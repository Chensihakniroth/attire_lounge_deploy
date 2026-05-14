import React from 'react';

/**
 * ThermalReceipt - Generates receipt HTML and prints via iframe injection.
 * This bypasses all portal/z-index/CSS conflicts by creating an isolated document.
 */

// Build a self-contained HTML receipt string
const buildReceiptHTML = (invoice, activeOutlet, isRefund = false, refundData = null) => {
    const formattedOutletName = activeOutlet 
        ? activeOutlet.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
        : 'Caffeine';

    const items = isRefund && refundData ? refundData.items : invoice.items;

    const grandTotal = isRefund && refundData 
        ? parseFloat(refundData.total) 
        : parseFloat(invoice.grand_total || invoice.total || invoice.final_total || 0);

    const subtotal = isRefund && refundData
        ? parseFloat(refundData.total)
        : parseFloat(invoice.subtotal || invoice.total || 0);

    const totalDiscount = isRefund ? 0 : parseFloat(invoice.tier_discount_amt || invoice.total_discount || invoice.discount_amount || 0);

    const itemRows = (items || []).map(item => {
        const qty = parseInt(item.quantity);
        const unitPrice = parseFloat(item.unit_price);
        const price = unitPrice * qty;

        let lineTotal = price;
        if (item.discount_type === 'percentage' || item.discount_type === 'percent') {
            lineTotal = price - (price * (parseFloat(item.discount_value) / 100));
        } else if (item.discount_type === 'amount' || item.discount_type === 'price') {
            lineTotal = price - parseFloat(item.discount_value);
        }
        if (isNaN(lineTotal)) lineTotal = price;

        return `
            <tr>
                <td style="padding: 3px 0; vertical-align: top;">
                    ${item.product_name}
                    ${item.product_variant ? `<div style="font-size: 9px; color: #555;">${item.product_variant}</div>` : ''}
                </td>
                <td style="padding: 3px 0; text-align: center; vertical-align: top;">
                    ${isRefund ? '-' : ''}${qty}
                </td>
                <td style="padding: 3px 0; text-align: right; vertical-align: top;">
                    $${lineTotal.toFixed(2)}
                </td>
            </tr>
        `;
    }).join('');

    const paymentRows = (!isRefund && invoice.payments && invoice.payments.length > 0)
        ? invoice.payments.map(p => `
            <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span style="text-transform: uppercase;">${p.method || p.payment_method}</span>
                <span>$${parseFloat(p.amount).toFixed(2)}</span>
            </div>
        `).join('')
        : '';

    const dateStr = new Date(invoice.created_at || invoice.date || Date.now()).toLocaleString();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt - ${invoice.invoice_number || 'POS'}</title>
    <style>
        @page {
            size: auto;
            margin: 0mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #000;
            background: #fff;
            width: 80mm;
            padding: 4mm;
            line-height: 1.3;
        }
        .header {
            text-align: center;
            margin-bottom: 12px;
        }
        .header h1 {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
        }
        .header h2 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 4px 0;
        }
        .header p {
            font-size: 10px;
            font-weight: bold;
        }
        .divider {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            padding: 1px 0;
        }
        .info-row .label { }
        .info-row .value { font-weight: bold; }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        table th {
            font-weight: normal;
            text-align: left;
            padding: 4px 0;
            border-bottom: 1px dashed #000;
        }
        table th:nth-child(2) { text-align: center; }
        table th:nth-child(3) { text-align: right; }
        .totals {
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 4px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            padding: 2px 0;
        }
        .grand-total {
            font-size: 14px;
            font-weight: bold;
            margin-top: 4px;
        }
        .payments {
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px dashed #000;
            font-size: 10px;
        }
        .footer .brand {
            font-weight: bold;
            margin-top: 4px;
        }
        .footer .notice {
            margin-top: 8px;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Attire Lounge Official</h1>
        <h2>${formattedOutletName}</h2>
        <p>${isRefund ? 'REFUND RECEIPT' : 'Receipt / Tax Invoice'}</p>
    </div>

    <hr class="divider">

    <div style="font-size: 10px; margin-bottom: 6px;">
        <div class="info-row">
            <span>Invoice:</span>
            <span class="value">${invoice.invoice_number || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span>Date:</span>
            <span>${dateStr}</span>
        </div>
        <div class="info-row">
            <span>Cashier:</span>
            <span>${invoice.cashier?.name || invoice.user?.name || 'Staff'}</span>
        </div>
        ${invoice.customer ? `
        <div class="info-row">
            <span>Customer:</span>
            <span>${invoice.customer.name}</span>
        </div>` : ''}
    </div>

    <hr class="divider">

    <table>
        <thead>
            <tr>
                <th style="width: 50%;">Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
            </tr>
        </thead>
        <tbody>
            ${itemRows}
        </tbody>
    </table>

    <div class="totals">
        <div class="total-row">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        ${totalDiscount > 0 ? `
        <div class="total-row">
            <span>Discount</span>
            <span>-$${totalDiscount.toFixed(2)}</span>
        </div>` : ''}
        <div class="total-row grand-total">
            <span>${isRefund ? 'TOTAL REFUNDED' : 'TOTAL'}</span>
            <span>$${grandTotal.toFixed(2)}</span>
        </div>
    </div>

    ${paymentRows ? `
    <div class="payments">
        ${paymentRows}
    </div>` : ''}

    <div class="footer">
        <p>Thank you for shopping at</p>
        <p class="brand">Attire Lounge Official</p>
        <p class="notice">Please keep receipt for returns</p>
    </div>

    <div style="height: 20px;"></div>
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

    // Wait for the iframe content to fully render, then print
    iframe.contentWindow.onload = () => {
        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (e) {
                console.error('[ThermalReceipt] Print failed:', e);
            }
            // Clean up iframe after a delay to allow print dialog to finish
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 3000);
        }, 500);
    };

    // Fallback: if onload doesn't fire (e.g. some browsers), trigger after timeout
    setTimeout(() => {
        if (iframe.parentNode) {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (e) {
                // Already printed or iframe removed
            }
        }
    }, 2000);
};

// Keep the component export for backward compatibility, but it renders nothing visually
const ThermalReceipt = () => null;
export default ThermalReceipt;
