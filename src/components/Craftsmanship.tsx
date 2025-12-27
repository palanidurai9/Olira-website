
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Phone, Gift, Truck, ArrowRight } from 'lucide-react';
import sewingImg from '../assets/craft-sewing.png';

const Craftsmanship: React.FC = () => {
    const steps = [
        {
            icon: <Star size={20} className="text-white" />,
            title: "You Choose Your Style",
            desc: "Fall in love with one of our unique designs and place your order."
        },
        {
            icon: <Phone size={20} className="text-white" />,
            title: "We Call to Confirm",
            desc: "Our team personally calls you to confirm your size and ask if you need any custom adjustments—on us."
        },
        {
            icon: <Gift size={20} className="text-white" />,
            title: "We Craft with Care",
            desc: "Your garment is then individually stitched by our skilled artisans here in Tiruppur."
        },
        {
            icon: <Truck size={20} className="text-white" />,
            title: "Delivered to Your Door",
            desc: "Your one-of-a-kind piece is dispatched, ready to be worn and loved in 7-15 working days."
        }
    ];

    return (
        <section className="bg-white py-16 md:py-24">
            <div className="container-custom mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left: Image */}
                    <div className="w-full lg:w-1/2">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                            <img
                                src={sewingImg}
                                alt="Craftsmanship"
                                className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay just for a bit of mood */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500"></div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-4">
                            Fashion Crafted Uniquely for You
                        </h2>
                        <p className="text-gray-500 mb-10 text-sm md:text-base leading-relaxed">
                            We don't just sell clothes. We craft them to your measurements and taste. Here's how your perfect outfit is born.
                        </p>

                        <div className="space-y-8 mb-10">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-5">
                                    <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md mt-1">
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-dark mb-1 font-serif">{step.title}</h3>
                                        <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-light">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link to="/shop" className="inline-flex items-center px-8 py-3 bg-gray-100 text-dark text-sm font-medium rounded-lg hover:bg-primary hover:text-white transition-all duration-300">
                            Shop now <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Craftsmanship;
