import React, { useState, Suspense } from 'react';
import { FaHome, FaBell, FaBoxOpen, FaUsers, FaClipboardList, FaChartLine, FaUser, FaQuestionCircle, FaBars, FaSignOutAlt } from 'react-icons/fa';

// Import components
const UserManagement = React.lazy(() => import('./usermanagement'));
const Inventory = React.lazy(() => import('./inventory'));
const CustomerManagement = React.lazy(() => import('./CustomerManagement'));

const Dashboard = ({ user, onBackToHome, onLogout }) => {
  const [currentView, setCurrentView] = useState('main');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      backgroundColor: 'white',
      overflow: 'hidden'
    },
    sidebar: {
      width: sidebarCollapsed ? '70px' : '260px',
      backgroundColor: 'white',
      borderRight: '1px solid rgba(100, 255, 218, 0.3)',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      flexShrink: 0
    },
    sidebarHeader: {
      height: '72px',
      padding: '0 20px',
      borderBottom: '1px solid rgba(100, 255, 218, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white'
    },
    logo: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: sidebarCollapsed ? '0px' : '20px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      letterSpacing: '-0.025em'
    },
    collapseButton: {
      width: '36px',
      height: '36px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: '#374151',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '14px',
      ':hover': {
        background: 'rgba(255, 255, 255, 0.2)',
        transform: 'scale(1.05)'
      }
    },
    userSection: {
      padding: sidebarCollapsed ? '16px' : '24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: sidebarCollapsed ? '80px' : 'auto'
    },

    userAvatar: {
      width: sidebarCollapsed ? '44px' : '60px',
      height: sidebarCollapsed ? '44px' : '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '700',
      fontSize: sidebarCollapsed ? '16px' : '22px',
      marginBottom: sidebarCollapsed ? '0' : '12px',
      marginLeft: 'auto',
      marginRight: 'auto',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
    },

    userName: {
      fontSize: sidebarCollapsed ? '0px' : '18px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #374151, #1f2937)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '6px',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      textAlign: 'center',
      height: sidebarCollapsed ? '0px' : 'auto',
      letterSpacing: '-0.025em'
    },

    userRole: {
      display: sidebarCollapsed ? 'none' : 'inline-flex',
      padding: '4px 16px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '700',
      background: user?.role === 'admin' 
        ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' 
        : 'linear-gradient(135deg, #06b6d4, #1e40af)',
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginTop: '6px',
      textAlign: 'center',
      justifyContent: 'center',
      height: sidebarCollapsed ? '0px' : 'auto',
      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
      border: 'none'
    },
    navigation: {
      flex: 1,
      padding: '20px 0',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    navGroup: {
      marginBottom: '24px'
    },
    navGroupTitle: {
      fontSize: sidebarCollapsed ? '0px' : '14px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '12px',
      paddingLeft: '20px',
      transition: 'all 0.3s ease',
      textAlign: 'left',
      overflow: 'hidden'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      height: '48px',
      padding: '0 20px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: '#6b7280',
      position: 'relative',
      margin: '0 12px',
      borderRadius: '12px',
      fontWeight: '500',
      ':hover': {
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#374151',
        transform: 'translateX(4px)'
      }
    },
    navItemActive: {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontWeight: '600',
      boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)'
    },
    navIcon: {
      width: '20px',
      height: '20px',
      marginRight: sidebarCollapsed ? '0' : '12px',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'margin-right 0.3s ease'
    },
    navText: {
      fontSize: sidebarCollapsed ? '0px' : '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },
    sidebarFooter: {
      padding: '20px',
      borderTop: '1px solid rgba(100, 255, 218, 0.3)',
      display: 'flex',
      flexDirection: sidebarCollapsed ? 'column' : 'row',
      gap: sidebarCollapsed ? '8px' : '8px',
      backgroundColor: 'white'
    },
    footerButton: {
      height: '40px',
      width: sidebarCollapsed ? '40px' : 'auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: '#374151',
      cursor: 'pointer',
      fontSize: sidebarCollapsed ? '14px' : '13px',
      fontWeight: '600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: sidebarCollapsed ? 'none' : 1,
      padding: sidebarCollapsed ? '0' : '0 12px',
      ':hover': {
        background: 'rgba(255, 255, 255, 0.2)',
        transform: 'scale(1.05)'
      }
    },
    logoutButton: {
      height: '36px',
      width: sidebarCollapsed ? '36px' : 'auto',
      backgroundColor: 'transparent',
      border: '1px solid #e53e3e',
      borderRadius: '8px',
      color: '#fc8181',
      cursor: 'pointer',
      fontSize: sidebarCollapsed ? '14px' : '13px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: sidebarCollapsed ? 'none' : 1,
      padding: sidebarCollapsed ? '0' : '0 8px'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      overflow: 'hidden'
    },
    mainHeader: {
      height: '80px',
      padding: '0 32px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      flexShrink: 0
    },
    mainTitle: {
      fontSize: '26px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
      letterSpacing: '-0.025em'
    },
    breadcrumbs: {
      fontSize: '14px',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500'
    },
    contentArea: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    welcomeCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '48px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '60px auto 0',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    welcomeIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    welcomeTitle: {
      fontSize: '32px',
      fontWeight: '800',
      margin: '0 0 16px 0',
      background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.025em'
    },
    welcomeSubtitle: {
      fontSize: '18px',
      color: '#6b7280',
      lineHeight: '1.6',
      margin: 0,
      fontWeight: '400'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#6b7280',
      fontSize: '16px',
      fontWeight: '500'
    },
    blockedContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid #e53e3e',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '60px auto 0'
    },
    blockedIcon: {
      fontSize: '48px',
      marginBottom: '20px',
      color: '#fc8181'
    },
    blockedTitle: {
      fontSize: '24px',
      fontWeight: '700',
      margin: '0 0 12px 0',
      color: '#fc8181'
    },
    blockedText: {
      fontSize: '16px',
      color: '#6b7280',
      lineHeight: '1.6',
      margin: 0
    },
    // New styles for panel content
    panelContainer: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      height: 'calc(100vh - 136px)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    panelHeader: {
      padding: '24px 32px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    },
    panelTitle: {
      fontSize: '22px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #1e40af, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
      letterSpacing: '-0.025em'
    },
    panelBody: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto'
    },
    comingSoonContent: {
      textAlign: 'center',
      color: '#6b7280',
      padding: '60px 20px'
    },
    comingSoonIcon: {
      fontSize: '64px',
      marginBottom: '24px'
    },
    comingSoonTitle: {
      fontSize: '26px',
      fontWeight: '700',
      margin: '0 0 16px 0',
      background: 'linear-gradient(135deg, #374151, #1f2937)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.025em'
    },
    comingSoonText: {
      fontSize: '16px',
      lineHeight: '1.6'
    },
    // Notification styles
    notificationItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(100, 255, 218, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px'
    },
    notificationIcon: {
      fontSize: '20px',
      marginTop: '2px'
    },
    notificationContent: {
      flex: 1
    },
    notificationTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#e2e8f0',
      margin: '0 0 4px 0'
    },
    notificationText: {
      fontSize: '14px',
      color: '#a0aec0',
      margin: '0 0 8px 0'
    },
    notificationTime: {
      fontSize: '12px',
      color: '#718096'
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
      e.currentTarget.style.backgroundColor = '#2a4365';
    }
  };

  const handleNavItemLeave = (e) => {
    if (!e.currentTarget.classList.contains('active')) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  const handleButtonHover = (e, isLogout = false) => {
    if (isLogout) {
      e.target.style.backgroundColor = '#e53e3e';
      e.target.style.color = '#ffffff';
    } else {
      e.target.style.backgroundColor = '#2d3748';
      e.target.style.color = '#e2e8f0';
    }
  };

  const handleButtonLeave = (e, isLogout = false) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.color = isLogout ? '#fc8181' : '#a0aec0';
  };

  const handleCollapseHover = (e) => {
    e.target.style.backgroundColor = '#2d3748';
    e.target.style.borderColor = '#4a5568';
  };

  const handleCollapseLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.borderColor = '#2d3748';
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
    return (
      <div style={styles.welcomeCard}>
        <div style={styles.welcomeIcon}>👋</div>
        <h2 style={styles.welcomeTitle}>Welcome back, {user?.firstName}!</h2>
        <p style={styles.welcomeSubtitle}>
          Select an option from the sidebar to get started with managing your marching band operations.
        </p>
      </div>
    );
  };

  const getNotificationsContent = () => {
    const sampleNotifications = [
      {
        id: 1,
        icon: '📅',
        title: 'Upcoming Performance',
        text: 'You have a performance scheduled for tomorrow at Central Park.',
        time: '2 hours ago'
      },
      {
        id: 2,
        icon: '👥',
        title: 'New Booking Request',
        text: 'A new customer has requested your services for a wedding ceremony.',
        time: '1 day ago'
      },
      {
        id: 3,
        icon: '⚠️',
        title: 'Inventory Alert',
        text: 'Some instruments need maintenance check before next performance.',
        time: '2 days ago'
      },
      {
        id: 4,
        icon: '💰',
        title: 'Payment Received',
        text: 'Payment for the corporate event has been processed successfully.',
        time: '3 days ago'
      }
    ];

    return (
      <div>
        {sampleNotifications.map(notification => (
          <div key={notification.id} style={styles.notificationItem}>
            <div style={styles.notificationIcon}>{notification.icon}</div>
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
            <Suspense fallback={<div style={styles.loadingContainer}>Loading User Management...</div>}>
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
          <Suspense fallback={<div style={styles.loadingContainer}>Loading Inventory Management...</div>}>
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
          <Suspense fallback={<div style={styles.loadingContainer}>Loading Customer Management...</div>}>
            <CustomerManagement
              user={user}
              onBackToHome={() => setCurrentView('main')}
              onLogout={onLogout}
              embedded={true}
            />
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
            {sidebarCollapsed ? '🎵' : 'Administrator'}
          </div>
          <button
            style={styles.collapseButton}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            onMouseEnter={handleCollapseHover}
            onMouseLeave={handleCollapseLeave}
            aria-label="Toggle sidebar"
          >
            <FaBars size={18} />
          </button>
        </div>

        {/* User Section */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {getUserInitials()}
          </div>
          <div style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={styles.userRole}>
            {user?.role || 'user'}
          </div>
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
            <FaHome size={16} style={{ marginRight: sidebarCollapsed ? 0 : 6 }} />
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
            <FaSignOutAlt size={16} style={{ marginRight: sidebarCollapsed ? 0 : 6 }} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.mainHeader}>
          <div>
            <h1 style={styles.mainTitle}>{getMainTitle()}</h1>
            <div style={styles.breadcrumbs}>{getBreadcrumbs()}</div>
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