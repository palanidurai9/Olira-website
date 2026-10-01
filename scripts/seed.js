/**
 * OLIRAA Firestore Database Seed Script
 * Run with: node scripts/seed.js
 * Requires serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    } catch (e) {
        console.log('Using default credentials or project ID from env');
        admin.initializeApp();
    }
}

const db = admin.firestore();

const CATEGORIES = [
    {
        id: 'cat-maxi-dress',
        name: 'Maxi Dresses',
        slug: 'maxi-dress',
        description: 'Flowing and elegant maxi dresses for all occasions.',
        image_url: '/src/assets/category-maxi-dress.png',
        is_active: true,
        order_index: 1
    },
    {
        id: 'cat-kurti-set',
        name: 'Kurti Sets',
        slug: 'kurti-set',
        description: 'Modern traditional kurti sets tailored for modesty.',
        image_url: '/src/assets/category-kurti-set.png',
        is_active: true,
        order_index: 2
    },
    {
        id: 'cat-tops',
        name: 'Tops',
        slug: 'tops',
        description: 'Chic, comfortable, and modern tops for everyday modesty.',
        image_url: '/src/assets/category-tops.png',
        is_active: true,
        order_index: 3
    },
    {
        id: 'cat-shirts',
        name: 'Shirts',
        slug: 'shirts',
        description: 'Classic and contemporary button-down shirts.',
        image_url: '/src/assets/category-shirts.png',
        is_active: true,
        order_index: 4
    },
    {
        id: 'cat-maternity-dress',
        name: 'Maternity Dresses',
        slug: 'maternity-dress',
        description: 'Graceful maternity dresses designed for ultimate comfort.',
        image_url: '/src/assets/category-maternity-dress.png',
        is_active: true,
        order_index: 5
    }
];

const PRODUCTS = [
    {
        id: 'prod-emerald-kurti-set',
        name: 'Emerald Olive Handcrafted Kurti Set',
        slug: 'emerald-olive-handcrafted-kurti-set',
        price: 2499,
        sale_price: 1999,
        compare_at_price: 2999,
        description: '<p>Embrace modest elegance with this handcrafted olive kurti set, featuring intricate neckline embroidery and coordinating straight-cut trousers.</p>',
        fabric: 'Pure Cotton Slub',
        care: 'Gentle Hand Wash in Cold Water',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Olive Green', 'Dusty Rose'],
        stock: 35,
        featured: true,
        new_arrival: true,
        bestseller: true,
        status: 'active',
        sku: 'OLR-KRT-001',
        tags: ['kurti', 'festive', 'cotton', 'modest'],
        launch_date: new Date().toISOString().split('T')[0],
        category_id: 'cat-kurti-set',
        category_slug: 'kurti-set',
        images: [
            { id: 'img-1', image_url: '/src/assets/hero-kurti.png', order_index: 0 },
            { id: 'img-2', image_url: '/src/assets/category-kurti-set.png', order_index: 1 }
        ],
        variants: [
            { id: 'var-krt-s-olive', sku: 'OLR-KRT-001-S-OLV', size: 'S', color: 'Olive Green', price: 1999, stock: 7, active: true },
            { id: 'var-krt-m-olive', sku: 'OLR-KRT-001-M-OLV', size: 'M', color: 'Olive Green', price: 1999, stock: 10, active: true },
            { id: 'var-krt-l-olive', sku: 'OLR-KRT-001-L-OLV', size: 'L', color: 'Olive Green', price: 1999, stock: 8, active: true },
            { id: 'var-krt-xl-olive', sku: 'OLR-KRT-001-XL-OLV', size: 'XL', color: 'Olive Green', price: 1999, stock: 6, active: true },
            { id: 'var-krt-xxl-olive', sku: 'OLR-KRT-001-XXL-OLV', size: 'XXL', color: 'Olive Green', price: 1999, stock: 4, active: true }
        ]
    },
    {
        id: 'prod-blush-maxi-dress',
        name: 'Blush Tiered Floral Maxi Dress',
        slug: 'blush-tiered-floral-maxi-dress',
        price: 3299,
        sale_price: 2799,
        compare_at_price: 3999,
        description: '<p>A romantic, breathable tiered maxi dress cut from lightweight viscose with delicate floral motifs and a flattering relaxed fit.</p>',
        fabric: 'Premium Chiffon Georgette',
        care: 'Dry Clean Recommended',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blush Pink', 'Ivory Cream'],
        stock: 28,
        featured: true,
        new_arrival: true,
        bestseller: false,
        status: 'active',
        sku: 'OLR-MAX-002',
        tags: ['maxi', 'floral', 'summer', 'modest dress'],
        launch_date: new Date().toISOString().split('T')[0],
        category_id: 'cat-maxi-dress',
        category_slug: 'maxi-dress',
        images: [
            { id: 'img-1', image_url: '/src/assets/category-maxi-dress.png', order_index: 0 }
        ],
        variants: [
            { id: 'var-max-s', sku: 'OLR-MAX-002-S', size: 'S', color: 'Blush Pink', price: 2799, stock: 6, active: true },
            { id: 'var-max-m', sku: 'OLR-MAX-002-M', size: 'M', color: 'Blush Pink', price: 2799, stock: 10, active: true },
            { id: 'var-max-l', sku: 'OLR-MAX-002-L', size: 'L', color: 'Blush Pink', price: 2799, stock: 8, active: true },
            { id: 'var-max-xl', sku: 'OLR-MAX-002-XL', size: 'XL', color: 'Blush Pink', price: 2799, stock: 4, active: true }
        ]
    },
    {
        id: 'prod-linen-maternity-dress',
        name: 'Soft Linen Nursing & Maternity Dress',
        slug: 'soft-linen-nursing-maternity-dress',
        price: 2899,
        sale_price: 2499,
        compare_at_price: 3499,
        description: '<p>Designed for comfort during pregnancy and beyond. Features concealed nursing zips and breathable natural linen fabric.</p>',
        fabric: 'Organic Linen Blend',
        care: 'Machine Wash Delicate',
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: ['Sage Green', 'Warm Beige'],
        stock: 22,
        featured: true,
        new_arrival: false,
        bestseller: true,
        status: 'active',
        sku: 'OLR-MAT-003',
        tags: ['maternity', 'nursing', 'linen'],
        launch_date: new Date().toISOString().split('T')[0],
        category_id: 'cat-maternity-dress',
        category_slug: 'maternity-dress',
        images: [
            { id: 'img-1', image_url: '/src/assets/category-maternity-dress.png', order_index: 0 }
        ],
        variants: [
            { id: 'var-mat-m', sku: 'OLR-MAT-003-M', size: 'M', color: 'Sage Green', price: 2499, stock: 6, active: true },
            { id: 'var-mat-l', sku: 'OLR-MAT-003-L', size: 'L', color: 'Sage Green', price: 2499, stock: 8, active: true },
            { id: 'var-mat-xl', sku: 'OLR-MAT-003-XL', size: 'XL', color: 'Sage Green', price: 2499, stock: 5, active: true },
            { id: 'var-mat-xxl', sku: 'OLR-MAT-003-XXL', size: 'XXL', color: 'Sage Green', price: 2499, stock: 3, active: true }
        ]
    }
];

const COUPONS = [
    {
        id: 'cpn-oliraa10',
        code: 'OLIRAA10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        min_order_value: 999,
        max_discount_amount: 500,
        usage_limit: 1000,
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString()
    },
    {
        id: 'cpn-welcome500',
        code: 'WELCOME500',
        discount_type: 'FIXED',
        discount_value: 500,
        min_order_value: 2999,
        usage_limit: 500,
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString()
    }
];

async function seed() {
    console.log('Starting OLIRAA Firestore Seeding...');

    // 1. Seed Categories
    console.log('Seeding categories...');
    for (const cat of CATEGORIES) {
        await db.collection('categories').doc(cat.id).set({
            ...cat,
            created_at: new Date().toISOString()
        }, { merge: true });
    }
    console.log('✓ Categories seeded.');

    // 2. Seed Products
    console.log('Seeding products...');
    for (const prod of PRODUCTS) {
        await db.collection('products').doc(prod.id).set({
            ...prod,
            created_at: new Date().toISOString()
        }, { merge: true });
    }
    console.log('✓ Products seeded.');

    // 3. Seed Coupons
    console.log('Seeding coupons...');
    for (const cpn of COUPONS) {
        await db.collection('coupons').doc(cpn.id).set(cpn, { merge: true });
    }
    console.log('✓ Coupons seeded.');

    console.log('\nSeed completed successfully!');
}

seed().catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
});
