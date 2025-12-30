import React from 'react';

const ReturnPolicy: React.FC = () => {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8">Return Policy</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p><strong>Last Updated: January 2025</strong></p>
                <p>We accept returns for store credit or refund within 7 days of delivery. Items must be in original condition with tags attached.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Non-Returnable Items</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Custom ordered items</li>
                    <li>Sale items</li>
                    <li>Gift cards</li>
                </ul>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Damaged or Defective Items</h3>
                <p>If you receive a damaged or defective item, please contact us immediately at hello@oliraa.com with details and photos of the product.</p>
            </div>
        </div>
    );
};

export default ReturnPolicy;
