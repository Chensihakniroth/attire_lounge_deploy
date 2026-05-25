import React from 'react';

/**
 * ThermalReceipt - Generates receipt HTML and prints via iframe injection.
 * Layout matched to 72mm thermal printer paper (EPSON L805 Series).
 * Uses bold, high-contrast text optimized for thermal printing.
 */

const KHR_RATE = 4100; // USD to KHR exchange rate

// Build a self-contained HTML receipt string matching the physical receipt layout
const buildReceiptHTML = (invoice, activeOutlet, isRefund = false, refundData = null) => {
    let formattedOutletName = 'Attire Lounge';
    if (activeOutlet === 'caffeine') formattedOutletName = 'CUFFEINE';
    if (activeOutlet === 'kravat') formattedOutletName = 'Kravat';

    const items = isRefund && refundData ? refundData.items : invoice.items;

    const grandTotal = isRefund && refundData 
        ? parseFloat(refundData.total) 
        : parseFloat(invoice.grand_total || invoice.total || invoice.final_total || 0);

    const subtotal = isRefund && refundData
        ? parseFloat(refundData.total)
        : parseFloat(invoice.subtotal || invoice.total || 0);

    const totalDiscount = isRefund ? 0 : parseFloat(invoice.tier_discount_amt || invoice.total_discount || invoice.discount_amount || 0);
    const discountPct = isRefund ? 0 : parseFloat(invoice.tier_discount_pct || 0);
    // Determine discount display: percentage shows "X%", fixed shows "$X"
    const discountLabel = discountPct > 0 ? `${discountPct}%` : (totalDiscount > 0 ? `$${totalDiscount.toFixed(2)}` : '0%');

    // Calculate total quantity
    let totalQty = 0;
    const itemCount = (items || []).length;

    // Build item rows matching: # | Description | Qty | Price | Disc | Amount
    const itemRows = (items || []).map((item, idx) => {
        const qty = parseInt(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        totalQty += qty;

        // Calculate per-item discount
        let itemDisc = 0;
        if (item.discount_type === 'percentage' || item.discount_type === 'percent') {
            itemDisc = (unitPrice * qty) * (parseFloat(item.discount_value) / 100);
        } else if (item.discount_type === 'amount' || item.discount_type === 'price') {
            itemDisc = parseFloat(item.discount_value) || 0;
        }

        const lineAmount = (unitPrice * qty) - itemDisc;
        const discDisplay = itemDisc > 0 ? itemDisc.toFixed(2) : '-';

        // Build description: product name + variant
        let descHtml = `<div style="font-weight: 900; font-size: 11px;">${item.product_name}</div>`;
        if (item.product_variant) {
            const variants = item.product_variant.split(' | ');
            const variantHtml = variants.map(v => {
                // Special formatting for Sugar and Milk
                if (v.toLowerCase().includes('sugar') || v.toLowerCase().includes('milk')) {
                    return `<div style="margin-top: 1px; font-weight: 700;">${v}</div>`;
                }
                return `<div style="margin-top: 1px;">- ${v}</div>`;
            }).join('');
            descHtml += `<div style="font-size: 10px; font-weight: normal; margin-top: 2px; padding-left: 0px; color: #000;">${variantHtml}</div>`;
        }

        return `
            <tr>
                <td>${idx + 1}</td>
                <td style="text-align: left; padding-bottom: 4px;">${descHtml}</td>
                <td>${qty}</td>
                <td>${unitPrice.toFixed(2)}</td>
                <td>${discDisplay}</td>
                <td>${lineAmount.toFixed(2)}</td>
            </tr>`;
    }).join('');

    // Date formatting: DD-MM-YYYY
    const d = new Date(invoice.created_at || invoice.date || Date.now());
    const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

    const sellerName = invoice.cashier?.name || invoice.user?.name || 'alo employee';
    const customerName = invoice.customer?.name || 'Walk-in Customer';
    const customerTel = invoice.customer?.phone || '';

    // KHR conversion
    const grandTotalKHR = Math.round(grandTotal * KHR_RATE);
    const formattedKHR = grandTotalKHR.toLocaleString();

    const showSellerAndCustomer = !['caffeine', 'kravat'].includes(activeOutlet);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice ${invoice.invoice_number || ''}</title>
    <style>
        @page {
            size: 72mm 297mm;
            margin: 0;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: #000;
            background: #fff;
            width: 72mm;
            padding: 3mm;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* ---- Header ---- */
        .invoice-title {
            text-align: center;
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 2px;
            margin: 4px 0 8px 0;
            text-transform: uppercase;
        }

        /* ---- Info Section ---- */
        .info-section {
            margin-bottom: 6px;
        }
        .info-row {
            display: flex;
            font-size: 10px;
            font-weight: 700;
            line-height: 1.6;
        }
        .info-label {
            min-width: 60px;
        }
        .info-dots {
            flex: 0 0 auto;
            margin: 0 2px;
        }
        .info-value {
            flex: 1;
        }

        /* ---- Divider ---- */
        .divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 4px 0;
        }
        .divider-thick {
            border: none;
            border-top: 2px dashed #000;
            margin: 4px 0;
        }

        /* ---- Items Table ---- */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            font-weight: 700;
        }
        table th {
            font-weight: 900;
            text-align: center;
            padding: 3px 1px;
            border-bottom: 1px dashed #000;
            font-size: 10px;
        }
        table th:nth-child(2) {
            text-align: left;
        }
        table td {
            padding: 2px 1px;
            text-align: center;
            vertical-align: top;
            font-weight: 700;
        }
        table td:nth-child(2) {
            text-align: left;
        }

        /* ---- Totals ---- */
        .totals-section {
            margin-top: 4px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 11px;
            font-weight: 700;
            padding: 1px 0;
        }
        .total-label {
            display: flex;
            gap: 4px;
        }
        .total-label .khmer {
            font-size: 10px;
        }
        .grand-total-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 13px;
            font-weight: 900;
            padding: 3px 0;
            margin-top: 2px;
        }
    </style>
