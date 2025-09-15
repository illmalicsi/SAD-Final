import React, { useState, Suspense } from 'react';
import { FaHome, FaBell, FaBoxOpen, FaUsers, FaClipboardList, FaChartLine, FaUser, FaQuestionCircle, FaBars, FaSignOutAlt } from 'react-icons/fa';

// Import components
const UserManagement = React.lazy(() => import('./usermanagement'));
const Inventory = React.lazy(() => import('./inventory'));

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
        { id: 'inventory', icon: <FaBoxOpen size={18} />, text: 'Inventory', view: 'inventory-management', adminOnly: false },
        { id: 'customers', icon: <FaClipboardList size={18} />, text: 'Customers', view: 'customer-management', adminOnly: false },
        { id: 'performances', icon: <FaChartLine size={18} />, text: 'Performances', view: 'performance-history', adminOnly: false }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'users', icon: <FaUsers size={18} />, text: 'User Management', view: 'user-management', adminOnly: true }
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
      backgroundColor: '#0f1419',
      overflow: 'hidden'
    },
    sidebar: {
      width: sidebarCollapsed ? '70px' : '260px',
      backgroundColor: '#1a1f29',
      borderRight: '1px solid #2d3748',
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
      borderBottom: '1px solid #2d3748',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#1a1f29'
    },
    logo: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: sidebarCollapsed ? '0px' : '20px',
      fontWeight: '700',
      color: '#64ffda',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      letterSpacing: '-0.02em'
    },
    collapseButton: {
      width: '32px',
      height: '32px',
      backgroundColor: 'transparent',
      border: '1px solid #2d3748',
      borderRadius: '8px',
      color: '#a0aec0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    },
    userSection: {
      padding: '20px',
      borderBottom: '1px solid #2d3748',
      backgroundColor: '#1a1f29',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userAvatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      backgroundColor: '#4a5568',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#e2e8f0',
      fontWeight: '600',
      fontSize: '20px',
      marginBottom: sidebarCollapsed ? '0' : '12px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    userName: {
      fontSize: sidebarCollapsed ? '0px' : '16px',
      fontWeight: '600',
      color: '#e2e8f0',
      marginBottom: '4px',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      textAlign: 'center',
    },
    userRole: {
      display: sidebarCollapsed ? 'none' : 'inline-flex',
      padding: '2px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '700',
      backgroundColor: user?.role === 'admin' ? '#2d5a87' : '#2d4a5a',
      color: user?.role === 'admin' ? '#90cdf4' : '#81e6d9',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginTop: '4px',
      textAlign: 'center',
      justifyContent: 'center',
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
      fontSize: sidebarCollapsed ? '0px' : '11px',
      fontWeight: '600',
      color: '#718096',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px',
      paddingLeft: '20px',
      transition: 'all 0.3s ease',
      overflow: 'hidden'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      height: '44px',
      padding: '0 20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#a0aec0',
      position: 'relative',
      margin: '0 8px',
      borderRadius: '8px'
    },
    navItemActive: {
      backgroundColor: '#2a4365',
      color: '#90cdf4',
      fontWeight: '500'
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
      borderTop: '1px solid #2d3748',
      display: 'flex',
      flexDirection: sidebarCollapsed ? 'column' : 'row',
      gap: '8px',
      backgroundColor: '#1a1f29'
    },
    footerButton: {
      height: '36px',
      backgroundColor: 'transparent',
      border: '1px solid #2d3748',
      borderRadius: '8px',
      color: '#a0aec0',
      cursor: 'pointer',
      fontSize: sidebarCollapsed ? '14px' : '13px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: sidebarCollapsed ? 'none' : 1
    },
    logoutButton: {
      height: '36px',
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
      flex: sidebarCollapsed ? 'none' : 1
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0f1419',
      overflow: 'hidden'
    },
    mainHeader: {
      height: '72px',
      padding: '0 32px',
      borderBottom: '1px solid #2d3748',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#1a1f29',
      flexShrink: 0
    },
    mainTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#e2e8f0',
      margin: 0,
      letterSpacing: '-0.02em'
    },
    breadcrumbs: {
      fontSize: '14px',
      color: '#718096',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    contentArea: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    welcomeCard: {
      backgroundColor: '#1a1f29',
      border: '1px solid #2d3748',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '60px auto 0'
    },
    welcomeIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    welcomeTitle: {
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 12px 0',
      color: '#e2e8f0',
      letterSpacing: '-0.02em'
    },
    welcomeSubtitle: {
      fontSize: '16px',
      color: '#a0aec0',
      lineHeight: '1.6',
      margin: 0
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#a0aec0',
      fontSize: '16px'
    },
    blockedContainer: {
      backgroundColor: '#1a1f29',
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
      color: '#a0aec0',
      lineHeight: '1.6',
      margin: 0
    },
    // New styles for panel content
    panelContainer: {
      backgroundColor: '#1a1f29',
      border: '1px solid #2d3748',
      borderRadius: '12px',
      height: 'calc(100vh - 136px)',
      display: 'flex',
      flexDirection: 'column'
    },
    panelHeader: {
      padding: '24px 32px',
      borderBottom: '1px solid #2d3748',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    panelTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#e2e8f0',
      margin: 0
    },
    panelBody: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto'
    },
    comingSoonContent: {
      textAlign: 'center',
      color: '#a0aec0',
      padding: '60px 20px'
    },
    comingSoonIcon: {
      fontSize: '64px',
      marginBottom: '24px'
    },
    comingSoonTitle: {
      fontSize: '24px',
      fontWeight: '600',
      margin: '0 0 16px 0',
      color: '#e2e8f0'
    },
    comingSoonText: {
      fontSize: '16px',
      lineHeight: '1.6'
    },
    // Notification styles
    notificationItem: {
      backgroundColor: '#0f1419',
      border: '1px solid #2d3748',
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
              ← Back to Home
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
            <div style={styles.panelContainer}>
              <div style={styles.panelHeader}>
                <h2 style={styles.panelTitle}>User Management</h2>
              </div>
              <div style={styles.panelBody}>
                <Suspense fallback={<div style={styles.loadingContainer}>Loading User Management...</div>}>
                  <UserManagement 
                    user={user} 
                    onBackToHome={() => setCurrentView('main')} 
                    onLogout={onLogout}
                    embedded={true}
                  />
                </Suspense>
              </div>
            </div>
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
          <div style={styles.panelContainer}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Customer Management</h2>
            </div>
            <div style={styles.panelBody}>
              {getComingSoonContent('Customer Management', '👥')}
            </div>
          </div>
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
              {getComingSoonContent('Profile Settings', '👤')}
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
            {sidebarCollapsed ? '🎵' : 'Band Manager'}
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
            <FaHome size={18} />
          </button>
          <button 
            style={styles.logoutButton}
            onClick={onLogout}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonLeave(e, true)}
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt size={18} />
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