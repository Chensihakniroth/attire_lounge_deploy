import React from 'react';

const ReturnPolicyPage = () => {
    return (
        <div className="min-h-screen pt-24 px-6 bg-attire-dark text-attire-cream py-12">
            <div className="max-w-4xl mx-auto bg-attire-navy p-8 md:p-12 rounded-lg shadow-lg border border-attire-cream/10">
                <h1 className="text-3xl md:text-4xl font-serif mb-6 text-white text-center">Return Policy</h1>
                
                <div className="space-y-6 text-attire-silver leading-relaxed">
                    <p>We want you to be completely satisfied with your purchase from Attire Lounge. Please review our return policy below.</p>
                    
                    <h2 className="text-xl md:text-2xl font-semibold pt-4 text-white">In-Store Purchases & Local Deliveries (Phnom Penh)</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>You may return or exchange items within <strong>1-2 days</strong> of the purchase date.</li>
                        <li>To be eligible for a return, your item must be <strong>unworn, unwashed, unaltered, and in the same condition that you received it</strong>, with all original tags attached.</li>
                        <li>Proof of purchase is required for all returns or exchanges.</li>
                        <li>Refunds will be issued to the original method of payment.</li>
                    </ul>

                    <h2 className="text-xl md:text-2xl font-semibold pt-4 text-white">Provincial/Upcountry Deliveries</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>For orders shipped to provinces outside of Phnom Penh, we <strong>do not accept returns or refunds</strong>.</li>
                        <li>We also <strong>do not offer alterations</strong> for items shipped to the provinces. We encourage you to check our sizing guides carefully before placing your order.</li>
                    </ul>

                    <h2 className="text-xl md:text-2xl font-semibold pt-4 text-white">Conditions for All Returns</h2>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>Any item that has been worn, used, or altered will be considered <strong>void</strong> for a refund or exchange.</li>
                        <li>Sale items, custom-made items, and accessories (including but not limited to ties, pocket squares, and cufflinks) are considered <strong>final sale</strong> and cannot be returned.</li>
                        <li>The customer is responsible for any shipping costs associated with returning an item.</li>
                    </ul>
                    
                    <h2 className="text-xl md:text-2xl font-semibold pt-4 text-white">How to Initiate a Return (for eligible orders)</h2>
                    <p>To initiate a return, please bring the item to our store in Phnom Penh or contact us at:</p>
                    <p><strong>Email:</strong> attireloungekh@gmail.com</p>
                    <p><strong>Phone:</strong> (+855) 69-25-63-69</p>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicyPage;