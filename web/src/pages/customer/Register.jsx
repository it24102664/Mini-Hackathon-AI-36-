import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/authApi';

const FormField = ({ label, icon, children }) => (
    <div style={formStyles.group}>
        <label style={formStyles.label}>
            {icon && <span>{icon}</span>}
            {label}
        </label>
        {children}
    </div>
);

const formStyles = {
    group: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: {
        fontSize: '13px', fontWeight: '600',
        color: 'rgba(148,163,184,0.85)',
        display: 'flex', alignItems: 'center', gap: '6px',
    },
};

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/Auth/register', {
                fullName: fullName.trim(),
                email: email.trim(),
                password,
                phoneNumber: phoneNumber.trim(),
                address: address.trim()
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.card, textAlign: 'center', padding: '60px 36px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
                    <h2 style={{ ...styles.title, color: '#fff', marginBottom: '12px' }}>Account Created!</h2>
                    <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '14px', marginBottom: '24px' }}>
                        Welcome to MediStock Pharmacy. Redirecting you to sign in...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={styles.successSpinner} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Orbs */}
            <div style={{ ...styles.orb, width: 450, height: 450, background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', top: -100, right: -80 }} />
            <div style={{ ...styles.orb, width: 350, height: 350, background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', bottom: -80, left: -60 }} />

            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoBadge}>
                        <span style={{ fontSize: '24px' }}>💊</span>
                    </div>
                    <h1 style={styles.title}>Create Account</h1>
                    <p style={styles.subtitle}>Join MediStock as a customer to browse and order medicines</p>
                </div>

                <div style={styles.divider} />

                {error && (
                    <div style={styles.errorBox}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.twoCol}>
                        <FormField label="Full Name" icon="👤">
                            <input
                                type="text" required value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe" style={styles.input}
                            />
                        </FormField>
                        <FormField label="Email Address" icon="📧">
                            <input
                                type="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com" style={styles.input}
                                autoComplete="email"
                            />
                        </FormField>
                    </div>

                    <FormField label="Password (Min 6 characters)" icon="🔒">
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required minLength={6} value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong password"
                                style={{ ...styles.input, paddingRight: '48px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {password.length > 0 && (
                            <div style={styles.strengthBar}>
                                <div style={{
                                    ...styles.strengthFill,
                                    width: password.length < 6 ? '25%' : password.length < 10 ? '60%' : '100%',
                                    background: password.length < 6 ? '#ef4444' : password.length < 10 ? '#f59e0b' : '#10b981',
                                }} />
                            </div>
                        )}
                    </FormField>

                    <FormField label="Phone Number" icon="📞">
                        <input
                            type="tel" required value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="077 123 4567" style={styles.input}
                        />
                    </FormField>

                    <FormField label="Delivery Address" icon="📍">
                        <textarea
                            required rows={2} value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Your home or delivery address"
                            style={styles.textarea}
                        />
                    </FormField>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ ...styles.button, opacity: isLoading ? 0.75 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? (
                            <><div style={styles.btnSpinner} /> Creating Account...</>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                                </svg>
                                Register as Customer
                            </>
                        )}
                    </button>
                </form>

                <div style={styles.divider} />
                <div style={styles.footer}>
                    <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: '13px' }}>Already have an account?</span>
                    <Link to="/login" style={styles.loginLink}>Sign In here →</Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0f1d35 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative', overflow: 'hidden',
    },
    orb: {
        position: 'absolute', borderRadius: '50%', filter: 'blur(80px)',
        pointerEvents: 'none', animation: 'orb 12s ease-in-out infinite',
    },
    card: {
        background: 'rgba(17,24,39,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px', border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        width: '100%', maxWidth: '520px', padding: '36px',
        position: 'relative', zIndex: 10,
        animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
    },
    header: { textAlign: 'center', marginBottom: '20px' },
    logoBadge: {
        width: '56px', height: '56px', borderRadius: '16px',
        background: 'linear-gradient(135deg,#059669,#10b981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(5,150,105,0.4)',
    },
    title: {
        fontSize: '26px', fontWeight: '800', color: '#fff',
        margin: '0 0 6px', letterSpacing: '-0.3px',
        fontFamily: "'Outfit', sans-serif",
    },
    subtitle: { fontSize: '13px', color: 'rgba(148,163,184,0.65)', margin: 0 },
    divider: {
        height: '1px',
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)',
        margin: '18px 0',
    },
    errorBox: {
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
        color: '#fca5a5', padding: '12px 14px', borderRadius: '10px',
        fontSize: '13px', fontWeight: '500', marginBottom: '16px',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '14px' },
    twoCol: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px',
    },
    input: {
        width: '100%', padding: '11px 14px',
        borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.1)',
        fontSize: '14px', outline: 'none',
        background: 'rgba(255,255,255,0.05)', color: '#f1f5f9',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box', fontFamily: "'Inter', sans-serif",
    },
    textarea: {
        width: '100%', padding: '11px 14px', borderRadius: '10px',
        border: '1.5px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none',
        background: 'rgba(255,255,255,0.05)', color: '#f1f5f9',
        resize: 'none', fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box',
    },
    eyeBtn: {
        position: 'absolute', right: '12px', top: '50%',
        transform: 'translateY(-50%)', background: 'transparent',
        border: 'none', cursor: 'pointer', fontSize: '16px',
    },
    strengthBar: {
        height: '3px', borderRadius: '999px',
        background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
    },
    strengthFill: {
        height: '100%', borderRadius: '999px', transition: 'all 0.3s',
    },
    button: {
        background: 'linear-gradient(135deg,#059669,#10b981)',
        color: '#fff', border: 'none', padding: '13px', borderRadius: '10px',
        fontSize: '14px', fontWeight: '700', marginTop: '4px',
        boxShadow: '0 4px 16px rgba(5,150,105,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        cursor: 'pointer', fontFamily: "'Inter', sans-serif",
        transition: 'all 0.2s',
    },
    btnSpinner: {
        width: '16px', height: '16px',
        border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    },
    successSpinner: {
        width: '40px', height: '40px',
        border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    },
    footer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
    loginLink: { color: '#38bdf8', fontWeight: '700', textDecoration: 'none', fontSize: '13px' },
};

export default Register;
