import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, fromDate, toDate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (fromDate) params.append('fromDate', new Date(fromDate).toISOString());
            if (toDate) params.append('toDate', new Date(toDate).toISOString());

            const res = await api.get(`/Orders?${params.toString()}`);
            setOrders(res.data || []);
        } catch (error) {
            console.error('Failed to load order history:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setStatusFilter('all');
        setFromDate('');
        setToDate('');
        setSearchQuery('');
    };

    const filteredOrders = orders.filter((o) =>
        o.id.toString().includes(searchQuery) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalRevenue = filteredOrders
        .filter(o => o.status !== 'Rejected')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const completedOrders = filteredOrders.filter(o => o.status === 'Completed').length;

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>📜 Complete Pharmacy Order History</h1>
                        <p style={styles.subtitle}>Audit past orders, filter by execution date ranges, and analyze revenue flows.</p>
                    </div>
                </div>

                {/* Summary KPI Cards */}
                <div style={styles.kpiRow}>
                    <div style={styles.kpiCard}>
                        <span style={styles.kpiLabel}>Total Filtered Revenue</span>
                        <div style={styles.kpiValue}>Rs. {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <span style={styles.kpiSub}>Excluding rejected orders</span>
                    </div>

                    <div style={styles.kpiCard}>
                        <span style={styles.kpiLabel}>Total Orders</span>
                        <div style={styles.kpiValue}>{filteredOrders.length}</div>
                        <span style={styles.kpiSub}>Across all statuses</span>
                    </div>

                    <div style={styles.kpiCard}>
                        <span style={styles.kpiLabel}>Completed / Dispatched</span>
                        <div style={{ ...styles.kpiValue, color: '#16a34a' }}>{completedOrders}</div>
                        <span style={styles.kpiSub}>Successfully fulfilled</span>
                    </div>
                </div>

                {/* Filters Card */}
                <div style={styles.filterCard}>
                    <div style={styles.searchBox}>
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Search by Order # or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.dateGroup}>
                        <label style={styles.dateLabel}>From:</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={styles.dateInput}
                        />

                        <label style={styles.dateLabel}>To:</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={styles.dateInput}
                        />
                    </div>

                    <div style={styles.statusGroup}>
                        <label style={styles.dateLabel}>Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={styles.select}
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                        </select>

                        {(statusFilter !== 'all' || fromDate || toDate) && (
                            <button onClick={resetFilters} style={styles.resetBtn}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p>Fetching order audit records...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <div style={styles.emptyIcon}>📜</div>
                        <h3>No orders found</h3>
                        <p>No transactions match your specified date range or filter settings.</p>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Order #</th>
                                    <th style={styles.th}>Date & Time</th>
                                    <th style={styles.th}>Customer</th>
                                    <th style={styles.th}>Prescription</th>
                                    <th style={styles.th}>Total Amount</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} style={styles.tr}>
                                        <td style={styles.td}><strong>#{order.id}</strong></td>
                                        <td style={styles.td}>
                                            {new Date(order.orderDate).toLocaleDateString()} {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.customerName}>{order.customerName}</div>
                                            <div style={styles.customerEmail}>{order.customerEmail}</div>
                                        </td>
                                        <td style={styles.td}>
                                            {order.prescriptionUrl ? (
                                                <a
                                                    href={`http://localhost:5126${order.prescriptionUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={styles.rxLink}
                                                >
                                                    View Rx ({order.prescriptionStatus})
                                                </a>
                                            ) : (
                                                <span style={styles.notRequired}>N/A</span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <strong>Rs. {order.totalAmount.toFixed(2)}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: order.status === 'Completed' ? '#dcfce7' :
                                                    order.status === 'Confirmed' ? '#e0f2fe' :
                                                    order.status === 'Ready' ? '#ede9fe' :
                                                    order.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                                                color: order.status === 'Completed' ? '#15803d' :
                                                    order.status === 'Confirmed' ? '#0369a1' :
                                                    order.status === 'Ready' ? '#6d28d9' :
                                                    order.status === 'Rejected' ? '#dc2626' : '#b45309'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.itemsCount}>{order.items.length} items</span>
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
    kpiRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
    },
    kpiCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    kpiLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748b'
    },
    kpiValue: {
        fontSize: '26px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '6px 0 2px 0'
    },
    kpiSub: {
        fontSize: '12px',
        color: '#94a3b8'
    },
    filterCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        padding: '8px 14px',
        border: '1px solid #e2e8f0',
        flex: '1 1 240px'
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '14px',
        width: '100%'
    },
    dateGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    dateLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748b'
    },
    dateInput: {
        padding: '8px 10px',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '13px'
    },
    statusGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    select: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '13px'
    },
    resetBtn: {
        backgroundColor: '#f1f5f9',
        border: '1px solid #cbd5e1',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#475569',
        cursor: 'pointer'
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
        padding: '12px 16px',
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
        fontWeight: '600',
        color: '#0f172a'
    },
    customerEmail: {
        fontSize: '12px',
        color: '#64748b'
    },
    rxLink: {
        color: '#0284c7',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '12px'
    },
    notRequired: {
        fontSize: '12px',
        color: '#94a3b8'
    },
    statusBadge: {
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 8px',
        borderRadius: '4px'
    },
    itemsCount: {
        fontSize: '12px',
        color: '#64748b'
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
    }
};

export default OrderHistory;
