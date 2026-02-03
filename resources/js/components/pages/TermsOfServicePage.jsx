import React from 'react';
import PolicyLayout from '../layouts/PolicyLayout';
import { Link } from 'react-router-dom';

const TermsOfServicePage = () => {
    return (
        <PolicyLayout title="Terms of Service" lastUpdated="January 19, 2026">
            <p className="lead text-xl text-white/90 mb-10 font-light">
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Attire Lounge website (the "Service") operated by Attire Lounge ("us", "we", or "our").
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-12">
                <div className="p-8 bg-white/5 rounded-2xl border border-white/5">
                    <h3 className="!mt-0">Conditions of Use</h3>
                    <p className="!mb-0">
                        We will provide their services to you, which are subject to the conditions stated below in this document. Every time you visit this website, use its services, or make a purchase, you accept the following conditions. This is why we urge you to read them carefully.
                    </p>
                </div>
                <div className="p-8 bg-white/5 rounded-2xl border border-white/5">
                    <h3 className="!mt-0">Privacy Policy</h3>
                    <p className="!mb-0">
                        Before you continue using our website, we advise you to read our <Link to="/privacy" className="text-attire-accent hover:text-white transition-colors">Privacy Policy</Link> regarding our user data collection. It will help you better understand our practices.
                    </p>
                </div>
            </div>

            <h3>Copyright</h3>
            <p>Content published on this website (digital downloads, images, texts, graphics, logos) is the property of Attire Lounge and/or its content creators and protected by international copyright laws. The entire compilation of the content found on this website is the exclusive property of Attire Lounge.</p>

            <h3>Communications</h3>
            <p>The entire communication with us is electronic. Every time you send us an email or visit our website, you are going to be communicating with us. You hereby consent to receive communications from us. If you subscribe to the news on our website, you are going to receive regular emails from us. We will continue to communicate with you by posting news and notices on our website and by sending you emails. You also agree that all notices, disclosures, agreements, and other communications we provide to you electronically meet the legal requirements that such communications be in writing.</p>

            <div className="my-12 p-8 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/10">
                <h3 className="!mt-0 text-attire-accent">Applicable Law</h3>
                <p className="!mb-0 text-white/90">
                    By visiting this website, you agree that the laws of the Kingdom of Cambodia, without regard to principles of conflict laws, will govern these terms of service, or any dispute of any sort that might come between Attire Lounge and you, or its business partners and associates.
                </p>
            </div>
            
            <h3>Disputes</h3>
            <p>Any dispute related in any way to your visit to this website or to products you purchase from us shall be arbitrated by courts in the Kingdom of Cambodia and you consent to exclusive jurisdiction and venue of such courts.</p>

            <h3>Comments, Reviews, and Emails</h3>
            <p>Visitors may post content as long as it is not obscene, illegal, defamatory, threatening, infringing of intellectual property rights, invasive of privacy, or injurious in any other way to third parties. Content has to be free of software viruses, political campaign, and commercial solicitation.</p>
            <p>We reserve all rights (but not the obligation) to remove and/or edit such content. When you post your content, you grant Attire Lounge non-exclusive, royalty-free and irrevocable right to use, reproduce, publish, modify such content throughout the world in any media.</p>
            
            <h3>License and Site Access</h3>
            <p>We grant you a limited license to access and make personal use of this website. You are not allowed to download or modify it. This may be done only with written consent from us.</p>
        </PolicyLayout>
    );
};

export default TermsOfServicePage;