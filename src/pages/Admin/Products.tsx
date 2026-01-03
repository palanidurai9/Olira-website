
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
            // Remove images array from payload as it's handled separately
            delete (payload as any).images;

            // 1. Save Product
            const { data: savedProduct, error } = await supabase
                .from('products')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;

            // 2. Save Images
            if (currentProduct.images && currentProduct.images.length > 0) {
                const productImages = currentProduct.images.map((img, index) => ({
                    product_id: savedProduct.id,
                    image_url: img.image_url,
                    order_index: index
                }));

                // Full sync: Delete existing and re-insert (Simple way to handle reordering/deletions)
                await supabase.from('product_images').delete().eq('product_id', savedProduct.id);

                const { error: imgError } = await supabase.from('product_images').insert(productImages);
                if (imgError) throw imgError;
            }

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

    const handleResetCategories = async () => {
        if (!confirm('This will RESET categories to: Maxi Dresses, Kurti Sets, Tops, Shirts, Maternity. Any other UNUSED categories will be deleted. Continue?')) return;
        setSaving(true);
        try {
            const standard = [
                { name: 'Maxi Dresses', slug: 'maxi-dress' },
                { name: 'Kurti Sets', slug: 'kurti-set' },
                { name: 'Tops', slug: 'tops' },
                { name: 'Shirts', slug: 'shirts' },
                { name: 'Maternity Dresses', slug: 'maternity-dress' }
            ];

            // 1. Get all current categories
            const { data: currentCats } = await supabase.from('categories').select('*');

            // 2. Identify
            const toDelete = currentCats?.filter(c => !standard.find(s => s.slug === c.slug)) || [];
            const toAdd = standard.filter(s => !currentCats?.find(c => c.slug === s.slug));

            // 3. Delete unwanted
            if (toDelete.length > 0) {
                const ids = toDelete.map(c => c.id);
                const { error: delError } = await supabase.from('categories').delete().in('id', ids);
                if (delError) {
                    alert('Some categories could not be deleted because they have products linked to them. Please reassign those products first.');
                }
            }

            // 4. Add missing
            if (toAdd.length > 0) {
                await supabase.from('categories').insert(toAdd);
            }

            await fetchData();
            alert('Categories synchronized!');
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

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
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Launch Date</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading products...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No products found. Add your first one!</td></tr>
                            ) : (
                                products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-dark">{product.name}</div>
                                            <div className="text-xs text-gray-400">{product.slug}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                {categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                                            </span>
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
                            {/* Product Images - Multiple */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                                <div className="space-y-3">
                                    {currentProduct.images?.map((img, index) => (
                                        <div key={index} className="flex gap-2 items-start">
                                            <div className="flex-1 space-y-2">
                                                {img.image_url && (
                                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 h-24">
                                                        <img src={img.image_url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <input
                                                    type="url"
                                                    value={img.image_url}
                                                    onChange={e => {
                                                        const newImages = [...(currentProduct.images || [])];
                                                        newImages[index] = { ...newImages[index], image_url: e.target.value };
                                                        setCurrentProduct({ ...currentProduct, images: newImages });
                                                    }}
                                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    placeholder="Paste image URL..."
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = currentProduct.images?.filter((_, i) => i !== index);
                                                    setCurrentProduct({ ...currentProduct, images: newImages });
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded mt-auto mb-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...(currentProduct.images || [])];
                                            newImages.push({
                                                id: `temp-${Date.now()}`,
                                                product_id: currentProduct.id || '',
                                                image_url: '',
                                                order_index: newImages.length
                                            });
                                            setCurrentProduct({ ...currentProduct, images: newImages });
                                        }}
                                        className="text-sm text-primary hover:text-secondary font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Add Another Image
                                    </button>
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

                            {/* Sizes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                                <div className="flex flex-wrap gap-2">
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => {
                                                const currentSizes = currentProduct.sizes || [];
                                                const newSizes = currentSizes.includes(size)
                                                    ? currentSizes.filter(s => s !== size)
                                                    : [...currentSizes, size];
                                                setCurrentProduct({ ...currentProduct, sizes: newSizes });
                                            }}
                                            className={`px-3 py-1 rounded-md text-sm border transition-colors ${currentProduct.sizes?.includes(size)
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <div className="flex gap-2">
                                    <select
                                        value={currentProduct.category_id || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, category_id: e.target.value })}
                                        className="flex-1 p-2 border border-gray-200 rounded-md outline-none bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        {categories
                                            .filter(c => ['maxi-dress', 'kurti-set', 'tops', 'shirts', 'maternity-dress'].includes(c.slug))
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleResetCategories}
                                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-xs font-medium"
                                        title="Reset to Standard Categories"
                                    >
                                        Reset List
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Standard: Maxi, Kurti, Tops, Shirts, Maternity.
                                </p>
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
                    </div >
                </div >
            )}
        </div >
    );
};

export default Products;
