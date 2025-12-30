import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8">Terms of Service</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p>Welcome to Oliraa. By accessing or using our website, you agree to be bound by these Terms of Service.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">1. Use of Website</h3>
                <p>You may use our website only for lawful purposes. You are prohibited from violating or attempting to violate the security of the website.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">2. Product Information</h3>
                <p>We make every effort to display as accurately as possible the colors and features of our products. However, we cannot guarantee that your monitor's display of any color will be accurate.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">3. Pricing</h3>
                <p>All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">4. Governing Law</h3>
                <p>These terms shall be governed by and construed in accordance with the laws of India.</p>
            </div>
        </div>
    );
};

export default Terms;
