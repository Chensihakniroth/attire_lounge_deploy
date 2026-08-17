<?php

namespace App\Services\Agent;

use App\Models\Activity;
use App\Models\Altering;
use App\Models\Appointment;
use App\Models\CustomerProfile;
use App\Models\GiftRequest;
use App\Models\NewsletterSubscription;
use App\Models\Notification;
use App\Models\PosInvoice;
use App\Models\PosInvoiceItem;
use App\Models\PosPayment;
use App\Models\PosProduct;
use App\Models\PosRefund;
use App\Models\Promocode;
use App\Models\SalesTarget;
use App\Models\TelegramSubscriber;
use App\Services\SalesService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BusinessDataTools
{
    public const MAX_RESULTS = 500;
    public const DEFAULT_LIMIT = 50;
    public const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'done', 'cancelled'];
    public const GIFT_STATUSES = ['pending', 'approved', 'processing', 'completed', 'cancelled'];

    /**
     * OpenAI-compatible tool schemas. Built from a JSON literal (via json_decode)
     * so the bracket structure is unambiguous and easy to audit. Empty
     * "properties" objects are normalised to {} so providers accept them.
     */
    public function definitions(): array
    {
        $json = <<<'JSON'
[
  {"type":"function","function":{"name":"get_stats","description":"Today's key metrics for the active outlet or a specified outlet: product count, low/out-of-stock counts, orders today, revenue, appointments today, customers and newsletter subscribers.","parameters":{"type":"object","properties":{"outlet":{"type":"string","description":"Optional outlet slug: 'caffeine', 'kravat', or 'attire_lounge'. Defaults to active outlet."}},"required":[]}}},
  {"type":"function","function":{"name":"search_products","description":"Search POS products (outlet-scoped or specified outlet) by name, SKU or variant. Supports pagination and large batch limits up to 500 items.","parameters":{"type":"object","properties":{"query":{"type":"string"},"category":{"type":"string"},"outlet":{"type":"string","description":"Optional outlet slug: 'caffeine', 'kravat', or 'attire_lounge'."},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"get_product","description":"Fetch a single POS product by ID.","parameters":{"type":"object","properties":{"id":{"type":"integer"}},"required":["id"]}}},
  {"type":"function","function":{"name":"update_product","description":"Update a POS product price, stock_qty, min_stock or is_active. Only these fields may change.","parameters":{"type":"object","properties":{"id":{"type":"integer"},"price":{"type":"number","minimum":0},"stock_qty":{"type":"integer","minimum":0},"min_stock":{"type":"integer","minimum":0},"is_active":{"type":"boolean"}},"required":["id"],"additionalProperties":false}}},
  {"type":"function","function":{"name":"list_low_stock","description":"List active products that are low in stock (stock <= min_stock) or completely out of stock (stock <= 0) with individual item details. Supports filtering by query/category, pagination (page parameter) and batch limits up to 500 items.","parameters":{"type":"object","properties":{"query":{"type":"string","description":"Filter by product name, SKU or variant"},"category":{"type":"string","description":"Filter by product category"},"outlet":{"type":"string","description":"Optional outlet slug: 'caffeine', 'kravat', or 'attire_lounge'."},"include_out_of_stock":{"type":"boolean","description":"Whether to list out-of-stock items (default: true)"},"out_of_stock_only":{"type":"boolean","description":"Filter to only show out-of-stock items"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"search_customers","description":"Search customer profiles by name or phone number. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"get_customer","description":"Fetch a customer profile by ID.","parameters":{"type":"object","properties":{"id":{"type":"integer"}},"required":["id"]}}},
  {"type":"function","function":{"name":"get_customer_order_history","description":"Fetch complete order history, past invoices and lifetime spending summary for a customer.","parameters":{"type":"object","properties":{"customer_id":{"type":"integer"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":["customer_id"]}}},
  {"type":"function","function":{"name":"get_daily_sales","description":"Daily sales summary for a date (defaults today): completed orders, revenue and refunds for the active or specified outlet.","parameters":{"type":"object","properties":{"date":{"type":"string"},"outlet":{"type":"string","description":"Optional outlet slug: 'caffeine', 'kravat', or 'attire_lounge'."}},"required":[]}}},
  {"type":"function","function":{"name":"list_daily_report","description":"Fetch comprehensive daily/period sales report including total revenue, net revenue, refunds, top-selling products and category breakdown for the active or specified outlet.","parameters":{"type":"object","properties":{"date":{"type":"string","description":"Start date YYYY-MM-DD"},"end_date":{"type":"string","description":"Optional end date YYYY-MM-DD for date ranges or monthly top sellers"},"outlet":{"type":"string","description":"Optional outlet slug: 'caffeine', 'kravat', or 'attire_lounge'."}},"required":[]}}},
  {"type":"function","function":{"name":"list_orders","description":"List POS invoices and orders filtered by status, specific single date, date range (start_date to end_date), or search keyword (invoice # or customer). Supports pagination and limit up to 500.","parameters":{"type":"object","properties":{"status":{"type":"string","description":"Order status e.g. completed, pending, refunded, void"},"date":{"type":"string","description":"Single date YYYY-MM-DD"},"start_date":{"type":"string","description":"Start date of date range YYYY-MM-DD"},"end_date":{"type":"string","description":"End date of date range YYYY-MM-DD"},"query":{"type":"string","description":"Search by invoice number or customer name/phone"},"outlet":{"type":"string","description":"Optional outlet slug: 'caffeine', 'kravat', or 'attire_lounge'."},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"get_invoice_detail","description":"Fetch detailed POS invoice breakdown (items, payments, discounts, refunds, customer info) by invoice ID or invoice_number.","parameters":{"type":"object","properties":{"id":{"type":"integer"},"invoice_number":{"type":"string"}},"required":[]}}},
  {"type":"function","function":{"name":"create_pos_refund","description":"Process a refund for a completed POS invoice (full or partial by item ID and quantity). Automatically restores product stock.","parameters":{"type":"object","properties":{"invoice_id":{"type":"integer"},"type":{"type":"string","enum":["full","partial"]},"invoice_item_id":{"type":"integer"},"quantity":{"type":"integer","minimum":1},"reason":{"type":"string"}},"required":["invoice_id"]}}},
  {"type":"function","function":{"name":"search_gift_requests","description":"Search and list customer gift requests filtered by query or status. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"query":{"type":"string"},"status":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"get_gift_request","description":"Fetch full details for a single gift request by ID.","parameters":{"type":"object","properties":{"id":{"type":"integer"}},"required":["id"]}}},
  {"type":"function","function":{"name":"update_gift_request_status","description":"Update a gift request status (pending, approved, processing, completed, cancelled).","parameters":{"type":"object","properties":{"id":{"type":"integer"},"status":{"type":"string","enum":["pending","approved","processing","completed","cancelled"]}},"required":["id","status"],"additionalProperties":false}}},
  {"type":"function","function":{"name":"list_altering_orders","description":"List tailoring and alteration orders filtered by status or customer name/phone. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"status":{"type":"string"},"query":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"get_altering_order","description":"Fetch full details for a single tailoring/altering order by ID.","parameters":{"type":"object","properties":{"id":{"type":"integer"}},"required":["id"]}}},
  {"type":"function","function":{"name":"update_altering_status","description":"Update an altering order status, tailor pickup status, customer pickup status, or remark.","parameters":{"type":"object","properties":{"id":{"type":"integer"},"status":{"type":"string"},"pickup_status":{"type":"string"},"customer_pickup_status":{"type":"string"},"remark":{"type":"string"}},"required":["id"]}}},
  {"type":"function","function":{"name":"search_promocodes","description":"Search discount promo codes by code or name. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"get_sales_target","description":"Fetch monthly sales target vs actual revenue performance for the active or specified outlet.","parameters":{"type":"object","properties":{"year":{"type":"integer","minimum":2000,"maximum":2100},"month":{"type":"integer","minimum":1,"maximum":12},"outlet":{"type":"string","description":"Optional outlet slug: 'caffeine', 'kravat', or 'attire_lounge'."}},"required":[]}}},
  {"type":"function","function":{"name":"list_notifications","description":"List system notifications and alerts with unread count. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"unread_only":{"type":"boolean"},"type":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"list_activities","description":"List recent system activity audit logs. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"action":{"type":"string"},"model_type":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"list_appointments","description":"List appointments filtered by status and/or date. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"status":{"type":"string","enum":["pending","confirmed","done","cancelled"]},"date":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"create_appointment","description":"Book a new appointment with client details, service type, date and time.","parameters":{"type":"object","properties":{"name":{"type":"string"},"phone":{"type":"string"},"service":{"type":"string"},"date":{"type":"string"},"time":{"type":"string"},"email":{"type":"string"},"appointment_type":{"type":"string"},"message":{"type":"string"}},"required":["name","phone","service","date","time"]}}},
  {"type":"function","function":{"name":"update_appointment_status","description":"Update an appointment status (pending, confirmed, done, cancelled).","parameters":{"type":"object","properties":{"id":{"type":"integer"},"status":{"type":"string","enum":["pending","confirmed","done","cancelled"]}},"required":["id","status"],"additionalProperties":false}}},
  {"type":"function","function":{"name":"list_newsletter_subscribers","description":"List newsletter subscribers. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"update_customer","description":"Update a customer profile's contact/detail fields (phone, email, name, nationality, remarks, is_vip). Only these fields may change.","parameters":{"type":"object","properties":{"id":{"type":"integer"},"phone":{"type":"string"},"email":{"type":"string"},"name":{"type":"string"},"nationality":{"type":"string"},"remarks":{"type":"string"},"is_vip":{"type":"boolean"}},"required":["id"],"additionalProperties":false}}},
  {"type":"function","function":{"name":"list_gift_item_stock","description":"List gift item stock entries with optional out-of-stock filter. Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"is_out_of_stock":{"type":"boolean","description":"Filter to out-of-stock items only"},"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"get_gift_item_stock","description":"Fetch a single gift item stock entry by id.","parameters":{"type":"object","properties":{"id":{"type":"integer"}},"required":["id"]}}},
  {"type":"function","function":{"name":"update_gift_item_stock","description":"Update a gift item stock out-of-stock flag.","parameters":{"type":"object","properties":{"id":{"type":"integer"},"is_out_of_stock":{"type":"boolean"}},"required":["id"],"additionalProperties":false}}},
  {"type":"function","function":{"name":"list_telegram_subscribers","description":"List Telegram subscribers (chat id, type, title, active). Supports pagination (page) and limit up to 500.","parameters":{"type":"object","properties":{"limit":{"type":"integer","minimum":1,"maximum":500},"page":{"type":"integer","minimum":1}},"required":[]}}},
  {"type":"function","function":{"name":"bulk_update_products","description":"Update the same allowed fields (price, stock_qty, min_stock, is_active) across multiple POS products by id in a single transaction (max 50 ids).","parameters":{"type":"object","properties":{"ids":{"type":"array","items":{"type":"integer"},"minItems":1,"maxItems":50},"price":{"type":"number","minimum":0},"stock_qty":{"type":"integer","minimum":0},"min_stock":{"type":"integer","minimum":0},"is_active":{"type":"boolean"}},"required":["ids"],"additionalProperties":false}}},
  {"type":"function","function":{"name":"compare_sales","description":"Compare sales performance of a period (daily/weekly/monthly) against a previous comparison period for the active or specified outlet. Returns revenue, refunds, net revenue, orders and AOV with deltas.","parameters":{"type":"object","properties":{"period":{"type":"string","enum":["daily","weekly","monthly"]},"date":{"type":"string","description":"Anchor date YYYY-MM-DD (defaults today)"},"compare":{"type":"string","enum":["previous","same_last_week","same_last_month","same_last_year"],"description":"Which prior period to compare against (defaults previous)"},"outlet":{"type":"string","description":"Optional outlet slug: 'caffeine', 'kravat', or 'attire_lounge'."}},"required":[]}}}
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
            'list_products'               => 'searchProducts',
            'get_product'                 => 'getProduct',
            'update_product'              => 'updateProduct',
            'list_low_stock'              => 'listLowStock',
            'get_inventory'               => 'listLowStock',
            'search_customers'            => 'searchCustomers',
            'list_customers'              => 'searchCustomers',
            'get_customer'                => 'getCustomer',
            'get_customer_order_history'  => 'getCustomerOrderHistory',
            'get_daily_sales'             => 'getDailySales',
            'list_daily_report'           => 'listDailyReport',
            'list_sales_report'           => 'listDailyReport',
            'list_orders'                 => 'listOrders',
            'list_invoices'               => 'listOrders',
            'search_invoices'             => 'listOrders',
            'get_orders'                  => 'listOrders',
            'get_invoice_detail'          => 'getInvoiceDetail',
            'get_order_detail'            => 'getInvoiceDetail',
            'create_pos_refund'           => 'createPosRefund',
            'search_gift_requests'        => 'searchGiftRequests',
            'get_gift_request'            => 'getGiftRequest',
            'update_gift_request_status'  => 'updateGiftRequestStatus',
            'list_altering_orders'        => 'listAlteringOrders',
            'get_altering_order'          => 'getAlteringOrder',
            'update_altering_status'      => 'updateAlteringStatus',
            'search_promocodes'           => 'searchPromocodes',
            'get_sales_target'            => 'getSalesTarget',
            'list_notifications'          => 'listNotifications',
            'list_activities'             => 'listActivities',
            'list_appointments'           => 'listAppointments',
            'create_appointment'          => 'createAppointment',
            'update_appointment_status'   => 'updateAppointmentStatus',
            'list_newsletter_subscribers' => 'listNewsletterSubscribers',
            'update_customer'             => 'updateCustomer',
            'list_gift_item_stock'        => 'listGiftItemStock',
            'get_gift_item_stock'         => 'getGiftItemStock',
            'update_gift_item_stock'      => 'updateGiftItemStock',
            'list_telegram_subscribers'   => 'listTelegramSubscribers',
            'bulk_update_products'        => 'bulkUpdateProducts',
            'compare_sales'               => 'compareSales',
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
        $gst = implode(',', self::GIFT_STATUSES);

        $ruleName = match ($name) {
            'list_invoices', 'search_invoices', 'get_orders' => 'list_orders',
            'list_products'                                 => 'search_products',
            'list_customers'                                => 'search_customers',
            'get_inventory'                                 => 'list_low_stock',
            'list_sales_report'                             => 'list_daily_report',
            'get_order_detail'                              => 'get_invoice_detail',
            default                                         => $name,
        };

        return match ($ruleName) {
            'get_stats'                   => ['outlet' => 'nullable|string'],
            'search_products'             => ['query' => 'nullable|string', 'category' => 'nullable|string', 'outlet' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'get_product'                 => ['id' => 'required|integer|min:1'],
            'update_product'              => ['id' => 'required|integer|min:1', 'price' => 'nullable|numeric|min:0', 'stock_qty' => 'nullable|integer|min:0', 'min_stock' => 'nullable|integer|min:0', 'is_active' => 'nullable|boolean'],
            'list_low_stock'              => ['query' => 'nullable|string', 'category' => 'nullable|string', 'outlet' => 'nullable|string', 'include_out_of_stock' => 'nullable|boolean', 'out_of_stock_only' => 'nullable|boolean', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'search_customers'            => ['query' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'get_customer'                => ['id' => 'required|integer|min:1'],
            'get_customer_order_history'  => ['customer_id' => 'required|integer|min:1', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'get_daily_sales'             => ['date' => 'nullable|date_format:Y-m-d', 'outlet' => 'nullable|string'],
            'list_daily_report'           => ['date' => 'nullable|date_format:Y-m-d', 'end_date' => 'nullable|date_format:Y-m-d', 'outlet' => 'nullable|string'],
            'list_orders'                 => ['status' => 'nullable|string', 'date' => 'nullable|date_format:Y-m-d', 'start_date' => 'nullable|date_format:Y-m-d', 'end_date' => 'nullable|date_format:Y-m-d', 'query' => 'nullable|string', 'outlet' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'get_invoice_detail'          => ['id' => 'nullable|integer|min:1', 'invoice_number' => 'nullable|string'],
            'create_pos_refund'           => ['invoice_id' => 'required|integer|min:1', 'type' => 'nullable|string|in:full,partial', 'invoice_item_id' => 'nullable|integer|min:1', 'quantity' => 'nullable|integer|min:1', 'reason' => 'nullable|string|max:500'],
            'search_gift_requests'        => ['query' => 'nullable|string', 'status' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'get_gift_request'            => ['id' => 'required|integer|min:1'],
            'update_gift_request_status'  => ['id' => 'required|integer|min:1', 'status' => "required|string|in:$gst"],
            'list_altering_orders'        => ['status' => 'nullable|string', 'query' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'get_altering_order'          => ['id' => 'required|integer|min:1'],
            'update_altering_status'      => ['id' => 'required|integer|min:1', 'status' => 'nullable|string', 'pickup_status' => 'nullable|string', 'customer_pickup_status' => 'nullable|string', 'remark' => 'nullable|string'],
            'search_promocodes'           => ['query' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'get_sales_target'            => ['year' => 'nullable|integer|min:2000|max:2100', 'month' => 'nullable|integer|min:1|max:12', 'outlet' => 'nullable|string'],
            'list_notifications'          => ['unread_only' => 'nullable|boolean', 'type' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'list_activities'             => ['action' => 'nullable|string', 'model_type' => 'nullable|string', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'list_appointments'           => ['status' => "nullable|string|in:$st", 'date' => 'nullable|date_format:Y-m-d', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'create_appointment'          => ['name' => 'required|string|max:255', 'phone' => 'required|string|max:50', 'service' => 'required|string|max:255', 'date' => 'required|date_format:Y-m-d', 'time' => 'required|string', 'email' => 'nullable|email|max:255', 'appointment_type' => 'nullable|string', 'message' => 'nullable|string'],
            'update_appointment_status'   => ['id' => 'required|integer|min:1', 'status' => "required|string|in:$st"],
            'list_newsletter_subscribers' => ['limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'update_customer'             => ['id' => 'required|integer|min:1', 'phone' => 'nullable|string|max:50', 'email' => 'nullable|email|max:255', 'name' => 'nullable|string|max:255', 'nationality' => 'nullable|string|max:100', 'remarks' => 'nullable|string', 'is_vip' => 'nullable|boolean'],
            'list_gift_item_stock'        => ['is_out_of_stock' => 'nullable|boolean', 'limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'get_gift_item_stock'         => ['id' => 'required|integer|min:1'],
            'update_gift_item_stock'      => ['id' => 'required|integer|min:1', 'is_out_of_stock' => 'nullable|boolean'],
            'list_telegram_subscribers'   => ['limit' => "nullable|integer|min:1|max:$max", 'page' => 'nullable|integer|min:1'],
            'bulk_update_products'        => ['ids' => "required|array|max:50", 'ids.*' => 'integer|min:1', 'price' => 'nullable|numeric|min:0', 'stock_qty' => 'nullable|integer|min:0', 'min_stock' => 'nullable|integer|min:0', 'is_active' => 'nullable|boolean'],
            'compare_sales'               => ['period' => 'nullable|string|in:daily,weekly,monthly', 'date' => 'nullable|date_format:Y-m-d', 'compare' => 'nullable|string|in:previous,same_last_week,same_last_month,same_last_year', 'outlet' => 'nullable|string'],
            default                       => [],
        };
    }

    private function pagination(array $a, int $defaultLimit = self::DEFAULT_LIMIT): array
    {
        $limit = isset($a['limit']) ? max(1, min((int) $a['limit'], self::MAX_RESULTS)) : $defaultLimit;
        $page = max(1, (int) ($a['page'] ?? 1));
        $offset = ($page - 1) * $limit;
        return [$limit, $page, $offset];
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

    public function resolveOutlet(array $a = []): string
    {
        if (! empty($a['outlet'])) {
            $val = strtolower(trim((string) $a['outlet']));
            if (in_array($val, ['caffeine', 'cuffience', 'cuffence', 'caffeine_cafe', 'cafe', 'coffee', 'caffeine_outlet', 'drinks', 'beverages'])) {
                return 'caffeine';
            }
            if (in_array($val, ['kravat', 'ties', 'neckwear', 'kravat_outlet'])) {
                return 'kravat';
            }
            if (in_array($val, ['attire_lounge', 'attire', 'suits', 'styling_house', 'attire_outlet'])) {
                return 'attire_lounge';
            }
            return $val;
        }

        $outlet = request()->header('X-Active-Outlet')
            ?? request()->get('outlet')
            ?? 'attire_lounge';

        return in_array($outlet, ['attire_lounge', 'caffeine', 'kravat', 'nile']) ? $outlet : 'attire_lounge';
    }

    private function getStats(array $a = []): string
    {
        $today = today()->toDateString();
        $outlet = $this->resolveOutlet($a);
        $products = (int) PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->where('is_active', true)->count();
        $lowStock = (int) PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->where('is_active', true)->where('stock_qty', '>', 0)->whereColumn('stock_qty', '<=', 'min_stock')->count();
        $outOfStock = (int) PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->where('is_active', true)->where('stock_qty', '<=', 0)->count();
        $ordersToday = (int) PosInvoice::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->whereDate('date', $today)->count();
        $revenueToday = (float) PosInvoice::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->whereDate('date', $today)->where('status', 'completed')->sum('grand_total');
        $appointmentsToday = (int) Appointment::whereDate('date', $today)->count();
        $customers = (int) CustomerProfile::count();
        $subscribers = (int) NewsletterSubscription::count();

        return sprintf(
            'Outlet "%s" — products: %d | low-stock: %d | out-of-stock: %d | orders today: %d | revenue today: %s | appointments today: %d | customers: %d | newsletter subs: %d',
            $outlet, $products, $lowStock, $outOfStock, $ordersToday, $this->fmtMoney($revenueToday), $appointmentsToday, $customers, $subscribers
        );
    }

    private function searchProducts(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $outlet = $this->resolveOutlet($a);
        $query = PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet);
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
        $total = $query->count();
        $rows = $query->orderBy('name')
            ->offset($offset)
            ->limit($limit)
            ->get(['id', 'name', 'sku', 'variant', 'price', 'stock_qty', 'min_stock', 'category', 'is_active', 'outlet']);

        if ($rows->isEmpty()) {
            return "No products found in outlet \"{$outlet}\".";
        }
        $tableRows = $rows->map(fn ($p) => sprintf(
            '| #%d | %s | %s | %s | %s | %d (min %d) | %s | %s |',
            $p->id,
            $p->name,
            $p->variant ?: '—',
            $p->sku ?? 'n/a',
            $this->fmtMoney((float) $p->price),
            (int) $p->stock_qty,
            (int) $p->min_stock,
            $p->category ?? 'n/a',
            $p->is_active ? 'Active' : 'Inactive'
        ))->implode("\n");

        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "### Products in {$outlet}{$pageInfo}\n\n"
            . "| ID | Product Name | Variant | SKU | Price | Stock (Min) | Category | Status |\n"
            . "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
            . $tableRows;
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
        [$limit, $page, $offset] = $this->pagination($a, 30);
        $outlet = $this->resolveOutlet($a);
        $outOfStockOnly = (bool) ($a['out_of_stock_only'] ?? false);
        $includeOutOfStock = $a['include_out_of_stock'] ?? true;
        $q = $a['query'] ?? null;
        $cat = $a['category'] ?? null;

        $outQuery = PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->where('is_active', true)->where('stock_qty', '<=', 0);
        $lowQuery = PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->where('is_active', true)->where('stock_qty', '>', 0)->whereColumn('stock_qty', '<=', 'min_stock');

        if ($q) {
            $filter = function ($sq) use ($q) {
                $sq->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%")
                    ->orWhere('variant', 'like', "%{$q}%");
            };
            $outQuery->where($filter);
            $lowQuery->where($filter);
        }

        if ($cat) {
            $outQuery->where('category', $cat);
            $lowQuery->where('category', $cat);
        }

        $totalOut = $outQuery->count();
        $totalLow = $lowQuery->count();

        $outRows = collect();
        if ($includeOutOfStock || $outOfStockOnly) {
            $outRows = (clone $outQuery)
                ->orderBy('name')
                ->offset($offset)
                ->limit($limit)
                ->get(['id', 'name', 'sku', 'variant', 'stock_qty', 'min_stock', 'price', 'category']);
        }

        $lowRows = collect();
        if (! $outOfStockOnly) {
            $lowRows = (clone $lowQuery)
                ->orderBy('stock_qty')
                ->offset($offset)
                ->limit($limit)
                ->get(['id', 'name', 'sku', 'variant', 'stock_qty', 'min_stock', 'price', 'category']);
        }

        if ($outRows->isEmpty() && $lowRows->isEmpty() && $totalOut === 0 && $totalLow === 0) {
            $filterNote = ($q || $cat) ? " matching filter" : "";
            return "Inventory healthy: No low-stock or out-of-stock active products found{$filterNote}.";
        }

        $sections = [];

        if ($outRows->isNotEmpty()) {
            $totalPages = (int) ceil($totalOut / $limit);
            $start = $offset + 1;
            $end = min($offset + $outRows->count(), $totalOut);
            $outTableRows = $outRows->map(fn ($p) => sprintf(
                '| #%d | %s | %s | %s | 0 (min %d) | %s | %s | Out of stock |',
                $p->id,
                $p->name,
                $p->variant ?: '—',
                $p->sku ?? 'n/a',
                (int) $p->min_stock,
                $this->fmtMoney((float) $p->price),
                $p->category ?? '—'
            ))->implode("\n");

            $pageInfo = $totalPages > 1 ? " [Page {$page} of {$totalPages}, items {$start}-{$end} of {$totalOut}]" : "";
            $sections[] = "### 🔴 Out-of-stock items (Total: {$totalOut}){$pageInfo}\n\n"
                . "| ID | Product Name | Variant | SKU | Stock (Min) | Price | Category | Status |\n"
                . "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
                . $outTableRows;

            if ($page < $totalPages) {
                $nextPage = $page + 1;
                $sections[] = "💡 *To see next batch of out-of-stock items, ask with page={$nextPage}.*";
            }
        } elseif ($totalOut > 0 && ! $outOfStockOnly && ! $includeOutOfStock) {
            $sections[] = "🔴 Total out-of-stock items: {$totalOut}";
        }

        if ($lowRows->isNotEmpty()) {
            $totalPages = (int) ceil($totalLow / $limit);
            $start = $offset + 1;
            $end = min($offset + $lowRows->count(), $totalLow);
            $lowTableRows = $lowRows->map(fn ($p) => sprintf(
                '| #%d | %s | %s | %s | %d (min %d) | %s | %s | Low stock |',
                $p->id,
                $p->name,
                $p->variant ?: '—',
                $p->sku ?? 'n/a',
                (int) $p->stock_qty,
                (int) $p->min_stock,
                $this->fmtMoney((float) $p->price),
                $p->category ?? '—'
            ))->implode("\n");

            $pageInfo = $totalPages > 1 ? " [Page {$page} of {$totalPages}, items {$start}-{$end} of {$totalLow}]" : "";
            $sections[] = "### ⚠️ Low-stock items (Total: {$totalLow}){$pageInfo}\n\n"
                . "| ID | Product Name | Variant | SKU | Stock (Min) | Price | Category | Status |\n"
                . "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
                . $lowTableRows;

            if ($page < $totalPages && empty($outRows)) {
                $nextPage = $page + 1;
                $sections[] = "💡 *To see next batch of low-stock items, ask with page={$nextPage}.*";
            }
        }

        return implode("\n\n", $sections);
    }

    private function searchCustomers(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $query = CustomerProfile::query();
        if (! empty($a['query'])) {
            $q = $a['query'];
            $query->where(function ($sq) use ($q) {
                $sq->where('name', 'like', "%{$q}%")->orWhere('phone', 'like', "%{$q}%");
            });
        }
        $total = $query->count();
        $rows = $query->orderBy('name')
            ->offset($offset)
            ->limit($limit)
            ->get(['id', 'name', 'email', 'phone', 'created_at']);

        if ($rows->isEmpty()) {
            return 'No customers found.';
        }
        $lines = $rows->map(fn ($c) => sprintf(
            '- #%d %s | %s | %s',
            $c->id, $c->name, $c->phone ?? '—', $c->email ?? '—'
        ))->implode("\n");
        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Customers found{$pageInfo}:\n{$lines}";
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
        $outlet = $this->resolveOutlet($a);
        $date = $a['date'] ?? today()->toDateString();
        $revenue = (float) PosInvoice::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->whereDate('date', $date)->where('status', 'completed')->sum('grand_total');
        $orders = (int) PosInvoice::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->whereDate('date', $date)->where('status', 'completed')->count();
        $refunds = (float) PosInvoice::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet)->whereDate('date', $date)->whereIn('status', ['refunded', 'void'])->sum('grand_total');
        return "Sales for {$date} (Outlet: {$outlet}): {$orders} completed orders, revenue {$this->fmtMoney($revenue)}, refunds (refunded/void) {$this->fmtMoney($refunds)}.";
    }

    private function listOrders(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $outlet = $this->resolveOutlet($a);
        $query = PosInvoice::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)->where('outlet', $outlet);
        if (! empty($a['status'])) {
            $query->where('status', $a['status']);
        }
        if (! empty($a['date'])) {
            $query->whereDate('date', $a['date']);
        }
        if (! empty($a['start_date'])) {
            $query->whereDate('date', '>=', $a['start_date']);
        }
        if (! empty($a['end_date'])) {
            $query->whereDate('date', '<=', $a['end_date']);
        }
        if (! empty($a['query'])) {
            $term = trim($a['query']);
            $query->where(function ($q) use ($term) {
                $q->where('invoice_number', 'like', "%{$term}%")
                  ->orWhereHas('customer', function ($cq) use ($term) {
                      $cq->where('first_name', 'like', "%{$term}%")
                        ->orWhere('last_name', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%");
                  });
            });
        }
        $total = $query->count();
        $rows = $query->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get(['id', 'invoice_number', 'date', 'status', 'grand_total']);

        if ($rows->isEmpty()) {
            return 'No orders found.';
        }
        $lines = $rows->map(fn ($o) => sprintf(
            '- #%s (%s) | %s | %s | id %d',
            $o->invoice_number ?? $o->id, $o->date, $o->status, $this->fmtMoney((float) $o->grand_total), $o->id
        ))->implode("\n");
        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Orders found{$pageInfo}:\n{$lines}";
    }

    private function getInvoiceDetail(array $a): string
    {
        $query = PosInvoice::with(['customer', 'items', 'payments', 'refunds', 'promoCode']);
        if (! empty($a['id'])) {
            $invoice = $query->find($a['id']);
        } elseif (! empty($a['invoice_number'])) {
            $invoice = $query->where('invoice_number', $a['invoice_number'])->first();
        } else {
            return 'Please provide an invoice id or invoice_number.';
        }

        if (! $invoice) {
            return 'Invoice not found.';
        }

        $items = $invoice->items->map(function ($item) {
            $total = $item->line_total ?? ($item->quantity * $item->unit_price);
            return sprintf(
                '  - %s (x%d) @ %s = %s%s',
                $item->product_name ?? 'Item',
                $item->quantity ?? 1,
                $this->fmtMoney((float) $item->unit_price),
                $this->fmtMoney((float) $total),
                $item->discount_amount > 0 ? ' [discount: ' . $this->fmtMoney((float) $item->discount_amount) . ']' : ''
            );
        })->implode("\n");

        $payments = $invoice->payments->map(function ($p) {
            $label = class_exists(PosPayment::class) ? PosPayment::methodLabel($p->method ?? 'cash') : ($p->method ?? 'Payment');
            return sprintf('  - %s: %s (ref: %s)', $label, $this->fmtMoney((float) $p->amount), $p->reference ?? 'n/a');
        })->implode("\n");

        $refunds = $invoice->refunds->map(function ($r) {
            return sprintf('  - Refund #%d: %s (%s, reason: %s)', $r->id, $this->fmtMoney((float) $r->amount), $r->type ?? 'full', $r->reason ?? 'n/a');
        })->implode("\n");

        $promo = $invoice->promoCode ? sprintf(' | Promo: %s (-%s)', $invoice->promoCode->code, $this->fmtMoney((float) $invoice->promo_discount_amt)) : '';
        $customer = $invoice->customer ? sprintf('%s (%s)', $invoice->customer->name, $invoice->customer->phone ?? 'no phone') : 'Walk-in / None';

        $res = sprintf(
            "Invoice #%s (ID %d) — Outlet: %s | Date: %s | Status: %s | Payment Status: %s\nCustomer: %s\nSubtotal: %s | Discounts: %s%s | Grand Total: %s | Total Paid: %s | Balance Due: %s",
            $invoice->invoice_number ?? 'n/a',
            $invoice->id,
            $invoice->outlet ?? 'n/a',
            optional($invoice->date)->toDateString() ?? $invoice->date,
            $invoice->status,
            $invoice->payment_status ?? 'n/a',
            $customer,
            $this->fmtMoney((float) $invoice->subtotal),
            $this->fmtMoney((float) (($invoice->items_discount ?? 0) + ($invoice->tier_discount_amt ?? 0) + ($invoice->promo_discount_amt ?? 0))),
            $promo,
            $this->fmtMoney((float) $invoice->grand_total),
            $this->fmtMoney((float) $invoice->total_paid),
            $this->fmtMoney((float) $invoice->balance_due)
        );

        if ($items !== '') {
            $res .= "\nItems:\n" . $items;
        }
        if ($payments !== '') {
            $res .= "\nPayments:\n" . $payments;
        }
        if ($refunds !== '') {
            $res .= "\nRefunds:\n" . $refunds;
        }

        return $res;
    }

    private function searchGiftRequests(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $query = GiftRequest::query();
        if (! empty($a['query'])) {
            $q = $a['query'];
            $query->where(function ($sq) use ($q) {
                $sq->where('name', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('recipient_name', 'like', "%{$q}%")
                    ->orWhere('recipient_phone', 'like', "%{$q}%");
            });
        }
        if (! empty($a['status'])) {
            $query->where('status', $a['status']);
        }
        $total = $query->count();
        $rows = $query->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) {
            return 'No gift requests found.';
        }

        $lines = $rows->map(function ($g) {
            $itemsCount = is_array($g->selected_items) ? count($g->selected_items) : 0;
            return sprintf(
                '- #%d From: %s (%s) → To: %s (%s) | status: %s | items: %d | date: %s',
                $g->id,
                $g->name,
                $g->phone ?? '—',
                $g->recipient_name,
                $g->recipient_title ?? 'Recipient',
                $g->status ?? 'pending',
                $itemsCount,
                optional($g->created_at)->toDateString()
            );
        })->implode("\n");

        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Gift requests found{$pageInfo}:\n{$lines}";
    }

    private function listAlteringOrders(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $query = Altering::query();
        if (! empty($a['query'])) {
            $q = $a['query'];
            $query->where(function ($sq) use ($q) {
                $sq->where('customer_name', 'like', "%{$q}%")
                    ->orWhere('mobile', 'like', "%{$q}%")
                    ->orWhere('order_no', 'like', "%{$q}%")
                    ->orWhere('product', 'like', "%{$q}%");
            });
        }
        if (! empty($a['status'])) {
            $query->where('status', $a['status']);
        }
        $total = $query->count();
        $rows = $query->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) {
            return 'No alteration orders found.';
        }

        $lines = $rows->map(function ($alt) {
            return sprintf(
                '- #%d (Order %s) %s | item: %s | status: %s | tailor pickup: %s | customer pickup: %s | cost: %s',
                $alt->id,
                $alt->order_no ?? 'n/a',
                $alt->customer_name,
                $alt->product ?? 'n/a',
                $alt->status ?? 'pending',
                $alt->pickup_status ?? 'pending',
                $alt->customer_pickup_status ?? 'pending',
                $this->fmtMoney((float) ($alt->altering_cost ?? 0))
            );
        })->implode("\n");

        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Alteration orders found{$pageInfo}:\n{$lines}";
    }

    private function getSalesTarget(array $a): string
    {
        $year = (int) ($a['year'] ?? now()->year);
        $month = (int) ($a['month'] ?? now()->month);
        $outlet = $this->resolveOutlet($a);

        $target = SalesTarget::where('outlet', $outlet)->where('year', $year)->where('month', $month)->first();
        $targetRev = (float) ($target?->target_revenue ?? 0);

        $actualRev = (float) PosInvoice::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)
            ->where('outlet', $outlet)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->where('status', 'completed')
            ->sum('grand_total');

        $completedOrders = (int) PosInvoice::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)
            ->where('outlet', $outlet)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->where('status', 'completed')
            ->count();

        $pct = $targetRev > 0 ? round(($actualRev / $targetRev) * 100, 1) : 0;
        $diff = $actualRev - $targetRev;
        $statusNote = $targetRev > 0
            ? sprintf('Progress: %s%% of target (%s %s)', $pct, $diff >= 0 ? '+' . $this->fmtMoney($diff) . ' over' : $this->fmtMoney(abs($diff)) . ' to go', '')
            : 'No target set for this month.';

        return sprintf(
            'Sales Performance for %04d-%02d (Outlet: %s) — Target: %s | Actual Revenue: %s (%d completed orders) | %s',
            $year,
            $month,
            $outlet,
            $targetRev > 0 ? $this->fmtMoney($targetRev) : 'Not Set',
            $this->fmtMoney($actualRev),
            $completedOrders,
            trim($statusNote)
        );
    }

    private function listNotifications(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $unreadCount = (int) Notification::unread()->count();
        $query = Notification::query();

        if (! empty($a['type'])) {
            $query->ofType($a['type']);
        }
        if (! empty($a['unread_only']) || ! array_key_exists('unread_only', $a)) {
            if (($a['unread_only'] ?? true) === true) {
                $query->unread();
            }
        }
        $total = $query->count();
        $rows = $query->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) {
            return "Total unread notifications: {$unreadCount}. No notifications matching criteria.";
        }

        $lines = $rows->map(function ($n) {
            $readStatus = $n->is_read ? 'read' : 'UNREAD';
            return sprintf(
                '- [%s] #%d %s: %s (%s, %s)',
                $readStatus,
                $n->id,
                $n->title,
                Str::limit($n->message, 80),
                $n->type ?? 'info',
                optional($n->created_at)->diffForHumans() ?? 'recently'
            );
        })->implode("\n");

        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " [Page {$page} of {$totalPages}]" : "";
        return "Total unread notifications: {$unreadCount} (showing {$rows->count()}{$pageInfo}):\n{$lines}";
    }

    private function listAppointments(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $query = Appointment::query();
        if (! empty($a['status'])) {
            $query->where('status', $a['status']);
        }
        if (! empty($a['date'])) {
            $query->whereDate('date', $a['date']);
        }
        $total = $query->count();
        $rows = $query->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get(['id', 'name', 'phone', 'service', 'date', 'time', 'status']);

        if ($rows->isEmpty()) {
            return 'No appointments found.';
        }
        $lines = $rows->map(fn ($ap) => sprintf(
            '- #%d %s | %s | %s %s | %s',
            $ap->id, $ap->name, $ap->phone ?? '—', $ap->service, $ap->time, $ap->status
        ))->implode("\n");
        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Appointments found{$pageInfo}:\n{$lines}";
    }

    private function updateAppointmentStatus(array $a): string
    {
        $ap = Appointment::findOrFail($a['id']);
        $old = $ap->status;
        $ap->update(['status' => $a['status']]);
        return sprintf('Appointment #%d status: %s → %s.', $ap->id, $old, $ap->status);
    }

    private function createAppointment(array $a): string
    {
        $app = Appointment::create([
            'name'             => $a['name'],
            'phone'            => $a['phone'],
            'service'          => $a['service'],
            'date'             => $a['date'],
            'time'             => $a['time'],
            'email'            => $a['email'] ?? null,
            'appointment_type' => $a['appointment_type'] ?? 'general',
            'message'          => $a['message'] ?? 'Booked via AI Assistant',
            'status'           => 'pending',
        ]);
        $dateStr = optional($app->date)->toDateString() ?? $app->date;
        return sprintf('Created new Appointment #%d for %s (%s). Service: %s on %s at %s. Status: pending.', $app->id, $app->name, $app->phone, $app->service, $dateStr, $app->time);
    }

    private function createPosRefund(array $a): string
    {
        $invoice = PosInvoice::with('items')->findOrFail($a['invoice_id']);
        if (! in_array($invoice->status, ['completed', 'partial'])) {
            return "Cannot refund invoice #{$invoice->invoice_number} (status: {$invoice->status}). Only completed or partial invoices can be refunded.";
        }

        $type = $a['type'] ?? 'full';
        $reason = $a['reason'] ?? ($type === 'full' ? 'Full invoice refund via AI Assistant' : 'Partial item refund via AI Assistant');
        $processedBy = auth()->id() ?? $invoice->cashier_id;

        DB::beginTransaction();
        try {
            if ($type === 'full') {
                $previousRefundTotal = (float) PosRefund::where('invoice_id', $invoice->id)->sum('amount');
                $refundAmount = max(0.0, (float) $invoice->grand_total - $previousRefundTotal);

                $refund = PosRefund::create([
                    'outlet'          => $invoice->outlet ?? 'attire_lounge',
                    'invoice_id'      => $invoice->id,
                    'type'            => 'full',
                    'amount'          => $refundAmount,
                    'reason'          => $reason,
                    'processed_by'    => $processedBy,
                ]);

                foreach ($invoice->items as $item) {
                    if (! $item->is_service && $item->product_id) {
                        $alreadyRefunded = PosRefund::where('invoice_item_id', $item->id)->where('id', '!=', $refund->id)->sum('quantity');
                        $qtyToRestore = $item->quantity - $alreadyRefunded;
                        if ($qtyToRestore > 0) {
                            $posProduct = PosProduct::find($item->product_id);
                            if ($posProduct) {
                                $posProduct->increment('stock_qty', $qtyToRestore);
                            }
                        }
                    }
                }
                $invoice->update(['status' => 'refunded']);
                DB::commit();

                return sprintf('Successfully processed FULL refund of %s for Invoice #%s (ID %d). Reason: %s. Product stock restored.', $this->fmtMoney((float) $refundAmount), $invoice->invoice_number, $invoice->id, $reason);
            } else {
                if (empty($a['invoice_item_id'])) {
                    DB::rollBack();
                    return 'For partial refunds, invoice_item_id is required.';
                }
                $item = PosInvoiceItem::where('id', $a['invoice_item_id'])->where('invoice_id', $invoice->id)->firstOrFail();
                $qtyToRefund = (int) ($a['quantity'] ?? 1);
                $alreadyRefunded = PosRefund::where('invoice_item_id', $item->id)->sum('quantity');
                $remainingQty = $item->quantity - $alreadyRefunded;

                if ($qtyToRefund > $remainingQty) {
                    DB::rollBack();
                    return "Cannot refund {$qtyToRefund} units of '{$item->product_name}'. Remaining refundable units: {$remainingQty} (bought {$item->quantity}, already returned {$alreadyRefunded}).";
                }

                $calc = PosInvoiceItem::computeLineTotal(
                    $qtyToRefund,
                    (float) $item->unit_price,
                    $item->discount_type ?? 'none',
                    (float) ($item->discount_value ?? 0.0)
                );
                $lineTotal = round($calc['line_total'], 2);

                PosRefund::create([
                    'outlet'          => $invoice->outlet ?? 'attire_lounge',
                    'invoice_id'      => $invoice->id,
                    'type'            => 'partial',
                    'invoice_item_id' => $item->id,
                    'quantity'        => $qtyToRefund,
                    'amount'          => $lineTotal,
                    'reason'          => $reason,
                    'processed_by'    => $processedBy,
                ]);

                if (! $item->is_service && $item->product_id) {
                    $posProduct = PosProduct::find($item->product_id);
                    if ($posProduct) {
                        $posProduct->increment('stock_qty', $qtyToRefund);
                    }
                }

                $allRefunded = true;
                foreach ($invoice->items as $i) {
                    $totalRef = PosRefund::where('invoice_item_id', $i->id)->sum('quantity');
                    if ($totalRef < $i->quantity) {
                        $allRefunded = false;
                        break;
                    }
                }
                if ($allRefunded) {
                    $invoice->update(['status' => 'refunded', 'payment_status' => 'paid']);
                } else {
                    $invoice->update(['payment_status' => 'partial']);
                }

                $dateStr = optional($invoice->date)->toDateString() ?? (string) $invoice->date;
                $outlet = $invoice->outlet ?? 'attire_lounge';
                \Illuminate\Support\Facades\Cache::forget("sales_daily_v2_{$outlet}_{$dateStr}");

                DB::commit();

                $newStatus = $allRefunded ? 'refunded' : 'partial (payment: partial, invoice: ' . $invoice->status . ')';
                return sprintf('Successfully processed PARTIAL refund of %s (%d x %s) for Invoice #%s. Status: %s.', $this->fmtMoney((float) $lineTotal), $qtyToRefund, $item->product_name, $invoice->invoice_number, $newStatus);
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            return 'Refund error: ' . $e->getMessage();
        }
    }

    private function getGiftRequest(array $a): string
    {
        $g = GiftRequest::findOrFail($a['id']);
        $itemsStr = is_array($g->selected_items) ? implode(', ', $g->selected_items) : ($g->selected_items ?: 'None specified');
        return sprintf(
            "Gift Request #%d — Status: %s\nSender: %s | Phone: %s | Email: %s\nRecipient: %s (%s) | Phone: %s | Email: %s\nPreferences: %s\nSelected Items: %s\nSubmitted: %s",
            $g->id,
            $g->status ?? 'pending',
            $g->name,
            $g->phone ?? '—',
            $g->email ?? '—',
            $g->recipient_name,
            $g->recipient_title ?? 'Recipient',
            $g->recipient_phone ?? '—',
            $g->recipient_email ?? '—',
            $g->preferences ?? 'None',
            $itemsStr,
            optional($g->created_at)->toDateTimeString() ?? 'n/a'
        );
    }

    private function updateGiftRequestStatus(array $a): string
    {
        $gift = GiftRequest::findOrFail($a['id']);
        $old = $gift->status ?? 'pending';
        $gift->update(['status' => $a['status']]);
        return sprintf('Gift Request #%d status updated: %s → %s (Recipient: %s).', $gift->id, $old, $gift->status, $gift->recipient_name);
    }

    private function getAlteringOrder(array $a): string
    {
        $alt = Altering::findOrFail($a['id']);
        return sprintf(
            "Alteration Order #%d (Order No: %s) — Status: %s\nCustomer: %s | Mobile: %s | Address: %s\nProduct: %s | Altering Cost: %s\nPurchased: %s | Start Date: %s | Ready At: %s\nTailor Pickup: %s (%s) | Customer Pickup: %s (%s)\nRemark: %s",
            $alt->id,
            $alt->order_no ?? 'n/a',
            $alt->status ?? 'pending',
            $alt->customer_name,
            $alt->mobile ?? '—',
            $alt->delivery_address ?? '—',
            $alt->product ?? '—',
            $this->fmtMoney((float) ($alt->altering_cost ?? 0)),
            $alt->purchased_date ?? '—',
            optional($alt->start_date)->toDateString() ?? '—',
            optional($alt->ready_at)->toDateTimeString() ?? 'Not ready',
            $alt->tailor_pickup_date ?? '—',
            $alt->pickup_status ?? 'pending',
            $alt->customer_pickup_date ?? '—',
            $alt->customer_pickup_status ?? 'pending',
            $alt->remark ?? 'None'
        );
    }

    private function updateAlteringStatus(array $a): string
    {
        $alt = Altering::findOrFail($a['id']);
        $changed = [];
        foreach (['status', 'pickup_status', 'customer_pickup_status', 'remark'] as $field) {
            if (array_key_exists($field, $a) && $a[$field] !== null) {
                $old = $alt->{$field};
                $alt->{$field} = $a[$field];
                $changed[] = sprintf('%s: %s → %s', $field, $old ?? 'none', $a[$field]);
            }
        }
        if (isset($a['status']) && $a['status'] === 'ready' && ! $alt->ready_at) {
            $alt->ready_at = now();
        }
        $alt->save();
        return sprintf('Updated Alteration Order #%d (%s, Customer: %s). Changes: %s.', $alt->id, $alt->order_no ?? 'n/a', $alt->customer_name, implode('; ', $changed) ?: 'none');
    }

    private function searchPromocodes(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $query = Promocode::query();
        if (! empty($a['query'])) {
            $q = $a['query'];
            $query->where('code', 'like', "%{$q}%")->orWhere('name', 'like', "%{$q}%");
        }
        $total = $query->count();
        $rows = $query->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) {
            return 'No promo codes found.';
        }

        $lines = $rows->map(function ($p) {
            $isExpired = $p->expires_at && $p->expires_at->isPast();
            $status = $isExpired ? 'EXPIRED' : 'ACTIVE';
            return sprintf(
                '- Code: %s (%s) | Discount: %s%% | Status: %s | Expires: %s',
                $p->code,
                $p->name ?? 'Promo',
                $p->discount_percentage ?? 0,
                $status,
                $p->expires_at ? $p->expires_at->toDateString() : 'Never'
            );
        })->implode("\n");

        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Promo codes found{$pageInfo}:\n{$lines}";
    }

    private function getCustomerOrderHistory(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 10);
        $cust = CustomerProfile::findOrFail($a['customer_id']);
        $totalOrders = PosInvoice::where('customer_profile_id', $cust->id)->count();
        $invoices = PosInvoice::where('customer_profile_id', $cust->id)
            ->with('items')
            ->orderByDesc('date')
            ->offset($offset)
            ->limit($limit)
            ->get();

        $totalSpent = PosInvoice::where('customer_profile_id', $cust->id)->where('status', 'completed')->sum('grand_total');

        if ($invoices->isEmpty()) {
            return sprintf('Customer #%d (%s, %s) has no order history yet. Total orders: 0 | Lifetime spend: $0.00.', $cust->id, $cust->name, $cust->phone ?? 'no phone');
        }

        $lines = $invoices->map(function ($inv) {
            $itemsList = $inv->items->pluck('product_name')->filter()->take(3)->implode(', ');
            if ($inv->items->count() > 3) {
                $itemsList .= ' (+' . ($inv->items->count() - 3) . ' more)';
            }
            return sprintf(
                '- Invoice #%s (%s) | Status: %s | Total: %s | Items: %s',
                $inv->invoice_number ?? $inv->id,
                optional($inv->date)->toDateString() ?? $inv->date,
                $inv->status,
                $this->fmtMoney((float) $inv->grand_total),
                $itemsList ?: 'No items recorded'
            );
        })->implode("\n");

        $totalPages = (int) ceil($totalOrders / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total orders: {$totalOrders})" : " ({$totalOrders} total orders)";
        return sprintf(
            "Customer #%d: %s (%s) — Lifetime Spend: %s%s:\n%s",
            $cust->id,
            $cust->name,
            $cust->phone ?? 'no phone',
            $this->fmtMoney((float) $totalSpent),
            $pageInfo,
            $lines
        );
    }

    private function listActivities(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $query = Activity::with('user');
        if (! empty($a['action'])) {
            $query->where('action', 'like', "%{$a['action']}%");
        }
        if (! empty($a['model_type'])) {
            $query->where('model_type', 'like', "%{$a['model_type']}%");
        }
        $total = $query->count();
        $rows = $query->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get();

        if ($rows->isEmpty()) {
            return 'No activity logs found matching criteria.';
        }

        $lines = $rows->map(function ($act) {
            $userName = $act->user?->name ?? ($act->user_id ? "User #{$act->user_id}" : 'System');
            $modelStr = $act->model_type ? (class_basename($act->model_type) . ($act->model_id ? " #{$act->model_id}" : '')) : 'General';
            return sprintf(
                '- [%s] %s by %s on %s | %s',
                optional($act->created_at)->toDateTimeString() ?? 'n/a',
                $act->action,
                $userName,
                $modelStr,
                Str::limit($act->details ?? 'No details', 60)
            );
        })->implode("\n");

        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Activity logs found{$pageInfo}:\n{$lines}";
    }

    private function listDailyReport(array $a): string
    {
        $date = $a['date'] ?? today()->toDateString();
        $endDate = $a['end_date'] ?? null;
        $outlet = $this->resolveOutlet($a);

        /** @var SalesService $service */
        $service = app(SalesService::class);
        $report = $service->getDailyReport($date, $outlet, $endDate);

        $periodStr = $endDate && $endDate !== $date ? "{$date} to {$endDate}" : $date;
        $res = sprintf(
            "Sales Report for %s (Outlet: %s):\n- Invoices: %d | Total Revenue: %s | Refunds: %s | Net Revenue: %s | AOV: %s | Items Sold: %d",
            $periodStr,
            $outlet,
            $report['invoice_count'] ?? 0,
            $this->fmtMoney((float) ($report['total_revenue'] ?? 0)),
            $this->fmtMoney((float) ($report['total_refunds'] ?? 0)),
            $this->fmtMoney((float) ($report['net_revenue'] ?? 0)),
            $this->fmtMoney((float) ($report['avg_order_value'] ?? 0)),
            (int) ($report['total_items'] ?? 0)
        );

        if (! empty($report['top_sellers']) && count($report['top_sellers']) > 0) {
            $topLines = collect($report['top_sellers'])->take(10)->map(fn ($ts) => sprintf('  - %s (%s): %d sold (%s)', $ts->product_name, $ts->product_variant ?: 'Standard', (int) $ts->total_qty, $this->fmtMoney((float) $ts->total_revenue)))->implode("\n");
            $res .= "\nTop Sellers:\n" . $topLines;
        }

        if (! empty($report['category_breakdown']) && count($report['category_breakdown']) > 0) {
            $catLines = collect($report['category_breakdown'])->map(fn ($cat) => sprintf('  - %s: %d qty (%s)', $cat->category, (int) $cat->total_qty, $this->fmtMoney((float) $cat->total_revenue)))->implode("\n");
            $res .= "\nCategory Breakdown:\n" . $catLines;
        }

        return $res;
    }

    private function listNewsletterSubscribers(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $total = NewsletterSubscription::count();
        $rows = NewsletterSubscription::orderByDesc('id')
            ->offset($offset)
            ->limit($limit)
            ->get(['id', 'phone_number', 'created_at']);

        if ($rows->isEmpty()) {
            return 'No subscribers found.';
        }
        $lines = $rows->map(fn ($s) => sprintf(
            '- #%d %s (since %s)',
            $s->id, $s->phone_number, optional($s->created_at)->toDateString()
        ))->implode("\n");
        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Subscribers found{$pageInfo}:\n{$lines}";
    }

    // ─── Tier-1 expansion tools ──────────────────────────────────────────────

    private function updateCustomer(array $a): string
    {
        $c = CustomerProfile::findOrFail($a['id']);
        $allowed = ['phone', 'email', 'name', 'nationality', 'remarks', 'is_vip'];
        $changed = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $a) && $a[$field] !== null) {
                $old = $c->{$field};
                $c->{$field} = $a[$field];
                $changed[] = sprintf('%s: %s -> %s', $field, $old ?? 'null', $a[$field]);
            }
        }
        if (empty($changed)) {
            return "No changes applied to customer #{$c->id}.";
        }
        $c->save();
        return sprintf('Updated customer #%d (%s). Changes: %s.', $c->id, $c->name, implode('; ', $changed));
    }

    private function listGiftItemStock(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $query = GiftItemStock::query();
        if (array_key_exists('is_out_of_stock', $a) && $a['is_out_of_stock'] !== null) {
            $query->where('is_out_of_stock', (bool) $a['is_out_of_stock']);
        }
        $total = $query->count();
        $rows = $query->orderByDesc('id')
            ->offset($offset)
            ->limit($limit)
            ->get(['id', 'item_id', 'is_out_of_stock', 'created_at', 'updated_at']);

        if ($rows->isEmpty()) {
            return 'No gift item stock entries found.';
        }
        $lines = $rows->map(function ($g) {
            return sprintf(
                '- #%d | item_id: %s | out_of_stock: %s | updated: %s',
                $g->id,
                $g->item_id,
                $g->is_out_of_stock ? 'YES' : 'no',
                optional($g->updated_at)->toDateTimeString() ?? 'n/a'
            );
        })->implode("\n");
        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Gift item stock{$pageInfo}:\n{$lines}";
    }

    private function getGiftItemStock(array $a): string
    {
        $g = GiftItemStock::findOrFail($a['id']);
        return sprintf(
            'Gift item stock #%d - item_id: %s | out_of_stock: %s | created: %s | updated: %s',
            $g->id,
            $g->item_id,
            $g->is_out_of_stock ? 'YES' : 'no',
            optional($g->created_at)->toDateTimeString() ?? 'n/a',
            optional($g->updated_at)->toDateTimeString() ?? 'n/a'
        );
    }

    private function updateGiftItemStock(array $a): string
    {
        $g = GiftItemStock::findOrFail($a['id']);
        $old = $g->is_out_of_stock;
        if (array_key_exists('is_out_of_stock', $a) && $a['is_out_of_stock'] !== null) {
            $g->is_out_of_stock = (bool) $a['is_out_of_stock'];
            $g->save();
            return sprintf(
                'Updated gift item stock #%d (item_id %s). out_of_stock: %s -> %s.',
                $g->id, $g->item_id, $old ? 'YES' : 'no', $g->is_out_of_stock ? 'YES' : 'no'
            );
        }
        return "No change for gift item stock #{$g->id}.";
    }

    private function listTelegramSubscribers(array $a): string
    {
        [$limit, $page, $offset] = $this->pagination($a, 50);
        $total = TelegramSubscriber::count();
        $rows = TelegramSubscriber::orderByDesc('id')
            ->offset($offset)
            ->limit($limit)
            ->get(['id', 'chat_id', 'chat_type', 'chat_title', 'is_active', 'created_at']);

        if ($rows->isEmpty()) {
            return 'No Telegram subscribers found.';
        }
        $lines = $rows->map(function ($s) {
            return sprintf(
                '- #%d | chat %s (%s) | title: %s | active: %s',
                $s->id,
                $s->chat_id ?? 'n/a',
                $s->chat_type ?? '-',
                $s->chat_title ?? '-',
                $s->is_active ? 'yes' : 'no'
            );
        })->implode("\n");
        $totalPages = (int) ceil($total / $limit);
        $pageInfo = $totalPages > 1 ? " (Page {$page} of {$totalPages}, total: {$total})" : " (Total: {$total})";
        return "Telegram subscribers found{$pageInfo}:\n{$lines}";
    }

    private function bulkUpdateProducts(array $a): string
    {
        $ids = array_slice(array_unique(array_map('intval', (array) $a['ids'])), 0, 50);
        if (empty($ids)) {
            return 'No valid product ids provided.';
        }
        $fields = [];
        foreach (['price', 'stock_qty', 'min_stock', 'is_active'] as $f) {
            if (array_key_exists($f, $a) && $a[$f] !== null) {
                $fields[$f] = $a[$f];
            }
        }
        if (empty($fields)) {
            return 'No fields to update for bulk_update_products.';
        }
        $outlet = request()->header('X-Active-Outlet', 'attire_lounge');
        DB::beginTransaction();
        try {
            $updated = 0;
            foreach ($ids as $id) {
                $p = PosProduct::find($id);
                if (! $p) {
                    continue;
                }
                foreach ($fields as $f => $v) {
                    $p->{$f} = $v;
                }
                $p->save();
                $updated++;
            }
            \Illuminate\Support\Facades\Cache::forget("sales_daily_v2_{$outlet}_" . today()->toDateString());
            DB::commit();
            return sprintf('Bulk updated %d product(s) with fields: %s.', $updated, implode(', ', array_keys($fields)));
        } catch (\Throwable $e) {
            DB::rollBack();
            return 'Bulk update error: ' . $e->getMessage();
        }
    }

    private function compareSales(array $a): string
    {
        $period  = $a['period'] ?? 'daily';
        $date    = $a['date'] ?? today()->toDateString();
        $compare = $a['compare'] ?? 'previous';
        $outlet  = $this->resolveOutlet($a);

        $current  = $this->salesPeriod($period, $date, $outlet);
        $prevDate = $this->salesCompareDate($period, $compare, $date);
        $previous = $this->salesPeriod($period, $prevDate, $outlet);

        $revC = (float) ($current['total_revenue'] ?? 0);
        $revP = (float) ($previous['total_revenue'] ?? 0);
        $ordersC = $this->salesOrders($current);
        $ordersP = $this->salesOrders($previous);
        $aovC = $this->salesAov($current, $revC, $ordersC);
        $aovP = $this->salesAov($previous, $revP, $ordersP);

        $pct = function ($c, $p) {
            if (! $p) {
                return 'n/a';
            }
            return sprintf('%+01.1f%%', round((($c - $p) / $p) * 100, 1));
        };

        return sprintf(
            "Sales comparison (%s): %s vs %s\n- Revenue: %s vs %s (%s)\n- Net Revenue: %s vs %s\n- Refunds: %s vs %s\n- Orders: %s vs %s\n- AOV: %s vs %s",
            $period,
            $date,
            $prevDate,
            $this->fmtMoney($revC), $this->fmtMoney($revP), $pct($revC, $revP),
            $this->fmtMoney((float) ($current['net_revenue'] ?? 0)), $this->fmtMoney((float) ($previous['net_revenue'] ?? 0)),
            $this->fmtMoney((float) ($current['total_refunds'] ?? 0)), $this->fmtMoney((float) ($previous['total_refunds'] ?? 0)),
            $ordersC, $ordersP,
            $this->fmtMoney($aovC), $this->fmtMoney($aovP)
        );
    }

    private function salesPeriod(string $period, string $date, string $outlet): array
    {
        /** @var SalesService $service */
        $service = app(SalesService::class);
        if ($period === 'weekly') {
            return $service->getWeeklyReport($date, $outlet);
        }
        if ($period === 'monthly') {
            $d = \Carbon\Carbon::parse($date);
            return $service->getMonthlyReport($d->year, $d->month, $outlet);
        }
        return $service->getDailyReport($date, $outlet);
    }

    private function salesCompareDate(string $period, string $compare, string $date): string
    {
        $d = \Carbon\Carbon::parse($date);
        if ($compare === 'same_last_week') {
            return $d->copy()->subWeek()->toDateString();
        }
        if ($compare === 'same_last_month') {
            return $d->copy()->subMonth()->toDateString();
        }
        if ($compare === 'same_last_year') {
            return $d->copy()->subYear()->toDateString();
        }
        if ($period === 'weekly') {
            return $d->copy()->subWeek()->toDateString();
        }
        if ($period === 'monthly') {
            return $d->copy()->subMonth()->toDateString();
        }
        return $d->copy()->subDay()->toDateString();
    }

    private function salesOrders(array $r)
    {
        if (isset($r['invoice_count'])) {
            return (int) $r['invoice_count'];
        }
        if (isset($r['daily_breakdown']) && $r['daily_breakdown'] instanceof \Illuminate\Support\Collection) {
            return (int) $r['daily_breakdown']->sum('invoices');
        }
        return 'n/a';
    }

    private function salesAov(array $r, float $revenue, $orders)
    {
        if (isset($r['avg_order_value'])) {
            return (float) $r['avg_order_value'];
        }
        if (is_numeric($orders) && $orders > 0) {
            return round($revenue / $orders, 2);
        }
        return 0.0;
    }
}
