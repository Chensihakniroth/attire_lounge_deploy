import React from 'react';
import PolicyLayout from '../layouts/PolicyLayout';
import { motion } from 'framer-motion';
import { FileText, Database, Share2, Shield, Mail, Phone, CheckCircle } from 'lucide-react';

const InfoSection = ({ icon: Icon, title, children }) => (
    <motion.div 
        className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-3xl p-8 transition-all duration-300 hover:border-white/10 hover:bg-black/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
    >
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-attire-accent/10 rounded-xl flex items-center justify-center border border-attire-accent/20">
                <Icon className="w-6 h-6 text-attire-accent" />
            </div>
            <h3 className="!m-0 text-xl font-serif text-white">{title}</h3>
        </div>
        <div className="prose-p:text-attire-silver/80 prose-ul:list-none prose-ul:p-0 prose-li:flex prose-li:items-start prose-li:gap-3 prose-li:mb-2">
            {children}
        </div>
    </motion.div>
);

const CustomListItem = ({ children }) => (
    <li>
        <CheckCircle className="w-4 h-4 text-attire-accent mt-1 shrink-0" />
        <span>{children}</span>
    </li>
);

const PrivacyPolicyPage = () => {
    return (
        <PolicyLayout title="Privacy Policy" lastUpdated="January 19, 2026">
            <motion.p 
                className="lead text-xl text-center text-white/70 mb-16 font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                Your privacy is paramount. This policy outlines how we collect, use, and protect your personal information when you interact with Attire Lounge.
            </motion.p>

            <div className="space-y-8">
                <InfoSection icon={Database} title="Information We Collect">
                    <p>We may collect personal information when you perform actions such as:</p>
                    <ul>
                        <CustomListItem>Browsing our website and collections.</CustomListItem>
                        <CustomListItem>Subscribing to our newsletter (phone number).</CustomListItem>
                        <CustomListItem>Booking an appointment or making a purchase.</CustomListItem>
                        <CustomListItem>Contacting us with inquiries.</CustomListItem>
                    </ul>
                </InfoSection>

                <InfoSection icon={FileText} title="How We Use Your Information">
                    <p>Your information is used to enhance your experience, including:</p>
                    <ul>
                        <CustomListItem>Sending our newsletter and promotional materials via Telegram.</CustomListItem>
                        <CustomListItem>Continuously improving our website and services.</CustomListItem>
                        <CustomListItem>Responding to your inquiries and providing customer service.</CustomListItem>
                    </ul>
                </InfoSection>

                <InfoSection icon={Share2} title="Disclosure of Your Information">
                    <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This excludes trusted third parties who assist us in our operations, provided they agree to maintain confidentiality.</p>
                </InfoSection>

                <InfoSection icon={Shield} title="Security of Your Information">
                    <p>We implement administrative, technical, and physical security measures to protect your data. While we strive for maximum security, please note that no method is 100% impenetrable. We take all reasonable steps to secure your information against misuse.</p>
                </InfoSection>

                <div className="grid md:grid-cols-2 gap-8">
                    <InfoSection icon={CheckCircle} title="Your Consent">
                        <p>By using our site and subscribing, you consent to our privacy policy.</p>
                    </InfoSection>
                     <InfoSection icon={FileText} title="Policy Changes">
                        <p>Any changes to our policy will be posted on this page. Last modified: Jan 19, 2026.</p>
                    </InfoSection>
                </div>
            </div>

            <div className="mt-20 pt-12 border-t border-white/10 text-center">
                <h3 className="text-2xl font-serif mb-4">Contacting Us</h3>
                <p className="max-w-xl mx-auto text-attire-silver/70 mb-8">
                    If you have any questions regarding this privacy policy, you may contact us using the information below.
                </p>
                <div className="inline-flex flex-col md:flex-row items-center gap-6 mt-6">
                    <a href="mailto:attireloungekh@gmail.com" className="w-full md:w-auto group flex items-center justify-center gap-4 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300">
                        <Mail className="w-5 h-5 text-attire-accent" />
                        <span className="text-sm font-medium text-white">attireloungekh@gmail.com</span>
                    </a>
                    <a href="tel:+85569256369" className="w-full md:w-auto group flex items-center justify-center gap-4 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300">
                        <Phone className="w-5 h-5 text-attire-accent" />
                        <span className="text-sm font-medium text-white">(+855) 69-25-63-69</span>
                    </a>
                </div>
            </div>
        </PolicyLayout>
    );
};

export default PrivacyPolicyPage;
