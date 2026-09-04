import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const res = await api.get('/Orders/my-orders');
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'Pending': return 1;
            case 'Confirmed': return 2;
            case 'Ready': return 3;
            case 'Completed': return 4;
            case 'Rejected': return -1;
            default: return 1;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#d97706';
            case 'Confirmed': return '#0284c7';
            case 'Ready': return '#7c3aed';
            case 'Completed': return '#16a34a';
            case 'Rejected': return '#dc2626';
            default: return '#64748b';
        }
    };

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>📋 My Medicine Orders</h1>
                        <p style={styles.subtitle}>Track your prescription reviews, dispatch statuses, and delivery progress.</p>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p>Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={styles.emptyCard}>
                        <div style={styles.emptyIcon}>📦</div>
                        <h3>No orders placed yet</h3>
                        <p>You have not made any purchases from MediStock Pharmacy.</p>
                    </div>
                ) : (
                    <div style={styles.ordersList}>
                        {orders.map((order) => {
                            const step = getStatusStep(order.status);
                            const isRejected = order.status === 'Rejected';

                            return (
                                <div key={order.id} style={styles.orderCard}>
                                    {/* Order Top Bar */}
                                    <div style={styles.orderTop}>
                                        <div>
                                            <span style={styles.orderNumber}>Order #{order.id}</span>
                                            <span style={styles.orderDate}>
                                                Placed on {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div style={styles.statusBadges}>
                                            {/* Prescription Status Badge */}
                                            {order.prescriptionStatus !== 'NotRequired' && (
                                                <span style={{
                                                    ...styles.rxStatusBadge,
                                                    backgroundColor: order.prescriptionStatus === 'Approved' ? '#dcfce7' : order.prescriptionStatus === 'Rejected' ? '#fee2e2' : '#fef3c7',
                                                    color: order.prescriptionStatus === 'Approved' ? '#15803d' : order.prescriptionStatus === 'Rejected' ? '#b91c1c' : '#b45309'
                                                }}>
                                                    Rx {order.prescriptionStatus === 'Approved' ? '✓ Approved' : order.prescriptionStatus === 'Rejected' ? '✕ Rejected' : '⏳ Under Review'}
                                                </span>
                                            )}

                                            {/* Order Status Badge */}
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusColor(order.status)
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stepper Progress */}
                                    {!isRejected ? (
                                        <div style={styles.stepperContainer}>
                                            <div style={styles.stepper}>
                                                {['Pending', 'Confirmed', 'Ready for Pickup / Delivery', 'Completed'].map((label, idx) => {
                                                    const stepNum = idx + 1;
                                                    const isCompleted = step >= stepNum;
                                                    const isCurrent = step === stepNum;

                                                    return (
                                                        <div key={label} style={styles.stepItem}>
                                                            <div style={{
                                                                ...styles.stepCircle,
                                                                backgroundColor: isCompleted ? '#0284c7' : '#e2e8f0',
                                                                color: isCompleted ? '#ffffff' : '#64748b',
                                                                boxShadow: isCurrent ? '0 0 0 4px rgba(2,132,199,0.2)' : 'none'
                                                            }}>
                                                                {isCompleted ? '✓' : stepNum}
                                                            </div>
                                                            <span style={{
                                                                ...styles.stepLabel,
                                                                color: isCompleted ? '#0f172a' : '#94a3b8',
                                                                fontWeight: isCurrent ? '700' : '500'
                                                            }}>
                                                                {label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={styles.rejectedBanner}>
                                            ❌ <strong>Order Rejected:</strong> {order.pharmacistNotes || 'This order was rejected during prescription or inventory verification.'}
                                        </div>
                                    )}

                                    {/* Pharmacist Feedback Note */}
                                    {order.pharmacistNotes && !isRejected && (
                                        <div style={styles.notesBox}>
                                            <strong>Pharmacist Note:</strong> {order.pharmacistNotes}
                                        </div>
                                    )}

                                    {/* Items Table */}
                                    <div style={styles.itemsSection}>
                                        <h4 style={styles.itemsHeading}>Ordered Items ({order.items.length})</h4>
                                        <div style={styles.itemsGrid}>
                                            {order.items.map((item) => (
                                                <div key={item.id} style={styles.itemCard}>
                                                    <div>
                                                        <span style={styles.itemTitle}>{item.medicineName}</span>
                                                        {item.requiresPrescription && (
                                                            <span style={styles.rxMiniPill}>Rx</span>
                                                        )}
                                                        <div style={styles.itemSub}>Qty: {item.quantity} × Rs. {item.unitPrice.toFixed(2)}</div>
                                                    </div>
                                                    <span style={styles.itemTotal}>Rs. {item.subtotal.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Footer */}
                                    <div style={styles.orderFooter}>
                                        <div style={styles.deliveryDetails}>
                                            <span>📍 <strong>Delivery:</strong> {order.shippingAddress || 'Not specified'}</span>
                                            <span>📞 <strong>Contact:</strong> {order.contactPhone || 'Not specified'}</span>
                                        </div>

                                        <div style={styles.totalBlock}>
                                            <span style={styles.totalLabel}>Grand Total:</span>
                                            <span style={styles.totalAmount}>Rs. {order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Prescription Preview Link */}
                                    {order.prescriptionUrl && (
                                        <div style={styles.prescriptionLinkRow}>
                                            <span>Uploaded Prescription:</span>
                                            <a
                                                href={`http://localhost:5126${order.prescriptionUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={styles.viewRxBtn}
                                            >
                                                🔍 View Uploaded Prescription Document
                                            </a>
                                        </div>
                                    )}
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
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Roboto, sans-serif"
    },
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '32px 20px'
    },
    header: {
        marginBottom: '28px'
    },
    title: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 6px 0'
    },
    subtitle: {
        fontSize: '15px',
        color: '#64748b',
        margin: 0
    },
    loadingBox: {
        textAlign: 'center',
        padding: '80px 20px',
        color: '#64748b'
    },
    spinner: {
        width: '36px',
        height: '36px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #0284c7',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px auto'
    },
    emptyCard: {
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#64748b',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    emptyIcon: {
        fontSize: '56px',
        marginBottom: '16px'
    },
    ordersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    orderCard: {
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        padding: '24px'
    },
    orderTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '16px',
        gap: '12px',
        flexWrap: 'wrap'
    },
    orderNumber: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#0f172a',
        display: 'block'
    },
    orderDate: {
        fontSize: '13px',
        color: '#64748b',
        marginTop: '2px',
        display: 'block'
    },
    statusBadges: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    rxStatusBadge: {
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    statusBadge: {
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 12px',
        borderRadius: '6px'
    },
    stepperContainer: {
        margin: '24px 0',
        padding: '0 10px'
    },
    stepper: {
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative'
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1
    },
    stepCircle: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 'bold',
        marginBottom: '6px',
        transition: 'all 0.3s'
    },
    stepLabel: {
        fontSize: '12px',
        maxWidth: '120px'
    },
    rejectedBanner: {
        backgroundColor: '#fee2e2',
        border: '1px solid #f87171',
        color: '#991b1b',
        padding: '12px 16px',
        borderRadius: '8px',
        margin: '18px 0',
        fontSize: '14px'
    },
    notesBox: {
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1e40af',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        margin: '12px 0'
    },
    itemsSection: {
        marginTop: '20px'
    },
    itemsHeading: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#475569',
        margin: '0 0 10px 0'
    },
    itemsGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    itemCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #f1f5f9'
    },
    itemTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e293b'
    },
    rxMiniPill: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        fontSize: '10px',
        fontWeight: '700',
        padding: '1px 5px',
        borderRadius: '3px',
        marginLeft: '6px'
    },
    itemSub: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '2px'
    },
    itemTotal: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#0f172a'
    },
    orderFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #f1f5f9',
        flexWrap: 'wrap',
        gap: '12px'
    },
    deliveryDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontSize: '13px',
        color: '#64748b'
    },
    totalBlock: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    totalLabel: {
        fontSize: '14px',
        color: '#64748b',
        fontWeight: '600'
    },
    totalAmount: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#0284c7'
    },
    prescriptionLinkRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: '1px dashed #e2e8f0',
        fontSize: '13px',
        color: '#475569'
    },
    viewRxBtn: {
        color: '#0284c7',
        textDecoration: 'none',
        fontWeight: '700',
        fontSize: '13px'
    }
};

export default MyOrders;
