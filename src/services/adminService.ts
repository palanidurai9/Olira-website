import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product, Category, Order, Coupon, UserProfile } from '../types';
import { mapDocToProduct } from './productService';
import { STANDARD_CATEGORIES } from './categoryService';
import { subDays, format, isSameDay, parseISO } from 'date-fns';

/**
 * Fetch real Dashboard statistics from Firestore
 */
export async function getDashboardStats() {
    try {
        // 1. Fetch products
        const productsSnap = await getDocs(collection(db, 'products'));
        const allProducts = productsSnap.docs.map(d => mapDocToProduct(d.id, d.data()));
        const totalProducts = allProducts.length;
        const lowStockProducts = allProducts.filter(p => p.stock < 10).slice(0, 5);

        // 2. Fetch orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const allOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order));

        let totalSales = 0;
        const customerPhones = new Set<string>();
        const customerEmails = new Set<string>();

        // 7-day sales buckets
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(today, 6 - i);
            return {
                date: d,
                shortDate: format(d, 'dd MMM'),
                total: 0
            };
        });

        allOrders.forEach(order => {
            const amount = Number(order.total) || 0;
            // Count sales if paid or COD confirmed
            totalSales += amount;
            if (order.phone) customerPhones.add(order.phone);
            if (order.email) customerEmails.add(order.email);

            if (order.created_at) {
                try {
                    const orderDate = parseISO(order.created_at);
                    const bucket = last7Days.find(b => isSameDay(b.date, orderDate));
                    if (bucket) {
                        bucket.total += amount;
                    }
                } catch {
                    // Ignore date parse issues
                }
            }
        });

        // 3. Customers count from users collection or unique order contacts
        const usersSnap = await getDocs(collection(db, 'users'));
        const totalCustomers = Math.max(usersSnap.size, customerEmails.size, customerPhones.size);

        // 4. Sort recent orders
        const recentOrders = [...allOrders]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        const maxDaily = Math.max(...last7Days.map(d => d.total));

        return {
            totalSales,
            totalOrders: allOrders.length,
            totalProducts,
            totalCustomers,
            recentOrders,
            lowStockProducts,
            dailySales: last7Days,
            maxSales: maxDaily > 0 ? maxDaily : 100
        };
    } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
        return {
            totalSales: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalCustomers: 0,
            recentOrders: [],
            lowStockProducts: [],
            dailySales: [],
            maxSales: 100
        };
    }
}

/**
 * Fetch all products for admin
 */
export async function getAdminProducts(): Promise<Product[]> {
    const snap = await getDocs(collection(db, 'products'));
    const products = snap.docs.map(d => mapDocToProduct(d.id, d.data()));
    products.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    return products;
}

/**
 * Save or update product with Firebase Storage image upload
 */
export async function saveAdminProduct(
    productData: Partial<Product>,
    newImageFiles: { file: File; index: number }[] = []
): Promise<Product> {
    const slug = productData.slug || productData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || `prod-${Date.now()}`;
    const productRef = productData.id ? doc(db, 'products', productData.id) : doc(collection(db, 'products'));

    const existingImages = [...(productData.images || [])];

    // Upload new image files to Firebase Storage
    for (const item of newImageFiles) {
        const ext = item.file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const storageRef = ref(storage, `products/${fileName}`);
        const snapshot = await uploadBytes(storageRef, item.file);
        const url = await getDownloadURL(snapshot.ref);

        existingImages[item.index] = {
            id: `img-${Date.now()}-${item.index}`,
            image_url: url,
            order_index: item.index
        };
    }

    const payload: Record<string, any> = {
        name: productData.name || '',
        slug,
        price: Number(productData.price) || 0,
        sale_price: productData.sale_price !== undefined ? Number(productData.sale_price) : null,
        compare_at_price: productData.compare_at_price !== undefined ? Number(productData.compare_at_price) : null,
        description: productData.description || '',
        short_description: productData.short_description || '',
        fabric: productData.fabric || '',
        care: productData.care || '',
        sizes: productData.sizes || ['S', 'M', 'L', 'XL'],
        colors: productData.colors || [],
        variants: productData.variants || [],
        stock: Number(productData.stock) || 0,
        featured: Boolean(productData.featured),
        new_arrival: Boolean(productData.new_arrival),
        bestseller: Boolean(productData.bestseller),
        status: productData.status || 'active',
        sku: productData.sku || '',
        tags: productData.tags || [],
        launch_date: productData.launch_date || new Date().toISOString().split('T')[0],
        category_id: productData.category_id || '',
        category_slug: productData.category_slug || '',
        images: existingImages,
        updated_at: new Date().toISOString()
    };

    if (!productData.id) {
        payload.created_at = new Date().toISOString();
        payload.createdAt = serverTimestamp();
    }

    await setDoc(productRef, payload, { merge: true });
    return mapDocToProduct(productRef.id, payload);
}

/**
 * Delete product
 */
export async function deleteAdminProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, 'products', id));
}

/**
 * Fetch all categories for admin
 */
export async function getAdminCategories(): Promise<Category[]> {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) {
        return STANDARD_CATEGORIES;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
}

/**
 * Save category with image upload
 */
