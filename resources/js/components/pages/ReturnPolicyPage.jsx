import React from 'react';
import PolicyLayout from '../layouts/PolicyLayout';
import { AlertTriangle, Clock, MapPin, CheckCircle } from 'lucide-react';

const ReturnPolicyPage = () => {
    return (
        <PolicyLayout title="Return Policy" lastUpdated="January 19, 2026">
            <p className="lead text-xl text-white/90 mb-12 font-light text-center">
                We want you to be completely satisfied with your purchase from Attire Lounge. Please review our detailed return policy below.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-16">
                {/* Local Purchases Card */}
                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-attire-accent/30 transition-colors">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-full bg-attire-accent/20 text-attire-accent">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="!my-0 text-xl">In-Store & Local</h3>
                    </div>
                    <ul className="space-y-4 !pl-0">
                        <li className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-attire-silver shrink-0 mt-1" />
                            <span>Return or exchange within <strong>1-2 days</strong> of purchase.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-attire-silver shrink-0 mt-1" />
                            <span>Items must be <strong>unworn, unwashed, and unaltered</strong> with original tags.</span>
                        </li>
                    </ul>
                </div>

                {/* Provincial Purchases Card */}
                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-red-500/30 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="p-3 rounded-full bg-red-500/20 text-red-500">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="!my-0 text-xl">Provincial Delivery</h3>
                    </div>
                    <ul className="space-y-4 !pl-0 relative z-10">
                        <li className="flex items-start gap-3 text-red-200/80">
                            <span>We <strong>do not accept returns or refunds</strong> for provincial orders.</span>
                        </li>
                        <li className="flex items-start gap-3 text-red-200/80">
                            <span><strong>No alterations</strong> offered. Please check sizing guides carefully before ordering.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <h3>Conditions for All Returns</h3>
            <div className="bg-black/20 p-8 rounded-2xl border border-white/5 mb-12">
                <ul className="grid gap-4">
                    <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-attire-accent mt-2.5 shrink-0" />
                        <span>Any item that has been worn, used, or altered will be considered <strong>void</strong> for a refund or exchange.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-attire-accent mt-2.5 shrink-0" />
                        <span>Sale items, custom-made items, and accessories (ties, pocket squares, cufflinks) are <strong>final sale</strong>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-attire-accent mt-2.5 shrink-0" />
                        <span>Customer is responsible for any shipping costs associated with returning an item.</span>
                    </li>
                </ul>
            </div>
            
            <div className="text-center p-10 bg-attire-accent/10 rounded-3xl border border-attire-accent/20">
                <h3 className="!mt-0 mb-6">Start a Return</h3>
                <p className="mb-8 max-w-lg mx-auto">To initiate a return for an eligible order, please visit our store in Phnom Penh or contact our support team.</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                     <a href="mailto:attireloungekh@gmail.com" className="px-8 py-3 bg-attire-accent text-black font-semibold rounded-full hover:bg-white transition-colors">
                        Email Support
                    </a>
                    <a href="tel:+85569256369" className="px-8 py-3 border border-white/20 hover:bg-white/10 rounded-full transition-colors">
                        Call Us
                    </a>
                </div>
            </div>
        </PolicyLayout>
    );
};

export default ReturnPolicyPage;