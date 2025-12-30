import React, { useState } from 'react';
import { Search } from 'lucide-react';

const TrackOrder: React.FC = () => {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState<null | string>(null);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock tracking logic
        setStatus(`Order #${orderId} is currently being processed at our warehouse.`);
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto min-h-[60vh]">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8 text-center">Track Your Order</h1>

            <form onSubmit={handleTrack} className="space-y-4">
                <div>
                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                    <div className="relative">
                        <input
                            type="text"
                            id="orderId"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Enter your Order ID (e.g., OLI-1234)"
                            className="block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm"
                            required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                    Track Status
                </button>
            </form>

            {status && (
                <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-100 text-center animate-fade-in">
                    <p className="text-gray-700">{status}</p>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;
