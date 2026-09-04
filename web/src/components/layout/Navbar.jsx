import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';
    const isPharmacist = role === 'pharmacist' || role === 'staff';
    const isCustomer = role === 'customer' || role === 'patient';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => setMobileOpen(false), [location.pathname]);

    const handleLogout = () => { logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path;

    const roleColor = isAdmin ? '#ef4444' : isPharmacist ? '#2563eb' : '#10b981';
    const roleBg = isAdmin ? 'rgba(239,68,68,0.12)' : isPharmacist ? 'rgba(37,99,235,0.12)' : 'rgba(16,185,129,0.12)';

    const homeRoute = isAdmin ? '/admin/dashboard' : isPharmacist ? '/pharmacist/dashboard' : '/customer/store';

    return (
        <>
            <nav style={{
                ...styles.nav,
                boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.25)' : '0 1px 0 rgba(255,255,255,0.06)',
                backdropFilter: scrolled ? 'blur(24px)' : 'blur(12px)',
            }}>
                <div style={styles.container}>
                    {/* Brand */}
                    <div style={styles.brand} onClick={() => navigate(homeRoute)} role="button" tabIndex={0}>
                        <div style={styles.logoBadge}>
                            <span style={{ fontSize: '20px' }}>💊</span>
                        </div>
                        <div>
                            <span style={styles.brandTitle}>MediStock</span>
                            <span style={styles.brandSub}>PHARMACY</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <div style={styles.navLinks}>
                        {isCustomer && (
                            <>
                                <NavLink to="/customer/store" active={isActive('/customer/store')}>Medicine Store</NavLink>
                                <NavLink to="/customer/orders" active={isActive('/customer/orders')}>My Orders</NavLink>
                                <Link to="/customer/cart" style={styles.cartButton}>
                                    <span>🛍️</span>
                                    <span>Cart</span>
                                    {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
                                </Link>
                            </>
                        )}
                        {isPharmacist && (
                            <>
                                <NavLink to="/pharmacist/dashboard" active={isActive('/pharmacist/dashboard')}>Dashboard</NavLink>
                                <NavLink to="/pharmacist/medicines" active={isActive('/pharmacist/medicines')}>Medicines</NavLink>
                                <NavLink to="/pharmacist/categories" active={isActive('/pharmacist/categories')}>Categories</NavLink>
                                <NavLink to="/pharmacist/inventory" active={isActive('/pharmacist/inventory')}>Inventory</NavLink>
                                <NavLink to="/pharmacist/orders" active={isActive('/pharmacist/orders')}>Orders</NavLink>
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <NavLink to="/admin/dashboard" active={isActive('/admin/dashboard')}>Dashboard</NavLink>
                                <NavLink to="/admin/staff" active={isActive('/admin/staff')}>Staff</NavLink>
                                <NavLink to="/admin/customers" active={isActive('/admin/customers')}>Customers</NavLink>
                                <NavLink to="/admin/orders" active={isActive('/admin/orders')}>Orders</NavLink>
                                <NavLink to="/pharmacist/medicines" active={isActive('/pharmacist/medicines')}>Products</NavLink>
                            </>
                        )}
                    </div>

                    {/* User Section */}
                    <div style={styles.userSection}>
                        <div style={styles.userInfo}>
                            <div style={styles.userAvatar}>
                                {(user?.fullName || 'U')[0].toUpperCase()}
                            </div>
                            <div style={styles.userText}>
                                <span style={styles.userName}>{user?.fullName || 'User'}</span>
                                <span style={{ ...styles.roleBadge, color: roleColor, background: roleBg }}>
                                    {user?.role || 'Guest'}
                                </span>
                            </div>
                        </div>
                        <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16,17 21,12 16,7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Active route indicator line */}
            <div style={styles.navBorder} />
        </>
    );
};

const NavLink = ({ to, active, children }) => (
    <Link to={to} style={active ? styles.activeLink : styles.link}>
        {active && <span style={styles.activeDot} />}
        {children}
    </Link>
);

const styles = {
    nav: {
        background: 'rgba(10, 15, 30, 0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'box-shadow 0.3s, backdrop-filter 0.3s',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    navBorder: {
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #2563eb, #0ea5e9, transparent)',
        opacity: 0.6,
    },
    container: {
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        flexShrink: 0,
    },
    logoBadge: {
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
        flexShrink: 0,
    },
    brandTitle: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: '-0.4px',
        display: 'block',
        fontFamily: "'Outfit', 'Inter', sans-serif",
    },
    brandSub: {
        fontSize: '9px',
        fontWeight: '700',
        color: '#38bdf8',
        letterSpacing: '2.5px',
        display: 'block',
        opacity: 0.8,
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flex: 1,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    link: {
        color: 'rgba(148, 163, 184, 0.9)',
        textDecoration: 'none',
        fontSize: '13.5px',
        fontWeight: '500',
        padding: '7px 13px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
    },
    activeLink: {
        color: '#ffffff',
        backgroundColor: 'rgba(37, 99, 235, 0.18)',
        textDecoration: 'none',
        fontSize: '13.5px',
        fontWeight: '600',
        padding: '7px 13px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        border: '1px solid rgba(37,99,235,0.35)',
        whiteSpace: 'nowrap',
    },
    activeDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#38bdf8',
        flexShrink: 0,
    },
    cartButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '13.5px',
        fontWeight: '600',
        padding: '7px 15px',
        borderRadius: '8px',
        transition: 'opacity 0.2s, transform 0.2s',
        boxShadow: '0 2px 10px rgba(37,99,235,0.35)',
        whiteSpace: 'nowrap',
        position: 'relative',
    },
    cartBadge: {
        background: '#ef4444',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '800',
        padding: '2px 6px',
        borderRadius: '9999px',
        lineHeight: '1.2',
        position: 'absolute',
        top: '-6px',
        right: '-6px',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    userAvatar: {
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '800',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(79,70,229,0.4)',
    },
    userText: {
        display: 'flex',
        flexDirection: 'column',
    },
    userName: {
        color: '#f1f5f9',
        fontSize: '13px',
        fontWeight: '600',
        lineHeight: '1.3',
    },
    roleBadge: {
        fontSize: '10px',
        fontWeight: '700',
        padding: '1px 8px',
        borderRadius: '9999px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    logoutBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(248, 113, 113, 0.1)',
        color: '#fca5a5',
        border: '1px solid rgba(248, 113, 113, 0.2)',
        padding: '7px 13px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },
};

export default Navbar;
