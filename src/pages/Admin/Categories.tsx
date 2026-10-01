import React, { useEffect, useState } from 'react';
import {
    getAdminCategories,
    saveAdminCategory,
    deleteAdminCategory,
    resetAdminCategories
} from '../../services/adminService';
import type { Category } from '../../types';
import { Plus, Edit2, Trash2, FolderTree, RefreshCw, Upload, X, Loader2 } from 'lucide-react';

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
        name: '',
        slug: '',
        description: '',
        is_active: true
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAdminCategories();
            setCategories(data);
        } catch (e) {
            console.error('Error fetching categories:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (cat?: Category) => {
        setImageFile(null);
        if (cat) {
            setCurrentCategory(cat);
            setImagePreview(cat.image_url || '');
        } else {
            setCurrentCategory({
                name: '',
                slug: '',
                description: '',
                is_active: true
            });
            setImagePreview('');
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveAdminCategory(currentCategory, imageFile || undefined);
            await fetchData();
            setIsModalOpen(false);
            alert('Category saved successfully!');
        } catch (err: any) {
            alert('Error saving category: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteAdminCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err: any) {
            alert('Error deleting category: ' + err.message);
        }
    };

    const handleResetToStandard = async () => {
        if (!confirm('This will seed the standard OLIRAA categories (Maxi Dresses, Kurti Sets, Tops, Shirts, Maternity). Continue?')) return;
        try {
            setLoading(true);
            await resetAdminCategories();
            await fetchData();
            alert('Categories synchronized with standard catalog!');
        } catch (e: any) {
            alert('Error resetting categories: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Categories</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage storefront collections and navigation taxonomy</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleResetToStandard}
                        className="btn-outline flex items-center gap-1.5 text-xs py-2.5 px-4 font-semibold"
                        title="Sync Standard Categories"
                    >
                        <RefreshCw size={14} /> Reset Standards
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-primary flex items-center gap-1.5 text-xs py-2.5 px-4 font-bold uppercase tracking-wider"
                    >
                        <Plus size={16} /> Add Category
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6">Category</th>
                                <th className="py-4 px-6">Slug</th>
                                <th className="py-4 px-6">Description</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-6 w-32 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-48 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-6 w-12 bg-gray-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : categories.length > 0 ? (
                                categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                                    {cat.image_url ? (
                                                        <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FolderTree size={18} className="text-primary" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-dark text-xs">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-xs font-mono text-gray-500">
                                            /{cat.slug}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-500 max-w-xs truncate">
                                            {cat.description || 'No description'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cat.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {cat.is_active !== false ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
                                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                                        No categories found. Click "Reset Standards" to populate initial categories.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full relative z-10 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-serif font-bold text-dark">
                                {currentCategory.id ? 'Edit Category' : 'Add Category'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-dark">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={currentCategory.name || ''}
                                    onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                    placeholder="e.g. Maxi Dresses"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Slug (URL identifier)</label>
                                <input
                                    type="text"
                                    value={currentCategory.slug || ''}
                                    onChange={e => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary font-mono text-xs"
                                    placeholder="maxi-dress"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                                <textarea
                                    rows={2}
                                    value={currentCategory.description || ''}
                                    onChange={e => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                    className="w-full border border-gray-200 p-2.5 rounded-md text-sm outline-none focus:border-primary"
                                    placeholder="Brief summary of this category..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Category Image</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center shrink-0">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload size={18} className="text-gray-400" />
                                        )}
                                    </div>
                                    <label className="btn-outline text-xs py-2 px-3 cursor-pointer">
                                        Choose File
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={currentCategory.is_active !== false}
                                    onChange={e => setCurrentCategory({ ...currentCategory, is_active: e.target.checked })}
                                    className="accent-primary"
                                />
                                <span>Active (Visible on website)</span>
                            </label>

                            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary text-xs py-2 px-5 font-bold uppercase tracking-wider flex items-center gap-2"
                                >
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                                    {saving ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
