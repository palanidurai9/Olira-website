import React from 'react';

const CookiesPage: React.FC = () => {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8">Cookie Policy</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p>This Cookie Policy explains how Oliraa uses cookies and similar technologies to recognize you when you visit our website.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">What are Cookies?</h3>
                <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">How We Use Cookies</h3>
                <p>We use cookies to understand how you interact with our website, remember your preferences, and improve your user experience.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Managing Cookies</h3>
                <p>You can control and manage cookies in various ways. You can change your browser settings to disable or delete cookies.</p>
            </div>
        </div>
    );
};

export default CookiesPage;
