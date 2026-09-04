import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';
import { useCart } from '../../context/CartContext';

const Store = () => {
    const { addToCart } = useCart();
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [rxFilter, setRxFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [quantities, setQuantities] = useState({});
    const [addingIds, setAddingIds] = useState(new Set());

    useEffect(() => { fetchProducts(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchProducts = async () => {
        try {
            const [medsRes, catsRes] = await Promise.all([
                api.get('/Medicines?onlyActive=true'),
                api.get('/Categories')
            ]);
            setMedicines(medsRes.data || []);
            setCategories(catsRes.data || []);
        } catch (error) {
            console.error('Failed to load store catalog:', error);
            showToast('Failed to load medicines. Please refresh.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (id, delta, maxStock) => {
        const current = quantities[id] || 1;
        const updated = Math.max(1, Math.min(maxStock, current + delta));
        setQuantities({ ...quantities, [id]: updated });
    };

    const handleAddToCart = async (medicine) => {
        const qty = quantities[medicine.id] || 1;
        setAddingIds(prev => new Set(prev).add(medicine.id));
        addToCart(medicine, qty);
        showToast(`Added ${qty}× ${medicine.name} to cart! 🛒`);
        setTimeout(() => {
            setAddingIds(prev => {
                const next = new Set(prev); next.delete(medicine.id); return next;
            });
        }, 600);
    };

    const filteredMedicines = medicines.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || m.categoryId === parseInt(selectedCategory);
        const matchesRx = rxFilter === 'all' ? true : rxFilter === 'rx' ? m.requiresPrescription : !m.requiresPrescription;
        return matchesSearch && matchesCategory && matchesRx;
    });

    return (
        <div style={styles.page}>
            <Navbar />

            {/* Toast */}
            {toast.show && (
                <div style={{
                    ...styles.toast,
                    background: toast.type === 'error'
                        ? 'linear-gradient(135deg,#dc2626,#ef4444)'
                        : 'linear-gradient(135deg,#059669,#10b981)'
                }}>
                    <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
                    {toast.message}
                </div>
            )}

            {/* Hero */}
            <div style={styles.hero}>
                <div style={styles.heroOrb1} />
                <div style={styles.heroOrb2} />
                <div style={styles.heroContent}>
                    <div style={styles.heroBadge}>🏥 Certified Healthcare Products</div>
                    <h1 style={styles.heroTitle}>MediStock Online Pharmacy</h1>
                    <p style={styles.heroSubtitle}>
                        Order prescription medications and wellness essentials safely.
                        Fast delivery · Verified quality · Licensed pharmacists.
                    </p>
                    {/* Live stats */}
                    <div style={styles.heroStats}>
                        <div style={styles.heroStatItem}>
                            <strong>{medicines.length}</strong>
                            <span>Products</span>
                        </div>
                        <div style={styles.heroStatDivider} />
                        <div style={styles.heroStatItem}>
                            <strong>{categories.length}</strong>
                            <span>Categories</span>
                        </div>
                        <div style={styles.heroStatDivider} />
                        <div style={styles.heroStatItem}>
                            <strong>{medicines.filter(m => !m.requiresPrescription).length}</strong>
                            <span>OTC Items</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.container}>
                {/* Filter Bar */}
                <div style={styles.filterBar}>
                    {/* Search */}
                    <div style={styles.searchBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search medicines by name or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={styles.clearBtn}>✕</button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div style={styles.filterGroup}>
                        <div style={styles.filterSelect}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>
                            </svg>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={styles.select}
                            >
                                <option value="all">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.rxPills}>
                            {[
                                { val: 'all', label: 'All' },
                                { val: 'otc', label: '🟢 OTC' },
                                { val: 'rx', label: '💊 Rx' },
                            ].map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => setRxFilter(opt.val)}
                                    style={{
                                        ...styles.rxPill,
                                        background: rxFilter === opt.val ? 'linear-gradient(135deg,#2563eb,#0ea5e9)' : 'transparent',
                                        color: rxFilter === opt.val ? '#fff' : '#64748b',
                                        border: rxFilter === opt.val ? '1.5px solid transparent' : '1.5px solid #e2e8f0',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count */}
                    {!loading && (
                        <div style={styles.resultsCount}>
                            <strong>{filteredMedicines.length}</strong> products
                        </div>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={styles.skeletonGrid}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} style={styles.skeletonCard} className="skeleton" />
                        ))}
                    </div>
                ) : filteredMedicines.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🔍</div>
                        <h3 style={styles.emptyTitle}>No medicines found</h3>
                        <p style={styles.emptyText}>Try adjusting your search or filter criteria.</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setRxFilter('all'); }} style={styles.resetBtn}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {filteredMedicines.map((med, idx) => {
                            const isOutOfStock = med.stockQuantity <= 0;
                            const isLowStock = !isOutOfStock && med.stockQuantity <= med.minStockLevel;
                            const qty = quantities[med.id] || 1;
                            const isAdding = addingIds.has(med.id);

                            return (
                                <div
                                    key={med.id}
                                    style={{ ...styles.card, animationDelay: `${(idx % 12) * 40}ms` }}
                                    className="animate-scaleIn"
                                >
                                    {/* Card Top Gradient Band */}
                                    <div style={{
                                        ...styles.cardBand,
                                        background: med.requiresPrescription
                                            ? 'linear-gradient(90deg,#ef4444,#f97316)'
                                            : 'linear-gradient(90deg,#2563eb,#10b981)',
                                    }} />

                                    {/* Badges */}
                                    <div style={styles.cardHeader}>
                                        <span style={{
                                            ...styles.categoryBadge,
                                            background: '#dbeafe', color: '#1e40af',
                                        }}>
                                            {med.categoryName || 'General'}
                                        </span>
                                        <span style={{
                                            ...styles.rxBadge,
                                            background: med.requiresPrescription ? '#fee2e2' : '#d1fae5',
                                            color: med.requiresPrescription ? '#b91c1c' : '#065f46',
                                        }}>
                                            {med.requiresPrescription ? '💊 Rx' : '✅ OTC'}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div style={styles.cardBody}>
                                        <h3 style={styles.medName}>{med.name}</h3>
                                        <p style={styles.medDesc}>
                                            {med.description || 'Verified pharmacy medication. Consult pharmacist for guidance.'}
                                        </p>

                                        {/* Stock */}
                                        <div style={styles.stockRow}>
                                            {isOutOfStock ? (
                                                <span style={styles.stockOut}>❌ Out of Stock</span>
                                            ) : isLowStock ? (
                                                <span style={styles.stockLow}>⚠️ Only {med.stockQuantity} left</span>
                                            ) : (
                                                <span style={styles.stockIn}>✓ In Stock ({med.stockQuantity})</span>
                                            )}
                                        </div>

                                        {/* Price & Qty */}
                                        <div style={styles.priceSection}>
                                            <div>
                                                <div style={styles.priceLabel}>Price per unit</div>
                                                <div style={styles.price}>Rs. {med.price.toFixed(2)}</div>
                                            </div>
                                            {!isOutOfStock && (
                                                <div style={styles.qtyPicker}>
                                                    <button
                                                        onClick={() => handleQuantityChange(med.id, -1, med.stockQuantity)}
                                                        style={styles.qtyBtn}
                                                        disabled={qty <= 1}
                                                    >−</button>
                                                    <span style={styles.qtyNum}>{qty}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(med.id, 1, med.stockQuantity)}
                                                        style={styles.qtyBtn}
                                                        disabled={qty >= med.stockQuantity}
                                                    >+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        disabled={isOutOfStock}
                                        onClick={() => handleAddToCart(med)}
                                        style={{
                                            ...styles.addBtn,
                                            background: isOutOfStock
                                                ? '#e2e8f0'
                                                : isAdding
                                                    ? 'linear-gradient(135deg,#059669,#10b981)'
                                                    : 'linear-gradient(135deg,#2563eb,#0ea5e9)',
                                            color: isOutOfStock ? '#94a3b8' : '#fff',
                                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                            transform: isAdding ? 'scale(0.97)' : 'scale(1)',
                                        }}
                                    >
                                        {isOutOfStock ? (
                                            'Out of Stock'
                                        ) : isAdding ? (
                                            <>✓ Added!</>
                                        ) : (
                                            <>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                                </svg>
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: {
        background: '#f0f4fb',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    toast: {
        position: 'fixed',
        bottom: '28px', right: '28px',
        color: '#fff',
        padding: '14px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 9999,
        fontWeight: '600',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    },
    // Hero
    hero: {
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f3a 55%, #0f2a4e 100%)',
        padding: '60px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    heroOrb1: {
        position: 'absolute', borderRadius: '50%', filter: 'blur(80px)',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle,rgba(37,99,235,0.25) 0%,transparent 70%)',
        top: '-100px', left: '-60px', pointerEvents: 'none',
    },
    heroOrb2: {
        position: 'absolute', borderRadius: '50%', filter: 'blur(80px)',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle,rgba(16,185,129,0.2) 0%,transparent 70%)',
        bottom: '-80px', right: '10%', pointerEvents: 'none',
    },
    heroContent: { maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 },
    heroBadge: {
        display: 'inline-block',
        background: 'rgba(56,189,248,0.12)',
        border: '1px solid rgba(56,189,248,0.25)',
        color: '#38bdf8',
        padding: '6px 18px', borderRadius: '9999px',
        fontSize: '12px', fontWeight: '700',
        marginBottom: '16px', letterSpacing: '0.5px',
    },
    heroTitle: {
        fontSize: '42px', fontWeight: '800',
        color: '#fff', margin: '0 0 14px 0',
        letterSpacing: '-0.5px',
        fontFamily: "'Outfit', sans-serif",
    },
    heroSubtitle: {
        fontSize: '16px', color: 'rgba(148,163,184,0.85)',
        margin: '0 0 28px 0', lineHeight: 1.6,
    },
    heroStats: {
        display: 'inline-flex', alignItems: 'center', gap: '24px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', padding: '14px 28px',
    },
    heroStatItem: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '2px', color: '#fff',
    },
    heroStatDivider: {
        width: '1px', height: '28px', background: 'rgba(255,255,255,0.12)',
    },
    // Filter Bar
    container: {
        maxWidth: '1320px', margin: '0 auto', padding: '32px 24px',
    },
    filterBar: {
        display: 'flex', flexWrap: 'wrap', gap: '12px',
        alignItems: 'center', marginBottom: '28px',
        background: '#fff', borderRadius: '14px',
        padding: '16px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e8eef7',
    },
    searchBox: {
        display: 'flex', alignItems: 'center', gap: '10px',
        flex: '1 1 280px', background: '#f8fafc',
        borderRadius: '10px', padding: '10px 14px',
        border: '1.5px solid #e2e8f0', transition: 'border-color 0.2s',
    },
    searchInput: {
        border: 'none', background: 'transparent', width: '100%',
        outline: 'none', fontSize: '14px', color: '#1e293b',
        fontFamily: "'Inter', sans-serif",
    },
    clearBtn: {
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: '#94a3b8', fontSize: '14px', padding: '2px',
    },
    filterGroup: {
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
    },
    filterSelect: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f8fafc', border: '1.5px solid #e2e8f0',
        borderRadius: '10px', padding: '10px 12px',
    },
    select: {
        border: 'none', background: 'transparent',
        fontSize: '13px', outline: 'none',
        color: '#1e293b', fontWeight: '500',
        fontFamily: "'Inter', sans-serif",
        cursor: 'pointer',
    },
    rxPills: {
        display: 'flex', gap: '4px',
        background: '#f8fafc', borderRadius: '10px',
        border: '1.5px solid #e2e8f0', padding: '4px',
    },
    rxPill: {
        padding: '6px 14px', borderRadius: '7px',
        fontSize: '12px', fontWeight: '600',
        cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: "'Inter', sans-serif",
    },
    resultsCount: {
        fontSize: '13px', color: '#64748b', fontWeight: '500',
        marginLeft: 'auto', whiteSpace: 'nowrap',
    },
    // Skeleton
    skeletonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    skeletonCard: { height: '340px', borderRadius: '16px' },
    // Empty
    emptyState: {
        textAlign: 'center', padding: '80px 24px',
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8eef7',
    },
    emptyIcon: { fontSize: '52px', marginBottom: '16px' },
    emptyTitle: {
        fontSize: '20px', fontWeight: '700',
        color: '#0f172a', margin: '0 0 8px 0',
    },
    emptyText: {
        fontSize: '14px', color: '#94a3b8', margin: '0 0 20px 0',
    },
    resetBtn: {
        background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
        color: '#fff', border: 'none', padding: '10px 24px',
        borderRadius: '10px', fontSize: '14px', fontWeight: '700',
        cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
    },
    // Product Grid
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e8eef7',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.25s, box-shadow 0.25s',
    },
    cardBand: { height: '4px', flexShrink: 0 },
    cardHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px 0',
    },
    categoryBadge: {
        fontSize: '11px', fontWeight: '700',
        padding: '3px 9px', borderRadius: '6px',
    },
    rxBadge: {
        fontSize: '11px', fontWeight: '700',
        padding: '3px 9px', borderRadius: '6px',
    },
    cardBody: { flex: 1, padding: '14px 18px' },
    medName: {
        fontSize: '17px', fontWeight: '700',
        color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.3,
    },
    medDesc: {
        fontSize: '13px', color: '#94a3b8',
        margin: '0 0 14px 0', lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    stockRow: { marginBottom: '14px' },
    stockIn: { fontSize: '12px', fontWeight: '600', color: '#059669' },
    stockLow: { fontSize: '12px', fontWeight: '600', color: '#d97706' },
    stockOut: { fontSize: '12px', fontWeight: '600', color: '#dc2626' },
    priceSection: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '12px', borderTop: '1px dashed #e8eef7',
    },
    priceLabel: {
        fontSize: '10px', color: '#94a3b8', fontWeight: '600',
        textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    price: {
        fontSize: '22px', fontWeight: '800',
        color: '#0f172a', fontFamily: "'Outfit', sans-serif",
    },
    qtyPicker: {
        display: 'flex', alignItems: 'center',
        background: '#f8fafc', borderRadius: '8px',
        border: '1.5px solid #e2e8f0',
    },
    qtyBtn: {
        width: '30px', height: '30px', border: 'none',
        background: 'transparent', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', color: '#475569', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: '6px', transition: 'background 0.15s',
    },
    qtyNum: {
        fontSize: '13px', fontWeight: '700',
        padding: '0 8px', color: '#0f172a', minWidth: '24px',
        textAlign: 'center',
    },
    addBtn: {
        margin: '0 18px 18px',
        padding: '12px', borderRadius: '10px',
        color: '#fff', border: 'none',
        fontSize: '14px', fontWeight: '700',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
    },
};

export default Store;
