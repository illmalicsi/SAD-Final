import React, { useState, Suspense } from 'react';
import { FaHome, FaBell, FaBoxOpen, FaUsers, FaClipboardList, FaChartLine, FaUser, FaQuestionCircle, FaBars, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaSearch, FaCog, FaCheckCircle, FaDollarSign, FaHistory } from 'react-icons/fa';

// Import components
const UserManagement = React.lazy(() => import('./usermanagement'));
const Inventory = React.lazy(() => import('./inventory'));
const CustomerManagement = React.lazy(() => import('./CustomerManagement'));
const Invoice = React.lazy(() => import('./Invoice'));
const TransactionHistory = React.lazy(() => import('./TransactionHistory'));
const Approval = React.lazy(() => import('./Approval'));
import Payment from './Payment';

const Dashboard = ({ user, onBackToHome, onLogout }) => {
  const [currentView, setCurrentView] = useState('main');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Add loading spinner animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const navigationGroups = [
    {
      title: 'Main',
      items: [
        { id: 'main', icon: <FaHome size={18} />, text: 'Dashboard', view: 'main', adminOnly: false },
        { id: 'notifications', icon: <FaBell size={18} />, text: 'Notifications', view: 'notifications', adminOnly: false }
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'inventory', icon: <FaBoxOpen size={18} />, text: 'Equipments', view: 'inventory-management', adminOnly: false },
        { id: 'customers', icon: <FaUsers size={18} />, text: 'Customers', view: 'customer-management', adminOnly: false },
        { id: 'performances', icon: <FaChartLine size={18} />, text: 'Performances', view: 'performance-history', adminOnly: false }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'users', icon: <FaUsers size={18} />, text: 'Users', view: 'user-management', adminOnly: true }
      ]
    },
    {
      title: 'Finance',
      items: [
        { id: 'invoice', icon: <FaClipboardList size={18} />, text: 'Invoices', view: 'invoice', adminOnly: true },
        { id: 'approval', icon: <FaCheckCircle size={18} />, text: 'Approvals', view: 'approval', adminOnly: true },
        { id: 'payment', icon: <FaDollarSign size={18} />, text: 'Payments', view: 'payment', adminOnly: true },
        { id: 'transactions', icon: <FaHistory size={18} />, text: 'Transactions', view: 'transactions', adminOnly: false }
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', icon: <FaUser size={18} />, text: 'Profile', view: 'my-profile', adminOnly: false },
        { id: 'help', icon: <FaQuestionCircle size={18} />, text: 'Help & Support', view: 'help-support', adminOnly: false }
      ]
    }
  ];

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f8fafc',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    sidebar: {
      width: sidebarCollapsed ? '80px' : '280px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      flexShrink: 0,
      boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)'
    },
    sidebarHeader: {
      height: '70px',
      padding: sidebarCollapsed ? '0 20px' : '0 24px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#ffffff',
      flexShrink: 0
    },
    logo: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: sidebarCollapsed ? '0px' : '20px',
      fontWeight: '700',
      color: '#0f172a',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      letterSpacing: '-0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    logoIcon: {
      fontSize: '24px',
      minWidth: '24px'
    },
    collapseButton: {
      width: '36px',
      height: '36px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    },
    userSection: {
      padding: sidebarCollapsed ? '20px 16px' : '24px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: '#fafbfc'
    },
    userAvatar: {
      width: sidebarCollapsed ? '40px' : '56px',
      height: sidebarCollapsed ? '40px' : '56px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: sidebarCollapsed ? '16px' : '20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
      flexShrink: 0
    },
    userName: {
      fontSize: sidebarCollapsed ? '0px' : '15px',
      fontWeight: '600',
      color: '#0f172a',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      height: sidebarCollapsed ? '0px' : 'auto',
      lineHeight: '1.4'
    },
    userEmail: {
      fontSize: sidebarCollapsed ? '0px' : '13px',
      color: '#64748b',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      height: sidebarCollapsed ? '0px' : 'auto',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      maxWidth: '100%'
    },
    userRole: {
      display: sidebarCollapsed ? 'none' : 'inline-flex',
      padding: '4px 12px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '600',
      background: user?.role === 'admin' 
        ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' 
        : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      border: 'none',
      boxShadow: user?.role === 'admin'
        ? '0 2px 8px rgba(139, 92, 246, 0.3)'
        : '0 2px 8px rgba(59, 130, 246, 0.3)'
    },
    navigation: {
      flex: 1,
      padding: '16px 0',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    navGroup: {
      marginBottom: '28px'
    },
    navGroupTitle: {
      fontSize: sidebarCollapsed ? '0px' : '11px',
      fontWeight: '700',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: '8px',
      padding: sidebarCollapsed ? '0' : '0 24px',
      transition: 'all 0.3s ease',
      overflow: 'hidden'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      height: '44px',
      padding: sidebarCollapsed ? '0' : '0 24px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#64748b',
      position: 'relative',
      margin: sidebarCollapsed ? '4px 16px' : '2px 12px',
      borderRadius: '10px',
      fontWeight: '500',
      fontSize: '14px',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
    },
    navItemActive: {
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      fontWeight: '600',
      boxShadow: '0 1px 3px rgba(37, 99, 235, 0.1)'
    },
    navIcon: {
      width: '20px',
      height: '20px',
      marginRight: sidebarCollapsed ? '0' : '12px',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'margin-right 0.3s ease',
      flexShrink: 0
    },
    navText: {
      fontSize: sidebarCollapsed ? '0px' : '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },
    sidebarFooter: {
      padding: sidebarCollapsed ? '16px 16px' : '16px 12px',
      borderTop: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: sidebarCollapsed ? 'column' : 'row',
      gap: '8px',
      backgroundColor: '#ffffff',
      flexShrink: 0
    },
    footerButton: {
      height: '40px',
      width: sidebarCollapsed ? '40px' : 'auto',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: sidebarCollapsed ? 'none' : 1,
      gap: '6px'
    },
    logoutButton: {
      height: '40px',
      width: sidebarCollapsed ? '40px' : 'auto',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '10px',
      color: '#dc2626',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: sidebarCollapsed ? 'none' : 1,
      gap: '6px'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      overflow: 'hidden'
    },
    mainHeader: {
      minHeight: '70px',
      padding: '0 32px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#ffffff',
      flexShrink: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    mainTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    breadcrumbs: {
      fontSize: '13px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontWeight: '500'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      width: '280px',
      transition: 'all 0.2s ease'
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: '14px',
      color: '#0f172a',
      width: '100%',
      fontFamily: 'inherit'
    },
    headerButton: {
      width: '40px',
      height: '40px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      width: '18px',
      height: '18px',
      backgroundColor: '#ef4444',
      borderRadius: '50%',
      fontSize: '10px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      border: '2px solid white'
    },
    contentArea: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    welcomeCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '32px',
      textAlign: 'center',
      maxWidth: '700px',
  margin: '40px auto 24px',
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    },
    welcomeCardOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      opacity: 0.3,
      pointerEvents: 'none'
    },
    welcomeIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      position: 'relative',
      zIndex: 1
    },
    welcomeTitle: {
      fontSize: '36px',
      fontWeight: '700',
      margin: '0 0 16px 0',
      letterSpacing: '-0.5px',
      position: 'relative',
      zIndex: 1
    },
    welcomeSubtitle: {
      fontSize: '18px',
      lineHeight: '1.6',
      margin: 0,
      fontWeight: '400',
      opacity: 0.95,
      position: 'relative',
      zIndex: 1
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      border: '1px solid #f1f5f9',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '12px',
      width: '100%',
      minWidth: 0
    },
    statIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      flexShrink: 0
    },
    statContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      marginBottom: '2px',
      letterSpacing: '-0.5px'
    },
    statLabel: {
      fontSize: '13px',
      color: '#64748b',
      fontWeight: '500'
    },
    statTrend: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '6px',
      marginTop: '8px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#64748b',
      fontSize: '16px',
      fontWeight: '500',
      gap: '16px'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f1f5f9',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    blockedContainer: {
      backgroundColor: 'white',
      border: '1px solid #fecaca',
      borderRadius: '20px',
      padding: '48px',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '60px auto 0',
      boxShadow: '0 10px 40px rgba(239, 68, 68, 0.1)'
    },
    blockedIcon: {
      fontSize: '64px',
      marginBottom: '24px'
    },
    blockedTitle: {
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 12px 0',
      color: '#dc2626',
      letterSpacing: '-0.5px'
    },
    blockedText: {
      fontSize: '16px',
      color: '#64748b',
      lineHeight: '1.6',
      margin: 0
    },
    panelContainer: {
      backgroundColor: 'white',
      border: '1px solid #f1f5f9',
      borderRadius: '16px',
      height: 'calc(100vh - 134px)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    },
    panelHeader: {
      padding: '24px 32px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fafbfc',
      flexShrink: 0
    },
    panelTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    panelBody: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto',
      backgroundColor: 'white'
    },
    comingSoonContent: {
      textAlign: 'center',
      color: '#64748b',
      padding: '80px 20px'
    },
    comingSoonIcon: {
      fontSize: '80px',
      marginBottom: '24px',
      opacity: 0.6
    },
    comingSoonTitle: {
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 16px 0',
      color: '#0f172a',
      letterSpacing: '-0.5px'
    },
    comingSoonText: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#64748b',
      maxWidth: '500px',
      margin: '0 auto'
    },
    notificationItem: {
      backgroundColor: 'white',
      border: '1px solid #f1f5f9',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    notificationIcon: {
      fontSize: '24px',
      marginTop: '2px',
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    notificationContent: {
      flex: 1,
      minWidth: 0
    },
    notificationTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0 0 4px 0'
    },
    notificationText: {
      fontSize: '14px',
      color: '#64748b',
      margin: '0 0 8px 0',
      lineHeight: '1.5'
    },
    notificationTime: {
      fontSize: '12px',
      color: '#94a3b8',
      fontWeight: '500'
    }
  };

  // Allow non-admin users in, but default their initial view to user-management
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setCurrentView('main');
      } else {
        setCurrentView('user-management');
      }
    }
  }, [user]);


  const handleNavItemHover = (e) => {
    if (!e.currentTarget.classList.contains('active')) {
      e.currentTarget.style.backgroundColor = '#f8fafc';
      e.currentTarget.style.color = '#0f172a';
    }
  };

  const handleNavItemLeave = (e) => {
    if (!e.currentTarget.classList.contains('active')) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = '#64748b';
    }
  };

  const handleButtonHover = (e, isLogout = false) => {
    if (isLogout) {
      e.target.style.backgroundColor = '#dc2626';
      e.target.style.color = '#ffffff';
      e.target.style.borderColor = '#dc2626';
    } else {
      e.target.style.backgroundColor = '#3b82f6';
      e.target.style.color = '#ffffff';
      e.target.style.borderColor = '#3b82f6';
    }
  };

  const handleButtonLeave = (e, isLogout = false) => {
    if (isLogout) {
      e.target.style.backgroundColor = '#fef2f2';
      e.target.style.color = '#dc2626';
      e.target.style.borderColor = '#fecaca';
    } else {
      e.target.style.backgroundColor = '#f8fafc';
      e.target.style.color = '#64748b';
      e.target.style.borderColor = '#e2e8f0';
    }
  };

  const handleCollapseHover = (e) => {
    e.target.style.backgroundColor = '#3b82f6';
    e.target.style.color = '#ffffff';
    e.target.style.borderColor = '#3b82f6';
  };

  const handleCollapseLeave = (e) => {
    e.target.style.backgroundColor = '#f8fafc';
    e.target.style.color = '#64748b';
    e.target.style.borderColor = '#e2e8f0';
  };

  const handleNavItemClick = (view) => {
    // Check if user is trying to access admin features without permission
    if (view === 'user-management' && user?.role !== 'admin') {
      alert('You do not have permission to access User Management');
      return;
    }
    setCurrentView(view);
  };

  // Check if user is blocked
  if (user?.isBlocked) {
    return (
      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={styles.mainHeader}>
            <h1 style={styles.mainTitle}>Access Denied</h1>
            <button
              style={styles.footerButton}
              onClick={onBackToHome}
              onMouseEnter={(e) => handleButtonHover(e)}
              onMouseLeave={(e) => handleButtonLeave(e)}
            >
            </button>
          </div>

          <div style={styles.contentArea}>
            <div style={styles.blockedContainer}>
              <div style={styles.blockedIcon}>🚫</div>
              <h2 style={styles.blockedTitle}>Account Blocked</h2>
              <p style={styles.blockedText}>
                Your account has been temporarily suspended. Please contact the administrator at
                <strong> dbe.official@example.com</strong> to restore access.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getMainTitle = () => {
    for (const group of navigationGroups) {
      const item = group.items.find(item => item.view === currentView);
      if (item) return item.text;
    }
    return 'Dashboard';
  };

  const getBreadcrumbs = () => {
    if (currentView === 'main') return 'Home';
    for (const group of navigationGroups) {
      const item = group.items.find(item => item.view === currentView);
      if (item) return `${group.title} / ${item.text}`;
    }
    return 'Dashboard';
  };

  const getWelcomeContent = () => {
    const statCards = [
      {
        icon: <FaBoxOpen />,
        value: '142',
        label: 'Total Equipments',
        trend: '↑ 12% this month',
        iconBg: '#eff6ff',
        iconColor: '#3b82f6',
        trendBg: '#dcfce7',
        trendColor: '#16a34a'
      },
      {
        icon: <FaUsers />,
        value: '87',
        label: 'Active Customers',
        trend: '↑ 8% this month',
        iconBg: '#fef3c7',
        iconColor: '#f59e0b',
        trendBg: '#dcfce7',
        trendColor: '#16a34a'
      },
      {
        icon: <FaChartLine />,
        value: '24',
        label: 'Upcoming Events',
        trend: '→ 3 this week',
        iconBg: '#fce7f3',
        iconColor: '#ec4899',
        trendBg: '#dbeafe',
        trendColor: '#3b82f6'
      },
      {
        icon: <FaBell />,
        value: '12',
        label: 'New Notifications',
        trend: '⚠ 3 urgent',
        iconBg: '#e0e7ff',
        iconColor: '#6366f1',
        trendBg: '#fee2e2',
        trendColor: '#dc2626'
      }
    ];

    return (
      <>
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeCardOverlay}></div>
          <div style={styles.welcomeIcon}>👋</div>
          <h2 style={styles.welcomeTitle}>Welcome back, {user?.firstName}!</h2>
          <p style={styles.welcomeSubtitle}>
            Manage your marching band operations with ease. Select an option from the sidebar to get started.
          </p>
        </div>

        <div style={styles.statsGrid}>
          {statCards.map((card, index) => (
            <div 
              key={index} 
              style={styles.statCard} 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
              }}
            >
              <div style={{ ...styles.statIcon, backgroundColor: card.iconBg, color: card.iconColor }}>
                {card.icon}
              </div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{card.value}</div>
                <div style={styles.statLabel}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const getNotificationsContent = () => {
    const sampleNotifications = [
      {
        id: 1,
        icon: '📅',
        title: 'Upcoming Performance',
        text: 'You have a performance scheduled for tomorrow at Central Park.',
        time: '2 hours ago',
        bgColor: '#dbeafe',
        iconColor: '#3b82f6'
      },
      {
        id: 2,
        icon: '👥',
        title: 'New Booking Request',
        text: 'A new customer has requested your services for a wedding ceremony.',
        time: '1 day ago',
        bgColor: '#dcfce7',
        iconColor: '#16a34a'
      },
      {
        id: 3,
        icon: '⚠️',
        title: 'Inventory Alert',
        text: 'Some instruments need maintenance check before next performance.',
        time: '2 days ago',
        bgColor: '#fef3c7',
        iconColor: '#f59e0b'
      },
      {
        id: 4,
        icon: '💰',
        title: 'Payment Received',
        text: 'Payment for the corporate event has been processed successfully.',
        time: '3 days ago',
        bgColor: '#dcfce7',
        iconColor: '#16a34a'
      },
      {
        id: 5,
        icon: '🎵',
        title: 'New Equipment Added',
        text: '5 new trumpets have been added to the inventory system.',
        time: '4 days ago',
        bgColor: '#e0e7ff',
        iconColor: '#6366f1'
      }
    ];

    return (
      <div>
        {sampleNotifications.map(notification => (
          <div 
            key={notification.id} 
            style={styles.notificationItem}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ 
              ...styles.notificationIcon, 
              backgroundColor: notification.bgColor,
              color: notification.iconColor
            }}>
              {notification.icon}
            </div>
            <div style={styles.notificationContent}>
              <div style={styles.notificationTitle}>{notification.title}</div>
              <div style={styles.notificationText}>{notification.text}</div>
              <div style={styles.notificationTime}>{notification.time}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getComingSoonContent = (title, icon = '🚧') => {
    return (
      <div style={styles.comingSoonContent}>
        <div style={styles.comingSoonIcon}>{icon}</div>
        <h2 style={styles.comingSoonTitle}>{title}</h2>
        <p style={styles.comingSoonText}>
          This feature is currently under development and will be available soon.
          <br />Stay tuned for updates!
        </p>
      </div>
    );
  };

  const getPanelContent = () => {
    switch (currentView) {
      case 'main':
        return getWelcomeContent();

      case 'notifications':
        return (
          <div style={styles.panelContainer}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Recent Notifications</h2>
            </div>
            <div style={styles.panelBody}>
              {getNotificationsContent()}
            </div>
          </div>
        );

      case 'user-management':
        if (user?.role === 'admin') {
          return (
            <Suspense fallback={
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <div>Loading User Management...</div>
              </div>
            }>
              <UserManagement
                user={user}
                onBackToHome={() => setCurrentView('main')}
                onLogout={onLogout}
                embedded={true}
              />
            </Suspense>
          );
        }
        break;

      case 'inventory-management':
        return (
          <Suspense fallback={
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <div>Loading Inventory Management...</div>
            </div>
          }>
            <Inventory
              user={user}
              onBackToHome={() => setCurrentView('main')}
              onLogout={onLogout}
              embedded={true}
            />
          </Suspense>
        );

      case 'customer-management':
        return (
          <Suspense fallback={
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <div>Loading Customer Management...</div>
            </div>
          }>
            <CustomerManagement
              user={user}
              onBackToHome={() => setCurrentView('main')}
              onLogout={onLogout}
              embedded={true}
            />
          </Suspense>
        );

      case 'invoice':
        return (
          <Suspense fallback={<div>Loading Invoices...</div>}>
            <Invoice user={user} onBackToHome={() => setCurrentView('main')} />
          </Suspense>
        );

      case 'approval':
        return (
          <Suspense fallback={<div>Loading Approvals...</div>}>
            <Approval onBackToHome={() => setCurrentView('main')} />
          </Suspense>
        );

      case 'payment':
        return (
          <Suspense fallback={<div>Loading Payments...</div>}>
            <Payment onBackToHome={() => setCurrentView('main')} />
          </Suspense>
        );
      case 'transactions':
        return (
          <Suspense fallback={<div>Loading Transactions...</div>}>
            <TransactionHistory onBackToHome={() => setCurrentView('main')} />
          </Suspense>
        );

      case 'performance-history':
        return (
          <div style={styles.panelContainer}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Performance History</h2>
            </div>
            <div style={styles.panelBody}>
              {getComingSoonContent('Performance History', '🎭')}
            </div>
          </div>
        );

      case 'my-profile':
        return (
          <div style={styles.panelContainer}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>My Profile</h2>
            </div>
            <div style={styles.panelBody}>
              {/* Profile editor - avatar upload */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#0b3b78' }}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontWeight: 800 }}>{getUserInitials()}</div>
                    )}
                  </div>

                  <label style={{ display: 'inline-flex', gap: 8 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const base64 = String(reader.result);
                          // Update current user in localStorage
                          try {
                            const stored = JSON.parse(localStorage.getItem('davaoBlueEaglesUser') || 'null');
                            const updated = { ...(stored || {}), avatar: base64 };
                            localStorage.setItem('davaoBlueEaglesUser', JSON.stringify(updated));
                            // Update users list if exists (for admin/user management)
                            const users = JSON.parse(localStorage.getItem('davaoBlueEaglesUsers') || '[]');
                            const updatedUsers = users.map(u => u.id === updated.id ? { ...u, avatar: base64 } : u);
                            if (users.length) localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));

                            // Notify parent/app that user changed (so nav/menu updates)
                            window.dispatchEvent(new CustomEvent('davaoUserUpdated', { detail: updated }));
                          } catch (err) {
                            console.error('Saving avatar failed', err);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <button style={{ padding: '8px 12px', borderRadius: 8, background: '#0b62d6', color: 'white', border: 'none', cursor: 'pointer' }}>Upload Photo</button>
                  </label>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ marginTop: 0 }}>{user?.firstName} {user?.lastName}</h3>
                  <p style={{ color: '#475569' }}>{user?.email}</p>
                  <div style={{ marginTop: 12 }}>
                    <p style={{ margin: 0, color: '#64748b' }}>You can upload a profile picture. It is stored locally in your browser.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'help-support':
        return (
          <div style={styles.panelContainer}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Help & Support</h2>
            </div>
            <div style={styles.panelBody}>
              {getComingSoonContent('Help & Support', '❓')}
            </div>
          </div>
        );

      default:
        return getWelcomeContent();
    }
  };

  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Sidebar Header */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            {!sidebarCollapsed && <span>Admin Dashboard</span>}
          </div>
          <button
            style={styles.collapseButton}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            onMouseEnter={handleCollapseHover}
            onMouseLeave={handleCollapseLeave}
            aria-label="Toggle sidebar"
          >
            <FaBars size={14} />
          </button>
        </div>

        {/* User Section */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {getUserInitials()}
          </div>
          {!sidebarCollapsed && (
            <>
              <div style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={styles.userEmail}>
                {user?.email}
              </div>
              <div style={styles.userRole}>
                {user?.role || 'user'}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          {navigationGroups.map((group) => (
            <div key={group.title} style={styles.navGroup}>
              <div style={styles.navGroupTitle}>{group.title}</div>
              {group.items.map((item) => {
                // Hide admin-only items for non-admin users
                if (item.adminOnly && user?.role !== 'admin') {
                  return null;
                }

                const isActive = currentView === item.view;
                return (
                  <div
                    key={item.id}
                    className={isActive ? 'active' : ''}
                    style={{
                      ...styles.navItem,
                      ...(isActive ? styles.navItemActive : {})
                    }}
                    onClick={() => handleNavItemClick(item.view)}
                    onMouseEnter={handleNavItemHover}
                    onMouseLeave={handleNavItemLeave}
                  >
                    <div style={styles.navIcon}>{item.icon}</div>
                    <span style={styles.navText}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={styles.sidebarFooter}>
          <button
            style={styles.footerButton}
            onClick={onBackToHome}
            onMouseEnter={(e) => handleButtonHover(e)}
            onMouseLeave={(e) => handleButtonLeave(e)}
            title="Back to Home"
            aria-label="Home"
          >
            <FaHome size={16} />
            {!sidebarCollapsed && <span>Home</span>}
          </button>
          <button
            style={styles.logoutButton}
            onClick={() => {
              onLogout();
              onBackToHome();
            }}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonLeave(e, true)}
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt size={16} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.mainHeader}>
          <div style={styles.headerLeft}>
            <h1 style={styles.mainTitle}>{getMainTitle()}</h1>
            <div style={styles.breadcrumbs}>{getBreadcrumbs()}</div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.searchBar}>
              <FaSearch size={16} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search..." 
                style={styles.searchInput}
              />
            </div>
            <button 
              style={styles.headerButton}
              onClick={() => setCurrentView('notifications')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
              title="Notifications"
            >
              <FaBell size={18} />
              <span style={styles.notificationBadge}>3</span>
            </button>
            <button 
              style={styles.headerButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
              title="Settings"
            >
              <FaCog size={18} />
            </button>
          </div>
        </div>

        <div style={styles.contentArea}>
          {getPanelContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;