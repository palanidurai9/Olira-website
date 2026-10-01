import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    limit
} from 'firebase/firestore';
import type { DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '../types';

/**
 * Normalizes Firestore product document to Product interface
 */
export function mapDocToProduct(id: string, data: DocumentData): Product {
    return {
        id,
        name: data.name || '',
        slug: data.slug || id,
        price: Number(data.price) || 0,
        sale_price: data.sale_price !== undefined ? Number(data.sale_price) : undefined,
        compare_at_price: data.compare_at_price !== undefined ? Number(data.compare_at_price) : undefined,
        description: data.description || '',
        short_description: data.short_description || '',
        fabric: data.fabric || '',
        care: data.care || '',
        sizes: Array.isArray(data.sizes) ? data.sizes : ['S', 'M', 'L', 'XL'],
        colors: Array.isArray(data.colors) ? data.colors : [],
        variants: Array.isArray(data.variants) ? data.variants : [],
        stock: Number(data.stock) || 0,
        featured: Boolean(data.featured),
        new_arrival: Boolean(data.new_arrival),
        bestseller: Boolean(data.bestseller),
        status: data.status || 'active',
        sku: data.sku || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        launch_date: data.launch_date || new Date().toISOString().split('T')[0],
        category_id: data.category_id,
        category_slug: data.category_slug,
        created_at: data.created_at || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined),
        updated_at: data.updated_at || (data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined),
        images: Array.isArray(data.images) ? data.images : []
    };
}

export interface ProductFilters {
    categoryId?: string;
    categorySlug?: string;
    featured?: boolean;
    newArrival?: boolean;
    bestseller?: boolean;
    sortBy?: 'newest' | 'price-low' | 'price-high' | 'featured';
    limitCount?: number;
}

/**
 * Fetch products with filtering and sorting
 */
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    try {
        const productsRef = collection(db, 'products');
        const constraints: QueryConstraint[] = [];

        // By default only show active products for customers
        // Filter by category if supplied
        if (filters.categoryId && filters.categoryId !== 'all') {
            constraints.push(where('category_id', '==', filters.categoryId));
        } else if (filters.categorySlug && filters.categorySlug !== 'all') {
            constraints.push(where('category_slug', '==', filters.categorySlug));
        }

        if (filters.featured) {
            constraints.push(where('featured', '==', true));
        }

        if (filters.limitCount) {
            constraints.push(limit(filters.limitCount));
        }

        const q = query(productsRef, ...constraints);
        const snapshot = await getDocs(q);

        const products = snapshot.docs.map(d => mapDocToProduct(d.id, d.data()));

        // In-memory sort if composite index is not yet built
        if (filters.sortBy === 'price-low') {
            products.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        } else if (filters.sortBy === 'price-high') {
            products.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        } else {
            // Newest by default
            products.sort((a, b) => new Date(b.launch_date || b.created_at || 0).getTime() - new Date(a.launch_date || a.created_at || 0).getTime());
        }

        return products;
    } catch (err) {
        console.error('Error in getProducts:', err);
        return [];
    }
}

/**
 * Fetch single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            return mapDocToProduct(docSnap.id, docSnap.data());
        }

        // Fallback: try by id directly if slug happens to be an ID
        const directDoc = await getDoc(doc(db, 'products', slug));
        if (directDoc.exists()) {
            return mapDocToProduct(directDoc.id, directDoc.data());
        }

        return null;
    } catch (err) {
        console.error('Error in getProductBySlug:', err);
        return null;
    }
}

/**
 * Fetch single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
            return mapDocToProduct(docSnap.id, docSnap.data());
        }
        return null;
    } catch (err) {
        console.error('Error in getProductById:', err);
        return null;
    }
}

/**
 * Fetch new arrivals (limit 4 for homepage)
 */
export async function getNewArrivals(limitCount: number = 4): Promise<Product[]> {
    return getProducts({ limitCount, sortBy: 'newest' });
}

/**
 * Fetch featured products
 */
export async function getFeaturedProducts(limitCount: number = 4): Promise<Product[]> {
    return getProducts({ featured: true, limitCount });
}

/**
 * Search products by keyword across name, description, tags, category
 */
export async function searchProducts(searchTerm: string): Promise<Product[]> {
    if (!searchTerm.trim()) return [];
    try {
        // Query active products
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const term = searchTerm.toLowerCase().trim();

        const all = snapshot.docs.map(d => mapDocToProduct(d.id, d.data()));
        return all.filter(p => {
            const matchName = p.name.toLowerCase().includes(term);
            const matchDesc = p.description?.toLowerCase().includes(term);
            const matchSku = p.sku?.toLowerCase().includes(term);
            const matchCategory = p.category_slug?.toLowerCase().includes(term);
            const matchTag = p.tags?.some(t => t.toLowerCase().includes(term));
            return matchName || matchDesc || matchSku || matchCategory || matchTag;
        });
    } catch (err) {
        console.error('Error searching products:', err);
        return [];
    }
}
