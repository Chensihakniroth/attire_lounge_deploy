import React from 'react';
import PolicyLayout from '../layouts/PolicyLayout';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Shield, Copyright, MessageCircle, Gavel, Users, KeyRound } from 'lucide-react';

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

const TermsOfServicePage = () => {
    return (
        <PolicyLayout title="Terms of Service" lastUpdated="January 19, 2026">
            <motion.p 
                className="lead text-xl text-center text-white/70 mb-16 font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                Welcome to Attire Lounge. By accessing our website, you agree to comply with and be bound by the following terms and conditions of use.
            </motion.p>
            
            <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <InfoSection icon={FileText} title="Conditions of Use">
                        <p>
                            Your use of our services is subject to the conditions stated here. Every time you visit, use our services, or make a purchase, you accept these conditions. Please read them carefully.
                        </p>
                    </InfoSection>
                    <InfoSection icon={Shield} title="Privacy Policy">
                        <p>
                            Before using our website, we advise you to read our <Link to="/privacy" className="text-attire-accent hover:text-white transition-colors">Privacy Policy</Link> regarding our user data collection to better understand our practices.
                        </p>
                    </InfoSection>
                </div>

                <InfoSection icon={Copyright} title="Copyright">
                    <p>All content published on this website (images, texts, graphics, logos) is the property of Attire Lounge and/or its content creators, protected by international copyright laws.</p>
                </InfoSection>

                <InfoSection icon={MessageCircle} title="Communications">
                    <p>All communication with us is electronic. By sending us an email or visiting our website, you consent to receive electronic communications from us, including newsletters and site notices.</p>
                </InfoSection>

                <InfoSection icon={Gavel} title="Applicable Law" highlighted={true}>
                    <p>
                        By visiting this website, you agree that the laws of the Kingdom of Cambodia, without regard to principles of conflict laws, will govern these terms of service and any dispute that might arise.
                    </p>
                </InfoSection>

                <div className="grid md:grid-cols-2 gap-8">
                    <InfoSection icon={Users} title="Comments & Reviews">
                        <p>Visitors may post content as long as it is not obscene, illegal, defamatory, or infringing on intellectual property rights. We reserve the right to remove or edit such content.</p>
                    </InfoSection>
                    <InfoSection icon={KeyRound} title="License and Site Access">
                        <p>We grant you a limited license to access and make personal use of this website. You are not allowed to download or modify it without our written consent.</p>
                    </InfoSection>
                </div>
            </div>
        </PolicyLayout>
    );
};

export default TermsOfServicePage;
