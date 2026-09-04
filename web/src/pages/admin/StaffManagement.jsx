import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/authApi';

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
        role: 'Pharmacist'
    });
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchStaff();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await api.get('/Users/staff');
            setStaffList(res.data || []);
        } catch (error) {
            console.error('Failed to load staff:', error);
            showToast('Failed to load staff list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (staff = null) => {
        if (staff) {
            setEditingStaff(staff);
            setFormData({
                fullName: staff.fullName,
                email: staff.email,
                password: '',
                phoneNumber: staff.phoneNumber || '',
                address: staff.address || '',
                role: staff.role
            });
        } else {
            setEditingStaff(null);
            setFormData({
                fullName: '',
                email: '',
                password: '',
                phoneNumber: '',
                address: '',
                role: 'Pharmacist'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingStaff) {
                await api.put(`/Users/staff/${editingStaff.id}`, {
                    fullName: formData.fullName.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    address: formData.address.trim(),
                    role: formData.role
                });
                showToast('Staff member updated successfully!');
            } else {
                await api.post('/Users/staff', {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    phoneNumber: formData.phoneNumber.trim(),
                    address: formData.address.trim(),
                    role: formData.role
                });
                showToast('New pharmacy staff member created successfully!');
            }
            setShowModal(false);
            await fetchStaff();
        } catch (error) {
            console.error('Error saving staff member:', error);
            showToast(error.response?.data?.message || 'Error saving staff member', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this staff account?`)) return;

        try {
            await api.put(`/Users/staff/${id}/toggle-status`);
            showToast(`Staff account ${action}d successfully.`);
            await fetchStaff();
        } catch (error) {
            console.error('Error toggling staff status:', error);
            showToast('Failed to update staff status', 'error');
        }
    };

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
                        <h1 style={styles.title}>👥 Pharmacy Staff Management</h1>
                        <p style={styles.subtitle}>Register, edit permissions, and manage active statuses of licensed pharmacy staff.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} style={styles.addBtn}>
                        + Add Pharmacy Staff
                    </button>
                </div>

                {loading ? (
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <p>Loading staff directory...</p>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Staff Member</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Phone & Contact</th>
                                    <th style={styles.th}>Address</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Registered Date</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map((member) => (
                                    <tr key={member.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.staffName}>{member.fullName}</div>
                                            <div style={styles.staffEmail}>{member.email}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.roleBadge,
                                                backgroundColor: member.role === 'Admin' ? '#fee2e2' : '#e0f2fe',
                                                color: member.role === 'Admin' ? '#b91c1c' : '#0369a1'
                                            }}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{member.phoneNumber || 'N/A'}</td>
                                        <td style={styles.td}>{member.address || 'N/A'}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: member.isActive ? '#dcfce7' : '#fee2e2',
                                                color: member.isActive ? '#15803d' : '#dc2626'
                                            }}>
                                                {member.isActive ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{new Date(member.createdAt).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actionRow}>
                                                <button onClick={() => handleOpenModal(member)} style={styles.editBtn}>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(member.id, member.isActive)}
                                                    style={{
                                                        ...styles.toggleBtn,
                                                        backgroundColor: member.isActive ? '#fee2e2' : '#dcfce7',
                                                        color: member.isActive ? '#dc2626' : '#15803d'
                                                    }}
                                                >
                                                    {member.isActive ? 'Deactivate' : 'Activate'}
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>
                                {editingStaff ? 'Edit Staff Member' : 'Register New Pharmacy Staff'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.modalForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="e.g. Sarah Jenkins"
                                    style={styles.input}
                                />
                            </div>

                            {!editingStaff && (
                                <>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="sarah@medistock.com"
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Temporary Password * (Min 6 chars)</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Create a password"
                                            style={styles.input}
                                        />
                                    </div>
                                </>
                            )}

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={styles.input}
                                >
                                    <option value="Pharmacist">Pharmacist</option>
                                    <option value="Staff">Pharmacy Staff</option>
                                    <option value="Admin">Administrator</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Contact Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="077 123 4567"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Residential / Branch Address</label>
                                <textarea
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Branch location or address"
                                    style={styles.textarea}
                                />
                            </div>

                            <div style={styles.modalFooter}>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} style={styles.submitBtn}>
                                    {submitting ? 'Saving...' : editingStaff ? 'Update Member' : 'Register Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
        marginBottom: '28px',
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
        padding: '11px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(2,132,199,0.3)'
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
    staffName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#0f172a'
    },
    staffEmail: {
        fontSize: '12px',
        color: '#64748b'
    },
    roleBadge: {
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 8px',
        borderRadius: '4px'
    },
    statusBadge: {
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 8px',
        borderRadius: '4px'
    },
    actionRow: {
        display: 'flex',
        gap: '6px'
    },
    editBtn: {
        backgroundColor: '#f1f5f9',
        color: '#0284c7',
        border: '1px solid #cbd5e1',
        padding: '5px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    toggleBtn: {
        border: 'none',
        padding: '5px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        overflow: 'hidden'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 24px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#0f172a',
        color: '#ffffff'
    },
    modalTitle: {
        fontSize: '17px',
        fontWeight: '700',
        margin: 0
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#ffffff',
        fontSize: '18px',
        cursor: 'pointer'
    },
    modalForm: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569'
    },
    input: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
    },
    textarea: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '12px'
    },
    cancelBtn: {
        backgroundColor: '#f1f5f9',
        color: '#334155',
        border: '1px solid #cbd5e1',
        padding: '10px 18px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    submitBtn: {
        backgroundColor: '#0284c7',
        color: '#ffffff',
        border: 'none',
        padding: '10px 22px',
        borderRadius: '8px',
        fontSize: '13px',
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

export default StaffManagement;
