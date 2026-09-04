import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/authApi';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, hasPrescriptionRequiredItems } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState(user?.address || '');
    const [contactPhone, setContactPhone] = useState(user?.phoneNumber || '');
    const [prescriptionFile, setPrescriptionFile] = useState(null);
    const [prescriptionPreview, setPrescriptionPreview] = useState(null);
    const [prescriptionUrl, setPrescriptionUrl] = useState('');
    const [uploadingPrescription, setUploadingPrescription] = useState(false);
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const [error, setError] = useState('');
    const [successOrder, setSuccessOrder] = useState(null);

    const requiresRx = hasPrescriptionRequiredItems();

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPrescriptionFile(file);
        setError('');

        // Generate preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setPrescriptionPreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setPrescriptionPreview(null);
        }

        // Upload to server
        setUploadingPrescription(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/Prescriptions/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setPrescriptionUrl(res.data.url);
        } catch (err) {
            console.error('Prescription upload failed:', err);
            setError(err.response?.data?.message || 'Failed to upload prescription. Please try again.');
        } finally {
            setUploadingPrescription(false);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setError('');

        if (cartItems.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        if (requiresRx && !prescriptionUrl) {
            setError('Please upload a valid doctor prescription for prescription-required items.');
            return;
        }

        if (!shippingAddress.trim()) {
            setError('Please provide a delivery address.');
            return;
        }

        if (!contactPhone.trim()) {
            setError('Please provide a contact phone number.');
            return;
        }

        setSubmittingOrder(true);
        try {
            const orderPayload = {
                items: cartItems.map((item) => ({
                    medicineId: item.medicineId,
                    quantity: item.quantity
                })),
                prescriptionUrl: prescriptionUrl || null,
                shippingAddress: shippingAddress.trim(),
                contactPhone: contactPhone.trim()
            };

            const response = await api.post('/Orders', orderPayload);
            clearCart();
            setSuccessOrder(response.data);
        } catch (err) {
            console.error('Order submission failed:', err);
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setSubmittingOrder(false);
        }
    };

    if (successOrder) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={styles.container}>
                    <div style={styles.successCard}>
                        <div style={styles.successIcon}>🎉</div>
                        <h2 style={styles.successTitle}>Order Placed Successfully!</h2>
                        <p style={styles.successText}>
                            Thank you for your order. Your order ID is <strong>#{successOrder.id}</strong>.
                        </p>
                        {successOrder.prescriptionStatus === 'Pending' && (
                            <div style={styles.rxNotice}>
                                ⚠️ <strong>Prescription Verification in Progress:</strong> Pharmacy staff will review your uploaded prescription shortly before dispatching your medicines.
                            </div>
                        )}
                        <div style={styles.successActions}>
                            <button onClick={() => navigate('/customer/orders')} style={styles.primaryBtn}>
                                Track My Orders
                            </button>
                            <button onClick={() => navigate('/customer/store')} style={styles.secondaryBtn}>
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <Navbar />

            <div style={styles.container}>
                <h1 style={styles.heading}>🛍️ Shopping Cart & Checkout</h1>

                {error && <div style={styles.errorBanner}>{error}</div>}

                {cartItems.length === 0 ? (
                    <div style={styles.emptyCartCard}>
                        <div style={styles.emptyCartIcon}>🛒</div>
                        <h2>Your shopping cart is empty</h2>
                        <p>Browse our catalog to select your healthcare essentials and prescriptions.</p>
                        <Link to="/customer/store" style={styles.shopBtn}>
                            Browse Medicines
                        </Link>
                    </div>
                ) : (
                    <div style={styles.layout}>
                        {/* Left Column: Cart Items & Prescription */}
                        <div style={styles.leftCol}>
                            {/* Items List */}
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>Items in Cart ({cartItems.length})</h2>

                                <div style={styles.itemsList}>
                                    {cartItems.map((item) => (
                                        <div key={item.medicineId} style={styles.itemRow}>
                                            <div style={styles.itemInfo}>
                                                <h4 style={styles.itemName}>{item.name}</h4>
                                                <div style={styles.itemMeta}>
                                                    <span style={styles.itemCategory}>{item.categoryName || 'General'}</span>
                                                    {item.requiresPrescription && (
                                                        <span style={styles.rxPill}>💊 Rx Required</span>
                                                    )}
                                                </div>
                                                <div style={styles.itemUnitPrice}>Rs. {item.price.toFixed(2)} each</div>
                                            </div>

                                            <div style={styles.qtyControl}>
                                                <button
                                                    onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                                                    style={styles.qtyBtn}
                                                >
                                                    -
                                                </button>
                                                <span style={styles.qtyNum}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                                                    style={styles.qtyBtn}
                                                    disabled={item.quantity >= item.stockQuantity}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div style={styles.subtotal}>
                                                Rs. {(item.price * item.quantity).toFixed(2)}
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.medicineId)}
                                                style={styles.deleteBtn}
                                                title="Remove item"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Prescription Upload Box */}
                            {requiresRx && (
                                <div style={styles.rxCard}>
                                    <div style={styles.rxHeader}>
                                        <span style={styles.rxAlertIcon}>⚠️</span>
                                        <div>
                                            <h3 style={styles.rxTitle}>Doctor's Prescription Required</h3>
                                            <p style={styles.rxDesc}>
                                                Your cart contains medicines that strictly require a verified doctor's prescription according to pharmaceutical regulations.
                                            </p>
                                        </div>
                                    </div>

                                    <div style={styles.uploadArea}>
                                        <input
                                            type="file"
                                            id="prescription-file"
                                            accept="image/png, image/jpeg, image/webp, application/pdf"
                                            onChange={handleFileSelect}
                                            style={styles.fileInput}
                                        />
                                        <label htmlFor="prescription-file" style={styles.uploadLabel}>
                                            <span style={styles.uploadIcon}>📄</span>
                                            <span style={styles.uploadText}>
                                                {uploadingPrescription
                                                    ? 'Uploading prescription...'
                                                    : prescriptionFile
                                                    ? `Selected: ${prescriptionFile.name}`
                                                    : 'Click or tap to upload prescription (JPG, PNG, PDF)'}
                                            </span>
                                        </label>

                                        {prescriptionUrl && (
                                            <div style={styles.uploadSuccess}>
                                                ✓ Prescription uploaded & ready for pharmacist verification
                                            </div>
                                        )}

                                        {prescriptionPreview && (
                                            <div style={styles.previewContainer}>
                                                <p style={styles.previewTitle}>Prescription Document Preview:</p>
                                                <img src={prescriptionPreview} alt="Prescription Preview" style={styles.previewImg} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Checkout Form & Summary */}
                        <div style={styles.rightCol}>
                            <form onSubmit={handleCheckout} style={styles.card}>
                                <h2 style={styles.cardTitle}>Order Summary</h2>

                                <div style={styles.summaryRow}>
                                    <span>Subtotal</span>
                                    <span>Rs. {cartTotal.toFixed(2)}</span>
                                </div>
                                <div style={styles.summaryRow}>
                                    <span>Delivery Fee</span>
                                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>FREE</span>
                                </div>
                                <div style={styles.totalRow}>
                                    <span>Total Amount</span>
                                    <span style={styles.totalPrice}>Rs. {cartTotal.toFixed(2)}</span>
                                </div>

                                <div style={styles.divider}></div>

                                <h3 style={styles.sectionSubtitle}>Delivery Details</h3>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Delivery Address *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter your complete street address, city, and postal code"
                                        style={styles.textarea}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Contact Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder="e.g. 077 123 4567"
                                        style={styles.input}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingOrder || uploadingPrescription || (requiresRx && !prescriptionUrl)}
                                    style={{
                                        ...styles.checkoutBtn,
                                        opacity: submittingOrder || (requiresRx && !prescriptionUrl) ? 0.6 : 1,
                                        cursor: submittingOrder || (requiresRx && !prescriptionUrl) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {submittingOrder
                                        ? 'Processing Order...'
                                        : requiresRx && !prescriptionUrl
                                        ? 'Upload Prescription to Place Order'
                                        : `Place Order (Rs. ${cartTotal.toFixed(2)})`}
                                </button>
                            </form>
                        </div>
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 20px'
    },
    heading: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '24px'
    },
    errorBanner: {
        backgroundColor: '#fee2e2',
        border: '1px solid #ef4444',
        color: '#991b1b',
        padding: '14px 18px',
        borderRadius: '8px',
        marginBottom: '24px',
        fontWeight: '600'
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '24px',
        alignItems: 'start'
    },
    leftCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    rightCol: {
        position: 'sticky',
        top: '90px'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 20px 0',
        paddingBottom: '12px',
        borderBottom: '1px solid #e2e8f0'
    },
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    itemRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1px solid #f1f5f9',
        gap: '12px'
    },
    itemInfo: {
        flex: 2
    },
    itemName: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 4px 0'
    },
    itemMeta: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '4px'
    },
    itemCategory: {
        fontSize: '12px',
        color: '#64748b'
    },
    rxPill: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        fontSize: '10px',
        fontWeight: '700',
        padding: '2px 6px',
        borderRadius: '4px'
    },
    itemUnitPrice: {
        fontSize: '13px',
        color: '#64748b'
    },
    qtyControl: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #cbd5e1'
    },
    qtyBtn: {
        width: '28px',
        height: '28px',
        border: 'none',
        background: 'transparent',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        color: '#334155'
    },
    qtyNum: {
        padding: '0 10px',
        fontSize: '14px',
        fontWeight: '700',
        color: '#0f172a'
    },
    subtotal: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#0f172a',
        width: '100px',
        textAlign: 'right'
    },
    deleteBtn: {
        background: 'transparent',
        border: 'none',
        color: '#ef4444',
        fontSize: '16px',
        cursor: 'pointer',
        padding: '6px'
    },
    rxCard: {
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        padding: '20px'
    },
    rxHeader: {
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        marginBottom: '16px'
    },
    rxAlertIcon: {
        fontSize: '28px'
    },
    rxTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#92400e',
        margin: '0 0 4px 0'
    },
    rxDesc: {
        fontSize: '13px',
        color: '#b45309',
        margin: 0,
        lineHeight: '1.4'
    },
    uploadArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    fileInput: {
        display: 'none'
    },
    uploadLabel: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        border: '2px dashed #d97706',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    uploadIcon: {
        fontSize: '22px'
    },
    uploadText: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#92400e'
    },
    uploadSuccess: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#15803d',
        backgroundColor: '#dcfce7',
        padding: '8px 12px',
        borderRadius: '6px'
    },
    previewContainer: {
        marginTop: '8px'
    },
    previewTitle: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#92400e',
        marginBottom: '6px'
    },
    previewImg: {
        maxWidth: '100%',
        maxHeight: '200px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        objectFit: 'contain'
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#64748b',
        marginBottom: '12px'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: '800',
        color: '#0f172a',
        paddingTop: '12px',
        borderTop: '1px solid #e2e8f0'
    },
    totalPrice: {
        fontSize: '22px',
        color: '#0284c7'
    },
    divider: {
        height: '1px',
        backgroundColor: '#e2e8f0',
        margin: '20px 0'
    },
    sectionSubtitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '14px'
    },
    formGroup: {
        marginBottom: '14px'
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569',
        marginBottom: '6px'
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
    checkoutBtn: {
        width: '100%',
        padding: '14px',
        borderRadius: '8px',
        backgroundColor: '#0284c7',
        color: '#ffffff',
        border: 'none',
        fontSize: '15px',
        fontWeight: '700',
        marginTop: '12px',
        boxShadow: '0 2px 8px rgba(2,132,199,0.3)'
    },
    emptyCartCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#64748b',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    emptyCartIcon: {
        fontSize: '56px',
        marginBottom: '16px'
    },
    shopBtn: {
        display: 'inline-block',
        marginTop: '20px',
        backgroundColor: '#0284c7',
        color: '#ffffff',
        textDecoration: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '15px'
    },
    successCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '48px 32px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '40px auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    },
    successIcon: {
        fontSize: '64px',
        marginBottom: '16px'
    },
    successTitle: {
        fontSize: '26px',
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: '12px'
    },
    successText: {
        fontSize: '16px',
        color: '#475569',
        marginBottom: '20px'
    },
    rxNotice: {
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        color: '#92400e',
        padding: '14px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '24px',
        textAlign: 'left'
    },
    successActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
    },
    primaryBtn: {
        backgroundColor: '#0284c7',
        color: '#ffffff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '14px',
        cursor: 'pointer'
    },
    secondaryBtn: {
        backgroundColor: '#f1f5f9',
        color: '#334155',
        border: '1px solid #cbd5e1',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '14px',
        cursor: 'pointer'
    }
};

export default Cart;
