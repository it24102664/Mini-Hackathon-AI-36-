import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Authentication Pages
import Login from './pages/Login';
import Register from './pages/customer/Register';

// Customer Pages
import Store from './pages/customer/Store';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/MyOrders';

// Pharmacist Pages
import PharmacistDashboard from './pages/pharmacist/Dashboard';
import Medicines from './pages/pharmacist/Medicines';
import Categories from './pages/pharmacist/Categories';
import Inventory from './pages/pharmacist/Inventory';
import PharmacistOrders from './pages/pharmacist/Orders';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import StaffManagement from './pages/admin/StaffManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import OrderHistory from './pages/admin/OrderHistory';

const RoleRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    const role = user.role?.toLowerCase();
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'pharmacist' || role === 'staff') return <Navigate to="/pharmacist/dashboard" replace />;
    return <Navigate to="/customer/store" replace />;
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        {/* Public Authentication Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<RoleRedirect />} />

                        {/* Customer Store & Orders Routes */}
                        <Route path="/customer/store" element={
                            <ProtectedRoute allowedRoles={['Customer', 'Patient', 'Admin', 'Pharmacist']}>
                                <Store />
                            </ProtectedRoute>
                        } />

                        <Route path="/customer/cart" element={
                            <ProtectedRoute allowedRoles={['Customer', 'Patient', 'Admin', 'Pharmacist']}>
                                <Cart />
                            </ProtectedRoute>
                        } />

                        <Route path="/customer/orders" element={
                            <ProtectedRoute allowedRoles={['Customer', 'Patient', 'Admin', 'Pharmacist']}>
                                <MyOrders />
                            </ProtectedRoute>
                        } />

                        {/* Pharmacist Management Routes */}
                        <Route path="/pharmacist/dashboard" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Pharmacist', 'Staff']}>
                                <PharmacistDashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/pharmacist/medicines" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Pharmacist', 'Staff']}>
                                <Medicines />
                            </ProtectedRoute>
                        } />

                        <Route path="/pharmacist/categories" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Pharmacist', 'Staff']}>
                                <Categories />
                            </ProtectedRoute>
                        } />

                        <Route path="/pharmacist/inventory" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Pharmacist', 'Staff']}>
                                <Inventory />
                            </ProtectedRoute>
                        } />

                        <Route path="/pharmacist/orders" element={
                            <ProtectedRoute allowedRoles={['Admin', 'Pharmacist', 'Staff']}>
                                <PharmacistOrders />
                            </ProtectedRoute>
                        } />

                        {/* Admin Management Suite Routes */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/staff" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <StaffManagement />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/customers" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <CustomerManagement />
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/orders" element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <OrderHistory />
                            </ProtectedRoute>
                        } />

                        {/* Catch-all fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;