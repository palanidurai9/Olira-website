
import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const FloatingWhatsApp: React.FC = () => {
    const location = useLocation();

    // Hide on admin pages
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    // Replace with actual WhatsApp number
    const whatsappNumber = "919876543210";
    const message = "Hi Oliraa! I'm interested in your collection.";

    const handleClick = () => {
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <motion.button
            onClick={handleClick}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
            aria-label="Chat on WhatsApp"
        >
            <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="fill-current stroke-none"
            >
                <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.767-.721 2.016-1.418.249-.694.249-1.289.173-1.418-.074-.129-.272-.206-.572-.356z" />
                <path d="M11.944 24c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12zm0-22c-5.523 0-10 4.477-10 10 0 1.956.574 3.774 1.55 5.314l-1.023 3.728 3.829-1.002c1.474.872 3.195 1.386 5.044 1.386 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10z" />
            </svg>
        </motion.button>
    );
};

export default FloatingWhatsApp;
