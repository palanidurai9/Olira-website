import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-dark mb-4">Contact Us</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        We'd love to hear from you. Whether you have a question about our collections,
                        need assistance with an order, or just want to say hello.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100"
                    >
                        <h3 className="text-2xl font-serif text-dark mb-8 text-center">Get in Touch</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-dark">Email Us</h4>
                                    <p className="text-gray-500 mb-1 text-sm">Our friendly team is here to help.</p>
                                    <a href="mailto:hello@oliraa.com" className="text-primary font-medium hover:underline">hello@oliraa.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-dark">WhatsApp</h4>
                                    <p className="text-gray-500 mb-1 text-sm">Mon-Sat from 10am to 6pm.</p>
                                    <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">+91 98765 43210</a>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 mb-10">
                            <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 className="font-medium text-dark">Visit Us</h4>
                                <p className="text-gray-500 mb-1 text-sm">Come say hello at our office headquarters.</p>
                                <p className="text-gray-700">
                                    123 Fashion Avenue, Anna Nagar, Chennai, Tamil Nadu 600040
                                </p>
                            </div>
                        </div>

                        {/* Map Placeholder or Additional Content */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                            <h4 className="font-bold text-dark mb-2">Customer Service</h4>
                            <p className="text-gray-500 text-sm">
                                Please allow up to 24 hours for a response to your email inquiries.
                                For urgent matters, please use WhatsApp.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
