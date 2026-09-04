import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
    { label: 'Admin', icon: '🔑', email: 'admin@medistock.com', password: 'Admin123!', color: '#ef4444' },
    { label: 'Pharmacist', icon: '💊', email: 'pharmacist@medistock.com', password: 'Pharmacist123!', color: '#2563eb' },
    { label: 'Customer', icon: '🛒', email: 'customer@medistock.com', password: 'Customer123!', color: '#10b981' },
];

const Login = () => {
    const [email, setEmail] = useState('admin@medistock.com');
    const [password, setPassword] = useState('Admin123!');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeDemo, setActiveDemo] = useState(0);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await login(email, password);
            const role = data.user.role?.toLowerCase();
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'pharmacist' || role === 'staff') navigate('/pharmacist/dashboard');
            else navigate('/customer/store');
        } catch (err) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickLogin = (idx) => {
        setActiveDemo(idx);
        setEmail(DEMO_ACCOUNTS[idx].email);
        setPassword(DEMO_ACCOUNTS[idx].password);
    };

    return (
        <div style={styles.container}>
            {/* Animated background orbs */}
            <div style={{ ...styles.orb, width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', top: '-150px', left: '-150px', animationDelay: '0s' }} />
            <div style={{ ...styles.orb, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', bottom: '-100px', right: '-80px', animationDelay: '3s' }} />
            <div style={{ ...styles.orb, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', top: '40%', left: '60%', animationDelay: '6s' }} />

            {/* Login Card */}
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.logoSection}>
                    <div style={styles.logoBadge} className="animate-pulse-brand">
                        <span style={{ fontSize: '28px' }}>💊</span>
                    </div>
                    <h1 style={styles.brandTitle}>MediStock</h1>
                    <p style={styles.brandSub}>CENTRAL PHARMACY PORTAL</p>
                    <p style={styles.tagline}>Your trusted pharmacy management platform</p>
                </div>

                <div style={styles.divider} />

                {/* Demo Quick-fill */}
                <div style={styles.quickLoginBox}>
                    <span style={styles.quickLoginLabel}>⚡ Quick Demo Access</span>
                    <div style={styles.quickBtnGroup}>
                        {DEMO_ACCOUNTS.map((acc, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleQuickLogin(idx)}
                                style={{
                                    ...styles.quickBtn,
                                    borderColor: activeDemo === idx ? acc.color : 'transparent',
                                    background: activeDemo === idx ? `${acc.color}14` : 'rgba(255,255,255,0.04)',
                                    color: activeDemo === idx ? acc.color : 'rgba(148,163,184,0.8)',
                                }}
                            >
                                <span>{acc.icon}</span>
                                <span>{acc.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                style={styles.input}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <span style={styles.inputIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                style={{ ...styles.input, paddingRight: '48px' }}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ ...styles.button, opacity: isLoading ? 0.75 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? (
                            <>
                                <div style={styles.btnSpinner} />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                    <polyline points="10,17 15,12 10,7"/>
                                    <line x1="15" y1="12" x2="3" y2="12"/>
                                </svg>
                                <span>Sign In to MediStock</span>
                            </>
                        )}
                    </button>
                </form>

                <div style={styles.divider} />

                <div style={styles.footer}>
                    <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '13px' }}>New to MediStock?</span>
                    <Link to="/register" style={styles.registerLink}>
                        Create Customer Account →
                    </Link>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0f1d35 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        borderRadius: '50%',
        animation: 'orb 12s ease-in-out infinite',
        pointerEvents: 'none',
    },
    card: {
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        width: '100%',
        maxWidth: '440px',
        padding: '40px 36px',
        position: 'relative',
        zIndex: 10,
        animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
    },
    logoSection: {
        textAlign: 'center',
        marginBottom: '24px',
    },
    logoBadge: {
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 14px auto',
        boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
    },
    brandTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#ffffff',
        margin: '0 0 4px 0',
        letterSpacing: '-0.5px',
        fontFamily: "'Outfit', sans-serif",
    },
    brandSub: {
        fontSize: '10px',
        fontWeight: '700',
        color: '#38bdf8',
        letterSpacing: '3px',
        margin: '0 0 8px 0',
    },
    tagline: {
        fontSize: '13px',
        color: 'rgba(148,163,184,0.6)',
        margin: 0,
    },
    divider: {
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        margin: '20px 0',
    },
    quickLoginBox: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '24px',
    },
    quickLoginLabel: {
        display: 'block',
        fontSize: '11px',
        fontWeight: '700',
        color: 'rgba(148,163,184,0.6)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '10px',
    },
    quickBtnGroup: {
        display: 'flex',
        gap: '8px',
    },
    quickBtn: {
        flex: 1,
        padding: '8px 10px',
        fontSize: '12px',
        fontWeight: '600',
        borderRadius: '8px',
        border: '1.5px solid transparent',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: 'rgba(148,163,184,0.85)',
    },
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: '13px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'rgba(100,116,139,0.7)',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        padding: '12px 14px 12px 42px',
        borderRadius: '10px',
        border: '1.5px solid rgba(255,255,255,0.1)',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.05)',
        color: '#f1f5f9',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: "'Inter', sans-serif",
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(100,116,139,0.7)',
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#fca5a5',
        padding: '12px 14px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '500',
    },
    button: {
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        color: '#ffffff',
        border: 'none',
        padding: '13px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        marginTop: '4px',
        transition: 'all 0.2s',
        boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
    },
    btnSpinner: {
        width: '16px',
        height: '16px',
        border: '2.5px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
    },
    footer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    registerLink: {
        color: '#38bdf8',
        fontWeight: '700',
        textDecoration: 'none',
        fontSize: '13px',
        transition: 'color 0.2s',
    },
};

export default Login;