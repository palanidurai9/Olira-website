import React from 'react';

const Returns: React.FC = () => {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8">Returns & Exchanges</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p>We want you to love your purchase. If you didn't love it, we're here to help.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Return Policy</h3>
                <p>We accept returns within 7 days of delivery. The product must be unused, unwashed, and with all original tags intact.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">How to Return</h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to the 'Track Order' page or contact our customer support.</li>
                    <li>Enter your order details and select the item you wish to return.</li>
                    <li>Our courier partner will pick up the package within 2-3 business days.</li>
                </ol>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Refunds</h3>
                <p>Once we receive and inspect the product, your refund will be processed to your original payment method within 5-7 business days.</p>
            </div>
        </div>
    );
};

export default Returns;
