import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const statusConfig = {
    Completed: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    Confirmed:  { bg: '#dbeafe', color: '#1e40af', dot: '#2563eb' },
    Ready:      { bg: '#ede9fe', color: '#5b21b6', dot: '#7c3aed' },
    Rejected:   { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    Pending:    { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0, totalOrders: 0, staffCount: 0,
        customerCount: 0, lowStockCount: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAdminOverview(); }, []);

    const fetchAdminOverview = async () => {
        try {
            const [ordersRes, staffRes, customersRes, alertsRes] = await Promise.all([
                api.get('/Orders'),
                api.get('/Users/staff'),
                api.get('/Users/customers'),
                api.get('/Medicines/alerts')
            ]);
            const orders = ordersRes.data || [];
            const revenue = orders
                .filter(o => o.status !== 'Rejected')
                .reduce((sum, o) => sum + o.totalAmount, 0);
            setStats({
                totalRevenue: revenue,
                totalOrders: orders.length,
                staffCount: (staffRes.data || []).length,
                customerCount: (customersRes.data || []).length,
                lowStockCount: alertsRes.data?.lowStockCount || 0
            });
            setRecentOrders(orders.slice(0, 6));
        } catch (error) {
            console.error('Failed to load admin overview:', error);
        } finally {
            setLoading(false);
        }
    };

    const modules = [
        { id: 'staff', title: 'Staff Management', desc: 'Add pharmacy staff, edit profiles, and manage licensed accounts.', icon: '👥', path: '/admin/staff', color: '#2563eb', gradient: 'linear-gradient(135deg,#2563eb,#0ea5e9)' },
        { id: 'customers', title: 'Customer Directory', desc: 'Monitor registered customers, order history, and account statuses.', icon: '🧑‍🤝‍🧑', path: '/admin/customers', color: '#059669', gradient: 'linear-gradient(135deg,#059669,#10b981)' },
        { id: 'orders', title: 'Order History', desc: 'Full order history with prescription audits and revenue reports.', icon: '📜', path: '/admin/orders', color: '#7c3aed', gradient: 'linear-gradient(135deg,#7c3aed,#6366f1)' },
        { id: 'medicines', title: 'Medicine Catalog', desc: 'Create products, configure pricing, min stock levels and Rx flags.', icon: '💊', path: '/pharmacist/medicines', color: '#d97706', gradient: 'linear-gradient(135deg,#d97706,#f59e0b)' },
        { id: 'categories', title: 'Category Management', desc: 'Organize medicines into antibiotics, cardiovascular, vitamins categories.', icon: '📁', path: '/pharmacist/categories', color: '#0891b2', gradient: 'linear-gradient(135deg,#0891b2,#0ea5e9)' },
        { id: 'inventory', title: 'Stock & Replenishment', desc: 'View low-stock warnings, expiring batches and trigger replenishment.', icon: '📦', path: '/pharmacist/inventory', color: '#dc2626', gradient: 'linear-gradient(135deg,#dc2626,#ef4444)' },
    ];

    if (loading) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px' }}>
                    <div style={styles.spinner} />
                    <p style={{ color: '#64748b', fontWeight: 600, marginTop: 16 }}>Loading pharmacy overview...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>
                {/* Hero Header */}
                <div style={styles.heroHeader} className="animate-fadeInDown">
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.6)', display: 'inline-block' }} />
                            Admin Administration HQ
                        </div>
                        <h1 style={styles.heroTitle}>MediStock Central Command</h1>
                        <p style={styles.heroSubtitle}>High-level monitoring of medicine stocks, customer orders and pharmacy staff operations.</p>
                    </div>
                    <div style={styles.heroStats}>
                        <div style={styles.quickStat}>
                            <span style={styles.quickStatValue}>Rs. {(stats.totalRevenue / 1000).toFixed(1)}K</span>
                            <span style={styles.quickStatLabel}>Total Revenue</span>
                        </div>
                        <div style={styles.quickStatDivider} />
                        <div style={styles.quickStat}>
                            <span style={styles.quickStatValue}>{stats.totalOrders}</span>
                            <span style={styles.quickStatLabel}>Total Orders</span>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div style={styles.metricsGrid}>
                    {[
                        { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: 'Completed & active orders', color: '#0f172a', accent: 'linear-gradient(90deg,#2563eb,#0ea5e9)', icon: '💰', delay: 0 },
                        { label: 'Total Orders', value: stats.totalOrders, sub: 'Processed through MediStock', color: '#2563eb', accent: 'linear-gradient(90deg,#0ea5e9,#2563eb)', icon: '📦', delay: 80 },
                        { label: 'Pharmacy Staff', value: stats.staffCount, sub: 'Active licensed members', color: '#7c3aed', accent: 'linear-gradient(90deg,#7c3aed,#6366f1)', icon: '👥', delay: 160 },
                        { label: 'Customers', value: stats.customerCount, sub: 'Registered profiles', color: '#059669', accent: 'linear-gradient(90deg,#059669,#10b981)', icon: '🧑‍🤝‍🧑', delay: 240 },
                        { label: 'Stock Alerts', value: stats.lowStockCount, sub: 'Items at/below minimum', color: stats.lowStockCount > 0 ? '#dc2626' : '#059669', accent: stats.lowStockCount > 0 ? 'linear-gradient(90deg,#dc2626,#ef4444)' : 'linear-gradient(90deg,#059669,#10b981)', icon: stats.lowStockCount > 0 ? '⚠️' : '✅', delay: 320 },
                    ].map((m, i) => (
                        <div key={i} style={{ ...styles.metricCard, animationDelay: `${m.delay}ms` }} className="animate-fadeInUp">
                            <div style={{ ...styles.metricAccent, background: m.accent }} />
                            <div style={styles.metricTop}>
                                <span style={styles.metricLabel}>{m.label}</span>
                                <span style={{ fontSize: '22px' }}>{m.icon}</span>
                            </div>
                            <div style={{ ...styles.metricValue, color: m.color }}>{m.value}</div>
                            <span style={styles.metricSub}>{m.sub}</span>
                        </div>
                    ))}
                </div>

                {/* Module Cards */}
                <div style={styles.sectionTitleRow}>
                    <h2 style={styles.sectionTitle}>Pharmacy Modules</h2>
                    <span style={styles.sectionSub}>Quick access to all system sections</span>
                </div>
                <div style={styles.modulesGrid}>
                    {modules.map((mod, i) => (
                        <div
                            key={mod.id}
                            style={{ ...styles.moduleCard, animationDelay: `${i * 60}ms` }}
                            className="animate-scaleIn card-lift"
                            onClick={() => navigate(mod.path)}
                        >
                            <div style={{ ...styles.moduleIconBg, background: mod.gradient }}>
                                <span style={{ fontSize: '22px' }}>{mod.icon}</span>
                            </div>
                            <div style={styles.moduleCardContent}>
                                <h3 style={styles.moduleTitle}>{mod.title}</h3>
                                <p style={styles.moduleDesc}>{mod.desc}</p>
                                <div style={{ ...styles.moduleArrow, color: mod.color }}>
                                    Open Module
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
                                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Orders */}
                <div style={styles.recentCard} className="animate-fadeInUp delay-400">
                    <div style={styles.recentHeader}>
                        <div>
                            <h3 style={styles.recentTitle}>Recent Customer Orders</h3>
                            <p style={styles.recentSub}>Last {recentOrders.length} orders processed</p>
                        </div>
                        <button onClick={() => navigate('/admin/orders')} style={styles.viewAllBtn}>
                            View All History →
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Prescription</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => {
                                    const sc = statusConfig[order.status] || statusConfig.Pending;
                                    return (
                                        <tr key={order.id}>
                                            <td>
                                                <span style={{ fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '3px 8px', borderRadius: 5, fontSize: 12 }}>
                                                    #{order.id}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{order.customerName}</td>
                                            <td style={{ color: '#64748b' }}>{order.items.length} items</td>
                                            <td style={{ fontWeight: 700 }}>Rs. {order.totalAmount.toFixed(2)}</td>
                                            <td>
                                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{order.prescriptionStatus}</span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    background: sc.bg, color: sc.color,
                                                    fontSize: 11, fontWeight: 700,
                                                    padding: '4px 10px', borderRadius: 9999,
                                                }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, boxShadow: `0 0 6px ${sc.dot}80` }} />
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
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
    container: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '36px 24px',
    },
    spinner: {
        width: '40px', height: '40px',
        border: '4px solid rgba(37,99,235,0.15)',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
    },
    // Hero Header
    heroHeader: {
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2236 60%, #0f2a4e 100%)',
        borderRadius: '20px',
        padding: '32px 36px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: { flex: 1 },
    heroBadge: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#fca5a5',
        fontSize: '11px', fontWeight: '700',
        padding: '5px 14px', borderRadius: '9999px',
        textTransform: 'uppercase', letterSpacing: '1px',
        marginBottom: '12px',
    },
    heroTitle: {
        fontSize: '30px', fontWeight: '800',
        color: '#ffffff', margin: '0 0 8px 0',
        letterSpacing: '-0.5px',
        fontFamily: "'Outfit', sans-serif",
    },
    heroSubtitle: {
        fontSize: '14px', color: 'rgba(148,163,184,0.8)', margin: 0,
    },
    heroStats: {
        display: 'flex', alignItems: 'center', gap: '24px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', padding: '20px 28px',
        flexShrink: 0,
    },
    quickStat: { textAlign: 'center' },
    quickStatValue: {
        display: 'block', fontSize: '24px', fontWeight: '800',
        color: '#fff', fontFamily: "'Outfit', sans-serif",
    },
    quickStatLabel: {
        display: 'block', fontSize: '12px', color: 'rgba(148,163,184,0.7)',
        fontWeight: '600', marginTop: '4px',
    },
    quickStatDivider: {
        width: '1px', height: '40px',
        background: 'rgba(255,255,255,0.1)',
    },
    // Metrics
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
    },
    metricCard: {
        background: '#fff',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid #e8eef7',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s, box-shadow 0.25s',
    },
    metricAccent: {
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
    },
    metricTop: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '10px',
    },
    metricLabel: {
        fontSize: '12px', fontWeight: '600',
        color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    metricValue: {
        fontSize: '26px', fontWeight: '800',
        margin: '0 0 4px 0', fontFamily: "'Outfit', sans-serif",
    },
    metricSub: { fontSize: '12px', color: '#94a3b8' },
    // Modules
    sectionTitleRow: {
        display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '20px', fontWeight: '800',
        color: '#0f172a', margin: 0,
        fontFamily: "'Outfit', sans-serif",
    },
    sectionSub: { fontSize: '14px', color: '#94a3b8' },
    modulesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
    },
    moduleCard: {
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e8eef7',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '22px',
        transition: 'transform 0.25s, box-shadow 0.25s',
    },
    moduleIconBg: {
        width: '48px', height: '48px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    moduleCardContent: { flex: 1 },
    moduleTitle: {
        fontSize: '16px', fontWeight: '700',
        color: '#0f172a', margin: '0 0 6px 0',
    },
    moduleDesc: {
        fontSize: '13px', color: '#64748b',
        margin: '0 0 12px 0', lineHeight: '1.4',
    },
    moduleArrow: {
        display: 'inline-flex', alignItems: 'center',
        fontSize: '13px', fontWeight: '700',
    },
    // Recent Card
    recentCard: {
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e8eef7',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        overflow: 'hidden',
    },
    recentHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
        flexWrap: 'wrap', gap: '12px',
    },
    recentTitle: {
        fontSize: '16px', fontWeight: '700',
        color: '#0f172a', margin: '0 0 4px 0',
    },
    recentSub: { fontSize: '12px', color: '#94a3b8', margin: 0 },
    viewAllBtn: {
        background: 'transparent', border: '1.5px solid #dbeafe',
        color: '#2563eb', fontSize: '13px', fontWeight: '700',
        cursor: 'pointer', padding: '8px 16px', borderRadius: '8px',
        transition: 'all 0.2s',
    },
};

export default AdminDashboard;