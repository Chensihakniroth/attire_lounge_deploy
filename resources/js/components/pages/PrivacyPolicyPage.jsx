import React from 'react';
import PolicyLayout from '../layouts/PolicyLayout';

const PrivacyPolicyPage = () => {
    return (
        <PolicyLayout title="Privacy Policy" lastUpdated="January 19, 2026">
            <p className="lead text-xl text-white/90 mb-10 font-light">
                Attire Lounge ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or subscribe to our newsletter.
            </p>

            <h3>Information We Collect</h3>
            <p>We may collect personal information from you in a variety of ways, including, but not limited to, when you:</p>
            <ul>
                <li>Visit our website</li>
                <li>Subscribe to our newsletter (we collect your email address)</li>
                <li>Make a purchase or use our services</li>
                <li>Contact us with inquiries</li>
            </ul>
            <p>The only personal information we collect for newsletter subscriptions is your email address.</p>

            <div className="my-12 p-8 bg-white/5 rounded-2xl border border-white/5">
                <h3 className="!mt-0">How We Use Your Information</h3>
                <p className="!mb-0">We use the information we collect for various purposes, including to:</p>
                <ul className="!mb-0">
                    <li>Send you our newsletter, marketing, or promotional materials.</li>
                    <li>Improve our website and services.</li>
                    <li>Respond to your comments, questions, and provide customer service.</li>
                </ul>
            </div>

            <h3>Disclosure of Your Information</h3>
            <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>

            <h3>Security of Your Information</h3>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

            <h3>Your Consent</h3>
            <p>By using our site and subscribing to our newsletter, you consent to our website's privacy policy.</p>

            <h3>Changes to Our Privacy Policy</h3>
            <p>If we decide to change our privacy policy, we will post those changes on this page. This policy was last modified on January 19, 2026.</p>

            <div className="mt-16 pt-8 border-t border-white/10">
                <h3>Contacting Us</h3>
                <p>If there are any questions regarding this privacy policy, you may contact us using the information below:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <strong className="block text-attire-accent text-sm uppercase tracking-wider mb-1">Email</strong>
                        <a href="mailto:attireloungekh@gmail.com" className="hover:text-white transition-colors">attireloungekh@gmail.com</a>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <strong className="block text-attire-accent text-sm uppercase tracking-wider mb-1">Phone</strong>
                        <a href="tel:+85569256369" className="hover:text-white transition-colors">(+855) 69-25-63-69</a>
                    </div>
                </div>
            </div>
        </PolicyLayout>
    );
};

export default PrivacyPolicyPage;
