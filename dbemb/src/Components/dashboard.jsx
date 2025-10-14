import React, { useState, Suspense } from 'react';
import { FaHome, FaBell, FaBoxOpen, FaUsers, FaClipboardList, FaChartLine, FaUser, FaQuestionCircle, FaBars, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaSearch, FaCog, FaCheckCircle, FaDollarSign, FaHistory, FaUserCircle, FaLock, FaClipboard, FaMusic, FaMapMarkerAlt, FaCrown, FaUserPlus } from 'react-icons/fa';
import AuthService from '../services/authService';

// Import components
const UserManagement = React.lazy(() => import('./usermanagement'));
const Inventory = React.lazy(() => import('./inventory'));
const CustomerManagement = React.lazy(() => import('./CustomerManagement'));
const Invoice = React.lazy(() => import('./Invoice'));
const TransactionHistory = React.lazy(() => import('./TransactionHistory'));
const Approval = React.lazy(() => import('./Approval'));
const MembershipApproval = React.lazy(() => import('./MembershipApproval'));
const BookingManagement = React.lazy(() => import('./BookingManagement'));
import Payment from './Payment';
import NotificationService from '../services/notificationService';

const Dashboard = ({ user, onBackToHome, onLogout }) => {
  const [currentView, setCurrentView] = useState('main');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [myInstrumentRequests, setMyInstrumentRequests] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Load user's instrument requests
  React.useEffect(() => {
    const loadMyRequests = async () => {
      try {
        const response = await AuthService.makeAuthenticatedRequest(
          'http://localhost:5000/api/instruments/my-requests'
        );
        const data = await response.json();
        
        if (data.success) {
          setMyInstrumentRequests(data.allRequests || []);
        } else {
          // Fallback to localStorage if API fails
          const borrowRequests = JSON.parse(localStorage.getItem('borrowRequests') || '[]');
          const rentRequests = JSON.parse(localStorage.getItem('rentRequests') || '[]');
          
          const myRequests = [
            ...borrowRequests.filter(req => req.userId === user?.id).map(req => ({ ...req, type: 'borrow' })),
            ...rentRequests.filter(req => req.userId === user?.id).map(req => ({ ...req, type: 'rent' }))
          ].sort((a, b) => new Date(b.requestDate || b.request_date) - new Date(a.requestDate || a.request_date));
          
          setMyInstrumentRequests(myRequests);
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        // Fallback to localStorage
        const borrowRequests = JSON.parse(localStorage.getItem('borrowRequests') || '[]');
        const rentRequests = JSON.parse(localStorage.getItem('rentRequests') || '[]');
        
        const myRequests = [
          ...borrowRequests.filter(req => req.userId === user?.id).map(req => ({ ...req, type: 'borrow' })),
          ...rentRequests.filter(req => req.userId === user?.id).map(req => ({ ...req, type: 'rent' }))
        ].sort((a, b) => new Date(b.requestDate || b.request_date) - new Date(a.requestDate || a.request_date));
        
        setMyInstrumentRequests(myRequests);
      }
    };

    if (user) {
      loadMyRequests();
    }

    // Listen for updates
    const handleBorrowUpdate = () => loadMyRequests();
    const handleRentUpdate = () => loadMyRequests();
    
    window.addEventListener('borrowRequestsUpdated', handleBorrowUpdate);
    window.addEventListener('rentRequestsUpdated', handleRentUpdate);
    
    return () => {
      window.removeEventListener('borrowRequestsUpdated', handleBorrowUpdate);
      window.removeEventListener('rentRequestsUpdated', handleRentUpdate);
    };
  }, [user]);

  // Load user notifications
  React.useEffect(() => {
    const loadNotifications = () => {
      if (user && user.email) {
        const notifications = NotificationService.getUserNotifications(user.email);
        setUserNotifications(notifications);
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    };

    loadNotifications();

    // Listen for notification updates
    const handleNotificationsUpdate = () => loadNotifications();
    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);

    // Poll for updates every 10 seconds
    const interval = setInterval(loadNotifications, 10000);

    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
      clearInterval(interval);
    };
  }, [user]);

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
        { id: 'customers', icon: <FaUsers size={18} />, text: 'Customers & Bookings', view: 'customer-management', adminOnly: false },
        { id: 'performances', icon: <FaChartLine size={18} />, text: 'Performances', view: 'performance-history', adminOnly: false },
        { id: 'approval', icon: <FaCheckCircle size={18} />, text: 'Approval', view: 'approval', adminOnly: false }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'users', icon: <FaUsers size={18} />, text: 'Users', view: 'user-management', adminOnly: true },
        { id: 'membership', icon: <FaUserPlus size={18} />, text: 'Membership Approval', view: 'membership-approval', adminOnly: true }
      ]
    },
    {
      title: 'Finance',
      items: [
        { id: 'invoice', icon: <FaClipboardList size={18} />, text: 'Invoices', view: 'invoice', adminOnly: true },
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

        {/* My Instrument Requests Section */}
        {myInstrumentRequests.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaMusic style={{ color: '#3b82f6' }} />
              My Instrument Requests
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {myInstrumentRequests.map((request) => (
                <div 
                  key={request.id || request.request_id} 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                        {request.instrumentName || request.instrument_name}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                        {(request.instrumentType || request.instrument_type).charAt(0).toUpperCase() + (request.instrumentType || request.instrument_type).slice(1)}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: 
                        request.status === 'approved' ? '#dcfce7' :
                        request.status === 'rejected' ? '#fee2e2' :
                        '#fef3c7',
                      color:
                        request.status === 'approved' ? '#16a34a' :
                        request.status === 'rejected' ? '#dc2626' :
                        '#f59e0b'
                    }}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Type</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                        {request.type === 'borrow' ? '🆓 Borrow' : '💰 Rent'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Quantity</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{request.quantity}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Start Date</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                        {new Date(request.startDate || request.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>End Date</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                        {new Date(request.endDate || request.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Purpose</p>
                    <p style={{ fontSize: '14px', color: '#0f172a' }}>{request.purpose}</p>
                  </div>
                  
                  {request.notes && (
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Notes</p>
                      <p style={{ fontSize: '14px', color: '#0f172a' }}>{request.notes}</p>
                    </div>
                  )}
                  
                  <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Requested on {new Date(request.requestDate || request.request_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const getNotificationsContent = () => {
    const handleMarkAsRead = (notificationId) => {
      NotificationService.markAsRead(notificationId);
    };

    const handleMarkAllAsRead = () => {
      if (user && user.email) {
        NotificationService.markAllAsRead(user.email);
      }
    };

    const handleDeleteNotification = (notificationId) => {
      NotificationService.deleteNotification(notificationId);
    };

    const getTimeAgo = (dateString) => {
      const now = new Date();
      const created = new Date(dateString);
      const diffMs = now - created;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const getNotificationIcon = (type) => {
      switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
      }
    };

    const getNotificationColor = (type) => {
      switch (type) {
        case 'success': return { bg: '#dcfce7', color: '#16a34a' };
        case 'error': return { bg: '#fee2e2', color: '#dc2626' };
        case 'warning': return { bg: '#fef3c7', color: '#f59e0b' };
        default: return { bg: '#dbeafe', color: '#3b82f6' };
      }
    };

    if (userNotifications.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FaBell size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '8px' }}>No notifications yet</p>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>When you receive notifications, they'll appear here</p>
        </div>
      );
    }

    return (
      <div>
        {unreadCount > 0 && (
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
            <button
              onClick={handleMarkAllAsRead}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#0369a1',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#0369a1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              Mark all as read
            </button>
          </div>
        )}
        
        {userNotifications
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(notification => {
            const colors = getNotificationColor(notification.type);
            return (
              <div 
                key={notification.id} 
                style={{
                  ...styles.notificationItem,
                  backgroundColor: notification.read ? '#ffffff' : '#f8fafc',
                  opacity: notification.read ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div style={{ 
                  ...styles.notificationIcon, 
                  backgroundColor: colors.bg,
                  color: colors.color
                }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ ...styles.notificationContent, flex: 1 }}>
                  <div style={styles.notificationTitle}>{notification.title}</div>
                  <div style={styles.notificationText}>{notification.message}</div>
                  
                  {/* Payment Details Section */}
                  {notification.data?.paymentDetails && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#0369a1', 
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        💳 Payment Information
                      </div>
                      
                      {/* Payment Options */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                          Payment Options:
                        </div>
                        {notification.data.paymentDetails.paymentOptions.map((option, idx) => (
                          <div key={idx} style={{ 
                            fontSize: '13px', 
                            color: '#475569',
                            marginBottom: '4px',
                            paddingLeft: '8px'
                          }}>
                            • {option.type}: <strong>₱{option.amount.toLocaleString()}</strong>
                          </div>
                        ))}
                      </div>

                      {/* Bank Transfer Details */}
                      <div style={{ 
                        marginBottom: '10px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid #e0f2fe'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                          🏦 Bank Transfer:
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                          <div><strong>Bank:</strong> {notification.data.paymentDetails.bankName}</div>
                          <div><strong>Account Name:</strong> {notification.data.paymentDetails.accountName}</div>
                          <div><strong>Account #:</strong> {notification.data.paymentDetails.accountNumber}</div>
                        </div>
                      </div>

                      {/* GCash Details */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                          📱 GCash:
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                          <div><strong>Name:</strong> {notification.data.paymentDetails.gcashName}</div>
                          <div><strong>Number:</strong> {notification.data.paymentDetails.gcashNumber}</div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div style={{
                        fontSize: '12px',
                        color: '#0369a1',
                        fontStyle: 'italic',
                        backgroundColor: '#ffffff',
                        padding: '8px',
                        borderRadius: '6px',
                        marginTop: '8px'
                      }}>
                        📝 {notification.data.paymentDetails.instructions}
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.notificationTime}>{getTimeAgo(notification.createdAt)}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification.id);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                  title="Delete notification"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            );
          })
        }
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

      case 'membership-approval':
        if (user?.role === 'admin') {
          return (
            <Suspense fallback={
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <div>Loading Membership Approval...</div>
              </div>
            }>
              <MembershipApproval
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
              <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px' }}>
                Manage your personal information and account settings
              </p>
            </div>
            <div style={styles.panelBody}>
              {/* Profile Content */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'start' }}>
                
                {/* Left Column - Profile Picture */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <div style={{ 
                    width: 160, 
                    height: 160, 
                    borderRadius: 20, 
                    overflow: 'hidden', 
                    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 48, 
                    color: '#0b3b78',
                    border: '4px solid #ffffff',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontWeight: 800, letterSpacing: '2px' }}>{getUserInitials()}</div>
                    )}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <label style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 20px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #0b62d6 0%, #0b3b78 100%)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 16px rgba(11, 98, 214, 0.3)'
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          
                          // Check file size (limit to 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size too large. Please choose an image under 5MB.');
                            return;
                          }

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
                              alert('Failed to save profile picture. Please try again.');
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      📷 Change Photo
                    </label>
                    <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '12px' }}>
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>

                {/* Right Column - User Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* Basic Information Card */}
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 20px 0', 
                      color: '#0f172a', 
                      fontSize: '18px', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <FaUserCircle /> Basic Information
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          First Name
                        </label>
                        <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500 }}>
                          {user?.firstName || 'Not provided'}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Last Name
                        </label>
                        <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500 }}>
                          {user?.lastName || 'Not provided'}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Email Address
                      </label>
                      <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500 }}>
                        {user?.email || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  {/* Account Information Card */}
                  <div style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                  }}>
                    <h3 style={{ 
                      margin: '0 0 20px 0', 
                      color: '#0f172a', 
                      fontSize: '18px', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <FaLock /> Account Details
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Role
                        </label>
                        <div style={{ 
                          padding: '12px 16px', 
                          background: user?.role === 'admin' ? '#fef3c7' : '#e0f2fe', 
                          borderRadius: 8, 
                          border: user?.role === 'admin' ? '1px solid #fbbf24' : '1px solid #0ea5e9', 
                          color: user?.role === 'admin' ? '#92400e' : '#0c4a6e', 
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          {user?.role === 'admin' ? <FaCrown /> : <FaUserCircle />} {user?.role || 'user'}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          User ID
                        </label>
                        <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#64748b', fontFamily: 'monospace', fontSize: '14px' }}>
                          #{user?.id || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Member Since
                      </label>
                      <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500 }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not available'}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Card (if available) */}
                  {(user?.phone || user?.birthday || user?.instrument || user?.address) && (
                    <div style={{
                      background: '#ffffff',
                      borderRadius: 16,
                      padding: 24,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                    }}>
                      <h3 style={{ 
                        margin: '0 0 20px 0', 
                        color: '#0f172a', 
                        fontSize: '18px', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <FaClipboard /> Additional Information
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {user?.phone && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Phone Number
                            </label>
                            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500 }}>
                              {user.phone}
                            </div>
                          </div>
                        )}
                        
                        {user?.birthday && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Date of Birth
                            </label>
                            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500 }}>
                              {new Date(user.birthday).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {user?.instrument && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Primary Instrument
                          </label>
                          <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FaMusic /> {user.instrument}
                          </div>
                        </div>
                      )}

                      {user?.address && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Address
                          </label>
                          <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 500, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FaMapMarkerAlt /> {user.address}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Account Status */}
                  <div style={{
                    background: user?.isBlocked ? '#fef2f2' : '#f0fdf4',
                    borderRadius: 16,
                    padding: 20,
                    border: user?.isBlocked ? '1px solid #fecaca' : '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <div style={{ 
                      fontSize: '24px',
                      filter: user?.isBlocked ? 'grayscale(1)' : 'none'
                    }}>
                      {user?.isBlocked ? '🚫' : '✅'}
                    </div>
                    <div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: user?.isBlocked ? '#dc2626' : '#16a34a',
                        marginBottom: 4
                      }}>
                        Account Status: {user?.isBlocked ? 'Blocked' : 'Active'}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: user?.isBlocked ? '#991b1b' : '#15803d'
                      }}>
                        {user?.isBlocked 
                          ? 'Your account has been restricted. Please contact support for assistance.'
                          : 'Your account is active and in good standing.'
                        }
                      </div>
                    </div>
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
              {unreadCount > 0 && <span style={styles.notificationBadge}>{unreadCount}</span>}
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


