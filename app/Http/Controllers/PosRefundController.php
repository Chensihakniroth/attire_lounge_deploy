<?php

namespace App\Http\Controllers;

use App\Models\PosInvoice;
use App\Models\PosInvoiceItem;
use App\Models\PosRefund;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PosRefundController extends Controller
{
    /**
     * Process a refund — full invoice or individual line item.
     * POST /api/v1/pos/invoices/{id}/refund
     */
    public function store(Request $request, int $invoiceId): JsonResponse
    {
        $invoice = PosInvoice::with('items')->findOrFail($invoiceId);

        if (!in_array($invoice->status, ['completed', 'partial'])) {
            return response()->json(['message' => 'Only completed or partial invoices can be refunded.'], 422);
        }

        $validated = $request->validate([
            'type'            => 'required|in:full,partial',
            'invoice_item_id' => 'nullable|exists:pos_invoice_items,id',
            'items'           => 'nullable|array',
            'items.*.id'      => 'required|exists:pos_invoice_items,id',
            'items.*.quantity'=> 'required|integer|min:0',
            'reason'          => 'nullable|string|max:500',
        ]);

        $processedBy = $request->user()?->id ?? $invoice->cashier_id;

        DB::beginTransaction();
        try {
            $refunds = [];
            
            if ($validated['type'] === 'full') {
                // For a full refund, calculate remaining amount (Total - All Previous Refunds)
                $previousRefundTotal = PosRefund::where('invoice_id', $invoiceId)->sum('amount');
                $refundAmount = max(0, $invoice->grand_total - $previousRefundTotal);
                
                $invoice->update(['status' => 'refunded']);
                
                $refund = PosRefund::create([
                    'invoice_id'      => $invoiceId,
                    'type'            => 'full',
                    'amount'          => $refundAmount,
                    'reason'          => $validated['reason'] ?? 'Full invoice refund',
                    'processed_by'    => $processedBy,
                ]);
                $refunds[] = $refund;
            } else {
                // Partial — refund specific line items with quantities
                $requestItems = $validated['items'] ?? [];
                
                // Fallback for isolated item legacy support
                if (empty($requestItems) && !empty($validated['invoice_item_id'])) {
                    $requestItems = [['id' => $validated['invoice_item_id'], 'quantity' => 1]];
                }

                if (empty($requestItems)) {
                    return response()->json(['message' => 'items list is required for partial refunds.'], 422);
                }

                foreach ($requestItems as $reqItem) {
                    $item = PosInvoiceItem::where('id', $reqItem['id'])
                        ->where('invoice_id', $invoiceId)
                        ->firstOrFail();

                    $qtyToRefund = (int) $reqItem['quantity'];
                    if ($qtyToRefund <= 0) continue;
                    
                    // Check against already refunded quantity
                    $alreadyRefunded = PosRefund::where('invoice_item_id', $item->id)->sum('quantity');
                    $remainingQty = $item->quantity - $alreadyRefunded;

                    if ($qtyToRefund > $remainingQty) {
                        throw new \Exception("Refund quantity for '{$item->product_name}' exceeds remaining refundable units ({$remainingQty}). Total bought: {$item->quantity}, Already returned: {$alreadyRefunded}.");
                    }

                    // Calculate proportional amount using the model's logic
                    $calc = PosInvoiceItem::computeLineTotal(
                        $qtyToRefund,
                        $item->unit_price,
                        $item->discount_type,
                        $item->discount_value
                    );

                    $refund = PosRefund::create([
                        'invoice_id'      => $invoiceId,
                        'type'            => 'partial',
                        'invoice_item_id' => $item->id,
                        'quantity'        => $qtyToRefund,
                        'amount'          => $calc['line_total'],
                        'reason'          => $validated['reason'] ?? 'Partial item refund',
                        'processed_by'    => $processedBy,
                    ]);
                    $refunds[] = $refund;
                }
                
                // If every item is now fully refunded, mark the whole invoice as refunded
                // Otherwise, keep it as partial
                $allRefunded = true;
                foreach ($invoice->items as $i) {
                    $totalRef = PosRefund::where('invoice_item_id', $i->id)->sum('quantity');
                    if ($totalRef < $i->quantity) {
                        $allRefunded = false;
                        break;
                    }
                }
                $invoice->update(['status' => $allRefunded ? 'refunded' : 'partial']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Refund processed successfully',
                'refunds' => $refunds,
                'invoice' => $invoice->fresh(['items', 'payments', 'refunds']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Refund failed: ' . $e->getMessage()], 500);
        }
    }
}
