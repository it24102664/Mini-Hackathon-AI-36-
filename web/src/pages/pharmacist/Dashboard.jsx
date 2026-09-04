import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const StatCard = ({ label, value, sub, color, gradient, icon, delay = 0 }) => (
    <div style={{ ...cardStyles.metric, animationDelay: `${delay}ms` }} className="animate-fadeInUp">
        <div style={{ ...cardStyles.metricAccent, background: gradient }} />
        <div style={{ ...cardStyles.metricIcon, background: `${color}18`, color }}>
            <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>
        <div style={cardStyles.metricContent}>
            <span style={cardStyles.metricLabel}>{label}</span>
            <div style={{ ...cardStyles.metricValue, color }}>{value}</div>
            <span style={cardStyles.metricSub}>{sub}</span>
        </div>
    </div>
);

const cardStyles = {
    metric: {
        background: '#fff',
        borderRadius: '16px',
        padding: '22px 24px',
        border: '1px solid #e8eef7',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s, box-shadow 0.25s',
        cursor: 'default',
    },
    metricAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
    },
    metricIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    metricContent: { flex: 1 },
    metricLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'block',
    },
    metricValue: {
        fontSize: '28px',
        fontWeight: '800',
        margin: '4px 0 2px',
        fontFamily: "'Outfit', sans-serif",
        lineHeight: 1.1,
    },
    metricSub: {
        fontSize: '12px',
        color: '#94a3b8',
    },
};

