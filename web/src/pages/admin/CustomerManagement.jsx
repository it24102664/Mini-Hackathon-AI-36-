import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/Users/customers');
            setCustomers(res.data || []);
        } catch (error) {
            console.error('Failed to load customers:', error);
            showToast('Failed to load customers list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this customer account?`)) return;

        try {
            await api.put(`/Users/customers/${id}/toggle-status`);
            showToast(`Customer account ${action}d successfully.`);
            await fetchCustomers();
        } catch (error) {
            console.error('Error toggling customer status:', error);
            showToast('Failed to update customer account status', 'error');
        }
    };

    const filteredCustomers = customers.filter((c) =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phoneNumber && c.phoneNumber.includes(searchQuery))
    );

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
                        <h1 style={styles.title}>🧑‍🤝‍🧑 Customer Directory</h1>
                        <p style={styles.subtitle}>View registered patient/customer profiles, order frequencies, and manage access.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div style={styles.toolbar}>
                    <div style={styles.searchBox}>
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by customer name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <span style={styles.countBadge}>
                        Total Registered: <strong>{customers.length}</strong>
                    </span>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p>Loading customer accounts...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <div style={styles.emptyIcon}>🧑‍🤝‍🧑</div>
                        <h3>No customers found</h3>
                        <p>No customer records match your search criteria.</p>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Customer</th>
                                    <th style={styles.th}>Phone Number</th>
                                    <th style={styles.th}>Delivery Address</th>
                                    <th style={styles.th}>Orders Placed</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Registered</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.customerName}>{customer.fullName}</div>
                                            <div style={styles.customerEmail}>{customer.email}</div>
                                        </td>
                                        <td style={styles.td}>{customer.phoneNumber || 'N/A'}</td>
                                        <td style={styles.td}>{customer.address || 'N/A'}</td>
                                        <td style={styles.td}>
                                            <span style={styles.ordersBadge}>
                                                {customer.totalOrders} order(s)
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: customer.isActive ? '#dcfce7' : '#fee2e2',
                                                color: customer.isActive ? '#15803d' : '#dc2626'
                                            }}>
                                                {customer.isActive ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleToggleStatus(customer.id, customer.isActive)}
                                                style={{
                                                    ...styles.toggleBtn,
                                                    backgroundColor: customer.isActive ? '#fee2e2' : '#dcfce7',
                                                    color: customer.isActive ? '#dc2626' : '#15803d'
                                                }}
                                            >
                                                {customer.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Roboto, sans-serif"
    },
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 20px'
    },
    header: {
        marginBottom: '24px'
    },
    title: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 4px 0'
    },
    subtitle: {
        fontSize: '15px',
        color: '#64748b',
        margin: 0
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '8px 14px',
        flex: '1 1 300px'
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '14px',
        width: '100%'
    },
    countBadge: {
        fontSize: '14px',
        color: '#64748b'
    },
    tableCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px'
    },
    th: {
        textAlign: 'left',
        padding: '14px 16px',
        backgroundColor: '#f8fafc',
        color: '#475569',
        fontWeight: '700',
        borderBottom: '1px solid #e2e8f0'
    },
    tr: {
        borderBottom: '1px solid #f1f5f9'
    },
    td: {
        padding: '14px 16px',
        color: '#1e293b'
    },
    customerName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#0f172a'
    },
    customerEmail: {
        fontSize: '12px',
        color: '#64748b'
    },
    ordersBadge: {
        backgroundColor: '#f1f5f9',
        color: '#334155',
        fontSize: '12px',
        fontWeight: '700',
        padding: '3px 8px',
        borderRadius: '6px'
    },
    statusBadge: {
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 8px',
        borderRadius: '4px'
    },
    toggleBtn: {
        border: 'none',
        padding: '6px 14px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
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
    emptyBox: {
        textAlign: 'center',
        backgroundColor: '#ffffff',
        padding: '60px 20px',
        borderRadius: '12px',
        color: '#64748b',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '12px'
    },
    toast: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        zIndex: 9999,
        fontWeight: '600',
        fontSize: '14px'
    }
};

export default CustomerManagement;
