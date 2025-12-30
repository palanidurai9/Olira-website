
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Instagram, Facebook, Twitter, ShoppingBag, HelpCircle, FileText, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer: React.FC = () => {
    // Accordion state
    const [openSection, setOpenSection] = useState<string | null>('Shop');

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const sections = [
        {
            title: 'Shop',
            icon: <ShoppingBag size={18} />,
            links: [
                { name: 'New Arrivals', to: '/new-arrivals' },
                { name: 'Best Sellers', to: '/shop?sort=best-selling' },
                { name: 'Sarees', to: '/sarees' },
                { name: 'Kurtis', to: '/kurtis' },
                { name: 'Dresses', to: '/dresses' }
            ]
        },
        {
            title: 'Customer Care',
            icon: <HelpCircle size={18} />,
            links: [
                { name: 'Contact Us', to: '/contact' },
                { name: 'Shipping & Delivery', to: '/shipping' },
                { name: 'Returns & Exchanges', to: '/returns' },
                { name: 'Size Guide', to: '/size-guide' },
                { name: 'Track Order', to: '/track-order' },
                { name: 'FAQ', to: '/faq' }
            ]
        },
        {
            title: 'Legal & Privacy',
            icon: <FileText size={18} />,
            links: [
                { name: 'Terms of Service', to: '/terms' },
                { name: 'Privacy Policy', to: '/privacy' },
                { name: 'Cookie Policy', to: '/cookies' },
                { name: 'Return Policy', to: '/return-policy' }
            ]
        },
        {
            title: 'Connect',
            icon: <Mail size={18} />,
            content: (
                <div className="flex flex-col space-y-3 text-gray-500 text-sm">
                    <p>Email: hello@olira.com</p>
                    <p>Phone: +91 98765 43210</p>
                    <p>Mon - Fri: 10:00 AM - 6:00 PM</p>
                    <div className="flex items-center space-x-4 mt-2">
                        <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-colors">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-colors">
                            <Facebook size={18} />
                        </a>
                        <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-colors">
                            <Twitter size={18} />
                        </a>
                    </div>
                </div>
            )
        }
    ];

    return (
        <footer className="bg-[#fcfbf9] pt-16 pb-8 border-t border-gray-100">
            <div className="container-custom px-4 max-w-7xl mx-auto">

                {/* Brand Logo - Centered */}
                <div className="flex justify-center mb-16">
                    <img src="/src/assets/olira-text-logo.png" alt="Oliraa" className="w-80 opacity-90" />
                </div>

                {/* Desktop Grid Layout (Visible on md+) */}
                <div className="hidden md:grid grid-cols-4 gap-8 mb-16">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="font-serif font-bold text-dark mb-6 flex items-center gap-2">
                                {section.title}
                            </h4>
                            {section.links ? (
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link to={link.to} className="text-sm text-gray-500 hover:text-primary transition-colors">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                section.content
                            )}
                        </div>
                    ))}
                </div>

                {/* Mobile Accordion Layout (Visible only on mobile) */}
                <div className="md:hidden space-y-4 mb-16">
                    {sections.map((section) => (
                        <div key={section.title} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                            >
                                <span className="flex items-center gap-3 font-medium text-dark text-sm uppercase tracking-wide">
                                    {section.icon}
                                    {section.title}
                                </span>
                                {openSection === section.title ? (
                                    <Minus size={16} className="text-gray-400" />
                                ) : (
                                    <Plus size={16} className="text-gray-400" />
                                )}
                            </button>

                            <AnimatePresence>
                                {openSection === section.title && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 border-t border-gray-50 bg-gray-50/30">
                                            {section.links ? (
                                                <ul className="space-y-3 pt-3">
                                                    {section.links.map((link) => (
                                                        <li key={link.name}>
                                                            <Link to={link.to} className="text-sm text-gray-500 hover:text-primary block py-1">
                                                                {link.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="pt-3">
                                                    {section.content}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Oliraa. All rights reserved.</p>
                    <div className="flex items-center space-x-6">
                        <Link to="/terms" className="hover:text-dark transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-dark transition-colors">Privacy Policy</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