export async function saveAdminCategory(category: Partial<Category>, imageFile?: File): Promise<void> {
    const catRef = category.id ? doc(db, 'categories', category.id) : doc(collection(db, 'categories'));
    let imageUrl = category.image_url || '';

    if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'png';
        const fileName = `category-${Date.now()}.${ext}`;
        const storageRef = ref(storage, `categories/${fileName}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
    }

    const slug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    await setDoc(catRef, {
        name: category.name || '',
        slug,
        description: category.description || '',
        image_url: imageUrl,
        is_active: category.is_active !== undefined ? category.is_active : true,
        order_index: category.order_index || 0,
        updated_at: new Date().toISOString()
    }, { merge: true });
}

/**
 * Delete category
 */
export async function deleteAdminCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, 'categories', id));
}

/**
 * Synchronize / Seed standard categories
 */
export async function resetAdminCategories(): Promise<void> {
    for (const cat of STANDARD_CATEGORIES) {
        const catRef = doc(db, 'categories', cat.id);
        await setDoc(catRef, {
            ...cat,
            is_active: true,
            created_at: new Date().toISOString()
        }, { merge: true });
    }
}

/**
 * Fetch admin orders with filtering
 */
export async function getAdminOrders(statusFilter: string = 'ALL', searchQuery: string = ''): Promise<Order[]> {
    const snap = await getDocs(collection(db, 'orders'));
    let orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));

    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (statusFilter !== 'ALL') {
        orders = orders.filter(o => o.order_status === statusFilter);
    }

    if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase().trim();
        orders = orders.filter(o =>
            o.order_number?.toLowerCase().includes(term) ||
            o.customer_name?.toLowerCase().includes(term) ||
            o.phone?.includes(term) ||
            o.email?.toLowerCase().includes(term)
        );
    }

    return orders;
}

/**
 * Update order status
 */
export async function updateAdminOrderStatus(orderId: string, status: string): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        order_status: status,
        updated_at: new Date().toISOString()
    });
}

/**
 * Update shipping details for order
 */
export async function updateAdminShippingInfo(
    orderId: string,
    shippingData: {
        shipping_status?: string;
        tracking_number?: string;
        tracking_url?: string;
        courier_name?: string;
    }
): Promise<void> {
    await updateDoc(doc(db, 'orders', orderId), {
        ...shippingData,
        updated_at: new Date().toISOString()
    });
}

/**
 * Delete order
 */
export async function deleteAdminOrder(orderId: string): Promise<void> {
    await deleteDoc(doc(db, 'orders', orderId));
}

/**
 * Fetch admin coupons
 */
export async function getAdminCoupons(): Promise<Coupon[]> {
    const snap = await getDocs(collection(db, 'coupons'));
    const coupons = snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
    coupons.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    return coupons;
}

/**
 * Create or update coupon
 */
export async function saveAdminCoupon(coupon: Partial<Coupon>): Promise<void> {
    const couponRef = coupon.id ? doc(db, 'coupons', coupon.id) : doc(collection(db, 'coupons'));
    await setDoc(couponRef, {
        code: coupon.code?.toUpperCase() || '',
        discount_type: coupon.discount_type || 'PERCENTAGE',
        discount_value: Number(coupon.discount_value) || 0,
        min_order_value: Number(coupon.min_order_value) || 0,
        max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
        start_date: coupon.start_date || null,
        end_date: coupon.end_date || null,
        usage_limit: coupon.usage_limit ? Number(coupon.usage_limit) : null,
        used_count: Number(coupon.used_count) || 0,
        is_active: coupon.is_active !== undefined ? coupon.is_active : true,
        created_at: coupon.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, { merge: true });
}

/**
 * Toggle coupon active status
 */
export async function toggleAdminCouponStatus(id: string, currentStatus: boolean): Promise<void> {
    await updateDoc(doc(db, 'coupons', id), {
        is_active: !currentStatus,
        updated_at: new Date().toISOString()
    });
}

/**
 * Delete coupon
 */
export async function deleteAdminCoupon(id: string): Promise<void> {
    await deleteDoc(doc(db, 'coupons', id));
}

/**
 * Fetch all registered customers and their spending metrics
 */
export async function getAdminCustomers(): Promise<any[]> {
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const ordersSnap = await getDocs(collection(db, 'orders'));

        const allOrders = ordersSnap.docs.map(d => d.data() as Order);

        const customers = usersSnap.docs.map(docSnap => {
            const user = docSnap.data() as UserProfile;
            const userOrders = allOrders.filter(o => o.userId === user.uid || (user.email && o.email === user.email));
            const totalSpent = userOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
            const lastOrder = userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

            return {
                ...user,
                totalOrders: userOrders.length,
                totalSpent,
                lastOrderDate: lastOrder ? lastOrder.created_at : null
            };
        });

        customers.sort((a, b) => b.totalSpent - a.totalSpent);
        return customers;
    } catch (err) {
        console.error('Error fetching admin customers:', err);
        return [];
    }
}

/**
 * Quick update stock for product or variant
 */
export async function updateAdminStock(productId: string, newStock: number, variantId?: string): Promise<void> {
    const productRef = doc(db, 'products', productId);
    const snap = await getDoc(productRef);

    if (snap.exists()) {
        const data = snap.data();
        if (variantId && Array.isArray(data.variants)) {
            const updatedVariants = data.variants.map((v: any) =>
                v.id === variantId ? { ...v, stock: newStock } : v
            );
            // Sum variant stock
            const totalStock = updatedVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
            await updateDoc(productRef, {
                variants: updatedVariants,
                stock: totalStock,
                updated_at: new Date().toISOString()
            });
        } else {
            await updateDoc(productRef, {
                stock: newStock,
                updated_at: new Date().toISOString()
            });
        }
    }
}

/**
 * Log admin action for audit trail in adminLogs collection
 */
export async function logAdminAction(
    adminId: string,
    adminEmail: string,
    action: string,
    target: string,
    details?: Record<string, any>
): Promise<void> {
    try {
        await addDoc(collection(db, 'adminLogs'), {
            adminId,
            adminEmail,
            action,
            target,
            details: details || {},
            timestamp: new Date().toISOString(),
            createdAt: serverTimestamp()
        });
    } catch (e) {
        console.warn('Could not record admin log:', e);
    }
}
