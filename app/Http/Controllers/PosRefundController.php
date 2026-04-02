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
            return response()->json(['message' => 'Only completed invoices can be refunded.'], 422);
        }

        $validated = $request->validate([
            'type'            => 'required|in:full,partial',
            'invoice_item_id' => 'nullable|exists:pos_invoice_items,id',
            'reason'          => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $refundAmount = 0;

            if ($validated['type'] === 'full') {
                $refundAmount = $invoice->grand_total;
                $invoice->update(['status' => 'refunded']);
            } else {
                // Partial — refund specific line item
                if (empty($validated['invoice_item_id'])) {
                    return response()->json(['message' => 'invoice_item_id is required for partial refunds.'], 422);
                }

                $item = PosInvoiceItem::where('id', $validated['invoice_item_id'])
                    ->where('invoice_id', $invoiceId)
                    ->firstOrFail();

                $refundAmount = $item->line_total;
            }

            $refund = PosRefund::create([
                'invoice_id'      => $invoiceId,
                'type'            => $validated['type'],
                'invoice_item_id' => $validated['invoice_item_id'] ?? null,
                'amount'          => $refundAmount,
                'reason'          => $validated['reason'] ?? null,
                'processed_by'    => $request->user()->id,
            ]);

            DB::commit();

            return response()->json([
                'refund'  => $refund->load(['invoiceItem', 'processedBy']),
                'invoice' => $invoice->fresh(['items', 'payments', 'refunds']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Refund failed: ' . $e->getMessage()], 500);
        }
    }
}
