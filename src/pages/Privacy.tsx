import React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8">Privacy Policy</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email, address, and payment details.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">How We Use Your Information</h3>
                <p>We use your information to process orders, communicate with you, and improve our services.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Sharing of Information</h3>
                <p>We do not sell or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website and conducting our business.</p>
            </div>
        </div>
    );
};

export default Privacy;
