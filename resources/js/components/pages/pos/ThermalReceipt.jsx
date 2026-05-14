import React from 'react';

const ThermalReceipt = ({ invoice, activeOutlet }) => {
    if (!invoice) return null;

    const formattedOutletName = activeOutlet 
        ? activeOutlet.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
        : 'Caffeine';

    return (
        <div className="print-only bg-white text-black text-[12px] font-mono leading-tight p-2" style={{ width: '80mm', color: 'black' }}>
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase" style={{ color: 'black' }}>Attire Lounge Official</h1>
                <h2 className="text-sm uppercase tracking-wider mt-1" style={{ color: 'black' }}>{formattedOutletName}</h2>
                <p className="text-[10px] mt-1" style={{ color: 'black' }}>Receipt / Tax Invoice</p>
            </div>

            {/* Transaction Info */}
            <div className="border-t border-b border-black border-dashed py-2 mb-2 text-[10px] space-y-1">
                <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="font-bold">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(invoice.created_at || Date.now()).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{invoice.cashier?.name || invoice.user?.name || 'Staff'}</span>
                </div>
                {invoice.customer && (
                    <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{invoice.customer.name}</span>
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="mb-2">
                <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                        <tr className="border-b border-black border-dashed">
                            <th className="font-normal py-1 w-1/2">Item</th>
                            <th className="font-normal py-1 text-center">Qty</th>
                            <th className="font-normal py-1 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item, idx) => (
                            <tr key={idx} className="align-top">
                                <td className="py-1">
                                    <span style={{ color: 'black' }}>{item.product_name}</span>
                                    {item.product_variant && <div className="text-[9px] text-gray-800">{item.product_variant}</div>}
                                </td>
                                <td className="py-1 text-center" style={{ color: 'black' }}>{item.quantity}</td>
                                <td className="py-1 text-right" style={{ color: 'black' }}>${(parseFloat(item.unit_price) * parseInt(item.quantity)).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="border-t border-black border-dashed pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${parseFloat(invoice.subtotal || invoice.total).toFixed(2)}</span>
                </div>
                {(parseFloat(invoice.total_discount || invoice.discount_amount) > 0) && (
                    <div className="flex justify-between">
                        <span>Discount</span>
                        <span>-${parseFloat(invoice.total_discount || invoice.discount_amount).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-[14px] mt-1" style={{ color: 'black' }}>
                    <span>TOTAL</span>
                    <span>${parseFloat(invoice.total || invoice.final_total).toFixed(2)}</span>
                </div>
            </div>

            {/* Payments */}
            <div className="mt-2 pt-2 border-t border-black border-dashed text-[10px] space-y-1">
                {invoice.payments?.map((payment, idx) => (
                    <div key={idx} className="flex justify-between">
                        <span className="uppercase">{payment.method || payment.payment_method}</span>
                        <span>${parseFloat(payment.amount).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-black border-dashed text-[10px]" style={{ color: 'black' }}>
                <p>Thank you for shopping at</p>
                <p className="font-bold mt-1">Attire Lounge Official</p>
                <p className="mt-2 text-[8px] uppercase tracking-widest text-gray-800">Please keep receipt for returns</p>
            </div>
            
            {/* Cut whitespace */}
            <div className="h-8"></div>
        </div>
    );
};

export default ThermalReceipt;
