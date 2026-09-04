import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const PharmacistOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rxModalOpen, setRxModalOpen] = useState(false);
    const [pharmacistNotes, setPharmacistNotes] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const url = filterStatus === 'all' ? '/Orders' : `/Orders?status=${filterStatus}`;
            const res = await api.get(url);
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
            showToast('Failed to load customer orders.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRxModal = (order) => {
        setSelectedOrder(order);
        setPharmacistNotes(order.pharmacistNotes || '');
        setRxModalOpen(true);
    };

    const handleReviewPrescription = async (isApproved) => {
        if (!selectedOrder) return;
        setActionLoading(true);
        try {
            await api.put(`/Orders/${selectedOrder.id}/prescription`, {
                isApproved,
                pharmacistNotes: pharmacistNotes.trim()
            });

            showToast(isApproved ? 'Prescription Approved successfully!' : 'Prescription Rejected.', isApproved ? 'success' : 'error');
            setRxModalOpen(false);
            await fetchOrders();
        } catch (error) {
            console.error('Prescription review error:', error);
            showToast(error.response?.data?.message || 'Failed to review prescription.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setActionLoading(true);
        try {
            await api.put(`/Orders/${orderId}/status`, {
                status: newStatus,
                pharmacistNotes: `Status changed to ${newStatus}`
            });

            showToast(`Order #${orderId} marked as ${newStatus}. Stock updated accordingly.`);
            await fetchOrders();
        } catch (error) {
            console.error('Status update error:', error);
            showToast(error.response?.data?.message || 'Failed to update order status.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredOrders = orders.filter((o) => {
        const query = searchQuery.toLowerCase();
        return o.id.toString().includes(query) ||
            o.customerName.toLowerCase().includes(query) ||
            (o.shippingAddress && o.shippingAddress.toLowerCase().includes(query));
    });

    return (
        <div style={styles.page}>
            <Navbar />

            {/* Toast Notification */}
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
                        <h1 style={styles.title}>📑 Customer Orders & Prescriptions</h1>
                        <p style={styles.subtitle}>
                            Inspect uploaded prescriptions, approve medical orders, and manage dispensing workflow.
                        </p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div style={styles.filterCard}>
                    <div style={styles.searchBox}>
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by Order # or Customer Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.filterTabs}>
                        {['all', 'Pending', 'Confirmed', 'Ready', 'Completed', 'Rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                style={filterStatus === status ? styles.activeTab : styles.tab}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p>Loading orders queue...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <div style={styles.emptyIcon}>📦</div>
                        <h3>No orders found</h3>
                        <p>There are no customer orders matching the selected filter criteria.</p>
                    </div>
                ) : (
                    <div style={styles.ordersGrid}>
                        {filteredOrders.map((order) => {
                            const hasRx = order.items.some(i => i.requiresPrescription);

                            return (
                                <div key={order.id} style={styles.orderCard}>
                                    {/* Card Header */}
                                    <div style={styles.orderCardHeader}>
                                        <div>
                                            <span style={styles.orderId}>Order #{order.id}</span>
                                            <span style={styles.orderDate}>
                                                {new Date(order.orderDate).toLocaleDateString()} {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div style={styles.headerBadges}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: order.status === 'Completed' ? '#16a34a' :
                                                    order.status === 'Confirmed' ? '#0284c7' :
                                                    order.status === 'Ready' ? '#7c3aed' :
                                                    order.status === 'Rejected' ? '#dc2626' : '#d97706'
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer & Delivery Details */}
                                    <div style={styles.customerBlock}>
                                        <div><strong>Customer:</strong> {order.customerName} ({order.customerEmail})</div>
                                        <div><strong>Phone:</strong> {order.contactPhone || 'N/A'}</div>
                                        <div><strong>Address:</strong> {order.shippingAddress || 'N/A'}</div>
                                    </div>

                                    {/* Prescription Section */}
                                    {hasRx && (
                                        <div style={styles.rxAlertSection}>
                                            <div style={styles.rxHeaderRow}>
                                                <span style={styles.rxTag}>💊 Prescription Required</span>
                                                <span style={{
                                                    ...styles.rxStatusTag,
                                                    color: order.prescriptionStatus === 'Approved' ? '#15803d' : order.prescriptionStatus === 'Rejected' ? '#b91c1c' : '#b45309',
                                                    backgroundColor: order.prescriptionStatus === 'Approved' ? '#dcfce7' : order.prescriptionStatus === 'Rejected' ? '#fee2e2' : '#fef3c7'
                                                }}>
                                                    Status: {order.prescriptionStatus}
                                                </span>
                                            </div>

                                            {order.prescriptionUrl ? (
                                                <button
                                                    onClick={() => handleOpenRxModal(order)}
                                                    style={styles.reviewRxBtn}
                                                >
                                                    🔍 View & Verify Prescription Document
                                                </button>
                                            ) : (
                                                <div style={styles.noRxWarning}>
                                                    ⚠️ No prescription file attached by customer!
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    <div style={styles.itemsBlock}>
                                        <h4 style={styles.itemsTitle}>Medicines ({order.items.length}):</h4>
                                        <div style={styles.itemsList}>
                                            {order.items.map((item) => (
                                                <div key={item.id} style={styles.itemRow}>
                                                    <div>
                                                        <span style={styles.itemName}>{item.medicineName}</span>
                                                        {item.requiresPrescription && <span style={styles.miniRx}>Rx</span>}
                                                        <span style={styles.itemQuantity}> × {item.quantity}</span>
                                                    </div>
                                                    <span style={styles.itemPrice}>Rs. {item.subtotal.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total & Action Pipeline */}
                                    <div style={styles.cardFooter}>
                                        <div style={styles.totalBlock}>
                                            <span style={styles.totalLabel}>Total:</span>
                                            <span style={styles.totalPrice}>Rs. {order.totalAmount.toFixed(2)}</span>
                                        </div>

                                        <div style={styles.actionPipeline}>
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button
                                                        disabled={actionLoading}
                                                        onClick={() => handleUpdateStatus(order.id, 'Confirmed')}
                                                        style={styles.confirmBtn}
                                                    >
                                                        ✓ Confirm & Deduct Stock
                                                    </button>
                                                    <button
                                                        disabled={actionLoading}
                                                        onClick={() => handleUpdateStatus(order.id, 'Rejected')}
                                                        style={styles.rejectBtn}
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                </>
                                            )}

                                            {order.status === 'Confirmed' && (
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleUpdateStatus(order.id, 'Ready')}
                                                    style={styles.readyBtn}
                                                >
                                                    📦 Mark as Ready for Pickup
                                                </button>
                                            )}

                                            {order.status === 'Ready' && (
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleUpdateStatus(order.id, 'Completed')}
                                                    style={styles.completeBtn}
                                                >
                                                    ✓ Mark as Completed / Delivered
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Prescription Review Modal */}
            {rxModalOpen && selectedOrder && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Prescription Inspection - Order #{selectedOrder.id}</h2>
                            <button onClick={() => setRxModalOpen(false)} style={styles.modalClose}>✕</button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.patientBanner}>
                                <strong>Patient / Customer:</strong> {selectedOrder.customerName} |
                                <strong> Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString()}
                            </div>

                            {/* Prescription Document Display */}
                            <div style={styles.docViewer}>
                                {selectedOrder.prescriptionUrl?.endsWith('.pdf') ? (
                                    <iframe
                                        src={`http://localhost:5126${selectedOrder.prescriptionUrl}`}
                                        title="Prescription PDF"
                                        style={styles.docIframe}
                                    />
                                ) : (
                                    <img
                                        src={`http://localhost:5126${selectedOrder.prescriptionUrl}`}
                                        alt="Uploaded Prescription"
                                        style={styles.docImg}
                                    />
                                )}
                            </div>

                            {/* Verification Notes */}
                            <div style={styles.notesGroup}>
                                <label style={styles.notesLabel}>Pharmacist Verification Notes / Rejection Reason:</label>
                                <textarea
                                    rows={3}
                                    value={pharmacistNotes}
                                    onChange={(e) => setPharmacistNotes(e.target.value)}
                                    placeholder="Enter notes on dosage check, doctor signature verification, or rejection reason..."
                                    style={styles.notesTextarea}
                                />
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                disabled={actionLoading}
                                onClick={() => handleReviewPrescription(false)}
                                style={styles.modalRejectBtn}
                            >
                                ✕ Reject Prescription
                            </button>
                            <button
                                disabled={actionLoading}
                                onClick={() => handleReviewPrescription(true)}
                                style={styles.modalApproveBtn}
                            >
                                ✓ Approve Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
        marginBottom: '28px'
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
    filterTabs: {
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
    ordersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
        gap: '20px'
    },
    orderCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '22px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e8eef7',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    orderCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '12px',
        marginBottom: '14px'
    },
    orderId: {
        fontSize: '17px',
        fontWeight: '800',
        color: '#0f172a',
        display: 'block'
    },
    orderDate: {
        fontSize: '12px',
        color: '#64748b'
    },
    headerBadges: {
        display: 'flex',
        gap: '6px'
    },
    statusBadge: {
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    customerBlock: {
        fontSize: '13px',
        color: '#475569',
        backgroundColor: '#f8fafc',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    rxAlertSection: {
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '14px'
    },
    rxHeaderRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    rxTag: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#92400e'
    },
    rxStatusTag: {
        fontSize: '11px',
        fontWeight: '700',
        padding: '2px 8px',
        borderRadius: '4px'
    },
    reviewRxBtn: {
        width: '100%',
        backgroundColor: '#0284c7',
        color: '#ffffff',
        border: 'none',
        padding: '8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    noRxWarning: {
        color: '#dc2626',
        fontSize: '12px',
        fontWeight: '700'
    },
    itemsBlock: {
        marginBottom: '16px'
    },
    itemsTitle: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#475569',
        margin: '0 0 8px 0'
    },
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    itemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#1e293b'
    },
    itemName: {
        fontWeight: '600'
    },
    miniRx: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        fontSize: '10px',
        fontWeight: '700',
        padding: '1px 4px',
        borderRadius: '3px',
        marginLeft: '4px'
    },
    itemQuantity: {
        color: '#64748b'
    },
    itemPrice: {
        fontWeight: '600'
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '14px',
        borderTop: '1px solid #f1f5f9',
        flexWrap: 'wrap',
        gap: '12px'
    },
    totalBlock: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '6px'
    },
    totalLabel: {
        fontSize: '13px',
        color: '#64748b'
    },
    totalPrice: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#0f172a'
    },
    actionPipeline: {
        display: 'flex',
        gap: '8px'
    },
    confirmBtn: {
        background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
        color: '#ffffff',
        border: 'none',
        padding: '8px 14px',
        borderRadius: '7px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'opacity 0.2s'
    },
    rejectBtn: {
        background: 'linear-gradient(135deg,#ef4444,#dc2626)',
        color: '#ffffff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '7px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    readyBtn: {
        background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
        color: '#ffffff',
        border: 'none',
        padding: '8px 14px',
        borderRadius: '7px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    completeBtn: {
        background: 'linear-gradient(135deg,#059669,#10b981)',
        color: '#ffffff',
        border: 'none',
        padding: '8px 14px',
        borderRadius: '7px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '20px'
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '750px', width: '100%',
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden'
    },
    modalHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(135deg,#0a0f1e,#1a2236)',
        color: '#ffffff'
    },
    modalTitle: { fontSize: '17px', fontWeight: '700', margin: 0 },
    modalClose: {
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#ffffff', fontSize: '16px', cursor: 'pointer',
        width: '30px', height: '30px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    modalBody: {
        padding: '20px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '14px'
    },
    patientBanner: {
        background: '#f0f4fb', padding: '12px 16px',
        borderRadius: '10px', fontSize: '13px', color: '#334155',
        border: '1px solid #e8eef7'
    },
    docViewer: {
        background: '#f8fafc', border: '1.5px solid #e8eef7',
        borderRadius: '10px', minHeight: '300px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
    },
    docImg: { maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' },
    docIframe: { width: '100%', height: '400px', border: 'none' },
    notesGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    notesLabel: { fontSize: '13px', fontWeight: '600', color: '#334155' },
    notesTextarea: {
        width: '100%', padding: '10px 12px',
        borderRadius: '10px', border: '1.5px solid #e2e8f0',
        fontSize: '13px', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box'
    },
    modalFooter: {
        display: 'flex', justifyContent: 'flex-end', gap: '10px',
        padding: '16px 24px', borderTop: '1px solid #f0f4fb',
        backgroundColor: '#f8fafc'
    },
    modalRejectBtn: {
        background: 'linear-gradient(135deg,#ef4444,#dc2626)',
        color: '#ffffff', border: 'none', padding: '10px 20px',
        borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
    },
    modalApproveBtn: {
        background: 'linear-gradient(135deg,#059669,#10b981)',
        color: '#ffffff', border: 'none', padding: '10px 20px',
        borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
    },
    loadingBox: { textAlign: 'center', padding: '100px 20px', color: '#64748b' },
    spinner: {
        width: '40px', height: '40px',
        border: '4px solid rgba(37,99,235,0.15)', borderTop: '4px solid #2563eb',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
        margin: '0 auto 16px auto'
    },
    emptyBox: {
        textAlign: 'center', backgroundColor: '#ffffff', padding: '80px 20px',
        borderRadius: '16px', color: '#64748b',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e8eef7'
    },
    emptyIcon: { fontSize: '52px', marginBottom: '16px' },
    toast: {
        position: 'fixed', bottom: '28px', right: '28px',
        color: '#ffffff', padding: '14px 20px', borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 9999,
        fontWeight: '600', fontSize: '14px',
        display: 'flex', alignItems: 'center', gap: '8px',
        animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)'
    }
};

export default PharmacistOrders;
