import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './redux/authSlice';
import { Layout } from './components';
import Registration from './fetcher/auth/regigretion';
import Login from './fetcher/auth/Login';
import DashboardPage from './pages/DashboardPage';
import NormalUserList from './fetcher/NormalUser/NormalUserList';
import StoresList from './fetcher/Store/StoresList';
import RatingsPage from './pages/RatingsPage';
import AdminUsersList from './fetcher/admin/AdminUsersList';
import AddStoreModal from './fetcher/Store/AddStoreModal';
import AddNormalUserModal from './fetcher/NormalUser/AddNormalUserModal';
import UpdatePasswordModal from './components/UpdatePasswordModal';
import AddAdminUserModal from './fetcher/admin/AddAdminUserModal';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user: reduxAuthUser } = useSelector((state) => state.auth);

  const authUser = reduxAuthUser || (() => {
    try {
      const u = localStorage.getItem('user') || localStorage.getItem('userdata');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const userRole = (authUser?.role || 'USER').toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const isStoreOwner =
    userRole === 'STORE_OWNER' ||
    userRole === 'OWNER' ||
    userRole.includes('OWNER') ||
    !!authUser?.is_owner;

  const [activeTab, setActiveTab] = useState(() =>
    isAdmin || isStoreOwner ? 'dashboard' : 'stores'
  );
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddNormalUserOpen, setIsAddNormalUserOpen] = useState(false);
  const [isAddAdminUserOpen, setIsAddAdminUserOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);

  // Automatically switch away from restricted tabs based on role
  React.useEffect(() => {
    if (!isAdmin && (activeTab === 'users' || activeTab === 'admin-users')) {
      setActiveTab('stores');
    }
    if (!isAdmin && !isStoreOwner && activeTab === 'dashboard') {
      setActiveTab('stores');
    }
  }, [isAdmin, isStoreOwner, activeTab]);

  const handleLogout = () => {
    dispatch(logout());
    setAuthMode('login');
  };

  // 1. If user is NOT logged in: Show Login or Registration page
  if (!isAuthenticated) {
    if (authMode === 'register') {
      return (
        <Registration
          onSwitchToLogin={() => setAuthMode('login')}
          onRegisterSuccess={() => setAuthMode('login')}
        />
      );
    }
    return (
      <Login
        onSwitchToRegister={() => setAuthMode('register')}
      />
    );
  }

  // 2. Once logged in: Show the main application & features
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={setActiveTab}
            onOpenAddStore={() => setIsAddStoreOpen(true)}
            onOpenAddNormalUser={() => setIsAddNormalUserOpen(true)}
            onOpenAddAdminUser={() => setIsAddAdminUserOpen(true)}
          />
        );
      case 'users':
        return (
          <NormalUserList
            onAddUser={() => setIsAddNormalUserOpen(true)}
          />
        );
      case 'stores':
        return (
          <StoresList
            onAddStore={isAdmin ? () => setIsAddStoreOpen(true) : null}
          />
        );
      case 'admin-users':
        return (
          <AdminUsersList
            onAddAdminUser={() => setIsAddAdminUserOpen(true)}
          />
        );
      case 'ratings':
        return <RatingsPage />;
      default:
        return (
          <DashboardPage
            onNavigate={setActiveTab}
            onOpenAddStore={() => setIsAddStoreOpen(true)}
            onOpenAddNormalUser={() => setIsAddNormalUserOpen(true)}
            onOpenAddAdminUser={() => setIsAddAdminUserOpen(true)}
          />
        );
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      onOpenAddStore={() => setIsAddStoreOpen(true)}
      onOpenAddNormalUser={() => setIsAddNormalUserOpen(true)}
      onOpenAddAdminUser={() => setIsAddAdminUserOpen(true)}
      onOpenUpdatePassword={() => setIsUpdatePasswordOpen(true)}
    >
      {renderContent()}

      {/* 1. Modal: Add New Store */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreAdded={() => setActiveTab('stores')}
      />

      {/* 2. Modal: Add Normal User */}
      <AddNormalUserModal
        isOpen={isAddNormalUserOpen}
        onClose={() => setIsAddNormalUserOpen(false)}
        onUserAdded={() => setActiveTab('users')}
      />

      {/* 3. Modal: Add Admin User (POST http://localhost:3000/api/admin) */}
      <AddAdminUserModal
        isOpen={isAddAdminUserOpen}
        onClose={() => setIsAddAdminUserOpen(false)}
        onAdminAdded={() => setActiveTab('admin-users')}
      />

      {/* 4. Modal: Update Password (STRICTLY for Normal Users: role === 'USER') */}
      {!isAdmin && (
        <UpdatePasswordModal
          isOpen={isUpdatePasswordOpen}
          onClose={() => setIsUpdatePasswordOpen(false)}
        />
      )}
    </Layout>
  );
}

export default App;
