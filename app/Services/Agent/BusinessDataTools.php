<?php

namespace App\Services\Agent;

use App\Models\Appointment;
use App\Models\CustomerProfile;
use App\Models\NewsletterSubscription;
use App\Models\PosInvoice;
use App\Models\PosProduct;
use Illuminate\Support\Facades\Validator;

class BusinessDataTools
{
    public const MAX_RESULTS = 30;
    public const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'done', 'cancelled'];

    /**
     * OpenAI-compatible tool schemas. Built from a JSON literal (via json_decode)
     * so the bracket structure is unambiguous and easy to audit. Empty
     * "properties" objects are normalised to {} so providers accept them.
     */
    public function definitions(): array
    {
        $json = <<<'JSON'
[
  {"type":"function","function":{"name":"get_stats","description":"Today's key metrics for the active outlet: product count, low/out-of-stock counts, orders today, revenue, appointments today, customers and newsletter subscribers.","parameters":{"type":"object","properties":{},"required":[]}}},
  {"type":"function","function":{"name":"search_products","description":"Search POS products (outlet-scoped) by name, SKU or variant. Returns id, name, variant, SKU, price, stock and category.","parameters":{"type":"object","properties":{"query":{"type":"string"},"category":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":30}},"required":[]}}},
  {"type":"function","function":{"name":"get_product","description":"Fetch a single POS product by ID.","parameters":{"type":"object","properties":{"id":{"type":"integer"}},"required":["id"]}}},
  {"type":"function","function":{"name":"update_product","description":"Update a POS product price, stock_qty, min_stock or is_active. Only these fields may change.","parameters":{"type":"object","properties":{"id":{"type":"integer"},"price":{"type":"number","minimum":0},"stock_qty":{"type":"integer","minimum":0},"min_stock":{"type":"integer","minimum":0},"is_active":{"type":"boolean"}},"required":["id"],"additionalProperties":false}}},
  {"type":"function","function":{"name":"list_low_stock","description":"List active products at or below min_stock (excluding fully out-of-stock) plus the out-of-stock count.","parameters":{"type":"object","properties":{"limit":{"type":"integer","minimum":1,"maximum":30}},"required":[]}}},
  {"type":"function","function":{"name":"search_customers","description":"Search customer profiles by name or phone number.","parameters":{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":30}},"required":[]}}},
  {"type":"function","function":{"name":"get_customer","description":"Fetch a customer profile by ID.","parameters":{"type":"object","properties":{"id":{"type":"integer"}},"required":["id"]}}},
    {"type":"function","function":{"name":"get_daily_sales","description":"Daily sales summary for a date (defaults today): completed orders, revenue and refunds.","parameters":{"type":"object","properties":{"date":{"type":"string"}},"required":[]}}},
  {"type":"function","function":{"name":"list_orders","description":"List POS invoices filtered by status and/or date.","parameters":{"type":"object","properties":{"status":{"type":"string"},"date":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":30}},"required":[]}}},
  {"type":"function","function":{"name":"list_appointments","description":"List appointments filtered by status and/or date.","parameters":{"type":"object","properties":{"status":{"type":"string","enum":["pending","confirmed","done","cancelled"]},"date":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":30}},"required":[]}}},
  {"type":"function","function":{"name":"update_appointment_status","description":"Update an appointment status (pending, confirmed, done, cancelled).","parameters":{"type":"object","properties":{"id":{"type":"integer"},"status":{"type":"string","enum":["pending","confirmed","done","cancelled"]}},"required":["id","status"],"additionalProperties":false}}},
  {"type":"function","function":{"name":"list_newsletter_subscribers","description":"List newsletter subscribers with their phone number and sign-up date.","parameters":{"type":"object","properties":{"limit":{"type":"integer","minimum":1,"maximum":30}},"required":[]}}}
]
JSON;
        $defs = json_decode($json, true);
        foreach ($defs as &$d) {
            $props = $d['function']['parameters']['properties'] ?? null;
            if (is_array($props) && empty($props)) {
                $d['function']['parameters']['properties'] = new \stdClass();
            }
        }
        unset($d);
        return $defs;
    }

    public function call(string $name, array $args): string
    {
        $map = [
            'get_stats'                   => 'getStats',
            'search_products'             => 'searchProducts',
            'get_product'                 => 'getProduct',
            'update_product'              => 'updateProduct',
            'list_low_stock'              => 'listLowStock',
            'search_customers'            => 'searchCustomers',
            'get_customer'                => 'getCustomer',
            'get_daily_sales'             => 'getDailySales',
            'list_orders'                 => 'listOrders',
            'list_appointments'           => 'listAppointments',
            'update_appointment_status'   => 'updateAppointmentStatus',
            'list_newsletter_subscribers' => 'listNewsletterSubscribers',
        ];
        if (! isset($map[$name])) {
            return 'Refused: tool "' . $name . '" is not available. ' . config('agent.refusal_message');
        }
        $validator = Validator::make($args, $this->rules($name));
        if ($validator->fails()) {
            return 'Invalid input for ' . $name . ': ' . $validator->errors()->first();
        }
        try {
            return (string) $this->{$map[$name]}($validator->validated());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return 'Not found: ' . $name;
        } catch (\Throwable $e) {
            return 'Error while running ' . $name . ': ' . $e->getMessage();
        }
    }

    private function rules(string $name): array
    {
        $max = self::MAX_RESULTS;
        $st = implode(',', self::APPOINTMENT_STATUSES);
        return match ($name) {
            'search_products'             => ['query' => 'nullable|string', 'category' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max"],
            'get_product'                 => ['id' => 'required|integer|min:1'],
            'update_product'              => ['id' => 'required|integer|min:1', 'price' => 'nullable|numeric|min:0', 'stock_qty' => 'nullable|integer|min:0', 'min_stock' => 'nullable|integer|min:0', 'is_active' => 'nullable|boolean'],
            'list_low_stock'              => ['limit' => "nullable|integer|min:1|max:$max"],
            'search_customers'            => ['query' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max"],
            'get_customer'                => ['id' => 'required|integer|min:1'],
            'get_daily_sales'             => ['date' => 'nullable|date_format:Y-m-d'],
            'list_orders'                 => ['status' => 'nullable|string', 'date' => 'nullable|date_format:Y-m-d', 'limit' => "nullable|integer|min:1|max:$max"],
            'list_appointments'           => ['status' => "nullable|string|in:$st", 'date' => 'nullable|date_format:Y-m-d', 'limit' => "nullable|integer|min:1|max:$max"],
            'update_appointment_status'   => ['id' => 'required|integer|min:1', 'status' => "required|string|in:$st"],
            'list_newsletter_subscribers' => ['limit' => "nullable|integer|min:1|max:$max"],
            default                       => [],
        };
    }

    private function cap(int $limit): int
    {
        return max(1, min($limit, self::MAX_RESULTS));
    }

    private function fmtMoney(float $value): string
    {
        return '$' . number_format($value, 2);
    }

    // ─── Tool implementations (data-only: Eloquent read/write on business models) ──

    private function getStats(): string
    {
        $today = today()->toDateString();
        $outlet = request()->header('X-Active-Outlet', 'attire_lounge');
        $products = (int) PosProduct::where('is_active', true)->count();
        $lowStock = (int) PosProduct::where('is_active', true)->where('stock_qty', '>', 0)->whereColumn('stock_qty', '<=', 'min_stock')->count();
        $outOfStock = (int) PosProduct::where('is_active', true)->where('stock_qty', '<=', 0)->count();
        $ordersToday = (int) PosInvoice::whereDate('date', $today)->count();
        $revenueToday = (float) PosInvoice::whereDate('date', $today)->where('status', 'completed')->sum('grand_total');
        $appointmentsToday = (int) Appointment::whereDate('date', $today)->count();
        $customers = (int) CustomerProfile::count();
        $subscribers = (int) NewsletterSubscription::count();

        return sprintf(
            'Outlet %s — products: %d | low-stock: %d | out-of-stock: %d | orders today: %d | revenue today: %s | appointments today: %d | customers: %d | newsletter subs: %d',
            $outlet, $products, $lowStock, $outOfStock, $ordersToday, $this->fmtMoney($revenueToday), $appointmentsToday, $customers, $subscribers
        );
    }

    private function searchProducts(array $a): string
    {
        $query = PosProduct::query();
        if (! empty($a['query'])) {
            $q = $a['query'];
            $query->where(function ($sq) use ($q) {
                $sq->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%")
                    ->orWhere('variant', 'like', "%{$q}%");
            });
        }
        if (! empty($a['category'])) {
            $query->where('category', $a['category']);
        }
        $rows = $query->orderBy('name')->limit($this->cap((int) ($a['limit'] ?? 15)))
            ->get(['id', 'name', 'sku', 'variant', 'price', 'stock_qty', 'min_stock', 'category', 'is_active']);

        if ($rows->isEmpty()) {
            return 'No products found.';
        }
        $lines = $rows->map(fn ($p) => sprintf(
            '- #%d %s %s | SKU %s | price %s | stock %d (min %d) | category %s | active %s',
            $p->id, $p->name, $p->variant, $p->sku ?? 'n/a', $this->fmtMoney((float) $p->price),
            (int) $p->stock_qty, (int) $p->min_stock, $p->category ?? 'n/a', $p->is_active ? 'yes' : 'no'
        ))->implode("\n");

        return "Products found: {$rows->count()}.\n{$lines}";
    }

    private function getProduct(array $a): string
    {
        $p = PosProduct::findOrFail($a['id']);
        return sprintf(
            'Product #%d — %s %s (SKU %s). Price: %s. Stock: %d (min %d, max %d). Category: %s. Service: %s. Accessory: %s. Active: %s.',
            $p->id, $p->name, $p->variant, $p->sku ?? 'n/a', $this->fmtMoney((float) $p->price),
            (int) $p->stock_qty, (int) $p->min_stock, (int) $p->max_stock, $p->category ?? 'n/a',
            $p->is_service ? 'yes' : 'no', $p->is_accessory ? 'yes' : 'no', $p->is_active ? 'yes' : 'no'
        );
    }

    private function updateProduct(array $a): string
    {
        $p = PosProduct::findOrFail($a['id']);
        $changed = [];
        foreach (['price', 'stock_qty', 'min_stock', 'is_active'] as $field) {
            if (array_key_exists($field, $a)) {
                $old = $p->{$field};
                $p->{$field} = $a[$field];
                $changed[] = sprintf('%s: %s → %s', $field, $old ?? 'null', $a[$field]);
            }
        }
        $p->save();
        return sprintf('Updated product #%d (%s). Changes: %s.', $p->id, $p->sku ?? 'n/a', implode('; ', $changed));
    }

    private function listLowStock(array $a): string
    {
        $rows = PosProduct::where('is_active', true)->where('stock_qty', '>', 0)
            ->whereColumn('stock_qty', '<=', 'min_stock')->orderBy('stock_qty')
            ->limit($this->cap((int) ($a['limit'] ?? 15)))
            ->get(['id', 'name', 'sku', 'variant', 'stock_qty', 'min_stock', 'price']);
        $out = (int) PosProduct::where('is_active', true)->where('stock_qty', '<=', 0)->count();

        $note = $rows->isEmpty() ? '' : "\n" . $rows->map(fn ($p) => sprintf(
            '- #%d %s %s | SKU %s | stock %d (min %d) | %s',
            $p->id, $p->name, $p->variant, $p->sku ?? 'n/a', (int) $p->stock_qty, (int) $p->min_stock, $this->fmtMoney((float) $p->price)
        ))->implode("\n");

        return "Low-stock items: {$rows->count()} | out-of-stock: {$out}.{$note}";
    }

    private function searchCustomers(array $a): string
    {
        $query = CustomerProfile::query();
        if (! empty($a['query'])) {
            $q = $a['query'];
            $query->where(function ($sq) use ($q) {
                $sq->where('name', 'like', "%{$q}%")->orWhere('phone', 'like', "%{$q}%");
            });
        }
        $rows = $query->orderBy('name')->limit($this->cap((int) ($a['limit'] ?? 15)))
            ->get(['id', 'name', 'email', 'phone', 'created_at']);

        if ($rows->isEmpty()) {
            return 'No customers found.';
        }
        $lines = $rows->map(fn ($c) => sprintf(
            '- #%d %s | %s | %s',
            $c->id, $c->name, $c->phone ?? '—', $c->email ?? '—'
        ))->implode("\n");
        return "Customers found: {$rows->count()}.\n{$lines}";
    }

    private function getCustomer(array $a): string
    {
        $c = CustomerProfile::findOrFail($a['id']);
        return sprintf(
            'Customer #%d — %s | email %s | phone %s | nationality %s | host %s | assistant %s | member since %s',
            $c->id, $c->name, $c->email ?? '—', $c->phone ?? '—', $c->nationality ?? 'n/a',
            $c->host ?? 'n/a', $c->assistant ?? 'n/a', optional($c->created_at)->toDateString()
        );
    }

    private function getDailySales(array $a): string
    {
        $date = $a['date'] ?? today()->toDateString();
        $revenue = (float) PosInvoice::whereDate('date', $date)->where('status', 'completed')->sum('grand_total');
        $orders = (int) PosInvoice::whereDate('date', $date)->where('status', 'completed')->count();
        $refunds = (float) PosInvoice::whereDate('date', $date)->whereIn('status', ['refunded', 'void'])->sum('grand_total');
        return "Sales for {$date}: {$orders} completed orders, revenue {$this->fmtMoney($revenue)}, refunds (refunded/void) {$this->fmtMoney($refunds)}.";
    }

    private function listOrders(array $a): string
    {
        $query = PosInvoice::query();
        if (! empty($a['status'])) {
            $query->where('status', $a['status']);
        }
        if (! empty($a['date'])) {
            $query->whereDate('date', $a['date']);
        }
        $rows = $query->orderByDesc('created_at')->limit($this->cap((int) ($a['limit'] ?? 15)))
            ->get(['id', 'invoice_number', 'date', 'status', 'grand_total']);

        if ($rows->isEmpty()) {
            return 'No orders found.';
        }
        $lines = $rows->map(fn ($o) => sprintf(
            '- #%s (%s) | %s | %s | id %d',
            $o->invoice_number ?? $o->id, $o->date, $o->status, $this->fmtMoney((float) $o->grand_total), $o->id
        ))->implode("\n");
        return "Orders found: {$rows->count()}.\n{$lines}";
    }

    private function listAppointments(array $a): string
    {
        $query = Appointment::query();
        if (! empty($a['status'])) {
            $query->where('status', $a['status']);
        }
        if (! empty($a['date'])) {
            $query->whereDate('date', $a['date']);
        }
        $rows = $query->orderByDesc('created_at')->limit($this->cap((int) ($a['limit'] ?? 15)))
            ->get(['id', 'name', 'phone', 'service', 'date', 'time', 'status']);

        if ($rows->isEmpty()) {
            return 'No appointments found.';
        }
        $lines = $rows->map(fn ($ap) => sprintf(
            '- #%d %s | %s | %s %s | %s',
            $ap->id, $ap->name, $ap->phone ?? '—', $ap->service, $ap->time, $ap->status
        ))->implode("\n");
        return "Appointments found: {$rows->count()}.\n{$lines}";
    }

    private function updateAppointmentStatus(array $a): string
    {
        $ap = Appointment::findOrFail($a['id']);
        $old = $ap->status;
        $ap->update(['status' => $a['status']]);
        return sprintf('Appointment #%d status: %s → %s.', $ap->id, $old, $ap->status);
    }

    private function listNewsletterSubscribers(array $a): string
    {
        $rows = NewsletterSubscription::orderByDesc('id')
            ->limit($this->cap((int) ($a['limit'] ?? 15)))
            ->get(['id', 'phone_number', 'created_at']);

        if ($rows->isEmpty()) {
            return 'No subscribers found.';
        }
        $lines = $rows->map(fn ($s) => sprintf(
            '- #%d %s (since %s)',
            $s->id, $s->phone_number, optional($s->created_at)->toDateString()
        ))->implode("\n");
        return "Subscribers: {$rows->count()}.\n{$lines}";
    }
}