const PharmacistDashboard = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState({
        totalProducts: 0, lowStockCount: 0, expiredCount: 0,
        expiringSoonCount: 0, lowStockMedicines: [], expiringMedicines: []
    });
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        try {
            const [alertsRes, ordersRes] = await Promise.all([
                api.get('/Medicines/alerts'),
                api.get('/Orders?status=Pending')
            ]);
            setAlerts(alertsRes.data);
            setPendingOrders(ordersRes.data || []);
        } catch (error) {
            console.error('Failed to load pharmacist dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={styles.loadingScreen}>
                    <div style={styles.loadingSpinner} />
                    <p style={{ color: '#64748b', fontWeight: 600, marginTop: 16 }}>Loading pharmacy metrics...</p>
                </div>
            </div>
        );
    }

    const metrics = [
        { label: 'Active Catalog', value: alerts.totalProducts, sub: 'Pharmaceutical products', color: '#2563eb', gradient: 'linear-gradient(90deg,#2563eb,#0ea5e9)', icon: '📦', delay: 0 },
        { label: 'Low Stock Alerts', value: alerts.lowStockCount, sub: 'Stock ≤ Minimum level', color: alerts.lowStockCount > 0 ? '#d97706' : '#10b981', gradient: alerts.lowStockCount > 0 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#10b981,#059669)', icon: '⚠️', delay: 100 },
        { label: 'Expiring Soon', value: alerts.expiringSoonCount, sub: `${alerts.expiredCount} already expired`, color: alerts.expiringSoonCount > 0 ? '#ef4444' : '#10b981', gradient: alerts.expiringSoonCount > 0 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#10b981,#059669)', icon: '⏳', delay: 200 },
        { label: 'Pending Orders', value: pendingOrders.length, sub: 'Needs review or dispatch', color: pendingOrders.length > 0 ? '#7c3aed' : '#10b981', gradient: pendingOrders.length > 0 ? 'linear-gradient(90deg,#7c3aed,#6366f1)' : 'linear-gradient(90deg,#10b981,#059669)', icon: '📋', delay: 300 },
    ];

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header} className="animate-fadeInDown">
                    <div>
                        <div style={styles.headerBadge}>Pharmacy Operations</div>
                        <h1 style={styles.title}>Operations Dashboard</h1>
                        <p style={styles.subtitle}>Real-time stock monitoring, prescription verification & pending dispatch orders.</p>
                    </div>
                    <button onClick={() => navigate('/pharmacist/medicines')} style={styles.primaryBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add Medicine
                    </button>
                </div>

                {/* KPI Metrics */}
                <div style={styles.metricsGrid}>
                    {metrics.map((m, i) => <StatCard key={i} {...m} />)}
                </div>

                {/* Two-column Alerts */}
                <div style={styles.twoCol}>
                    {/* Low Stock */}
                    <div style={styles.sectionCard} className="animate-fadeInUp delay-200">
                        <div style={styles.sectionHeader}>
                            <div>
                                <h3 style={styles.sectionTitle}>⚠️ Low Stock Alerts</h3>
                                <p style={styles.sectionDesc}>{alerts.lowStockMedicines?.length || 0} medicines need restocking</p>
                            </div>
                            <Link to="/pharmacist/inventory" style={styles.sectionLink}>View Inventory →</Link>
                        </div>
                        <div style={styles.sectionBody}>
                            {(!alerts.lowStockMedicines || alerts.lowStockMedicines.length === 0) ? (
                                <div style={styles.allGood}>
                                    <span style={{ fontSize: '20px' }}>✅</span>
                                    <span>All inventory levels above minimum threshold</span>
                                </div>
                            ) : (
                                <div style={styles.alertList}>
                                    {alerts.lowStockMedicines.map((med) => (
                                        <div key={med.id} style={styles.alertItem}>
                                            <div style={styles.alertItemDot} />
                                            <div style={{ flex: 1 }}>
                                                <div style={styles.medName}>{med.name}</div>
                                                <div style={styles.medMeta}>{med.categoryName} · Min: {med.minStockLevel}</div>
                                            </div>
                                            <div style={styles.stockBadge}>
                                                {med.stockQuantity} units
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expiring */}
                    <div style={styles.sectionCard} className="animate-fadeInUp delay-300">
                        <div style={styles.sectionHeader}>
                            <div>
                                <h3 style={styles.sectionTitle}>⏳ Expiring Within 30 Days</h3>
                                <p style={styles.sectionDesc}>{alerts.expiringMedicines?.length || 0} medicines require attention</p>
                            </div>
                            <Link to="/pharmacist/inventory" style={styles.sectionLink}>Inspect Batches →</Link>
                        </div>
                        <div style={styles.sectionBody}>
                            {(!alerts.expiringMedicines || alerts.expiringMedicines.length === 0) ? (
                                <div style={styles.allGood}>
                                    <span style={{ fontSize: '20px' }}>✅</span>
                                    <span>No medicines expiring within 30 days</span>
                                </div>
                            ) : (
                                <div style={styles.alertList}>
                                    {alerts.expiringMedicines.map((med) => {
                                        const isPast = new Date(med.expiryDate) <= new Date();
                                        return (
                                            <div key={med.id} style={styles.alertItem}>
                                                <div style={{ ...styles.alertItemDot, background: isPast ? '#ef4444' : '#f59e0b' }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={styles.medName}>{med.name}</div>
                                                    <div style={styles.medMeta}>Stock: {med.stockQuantity} units</div>
                                                </div>
                                                <div style={{
                                                    ...styles.expiryBadge,
                                                    background: isPast ? '#fee2e2' : '#fef3c7',
                                                    color: isPast ? '#dc2626' : '#d97706',
                                                }}>
                                                    {isPast ? '🔴 EXPIRED' : `Exp: ${new Date(med.expiryDate).toLocaleDateString()}`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pending Orders Table */}
                <div style={{ ...styles.sectionCard, marginTop: 0 }} className="animate-fadeInUp delay-400">
                    <div style={styles.sectionHeader}>
                        <div>
                            <h3 style={styles.sectionTitle}>📑 Orders Awaiting Review</h3>
                            <p style={styles.sectionDesc}>{pendingOrders.length} pending customer orders in queue</p>
                        </div>
                        <Link to="/pharmacist/orders" style={styles.sectionLink}>Open Queue →</Link>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        {pendingOrders.length === 0 ? (
                            <div style={{ ...styles.allGood, margin: '16px' }}>
                                <span style={{ fontSize: '20px' }}>✅</span>
                                <span>No pending customer orders in queue</span>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total Amount</th>
                                        <th>Prescription</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.slice(0, 8).map((order) => (
                                        <tr key={order.id}>
                                            <td><span style={styles.orderId}>#{order.id}</span></td>
                                            <td style={{ fontWeight: 600 }}>{order.customerName}</td>
                                            <td style={{ color: '#64748b' }}>{order.items.length} item(s)</td>
                                            <td style={{ fontWeight: 700, color: '#0f172a' }}>Rs. {order.totalAmount.toFixed(2)}</td>
                                            <td>
                                                {order.prescriptionStatus === 'NotRequired' ? (
                                                    <span className="badge badge-gray">Not Required</span>
                                                ) : order.prescriptionStatus === 'Pending' ? (
                                                    <span className="badge badge-amber">⏳ Needs Approval</span>
                                                ) : (
                                                    <span className="badge badge-green">✓ Approved</span>
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => navigate('/pharmacist/orders')} style={styles.processBtn}>
                                                    Process →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
    loadingScreen: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px',
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(37,99,235,0.15)',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
    },
    headerBadge: {
        display: 'inline-block',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,233,0.1))',
        color: '#2563eb',
        border: '1px solid rgba(37,99,235,0.2)',
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 12px',
        borderRadius: '9999px',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '8px',
    },
    title: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 6px 0',
        letterSpacing: '-0.5px',
        fontFamily: "'Outfit', sans-serif",
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0,
    },
    primaryBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        color: '#fff',
        border: 'none',
        padding: '12px 22px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
        transition: 'all 0.2s',
        fontFamily: "'Inter', sans-serif",
        flexShrink: 0,
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
        marginBottom: '28px',
    },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
    },
    sectionCard: {
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e8eef7',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        overflow: 'hidden',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '20px 24px',
        borderBottom: '1px solid #f1f5f9',
        gap: '12px',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 4px 0',
    },
    sectionDesc: {
        fontSize: '12px',
        color: '#94a3b8',
        margin: 0,
    },
    sectionLink: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#2563eb',
        textDecoration: 'none',
        flexShrink: 0,
        marginTop: '2px',
    },
    sectionBody: {
        padding: '16px 20px',
    },
    allGood: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        color: '#166534',
        padding: '14px 16px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '500',
    },
    alertList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    alertItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 14px',
        background: '#fafafa',
        borderRadius: '10px',
        border: '1px solid #f1f5f9',
        transition: 'background 0.15s',
    },
    alertItemDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#f59e0b',
        flexShrink: 0,
        boxShadow: '0 0 6px rgba(245,158,11,0.5)',
    },
    medName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b',
    },
    medMeta: {
        fontSize: '12px',
        color: '#94a3b8',
        marginTop: '2px',
    },
    stockBadge: {
        background: '#fef3c7',
        color: '#b45309',
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px',
        flexShrink: 0,
    },
    expiryBadge: {
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px',
        flexShrink: 0,
    },
    orderId: {
        fontWeight: '700',
        color: '#2563eb',
        background: '#dbeafe',
        padding: '3px 8px',
        borderRadius: '5px',
        fontSize: '12px',
    },
    processBtn: {
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        color: '#fff',
        border: 'none',
        padding: '7px 14px',
        borderRadius: '7px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
};

export default PharmacistDashboard;
