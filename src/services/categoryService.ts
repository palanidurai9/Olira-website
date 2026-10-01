import {
    collection,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category } from '../types';

export const STANDARD_CATEGORIES: Category[] = [
    { id: 'cat-maxi-dress', name: 'Maxi Dresses', slug: 'maxi-dress', description: 'Flowing and elegant maxi dresses for all occasions.' },
    { id: 'cat-kurti-set', name: 'Kurti Sets', slug: 'kurti-set', description: 'Modern traditional kurti sets tailored for modesty.' },
    { id: 'cat-tops', name: 'Tops', slug: 'tops', description: 'Chic, comfortable, and modern tops.' },
    { id: 'cat-shirts', name: 'Shirts', slug: 'shirts', description: 'Classic and contemporary button-down shirts.' },
    { id: 'cat-maternity-dress', name: 'Maternity Dresses', slug: 'maternity-dress', description: 'Graceful maternity dresses designed for ultimate comfort.' }
];

/**
 * Fetch all categories from Firestore
 */
export async function getCategories(): Promise<Category[]> {
    try {
        const catRef = collection(db, 'categories');
        const snap = await getDocs(catRef);

        if (snap.empty) {
            // Return standard categories if collection hasn't been seeded yet
            return STANDARD_CATEGORIES;
        }

        const list = snap.docs.map(d => ({
            id: d.id,
            name: d.data().name || '',
            slug: d.data().slug || '',
            description: d.data().description || '',
            image_url: d.data().image_url || '',
            is_active: d.data().is_active !== undefined ? d.data().is_active : true,
            order_index: d.data().order_index || 0,
            created_at: d.data().created_at
        } as Category));

        // Filter active and sort
        const active = list.filter(c => c.is_active !== false);
        active.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        return active.length > 0 ? active : STANDARD_CATEGORIES;
    } catch (err) {
        console.error('Error fetching categories from Firestore:', err);
        return STANDARD_CATEGORIES;
    }
}

/**
 * Fetch single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
        const catRef = collection(db, 'categories');
        const q = query(catRef, where('slug', '==', slug));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const d = snap.docs[0];
            return { id: d.id, ...d.data() } as Category;
        }

        // Fallback to standard
        const standard = STANDARD_CATEGORIES.find(c => c.slug === slug);
        return standard || null;
    } catch (err) {
        console.error('Error in getCategoryBySlug:', err);
        return STANDARD_CATEGORIES.find(c => c.slug === slug) || null;
    }
}
