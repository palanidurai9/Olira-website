import React from 'react';

const Shipping: React.FC = () => {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8">Shipping & Delivery</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p>At Olira, we ensure that your orders reach you in perfect condition and on time.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Shipping Charges</h3>
                <p>We offer <strong>Free Shipping</strong> on all orders above ₹2000 within India. For orders below ₹2000, a standard shipping charge of ₹100 applies.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">Delivery Time</h3>
                <p>Orders are usually dispatched within 24-48 hours of placement. Standard delivery time is 3-7 business days depending on your location.</p>

                <h3 className="text-xl font-bold text-dark mt-6 mb-2">International Shipping</h3>
                <p>Currently, we only ship within India. We are working on bringing Olira to the world soon.</p>
            </div>
        </div>
    );
};

export default Shipping;
