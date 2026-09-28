<?php

namespace App\Console\Commands;

use App\Models\NileSyncRun;
use App\Models\PosProduct;
use App\Models\Scopes\OutletScope;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncNileStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nile:sync-stock
                            {--dry-run : Report what would change, write nothing}
                            {--outlet= : Override the outlet to sync (default: config value)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Push Nile outlet stock from the POS to WooCommerce so a shop-floor sale is reflected on the storefront';

    public function handle(): int
    {
        $startedAt = microtime(true);
        $dryRun = (bool) $this->option('dry-run');
        $outlet = $this->option('outlet') ?: config('nile-woocommerce.outlet');

        $key    = config('nile-woocommerce.consumer_key');
        $secret = config('nile-woocommerce.consumer_secret');
        $base   = rtrim(config('nile-woocommerce.store_url'), '/');

        if (! $key || ! $secret) {
            $this->error('WooCommerce credentials missing. Set WC_CONSUMER_KEY and WC_CONSUMER_SECRET.');
            $this->recordRun($startedAt, $outlet, 'error', 'WooCommerce credentials missing.', 0, 0, 0, 0, 0, []);
            return self::FAILURE;
        }

        $this->info("Pushing outlet [{$outlet}] stock to {$base}" . ($dryRun ? ' (DRY RUN)' : ''));

        $variations = $this->fetchVariations($base, $key, $secret);
        if ($variations === null) {
            $this->recordRun($startedAt, $outlet, 'error', 'Could not reach the WooCommerce storefront.', 0, 0, 0, 0, 0, []);
            return self::FAILURE;
        }

        // sku => ['id' => variation id, 'parent' => parent id, 'stock', 'status', 'manage']
        $map = [];
        foreach ($variations as $variation) {
            $sku = trim((string) ($variation['sku'] ?? ''));
            if ($sku === '' || empty($variation['id'])) {
                continue;
            }
            $map[$sku] = [
                'id'     => (int) $variation['id'],
                'parent' => (int) ($variation['parent_id'] ?? 0),
                'stock'  => $variation['stock_quantity'],
                'status' => (string) ($variation['stock_status'] ?? ''),
                'manage' => ! empty($variation['manage_stock']),
            ];
        }
        $this->info('Storefront variations: ' . count($variations) . ' (' . count($map) . ' matched by SKU)');
        $this->newLine();

        $products = PosProduct::withoutGlobalScope(OutletScope::class)
            ->where('outlet', $outlet)
            ->where('is_active', true)
            ->where('is_service', false)
            ->get(['id', 'sku', 'name', 'variant', 'stock_qty']);

        $matched = 0;
        $changed = 0;
        $unchanged = 0;
        $notOnStore = 0;
        $enabledTracking = 0;
        $errors = 0;
        $lines = [];
        $changedRows = [];

        foreach ($products as $product) {
            $sku = trim((string) $product->sku);
            if ($sku === '' || ! isset($map[$sku])) {
                $notOnStore++;
                continue;
            }

            $remote = $map[$sku];
            $matched++;

            // A negative POS quantity is test/legacy data, never a real state to
            // publish — clamp rather than push a nonsense number to the storefront.
            $target = max(0, (int) $product->stock_qty);
            $targetStatus = $target > 0 ? 'instock' : 'outofstock';

            $remoteStock = ($remote['stock'] === null || $remote['stock'] === '')
                ? null
                : (int) $remote['stock'];

            $stockDiffers = $remoteStock !== $target;
            $statusDiffers = $remote['status'] !== $targetStatus;
            $needsTracking = ! $remote['manage'];

            if (! $stockDiffers && ! $statusDiffers && ! $needsTracking) {
                $unchanged++;
                continue;
            }

            $why = [];
            if ($stockDiffers) {
                $why[] = 'stock ' . ($remoteStock === null ? 'null' : $remoteStock) . " -> {$target}";
            }
            if ($statusDiffers) {
                $why[] = "status {$remote['status']} -> {$targetStatus}";
            }
            if ($needsTracking) {
                $why[] = 'manage_stock off -> on';
                $enabledTracking++;
            }

            $changed++;
            $lines[] = sprintf(
                '  %-14s %-38s %s',
                $sku,
                mb_strimwidth(trim($product->name . ' ' . $product->variant), 0, 38),
                implode(', ', $why)
            );

            $changedRows[] = [
                'sku'  => $sku,
                'name' => trim($product->name . ' ' . $product->variant),
                'from' => $remoteStock,
                'to'   => $target,
                'why'  => $why,
            ];

            if ($dryRun) {
                continue;
            }

            // Re-read immediately before the write: a WooCommerce order can land
            // through the webhook at any moment and decrement pos_products, so the
            // value fetched at the top of the run may already be stale.
            $fresh = PosProduct::withoutGlobalScope(OutletScope::class)
                ->where('id', $product->id)
                ->value('stock_qty');
            $freshTarget = max(0, (int) $fresh);

            $body = [
                'manage_stock'  => true,
                'stock_quantity' => $freshTarget,
                'stock_status'  => $freshTarget > 0 ? 'instock' : 'outofstock',
                'backorders'    => 'no',
            ];

            $response = Http::withBasicAuth($key, $secret)
                ->withHeaders([
                    'User-Agent' => config('nile-woocommerce.user_agent'),
                    'Accept'     => 'application/json',
                    // Makes the Stock Monitor log this as a POS change rather than
                    // a website edit. The plugin already listens for these headers.
                    'X-Nile-Stock-Source'            => 'pos',
                    'X-Nile-Stock-Previous-Quantity' => (string) ($remoteStock ?? 0),
                ])
                ->timeout(45)
                ->put("{$base}/wp-json/wc/v3/products/{$remote['parent']}/variations/{$remote['id']}", $body);

            if (! $response->successful()) {
                $errors++;
                $this->warn("  ! {$sku}: HTTP {$response->status()} " . mb_strimwidth($response->body(), 0, 160));
                continue;
            }

            $confirmed = $response->json('stock_quantity');
            if ((int) $confirmed !== $freshTarget) {
                $this->warn("  ! {$sku}: store reports {$confirmed}, expected {$freshTarget}");
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
        $this->info('Would change           : ' . $changed . ($dryRun ? ' (dry run, nothing written)' : ''));
        $this->info('Stock tracking enabled  : ' . $enabledTracking);
        $this->info('Already correct        : ' . $unchanged);
        $this->info('Not on storefront      : ' . $notOnStore . ' (left untouched)');
        $this->info('Write errors           : ' . $errors);

        if (! $dryRun && $changed > 0) {
            Log::info('Nile stock sync', [
                'outlet'          => $outlet,
                'changed'         => $changed,
                'tracking_enabled'=> $enabledTracking,
                'errors'          => $errors,
            ]);
        }

        if (! $dryRun) {
            $this->recordRun(
                $startedAt,
                $outlet,
                $errors > 0 ? 'error' : 'success',
                $errors > 0
                    ? $errors . ' variation(s) could not be written.'
                    : ($changed > 0
                        ? $changed . ' stock value(s) pushed to the storefront.'
                        : 'Storefront stock already matches the POS.'),
                $matched,
                $changed,
                $unchanged,
                $notOnStore,
                $errors,
                $changedRows
            );
        }

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Persist a run summary for the admin "Sync POS" screen.
     */
    private function recordRun(
        float $startedAt,
        string $outlet,
        string $status,
        string $message,
        int $matched,
        int $changed,
        int $unchanged,
        int $notOnStore,
        int $errors,
        array $details
    ): void {
        try {
            NileSyncRun::create([
                'job'         => 'stock',
                'outlet'      => $outlet,
                'status'      => $status,
                'direction'   => 'pos_to_wp',
                'matched'     => $matched,
                'changed'     => $changed,
                'unchanged'   => $unchanged,
                'not_on_store'=> $notOnStore,
                'errors'      => $errors,
                'duration_ms' => (int) round((microtime(true) - $startedAt) * 1000),
                'message'     => $message,
                'details'     => $details,
            ]);
        } catch (\Throwable $e) {
            // Never let telemetry bookkeeping break the actual sync.
            Log::warning('Could not record nile stock sync run', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Collect every published variation with the id fields a write needs.
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
