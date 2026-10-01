import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    getAdminProducts,
    getAdminCategories,
    saveAdminProduct,
    deleteAdminProduct
} from '../../services/adminService';
import type { Product, Category, ProductVariant } from '../../types';
import { Plus, Edit2, Trash2, Search, X, Save, Loader2, Upload, Star } from 'lucide-react';

const Products: React.FC = () => {
    const location = useLocation();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

    // Drawer / Form State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [],
        variants: [],
        stock: 10,
        featured: false,
        new_arrival: true,
        bestseller: false,
        launch_date: new Date().toISOString().split('T')[0]
    });
    const [saving, setSaving] = useState(false);
    const [newImages, setNewImages] = useState<{ file: File; index: number; preview: string }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const state = location.state as { editProductId?: string } | null;
        if (products.length > 0 && state?.editProductId) {
            const productToEdit = products.find(p => p.id === state.editProductId);
            if (productToEdit) {
                handleOpenSidebar(productToEdit);
            }
        }
    }, [products, location.state]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prods, cats] = await Promise.all([
                getAdminProducts(),
                getAdminCategories()
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (e) {
            console.error('Error fetching admin products:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSidebar = (product?: Product) => {
        setNewImages([]);
        if (product) {
            setCurrentProduct({ ...product });
        } else {
            setCurrentProduct({
                name: '',
                slug: '',
                price: 0,
                sale_price: undefined,
                description: '',
                fabric: 'Premium Viscose Rayon',
                care: 'Dry Clean or Gentle Hand Wash',
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Olive', 'Blush Pink'],
                variants: [],
                stock: 20,
                featured: false,
                new_arrival: true,
                bestseller: false,
                category_id: categories[0]?.id || '',
                category_slug: categories[0]?.slug || '',
                images: [],
                launch_date: new Date().toISOString().split('T')[0]
            });
        }
        setIsSidebarOpen(true);
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        const preview = URL.createObjectURL(file);

        setNewImages(prev => {
            const filtered = prev.filter(item => item.index !== index);
            return [...filtered, { file, index, preview }];
        });
    };

    const handleGenerateVariants = () => {
        const sizes = currentProduct.sizes || ['S', 'M', 'L', 'XL'];
        const colors = currentProduct.colors && currentProduct.colors.length > 0 ? currentProduct.colors : ['Standard'];
        const basePrice = Number(currentProduct.price) || 0;
        const perVariantStock = Math.max(1, Math.floor((Number(currentProduct.stock) || 20) / (sizes.length * colors.length)));

        const generated: ProductVariant[] = [];
        sizes.forEach(size => {
            colors.forEach(color => {
                generated.push({
                    id: `var-${size}-${color}`.toLowerCase(),
                    sku: `${currentProduct.sku || 'OLR'}-${size}-${color.substring(0, 3)}`.toUpperCase(),
                    size,
                    color,
                    price: basePrice,
                    stock: perVariantStock,
                    active: true
                });
            });
        });

        setCurrentProduct(prev => ({ ...prev, variants: generated }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const catObj = categories.find(c => c.id === currentProduct.category_id);
            const productToSave: Partial<Product> = {
                ...currentProduct,
                category_slug: catObj?.slug || currentProduct.category_slug
            };

            await saveAdminProduct(
                productToSave,
                newImages.map(item => ({ file: item.file, index: item.index }))
            );

            await fetchData();
            setIsSidebarOpen(false);
            alert('Product saved successfully to Firestore!');
        } catch (error: any) {
            alert('Error saving product: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this product?')) return;
        try {
            await deleteAdminProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            alert('Error deleting product: ' + err.message);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCat = selectedCategoryFilter === 'ALL' || p.category_id === selectedCategoryFilter || p.category_slug === selectedCategoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Product Catalog</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage products, variants, images, and live inventory</p>
                </div>
                <button
                    onClick={() => handleOpenSidebar()}
                    className="btn-primary flex items-center justify-center gap-2 text-xs py-3 px-5 uppercase tracking-wider font-bold shadow-md"
                >
                    <Plus size={16} /> Add New Product
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search products by title or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Category:</span>
                    <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-dark outline-none focus:border-primary bg-white"
                    >
                        <option value="ALL">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6">Product</th>
                                <th className="py-4 px-6">Category</th>
                                <th className="py-4 px-6">Price</th>
                                <th className="py-4 px-6">Stock</th>
                                <th className="py-4 px-6">Variants</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-10 w-40 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-6 w-16 bg-gray-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-14 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                                    <img
                                                        src={product.images?.[0]?.image_url || '/src/assets/product-placeholder.png'}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-dark text-xs truncate max-w-[200px]">{product.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.sku || 'NO-SKU'}</p>
                                                    {product.featured && (
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1">
                                                            <Star size={10} fill="currentColor" /> Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-600">
                                            {categories.find(c => c.id === product.category_id)?.name || product.category_slug || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-xs">
                                            <span className="font-bold text-dark">₹{product.price}</span>
                                            {product.sale_price && (
                                                <span className="block text-[10px] text-red-600">Sale: ₹{product.sale_price}</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-xs">
                                            <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-500">
                                            {product.variants?.length ? `${product.variants.length} combinations` : `${product.sizes?.length || 0} sizes`}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                {product.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenSidebar(product)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-xs text-gray-400">
                                        No products found matching filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Product Slide-over Drawer */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl z-10 flex flex-col overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-dark">
                                    {currentProduct.id ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <p className="text-xs text-gray-500">Configured in Cloud Firestore</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
                            {/* Basic Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Basic Information</h3>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Product Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentProduct.name || ''}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                        className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                        placeholder="e.g. Emerald Olive Printed Kurti Set"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                                        <select
                                            value={currentProduct.category_id || ''}
                                            onChange={(e) => {
                                                const cat = categories.find(c => c.id === e.target.value);
                                                setCurrentProduct({
                                                    ...currentProduct,
                                                    category_id: e.target.value,
                                                    category_slug: cat?.slug
                                                });
                                            }}
                                            className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary bg-white"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">SKU</label>
                                        <input
                                            type="text"
                                            value={currentProduct.sku || ''}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                                            className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary uppercase font-mono"
                                            placeholder="OLR-KRT-001"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Regular Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={currentProduct.price || ''}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) || 0 })}
                                            className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Sale Price (₹)</label>
                                        <input
                                            type="number"
                                            value={currentProduct.sale_price ?? ''}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, sale_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                                            className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Stock Total</label>
                                        <input
                                            type="number"
                                            required
                                            value={currentProduct.stock || ''}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) || 0 })}
                                            className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                                    <textarea
                                        rows={4}
                                        value={currentProduct.description || ''}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                        className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                        placeholder="Full product story, fit notes, styling advice..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Fabric</label>
                                        <input
                                            type="text"
                                            value={currentProduct.fabric || ''}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, fabric: e.target.value })}
                                            className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                            placeholder="Pure Cotton / Chanderi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Care Instructions</label>
                                        <input
                                            type="text"
                                            value={currentProduct.care || ''}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, care: e.target.value })}
                                            className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                            placeholder="Dry clean only"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Images Upload */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Product Gallery (Max 4)</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {[0, 1, 2, 3].map(idx => {
                                        const existingImg = currentProduct.images?.[idx]?.image_url;
                                        const newImg = newImages.find(item => item.index === idx)?.preview;
                                        const displayImg = newImg || existingImg;

                                        return (
                                            <div key={idx} className="relative aspect-[3/4] border-2 border-dashed border-gray-200 rounded-lg overflow-hidden flex flex-col items-center justify-center bg-gray-50 hover:border-primary group">
                                                {displayImg ? (
                                                    <img src={displayImg} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-2 text-gray-400">
                                                        <Upload size={20} className="mx-auto mb-1 text-gray-400 group-hover:text-primary" />
                                                        <span className="text-[10px] block">Slot {idx + 1}</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageSelect(e, idx)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Variants Management */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Size & Color Variants</h3>
                                    <button
                                        type="button"
                                        onClick={handleGenerateVariants}
                                        className="text-xs text-primary font-bold hover:underline"
                                    >
                                        Auto-Generate Combinations
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Available Sizes</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(sz => (
                                                <label key={sz} className="flex items-center gap-1.5 text-xs bg-gray-50 px-2.5 py-1 rounded border cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentProduct.sizes?.includes(sz)}
                                                        onChange={(e) => {
                                                            const sizes = currentProduct.sizes || [];
                                                            if (e.target.checked) {
                                                                setCurrentProduct({ ...currentProduct, sizes: [...sizes, sz] });
                                                            } else {
                                                                setCurrentProduct({ ...currentProduct, sizes: sizes.filter(s => s !== sz) });
                                                            }
                                                        }}
                                                        className="accent-primary"
                                                    />
                                                    <span>{sz}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Colors (Comma separated)</label>
                                        <input
                                            type="text"
                                            value={currentProduct.colors?.join(', ') || ''}
                                            onChange={(e) => {
                                                const colors = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
                                                setCurrentProduct({ ...currentProduct, colors });
                                            }}
                                            placeholder="Olive, Wine, Sage"
                                            className="w-full border border-gray-200 p-2.5 rounded-md text-xs outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                {currentProduct.variants && currentProduct.variants.length > 0 && (
                                    <div className="mt-3 border rounded-lg overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                                                <tr>
                                                    <th className="p-2">Size</th>
                                                    <th className="p-2">Color</th>
                                                    <th className="p-2">SKU</th>
                                                    <th className="p-2">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {currentProduct.variants.map((v, i) => (
                                                    <tr key={i}>
                                                        <td className="p-2 font-bold">{v.size}</td>
                                                        <td className="p-2">{v.color}</td>
                                                        <td className="p-2 font-mono text-[10px]">{v.sku}</td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                value={v.stock}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    const updated = [...(currentProduct.variants || [])];
                                                                    updated[i] = { ...updated[i], stock: val };
                                                                    setCurrentProduct({ ...currentProduct, variants: updated });
                                                                }}
                                                                className="w-16 border rounded px-1.5 py-0.5"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Flags */}
                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentProduct.featured}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, featured: e.target.checked })}
                                        className="accent-primary"
                                    />
                                    <span>Mark as Featured Product (Homepage highlight)</span>
                                </label>

                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentProduct.new_arrival}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, new_arrival: e.target.checked })}
                                        className="accent-primary"
                                    />
                                    <span>Mark as New Arrival</span>
                                </label>

                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentProduct.bestseller}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, bestseller: e.target.checked })}
                                        className="accent-primary"
                                    />
                                    <span>Mark as Best Seller</span>
                                </label>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white py-4">
                                <button
                                    type="button"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="px-5 py-2.5 border rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary text-xs py-2.5 px-6 uppercase tracking-wider font-bold flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Saving...' : 'Save Product'}
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
