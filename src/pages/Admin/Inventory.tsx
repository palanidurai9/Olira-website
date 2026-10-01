import React, { useEffect, useState } from 'react';
import { getAdminProducts, updateAdminStock } from '../../services/adminService';
import type { Product } from '../../types';
import { Search, AlertTriangle, CheckCircle, Boxes, Save } from 'lucide-react';

const Inventory: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLowStock, setFilterLowStock] = useState(false);
    const [stockInputs, setStockInputs] = useState<{ [id: string]: number }>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getAdminProducts();
            setProducts(data);
            const initialInputs: { [id: string]: number } = {};
            data.forEach(p => {
                initialInputs[p.id] = p.stock;
            });
            setStockInputs(initialInputs);
        } catch (e) {
            console.error('Error fetching inventory:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async (productId: string) => {
        const newStock = stockInputs[productId];
        if (newStock === undefined || isNaN(newStock)) return;

        setSavingId(productId);
        try {
            await updateAdminStock(productId, newStock);
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
            alert('Stock updated successfully!');
        } catch (err: any) {
            alert('Error updating stock: ' + err.message);
        } finally {
            setSavingId(null);
        }
    };

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLow = filterLowStock ? p.stock < 10 : true;
        return matchesSearch && matchesLow;
    });

    const totalStockUnits = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
    const lowStockCount = products.filter(p => p.stock < 10).length;

    return (
        <div className="pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-dark">Inventory Management</h1>
                    <p className="text-xs text-gray-500 mt-1">Live stock levels, out-of-stock monitoring, and quick restock</p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                        <Boxes size={22} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Total SKUs</p>
                        <p className="text-2xl font-bold text-dark">{products.length}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-50 text-green-600">
                        <CheckCircle size={22} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Total Units in Stock</p>
                        <p className="text-2xl font-bold text-dark">{totalStockUnits}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Low Stock Alerts (&lt;10)</p>
                        <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search product name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary"
                    />
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer self-start sm:self-auto">
                    <input
                        type="checkbox"
                        checked={filterLowStock}
                        onChange={e => setFilterLowStock(e.target.checked)}
                        className="accent-primary"
                    />
                    <span>Show only low stock items</span>
                </label>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6">Product</th>
                                <th className="py-4 px-6">SKU</th>
                                <th className="py-4 px-6">Variants</th>
                                <th className="py-4 px-6">Current Stock</th>
                                <th className="py-4 px-6">Quick Update</th>
                                <th className="py-4 px-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-6"><div className="h-10 w-40 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-4 w-12 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-8 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="py-4 px-6"><div className="h-8 w-16 bg-gray-100 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length > 0 ? (
                                filtered.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                                                    <img
                                                        src={p.images?.[0]?.image_url || '/src/assets/product-placeholder.png'}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-dark text-xs truncate max-w-[200px]">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400">₹{p.price}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-xs font-mono text-gray-600">
                                            {p.sku || '-'}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-500">
                                            {p.variants?.length ? `${p.variants.length} combinations` : p.sizes?.join(', ') || '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {p.stock} units
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <input
                                                type="number"
                                                min={0}
                                                value={stockInputs[p.id] !== undefined ? stockInputs[p.id] : p.stock}
                                                onChange={e => setStockInputs({ ...stockInputs, [p.id]: parseInt(e.target.value) || 0 })}
                                                className="w-24 border border-gray-200 rounded px-2.5 py-1.5 text-xs font-bold text-dark outline-none focus:border-primary"
                                            />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleStockUpdate(p.id)}
                                                disabled={savingId === p.id}
                                                className="btn-primary text-xs py-1.5 px-3 uppercase font-bold tracking-wider inline-flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <Save size={13} />
                                                <span>Save</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                                        No inventory records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
