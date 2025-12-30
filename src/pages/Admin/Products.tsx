
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, Category } from '../../types';
import { Plus, Edit2, Trash2, Search, X, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit/Add Mode
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 10,
        featured: false,
        launch_date: new Date().toISOString().split('T')[0] // today
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: categoriesData } = await supabase.from('categories').select('*');

        if (productsData) setProducts(productsData);
        if (categoriesData) setCategories(categoriesData);
        setLoading(false);
    };

    const handleOpenSidebar = (product?: Product) => {
        if (product) {
            setCurrentProduct({ ...product });
        } else {
            setCurrentProduct({
                sizes: ['S', 'M', 'L', 'XL'],
                stock: 10,
                featured: false,
                launch_date: new Date().toISOString().split('T')[0]
            });
        }
        setIsSidebarOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Auto-generate slug from name if missing
            const slug = currentProduct.slug || currentProduct.name?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            const payload = { ...currentProduct, slug };
            // Remove images array from payload as it's handled separately (mock logic for now)
            delete (payload as any).images;

            const { error } = await supabase.from('products').upsert(payload);

            if (error) throw error;

            await fetchData();
            setIsSidebarOpen(false);
        } catch (error: any) {
            alert('Error saving product: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            fetchData();
        }
    };

    // Removed AI generation logic

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-serif font-bold text-dark">Products</h1>
                <button
                    onClick={() => handleOpenSidebar()}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex items-center">
                <Search size={20} className="text-gray-400 mr-3" />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                <th className="p-4">Name</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Launch Date</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading products...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No products found. Add your first one!</td></tr>
                            ) : (
                                products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-dark">{product.name}</div>
                                            <div className="text-xs text-gray-400">{product.slug}</div>
                                        </td>
                                        <td className="p-4">₹{product.price}</td>
                                        <td className="p-4 w-32">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${new Date(product.launch_date) <= new Date() ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {format(new Date(product.launch_date), 'MMM d, yyyy')}
                                            </span>
                                        </td>
                                        <td className="p-4">{product.stock}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleOpenSidebar(product)} className="text-blue-600 hover:text-blue-800 p-2"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slide-up md:animate-none">

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold text-dark">{currentProduct.id ? 'Edit Product' : 'New Product'}</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Product Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                <div className="space-y-3">
                                    {currentProduct.images?.[0]?.image_url && (
                                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <img
                                                src={currentProduct.images[0].image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="url"
                                        value={currentProduct.images?.[0]?.image_url || ''}
                                        onChange={e => {
                                            const newImages = [...(currentProduct.images || [])];
                                            if (newImages.length > 0) {
                                                newImages[0] = { ...newImages[0], image_url: e.target.value };
                                            } else {
                                                newImages.push({ id: 'temp-' + Date.now(), product_id: currentProduct.id || '', image_url: e.target.value, order_index: 0 });
                                            }
                                            setCurrentProduct({ ...currentProduct, images: newImages });
                                        }}
                                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        placeholder="Paste image URL (e.g. from Unsplash)"
                                    />
                                    <p className="text-xs text-gray-500">
                                        For now, simply paste a URL. Future updates will support file uploads.
                                    </p>
                                </div>
                            </div>
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={currentProduct.name || ''}
                                    onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="e.g. Midnight Silk Abaya"
                                />
                            </div>

                            {/* Fabric */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Details</label>
                                <input
                                    type="text"
                                    value={currentProduct.fabric || ''}
                                    onChange={e => setCurrentProduct({ ...currentProduct, fabric: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="e.g. 100% Premium Nida"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={4}
                                    value={currentProduct.description || ''}
                                    onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                    placeholder="Generated description will appear here..."
                                />
                            </div>

                            {/* Price & Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={currentProduct.price || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Optional)</label>
                                    <input
                                        type="number"
                                        value={currentProduct.sale_price || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, sale_price: Number(e.target.value) })}
                                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        value={currentProduct.stock || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Launch Date</label>
                                    <input
                                        type="date"
                                        value={currentProduct.launch_date || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, launch_date: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={currentProduct.category_id || ''}
                                    onChange={e => setCurrentProduct({ ...currentProduct, category_id: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-md outline-none bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {categories.length === 0 ? (
                                    <div className="mt-2 text-xs text-orange-500 flex items-center gap-2">
                                        <span>No categories found in database.</span>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const defaults = [
                                                    { name: 'Sarees', slug: 'sarees' },
                                                    { name: 'Kurtis', slug: 'kurtis' },
                                                    { name: 'Dresses', slug: 'dresses' },
                                                    { name: 'Co-ord Sets', slug: 'coord-sets' },
                                                    { name: 'Suit Sets', slug: 'suit-sets' }
                                                ];
                                                const { error } = await supabase.from('categories').insert(defaults);
                                                if (error) alert('Failed to create categories: ' + error.message);
                                                else fetchData();
                                            }}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            Initialize Defaults
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">Select a category for this product.</p>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 border-t border-gray-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    Save Product
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
