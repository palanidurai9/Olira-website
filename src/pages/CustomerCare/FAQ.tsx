import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "How do I place an order?",
            answer: "Simply browse our collection, select your size, and click 'Add to Cart'. Once you're ready, proceed to checkout and follow the steps to complete your purchase."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit/debit cards, UPI, Net Banking, and Cash on Delivery (COD) for select locations."
        },
        {
            question: "Can I cancel my order?",
            answer: "Yes, you can cancel your order within 24 hours of placing it. Please contact our customer support immediately."
        },
        {
            question: "Do you ship internationally?",
            answer: "Currently, we only ship within India. We plan to expand our shipping to international locations soon."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order is shipped, you will receive a tracking link via email and SMS. You can also track it on our website under 'Track Order'."
        }
    ];

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8 text-center">Frequently Asked Questions</h1>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            <span className="font-medium text-dark">{faq.question}</span>
                            {openIndex === index ? (
                                <Minus size={20} className="text-gray-400 flex-shrink-0" />
                            ) : (
                                <Plus size={20} className="text-gray-400 flex-shrink-0" />
                            )}
                        </button>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="p-4 pt-0 text-gray-600 bg-white border-t border-gray-100">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
