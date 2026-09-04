import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const showToastMessage = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/Categories');
            setCategories(res.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToastMessage('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/Categories/${editingId}`, formData);
                showToastMessage('Category updated successfully!', 'success');
            } else {
                await api.post('/Categories', formData);
                showToastMessage('Category added successfully!', 'success');
            }
            resetForm();
            await fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            showToastMessage(error.response?.data?.message || 'Error saving category', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, description: cat.description || '' });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? (Will fail if medicines are linked)')) return;
        try {
            await api.delete(`/Categories/${id}`);
            showToastMessage('Category deleted successfully!', 'success');
            await fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            showToastMessage(error.response?.data?.message || 'Cannot delete category with associated medicines', 'error');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
                        <h1 style={styles.title}>📁 Medicine Categories</h1>
                        <p style={styles.subtitle}>Organize pharmaceutical products by therapeutic class, administration route, or health condition.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (showForm) resetForm();
                            else setShowForm(true);
                        }}
                        style={styles.addBtn}
                    >
                        {showForm ? '✕ Cancel' : '+ Add Category'}
                    </button>
                </div>

                {/* Create/Edit Card */}
                {showForm && (
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>
                            {editingId ? `Edit Category (#${editingId})` : 'Create New Category'}
                        </h3>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div>
                                <label style={styles.label}>Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Antibiotics, Pain Relief, Cardiovascular"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={styles.input}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    rows="2"
                                    placeholder="Brief description of the therapeutic category..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={styles.textarea}
                                />
                            </div>

                            <div style={styles.formActions}>
                                <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} style={styles.submitBtn}>
                                    {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Toolbar */}
                <div style={styles.toolbar}>
                    <div style={styles.searchBox}>
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Filter categories by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <span style={styles.countBadge}>
                        Total Categories: <strong>{categories.length}</strong>
                    </span>
                </div>

                {/* Categories Table */}
                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p>Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <div style={styles.emptyIcon}>📁</div>
                        <h3>No categories found</h3>
                        <p>No category matches your search.</p>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Category Name</th>
                                    <th style={styles.th}>Description</th>
                                    <th style={styles.th}>Created Date</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map((c) => (
                                    <tr key={c.id} style={styles.tr}>
                                        <td style={styles.td}><strong>#{c.id}</strong></td>
                                        <td style={styles.td}>
                                            <span style={styles.catPill}>{c.name}</span>
                                        </td>
                                        <td style={styles.td}>{c.description || 'No description provided'}</td>
                                        <td style={styles.td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actionRow}>
                                                <button onClick={() => handleEdit(c)} style={styles.editBtn}>
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(c.id)} style={styles.deleteBtn}>
                                                    Delete
                                                </button>
                                            </div>
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
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
    addBtn: {
        backgroundColor: '#0284c7',
        color: '#ffffff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(2,132,199,0.3)'
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginBottom: '24px'
    },
    formTitle: {
        fontSize: '17px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 16px 0',
        paddingBottom: '10px',
        borderBottom: '1px solid #f1f5f9'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569',
        marginBottom: '4px'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
    },
    textarea: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '8px'
    },
    cancelBtn: {
        backgroundColor: '#f1f5f9',
        color: '#334155',
        border: '1px solid #cbd5e1',
        padding: '8px 18px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    submitBtn: {
        backgroundColor: '#0284c7',
        color: '#ffffff',
        border: 'none',
        padding: '8px 22px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer'
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
        gap: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '8px 14px',
        flex: '1 1 280px'
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '14px',
        width: '100%'
    },
    countBadge: {
        fontSize: '13px',
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
    catPill: {
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    actionRow: {
        display: 'flex',
        gap: '8px'
    },
    editBtn: {
        backgroundColor: '#f1f5f9',
        color: '#0284c7',
        border: '1px solid #cbd5e1',
        padding: '5px 12px',
        borderRadius: '5px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    deleteBtn: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        border: 'none',
        padding: '5px 12px',
        borderRadius: '5px',
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

export default Categories;