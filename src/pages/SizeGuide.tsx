import React from 'react';

const SizeGuide: React.FC = () => {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif text-dark mb-8">Size Guide</h1>
            <p className="text-gray-600 mb-8">Use this guide to choose the right size for a perfect fit.</p>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-dark uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Size</th>
                            <th className="px-6 py-3">Bust (inches)</th>
                            <th className="px-6 py-3">Waist (inches)</th>
                            <th className="px-6 py-3">Hips (inches)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b">
                            <td className="px-6 py-4 font-medium text-dark">XS</td>
                            <td className="px-6 py-4">32</td>
                            <td className="px-6 py-4">26</td>
                            <td className="px-6 py-4">34</td>
                        </tr>
                        <tr className="bg-white border-b">
                            <td className="px-6 py-4 font-medium text-dark">S</td>
                            <td className="px-6 py-4">34</td>
                            <td className="px-6 py-4">28</td>
                            <td className="px-6 py-4">36</td>
                        </tr>
                        <tr className="bg-white border-b">
                            <td className="px-6 py-4 font-medium text-dark">M</td>
                            <td className="px-6 py-4">36</td>
                            <td className="px-6 py-4">30</td>
                            <td className="px-6 py-4">38</td>
                        </tr>
                        <tr className="bg-white border-b">
                            <td className="px-6 py-4 font-medium text-dark">L</td>
                            <td className="px-6 py-4">38</td>
                            <td className="px-6 py-4">32</td>
                            <td className="px-6 py-4">40</td>
                        </tr>
                        <tr className="bg-white border-b">
                            <td className="px-6 py-4 font-medium text-dark">XL</td>
                            <td className="px-6 py-4">40</td>
                            <td className="px-6 py-4">34</td>
                            <td className="px-6 py-4">42</td>
                        </tr>
                        <tr className="bg-white">
                            <td className="px-6 py-4 font-medium text-dark">XXL</td>
                            <td className="px-6 py-4">42</td>
                            <td className="px-6 py-4">36</td>
                            <td className="px-6 py-4">44</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-sm text-gray-500">
                <p>* Garment measurements may vary slightly depending on style and fabric.</p>
                <p>* If you are between sizes, we recommend sizing up for a comfortable fit.</p>
            </div>
        </div>
    );
};

export default SizeGuide;
