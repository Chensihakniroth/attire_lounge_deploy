<?php

namespace App\Console\Commands;

use App\Models\PosProduct;
use App\Models\Scopes\OutletScope;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncNilePrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nile:sync-prices
                            {--dry-run : Report what would change, write nothing}
                            {--outlet= : Override the outlet to sync (default: config value)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Nile outlet prices from the WooCommerce storefront so the POS charges the live (sale-aware) price';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $outlet = $this->option('outlet') ?: config('nile-woocommerce.outlet');

        $key    = config('nile-woocommerce.consumer_key');
        $secret = config('nile-woocommerce.consumer_secret');
        $base   = rtrim(config('nile-woocommerce.store_url'), '/');

        if (! $key || ! $secret) {
            $this->error('WooCommerce credentials missing. Set WC_CONSUMER_KEY and WC_CONSUMER_SECRET.');
            return self::FAILURE;
        }

        $this->info("Syncing outlet [{$outlet}] from {$base}" . ($dryRun ? ' (DRY RUN)' : ''));

        $variations = $this->fetchVariations($base, $key, $secret);
        if ($variations === null) {
            return self::FAILURE;
        }

        $map = [];
        foreach ($variations as $variation) {
            $sku = trim((string) ($variation['sku'] ?? ''));
            if ($sku === '') {
                continue;
            }
            $map[$sku] = $variation;
        }

        $this->info("Storefront returned " . count($variations) . " variations (" . count($map) . ' with a SKU)');
        $this->newLine();

        $products = PosProduct::withoutGlobalScope(OutletScope::class)
            ->where('outlet', $outlet)
            ->where('is_active', true)
            ->where('is_service', false)
            ->get(['id', 'sku', 'name', 'variant', 'price', 'regular_price']);

        $matched = 0;
        $changed = 0;
        $backfilled = 0;
        $unchanged = 0;
        $notOnStore = 0;
        $lines = [];

        foreach ($products as $product) {
            $sku = trim((string) $product->sku);
            if ($sku === '' || ! isset($map[$sku])) {
                $notOnStore++;
                continue;
            }

            $remote  = $map[$sku];
            $regular = (float) ($remote['regular_price'] ?? 0);
            $sale    = (float) ($remote['sale_price'] ?? 0);
            $onSale  = ! empty($remote['on_sale']) && $sale > 0;

            // Never let a malformed storefront row zero out a live POS price.
            if ($regular <= 0) {
                $this->warn("  ! {$sku}: storefront regular price is {$regular} — skipped");
                continue;
            }

            $matched++;
            $effective = $onSale ? $sale : $regular;

            $currentPrice   = (float) $product->price;
            $currentRegular = $product->regular_price === null ? null : (float) $product->regular_price;

            $priceChanged   = abs($currentPrice - $effective) > 0.005;
            $regularChanged = $currentRegular === null || abs($currentRegular - $regular) > 0.005;

            if (! $priceChanged && ! $regularChanged) {
                $unchanged++;
                continue;
            }

            $update = [];
            if ($priceChanged) {
                $update['price'] = $effective;
                $changed++;
            }
            if ($regularChanged) {
                $update['regular_price'] = $regular;
                if (! $priceChanged) {
                    $backfilled++;
                }
            }

            $lines[] = sprintf(
                '  %-14s %-40s %9.2f -> %9.2f%s',
                $sku,
                mb_strimwidth(trim($product->name . ' ' . $product->variant), 0, 40),
                $currentPrice,
                $effective,
                $onSale ? '   [SALE, regular ' . number_format($regular, 2) . ']' : ''
            );

            if (! $dryRun && $update !== []) {
                $product->update($update);
            }
        }

        if ($lines !== []) {
            $this->line($dryRun ? '--- WOULD CHANGE ---' : '--- CHANGED ---');
            foreach ($lines as $line) {
                $this->line($line);
            }
            $this->newLine();
        }

        $this->info('POS products in outlet : ' . $products->count());
        $this->info('Matched on storefront  : ' . $matched);
        $this->info('Prices changed         : ' . $changed . ($dryRun ? ' (dry run, nothing written)' : ''));
        $this->info('Regular price recorded : ' . $backfilled);
        $this->info('Already correct        : ' . $unchanged);
        $this->info('Not on storefront      : ' . $notOnStore . ' (left untouched)');

        if (! $dryRun && $changed > 0) {
            Log::info('Nile price sync', [
                'outlet'   => $outlet,
                'changed'  => $changed,
                'backfill' => $backfilled,
                'matched'  => $matched,
            ]);
        }

        return self::SUCCESS;
    }

    /**
     * Collect every published variation.
     *
     * The WC REST collection endpoint rejects `type=variation` (its `type` enum
     * only accepts simple/grouped/external/variable), so variations have to be
     * walked parent-by-parent via /products/{id}/variations.
     *
     * @return array<int, array<string, mixed>>|null Null signals a failed fetch.
     */
    private function fetchVariations(string $base, string $key, string $secret): ?array
    {
        $client = Http::withBasicAuth($key, $secret)
            ->withHeaders([
                'User-Agent' => config('nile-woocommerce.user_agent'),
                'Accept'     => 'application/json',
            ])
            ->timeout(45);

        try {
            $parents = $this->paged($client, "{$base}/wp-json/wc/v3/products", [
                'type' => 'variable', 'status' => 'publish', 'per_page' => 100,
            ]);
        } catch (\Throwable $e) {
            $this->error('Could not list variable products: ' . $e->getMessage());
            return null;
        }

        if ($parents === null) {
            return null;
        }

        $this->line('Variable products: ' . count($parents));

        $variations = [];
        foreach ($parents as $parent) {
            $id = (int) ($parent['id'] ?? 0);
            if ($id === 0) {
                continue;
            }
            try {
                $batch = $this->paged($client, "{$base}/wp-json/wc/v3/products/{$id}/variations", [
                    'per_page' => 100,
                ]);
            } catch (\Throwable $e) {
                $this->warn("  ! variations for product {$id} failed: " . $e->getMessage());
                continue;
            }
            if ($batch !== null) {
                $variations = array_merge($variations, $batch);
            }
        }

        return $variations;
    }

    /**
     * Walk a paginated WC REST collection.
     *
     * @return array<int, array<string, mixed>>|null
     */
    private function paged($client, string $url, array $query): ?array
    {
        $all = [];
        $page = 1;
        $totalPages = 1;

        while ($page <= $totalPages) {
            $response = $client->get($url, $query + ['page' => $page]);

            if (! $response->successful()) {
                $this->error("{$url} returned HTTP {$response->status()} on page {$page}");
                $this->line(mb_strimwidth($response->body(), 0, 300));
                return null;
            }

            $batch = $response->json();
            if (! is_array($batch)) {
                $this->error("Unexpected response shape from {$url}.");
                return null;
            }

            $all = array_merge($all, $batch);
            $totalPages = (int) ($response->header('X-WP-TotalPages') ?: 1);
            $page++;
        }

        return $all;
    }
}