</head>
<body>
    <!-- INVOICE Header -->
    <div class="invoice-title">${isRefund ? 'REFUND' : 'INVOICE'}</div>

    <!-- Info Section -->
    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Date</span>
            <span class="info-dots">:</span>
            <span class="info-value">${dateStr}</span>
        </div>
        ${showSellerAndCustomer ? `
        <div class="info-row">
            <span class="info-label">Seller</span>
            <span class="info-dots">:</span>
            <span class="info-value">${sellerName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Customer</span>
            <span class="info-dots">:</span>
            <span class="info-value">${customerName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tel</span>
            <span class="info-dots">:</span>
            <span class="info-value">${customerTel || '...'}</span>
        </div>
        ` : ''}
    </div>

    <hr class="divider">

    <!-- Items Table -->
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Disc</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${itemRows}
        </tbody>
    </table>

    <hr class="divider">

    <!-- Items Count -->
    <div style="font-size: 10px; font-weight: 700; padding: 2px 0;">
        Items Purchase : ${itemCount} (Qty : ${totalQty})
    </div>

    <hr class="divider-thick">

    <!-- Totals Section -->
    <div class="totals-section">
        <div class="total-row">
            <span class="total-label">
                <span class="khmer">ផលបូក</span>
                <span>Sub-Total</span>
                <span>($)</span>
            </span>
            <span>: &nbsp; $ ${subtotal.toFixed(2)}</span>
        </div>

        <div class="total-row">
            <span class="total-label">
                <span class="khmer">បញ្ចុះតម្លៃ</span>
                <span>Disc. (${discountLabel})</span>
                <span>($)</span>
            </span>
            <span>: &nbsp; $ ${totalDiscount.toFixed(2)}</span>
        </div>

        <hr class="divider-thick">

        <div class="grand-total-row">
            <span class="total-label">
                <span class="khmer">សរុប</span>
                <span>Grand Total ($)</span>
            </span>
            <span>: &nbsp; $ ${grandTotal.toFixed(2)}</span>
        </div>

        <div class="grand-total-row">
            <span class="total-label">
                <span class="khmer">សរុប</span>
                <span>Grand Total (៛)</span>
            </span>
            <span>: &nbsp; ៛ ${formattedKHR}</span>
        </div>
    </div>

    ${!isRefund && invoice.payments && invoice.payments.length > 0 ? `
    <hr class="divider">
    <div style="font-size: 10px; font-weight: 700; padding: 2px 0;">
        ${invoice.payments.map(p => {
            const method = (p.method || p.payment_method || '').toUpperCase();
            return `<div class="total-row">
                <span>${method}</span>
                <span>$ ${parseFloat(p.amount).toFixed(2)}</span>
            </div>`;
        }).join('')}
    </div>` : ''}

    <div style="height: 16px;"></div>
</body>
</html>`;
};

/**
 * Prints the receipt by injecting an iframe with self-contained HTML.
 * This avoids all portal/z-index/CSS stacking context issues.
 */
export const printReceipt = (invoice, activeOutlet, isRefund = false, refundData = null) => {
    if (!invoice) {
        console.error('[ThermalReceipt] No invoice data provided for printing.');
        return;
    }

    console.log('[ThermalReceipt] Printing receipt for invoice:', invoice.invoice_number);

    const html = buildReceiptHTML(invoice, activeOutlet, isRefund, refundData);

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for the iframe to render, then print using a single robust timeout
    setTimeout(() => {
        if (!iframe.parentNode) return;
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) {
            console.error('[ThermalReceipt] Print failed:', e);
        }
        
        // Clean up iframe after a delay to allow print dialog to finish
        setTimeout(() => {
            if (iframe.parentNode) document.body.removeChild(iframe);
        }, 3000);
    }, 500);
};

// Keep the component export for backward compatibility, but it renders nothing visually
const ThermalReceipt = () => null;
export default ThermalReceipt;
