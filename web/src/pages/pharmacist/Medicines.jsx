import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        description: '',
        price: '',
        stockQuantity: '',
        minStockLevel: 10,
        expiryDate: '',
        requiresPrescription: false,
        isActive: true
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchData();
    }, []);

    const showToastMessage = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [medsRes, catsRes] = await Promise.all([
                api.get('/Medicines?onlyActive=false'),
                api.get('/Categories')
            ]);
            setMedicines(medsRes.data || []);
            setCategories(catsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToastMessage('Failed to load medicines list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = {
                name: formData.name.trim(),
                categoryId: parseInt(formData.categoryId),
                description: formData.description?.trim() || null,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stockQuantity),
                minStockLevel: parseInt(formData.minStockLevel || 10),
                expiryDate: new Date(formData.expiryDate).toISOString(),
                requiresPrescription: Boolean(formData.requiresPrescription),
                isActive: Boolean(formData.isActive)
            };

            if (editingId) {
                await api.put(`/Medicines/${editingId}`, data);
                showToastMessage('Medicine updated successfully!', 'success');
            } else {
                await api.post('/Medicines', data);
                showToastMessage('Medicine added successfully!', 'success');
            }
            resetForm();
            await fetchData();
        } catch (error) {
            console.error('Error saving medicine:', error);
            showToastMessage(error.response?.data?.message || 'Error saving medicine', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (med) => {
        setEditingId(med.id);
        setFormData({
            name: med.name,
            categoryId: med.categoryId.toString(),
            description: med.description || '',
            price: med.price.toString(),
            stockQuantity: med.stockQuantity.toString(),
            minStockLevel: (med.minStockLevel || 10).toString(),
            expiryDate: med.expiryDate ? med.expiryDate.split('T')[0] : '',
            requiresPrescription: med.requiresPrescription,
            isActive: med.isActive
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate/remove this medicine?')) return;
        try {
            await api.delete(`/Medicines/${id}`);
            showToastMessage('Medicine deactivated successfully!', 'success');
            await fetchData();
        } catch (error) {
            console.error('Error deactivating medicine:', error);
            showToastMessage('Failed to deactivate medicine', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            categoryId: '',
            description: '',
            price: '',
            stockQuantity: '',
            minStockLevel: 10,
            expiryDate: '',
            requiresPrescription: false,
            isActive: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredMedicines = medicines.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.categoryName && m.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
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
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>💊 Medicine & Product Catalog</h1>
                        <p style={styles.subtitle}>Add, configure, update pricing, minimum stock levels, and prescription rules.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (showForm) resetForm();
                            else setShowForm(true);
                        }}
                        style={styles.primaryBtn}
                    >
                        {showForm ? '✕ Cancel' : '+ Add New Product'}
                    </button>
                </div>

                {/* Form Modal / Drawer */}
                {showForm && (
                    <div style={styles.formCard}>
                        <h2 style={styles.formTitle}>
                            {editingId ? `Edit Product (ID: #${editingId})` : 'Create New Medicine / Product'}
                        </h2>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Amoxicillin 500mg Capsules"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formCol}>
                                    <label style={styles.label}>Category *</label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Unit Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="e.g. 450.00"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formCol}>
                                    <label style={styles.label}>Current Stock Quantity *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        placeholder="e.g. 100"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formCol}>
                                    <label style={styles.label}>Minimum Alert Level *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.minStockLevel}
                                        onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                                        placeholder="Alert when stock drops below"
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formCol}>
                                    <label style={styles.label}>Expiry Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formCol}>
                                    <label style={styles.label}>Regulations & Flags</label>
                                    <div style={styles.checkboxGroup}>
                                        <label style={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={formData.requiresPrescription}
                                                onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                                            />
                                            <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>Prescription Required (Rx)</span>
                                        </label>

                                        {editingId && (
                                            <label style={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                />
                                                <span>Active Product</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={styles.label}>Description & Dosage Instructions</label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter pharmacological notes, indications, or warnings..."
                                    style={styles.textarea}
                                />
                            </div>

                            <div style={styles.formActions}>
                                <button type="button" onClick={resetForm} style={styles.secondaryBtn}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} style={styles.saveBtn}>
                                    {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Add to Inventory'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table Search & Toolbar */}
                <div style={styles.toolbar}>
                    <div style={styles.searchBox}>
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Filter products by name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <span style={styles.countBadge}>
                        Showing {filteredMedicines.length} of {medicines.length} products
                    </span>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p>Loading inventory...</p>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Product Details</th>
                                    <th style={styles.th}>Category</th>
                                    <th style={styles.th}>Unit Price</th>
                                    <th style={styles.th}>Stock & Status</th>
                                    <th style={styles.th}>Min. Level</th>
                                    <th style={styles.th}>Expiry Date</th>
                                    <th style={styles.th}>Rx Required</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMedicines.map((med) => {
                                    const isLow = med.stockQuantity <= med.minStockLevel;
                                    const isExpired = new Date(med.expiryDate) <= new Date();

                                    return (
                                        <tr key={med.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.medName}>{med.name}</div>
                                                <div style={styles.medDesc}>{med.description || 'No description provided'}</div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.catPill}>{med.categoryName || 'General'}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <strong>Rs. {med.price.toFixed(2)}</strong>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{
                                                    ...styles.stockPill,
                                                    backgroundColor: med.stockQuantity === 0 ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7',
                                                    color: med.stockQuantity === 0 ? '#dc2626' : isLow ? '#b45309' : '#15803d'
                                                }}>
                                                    {med.stockQuantity === 0 ? 'Out of Stock' : `${med.stockQuantity} units`}
                                                    {isLow && med.stockQuantity > 0 && ' (Low Stock)'}
                                                </div>
                                            </td>
                                            <td style={styles.td}>{med.minStockLevel}</td>
                                            <td style={styles.td}>
                                                <span style={{ color: isExpired ? '#dc2626' : '#1e293b', fontWeight: isExpired ? 'bold' : 'normal' }}>
                                                    {new Date(med.expiryDate).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {med.requiresPrescription ? (
                                                    <span style={styles.rxBadge}>💊 Rx Required</span>
                                                ) : (
                                                    <span style={styles.otcBadge}>🟢 OTC</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.rowActions}>
                                                    <button onClick={() => handleEdit(med)} style={styles.editBtn} title="Edit Product">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(med.id)} style={styles.deactivateBtn} title="Deactivate">
                                                        ✕
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
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
    primaryBtn: {
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        color: '#ffffff',
        border: 'none',
        padding: '12px 22px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        fontFamily: "'Inter', sans-serif"
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '28px',
        border: '1px solid #e8eef7',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        marginBottom: '28px',
        animation: 'fadeInDown 0.4s ease-out'
    },
    formTitle: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 20px 0',
        paddingBottom: '14px',
        borderBottom: '1px solid #f0f4fb',
        fontFamily: "'Outfit', sans-serif"
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    formRow: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
    },
    formCol: {
        flex: 1,
        minWidth: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569'
    },
    input: {
        padding: '10px 12px',
        borderRadius: '9px',
        border: '1.5px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: "'Inter', sans-serif"
    },
    textarea: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '9px',
        border: '1.5px solid #e2e8f0',
        fontSize: '14px',
        outline: 'none',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box',
        transition: 'border-color 0.2s'
    },
    checkboxGroup: {
        display: 'flex',
        gap: '18px',
        alignItems: 'center',
        paddingTop: '8px'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '12px',
        paddingTop: '16px',
        borderTop: '1px solid #f0f4fb'
    },
    secondaryBtn: {
        background: '#f1f5f9',
        color: '#475569',
        border: '1.5px solid #e2e8f0',
        padding: '10px 20px',
        borderRadius: '9px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif"
    },
    saveBtn: {
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        color: '#ffffff',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '9px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
        fontFamily: "'Inter', sans-serif"
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        gap: '16px',
        flexWrap: 'wrap'
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        padding: '10px 14px',
        flex: '1 1 300px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '14px',
        width: '100%',
        fontFamily: "'Inter', sans-serif"
    },
    countBadge: {
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '600'
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
        fontWeight: '700',
        color: '#0f172a',
        fontSize: '14px'
    },
    medDesc: {
        fontSize: '12px',
        color: '#94a3b8',
        maxWidth: '280px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginTop: '2px'
    },
    catPill: {
        background: '#dbeafe',
        color: '#1e40af',
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 9px',
        borderRadius: '6px'
    },
    stockPill: {
        display: 'inline-block',
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    rxBadge: {
        background: '#fee2e2',
        color: '#b91c1c',
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 9px',
        borderRadius: '6px'
    },
    otcBadge: {
        background: '#d1fae5',
        color: '#065f46',
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 9px',
        borderRadius: '6px'
    },
    rowActions: {
        display: 'flex',
        gap: '6px'
    },
    editBtn: {
        background: '#dbeafe',
        color: '#1e40af',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '7px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.15s'
    },
    deactivateBtn: {
        background: '#fee2e2',
        color: '#dc2626',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '7px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.15s'
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

export default Medicines;