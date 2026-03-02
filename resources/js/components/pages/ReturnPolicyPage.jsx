import React from 'react';
import PolicyLayout from '../layouts/PolicyLayout';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, CheckCircle, PackageX, Mail, Phone, ClipboardCheck } from 'lucide-react';

const InfoSection = ({ icon: Icon, title, children, highlighted = false }) => (
    <motion.div 
        className={`border rounded-3xl p-8 transition-all duration-300 ${
            highlighted 
                ? 'bg-attire-accent/5 border-attire-accent/20' 
                : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30'
        }`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
    >
        <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                highlighted 
                    ? 'bg-attire-accent/10 border-attire-accent/20' 
                    : 'bg-white/5 border-white/10'
            }`}>
                <Icon className={`w-6 h-6 ${highlighted ? 'text-attire-accent' : 'text-attire-silver'}`} />
            </div>
            <h3 className={`!m-0 text-xl font-serif ${highlighted ? 'text-attire-accent' : 'text-white'}`}>{title}</h3>
        </div>
        <div className="prose-p:text-attire-silver/80 prose-ul:list-disc prose-ul:pl-5 prose-li:text-attire-silver/80">
            {children}
        </div>
    </motion.div>
);

const CustomListItem = ({ children, type = "check" }) => (
    <li>
        {type === "alert" && <AlertTriangle className="w-4 h-4 text-red-400 mt-1 shrink-0" />}
        {children}
    </li>
);

const ReturnPolicyPage = () => {
    return (
        <PolicyLayout title="Return Policy" lastUpdated="January 19, 2026">
            <motion.p 
                className="lead text-xl text-center text-white/70 mb-16 font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                We want you to be completely satisfied with your Attire Lounge purchase. Please review our detailed return policy below.
            </motion.p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Local Purchases Card */}
                <InfoSection icon={MapPin} title="In-Store & Local">
                    <ul>
                        <CustomListItem>Return or exchange within <strong>1-2 days</strong> of purchase.</CustomListItem>
                        <CustomListItem>Items must be <strong>unworn, unwashed, and unaltered</strong> with original tags.</CustomListItem>
                    </ul>
                </InfoSection>

                {/* Provincial Purchases Card */}
                <InfoSection icon={PackageX} title="Provincial Delivery" highlighted={true}>
                    <ul>
                        <CustomListItem type="alert">We <strong>do not accept returns or refunds</strong> for provincial orders.</CustomListItem>
                        <CustomListItem type="alert"><strong>No alterations</strong> offered. Please check sizing guides carefully before ordering.</CustomListItem>
                    </ul>
                </InfoSection>
            </div>

            <InfoSection icon={ClipboardCheck} title="Conditions for All Returns">
                <ul className="grid gap-4">
                    <CustomListItem>Any item that has been worn, used, or altered will be considered <strong>void</strong> for a refund or exchange.</CustomListItem>
                    <CustomListItem>Sale items, custom-made items, and accessories (ties, pocket squares, cufflinks) are <strong>final sale</strong>.</CustomListItem>
                    <CustomListItem>Customer is responsible for any shipping costs associated with returning an item.</CustomListItem>
                </ul>
            </InfoSection>
            
            <motion.div 
                className="text-center p-10 bg-attire-accent/10 rounded-3xl border border-attire-accent/20 mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
            >
                <h3 className="text-2xl font-serif mb-6">Start a Return</h3>
                <p className="mb-8 max-w-lg mx-auto text-attire-silver/70">To initiate a return for an eligible order, please visit our store in Phnom Penh or contact our support team.</p>
                
                <div className="inline-flex flex-col md:flex-row items-center gap-6">
                    <a href="mailto:attireloungekh@gmail.com" className="w-full md:w-auto group flex items-center justify-center gap-4 px-8 py-4 bg-attire-accent hover:bg-white text-black font-semibold rounded-full transition-all duration-300">
                        <Mail className="w-5 h-5" />
                        Email Support
                    </a>
                    <a href="tel:+85569256369" className="w-full md:w-auto group flex items-center justify-center gap-4 px-8 py-4 border border-white/20 hover:bg-white/10 rounded-full transition-colors duration-300">
                        <Phone className="w-5 h-5 text-white group-hover:text-attire-accent transition-colors" />
                        Call Us
                    </a>
                </div>
            </motion.div>
        </PolicyLayout>
    );
};

export default ReturnPolicyPage;