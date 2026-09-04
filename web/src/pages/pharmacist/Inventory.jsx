import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const Inventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, low, out, expired, expiring
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const res = await api.get('/Medicines?onlyActive=true');
            setMedicines(res.data || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            showToast('Failed to load inventory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickRestock = async (med, addQty) => {
        setUpdatingId(med.id);
        try {
            const updatedStock = med.stockQuantity + addQty;
            await api.put(`/Medicines/${med.id}`, {
                name: med.name,
                categoryId: med.categoryId,
                description: med.description,
                price: med.price,
                stockQuantity: updatedStock,
                minStockLevel: med.minStockLevel || 10,
                expiryDate: med.expiryDate,
                requiresPrescription: med.requiresPrescription,
                isActive: med.isActive
            });

            showToast(`Restocked ${med.name}: now ${updatedStock} units.`);
            await fetchMedicines();
        } catch (error) {
            console.error('Restock error:', error);
            showToast('Failed to update stock', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const now = new Date();
    const soonThreshold = new Date();
    soonThreshold.setDate(now.getDate() + 30);

    const filteredMedicines = medicines.filter((m) => {
        const matchesQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.categoryName && m.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesQuery) return false;

        const isOut = m.stockQuantity === 0;
        const isLow = m.stockQuantity > 0 && m.stockQuantity <= (m.minStockLevel || 10);
        const expDate = new Date(m.expiryDate);
        const isExp = expDate <= now;
        const isExpSoon = !isExp && expDate <= soonThreshold;

        if (filter === 'low') return isLow;
        if (filter === 'out') return isOut;
        if (filter === 'expired') return isExp;
        if (filter === 'expiring') return isExpSoon;
        return true;
    });

    const lowStockCount = medicines.filter(m => m.stockQuantity > 0 && m.stockQuantity <= (m.minStockLevel || 10)).length;
    const outOfStockCount = medicines.filter(m => m.stockQuantity === 0).length;
    const expiringCount = medicines.filter(m => new Date(m.expiryDate) <= soonThreshold).length;

    return (
        <div style={styles.page}>
            <Navbar />

            {/* Toast */}
            {toast.show && (
                <div style={{
                    ...styles.toast,
                    backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981'
                }}>
                    {toast.message}
                </div>
            )}

            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>📦 Stock Inventory & Replenishment</h1>
                        <p style={styles.subtitle}>Track medicine inventory levels, low-stock alerts, expiry dates, and perform quick restock operations.</p>
                    </div>
                </div>

                {/* Filter Buttons & KPI tabs */}
                <div style={styles.filterCard}>
                    <div style={styles.searchBox}>
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Filter by medicine name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.tabsGroup}>
                        <button
                            onClick={() => setFilter('all')}
                            style={filter === 'all' ? styles.activeTab : styles.tab}
                        >
                            All Stock ({medicines.length})
                        </button>
                        <button
                            onClick={() => setFilter('low')}
                            style={{
                                ...(filter === 'low' ? styles.activeTab : styles.tab),
                                color: filter === 'low' ? '#ffffff' : '#d97706'
                            }}
                        >
                            ⚠️ Low Stock ({lowStockCount})
                        </button>
                        <button
                            onClick={() => setFilter('out')}
                            style={{
                                ...(filter === 'out' ? styles.activeTab : styles.tab),
                                color: filter === 'out' ? '#ffffff' : '#dc2626'
                            }}
                        >
                            ❌ Out of Stock ({outOfStockCount})
                        </button>
                        <button
                            onClick={() => setFilter('expiring')}
                            style={{
                                ...(filter === 'expiring' ? styles.activeTab : styles.tab),
                                color: filter === 'expiring' ? '#ffffff' : '#b45309'
                            }}
                        >
                            ⏳ Expiring ≤ 30 Days ({expiringCount})
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p>Loading inventory items...</p>
                    </div>
                ) : filteredMedicines.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <div style={styles.emptyIcon}>📦</div>
                        <h3>No medicines matching this filter</h3>
                        <p>There are no items found for the selected inventory status.</p>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Medicine</th>
                                    <th style={styles.th}>Category</th>
                                    <th style={styles.th}>Current Stock</th>
                                    <th style={styles.th}>Min. Stock Alert</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Batch Expiry</th>
                                    <th style={styles.th}>Quick Restock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMedicines.map((med) => {
                                    const isOut = med.stockQuantity === 0;
                                    const isLow = !isOut && med.stockQuantity <= (med.minStockLevel || 10);
                                    const exp = new Date(med.expiryDate);
                                    const isExpired = exp <= now;
                                    const isExpSoon = !isExpired && exp <= soonThreshold;

                                    return (
                                        <tr key={med.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.medName}>{med.name}</div>
                                                <div style={styles.priceTag}>Rs. {med.price.toFixed(2)}</div>
                                            </td>
                                            <td style={styles.td}>{med.categoryName}</td>
                                            <td style={styles.td}>
                                                <span style={styles.stockNumber}>{med.stockQuantity}</span> units
                                            </td>
                                            <td style={styles.td}>
                                                {med.minStockLevel || 10} units
                                            </td>
                                            <td style={styles.td}>
                                                {isOut ? (
                                                    <span style={styles.outBadge}>Out of Stock</span>
                                                ) : isLow ? (
                                                    <span style={styles.lowBadge}>⚠️ Low Stock</span>
                                                ) : (
                                                    <span style={styles.normalBadge}>✓ Adequate</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{
                                                    color: isExpired ? '#dc2626' : isExpSoon ? '#d97706' : '#1e293b',
                                                    fontWeight: isExpired || isExpSoon ? '700' : 'normal'
                                                }}>
                                                    {exp.toLocaleDateString()}
                                                    {isExpired && ' (EXPIRED)'}
                                                    {isExpSoon && ' (Expiring soon)'}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.restockActions}>
                                                    <button
                                                        disabled={updatingId === med.id}
                                                        onClick={() => handleQuickRestock(med, 20)}
                                                        style={styles.restockBtn}
                                                    >
                                                        +20
                                                    </button>
                                                    <button
                                                        disabled={updatingId === med.id}
                                                        onClick={() => handleQuickRestock(med, 50)}
                                                        style={styles.restockBtn}
                                                    >
                                                        +50
                                                    </button>
                                                    <button
                                                        disabled={updatingId === med.id}
                                                        onClick={() => handleQuickRestock(med, 100)}
                                                        style={styles.restockBtn}
                                                    >
                                                        +100
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
        fontFamily: "'Inter', 'Segoe UI', sans-serif"
    },
    container: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '36px 24px'
    },
    header: {
        marginBottom: '28px',
        animation: 'fadeInDown 0.5s ease-out'
    },
    title: {
        fontSize: '30px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 4px 0',
        letterSpacing: '-0.5px',
        fontFamily: "'Outfit', sans-serif"
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0
    },
    filterCard: {
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        border: '1px solid #e8eef7',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        padding: '9px 14px',
        border: '1.5px solid #e2e8f0',
        flex: '1 1 280px'
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '14px',
        width: '100%',
        fontFamily: "'Inter', sans-serif"
    },
    tabsGroup: {
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap'
    },
    tab: {
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1.5px solid #e2e8f0',
        backgroundColor: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748b',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: "'Inter', sans-serif"
    },
    activeTab: {
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1.5px solid transparent',
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        fontSize: '13px',
        fontWeight: '600',
        color: '#ffffff',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif"
    },
    tableCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        border: '1px solid #e8eef7',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px'
    },
    th: {
        textAlign: 'left',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        color: '#64748b',
        fontWeight: '600',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '2px solid #e8eef7'
    },
    tr: {
        borderBottom: '1px solid #f1f5f9',
        transition: 'background 0.15s'
    },
    td: {
        padding: '14px 16px',
        color: '#1e293b'
    },
    medName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#0f172a'
    },
    priceTag: {
        fontSize: '12px',
        color: '#94a3b8'
    },
    stockNumber: {
        fontSize: '15px',
        fontWeight: '800'
    },
    outBadge: {
        background: '#fee2e2',
        color: '#dc2626',
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    lowBadge: {
        background: '#fef3c7',
        color: '#b45309',
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    normalBadge: {
        background: '#d1fae5',
        color: '#065f46',
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    restockActions: {
        display: 'flex',
        gap: '6px'
    },
    restockBtn: {
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        color: '#fff',
        border: 'none',
        borderRadius: '7px',
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'opacity 0.2s'
    },
    loadingBox: {
        textAlign: 'center',
        padding: '100px 20px',
        color: '#64748b'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(37,99,235,0.15)',
        borderTop: '4px solid #2563eb',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        margin: '0 auto 16px auto'
    },
    emptyBox: {
        textAlign: 'center',
        backgroundColor: '#ffffff',
        padding: '80px 20px',
        borderRadius: '16px',
        color: '#64748b',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        border: '1px solid #e8eef7'
    },
    emptyIcon: {
        fontSize: '52px',
        marginBottom: '16px'
    },
    toast: {
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        color: '#ffffff',
        padding: '14px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 9999,
        fontWeight: '600',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    }
};

export default Inventory;