import React, { useState, Suspense } from 'react';

// Import UserManagement component
const UserManagement = React.lazy(() => import('./usermanagement'));

const Dashboard = ({ user, onBackToHome }) => {
  const [currentView, setCurrentView] = useState('main');
  
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.95), rgba(2, 6, 23, 0.98))',
      padding: '20px',
      color: '#e5e7eb'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid rgba(100, 255, 218, 0.2)'
    },
    title: {
      fontFamily: 'Marcellus, serif',
      fontSize: '28px',
      fontWeight: '600',
      margin: 0,
      background: 'linear-gradient(45deg, #60a5fa, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    backButton: {
      backgroundColor: 'transparent',
      border: '1px solid rgba(100, 255, 218, 0.3)',
      color: '#e5e7eb',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    card: {
      backgroundColor: 'rgba(10, 25, 47, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.15)',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardTitle: {
      fontFamily: 'Marcellus, serif',
      fontSize: '18px',
      fontWeight: '600',
      margin: '0 0 10px 0',
      color: '#e5e7eb'
    },
    cardText: {
      color: '#a8b2d1',
      fontSize: '14px',
      margin: 0
    },
    userInfo: {
      backgroundColor: 'rgba(10, 25, 47, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.15)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '30px'
    },
    userInfoTitle: {
      fontFamily: 'Marcellus, serif',
      fontSize: '20px',
      fontWeight: '600',
      margin: '0 0 15px 0',
      color: '#e5e7eb'
    },
    userInfoText: {
      color: '#a8b2d1',
      fontSize: '16px',
      margin: '0 0 10px 0'
    },
    roleBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: 'rgba(100, 255, 218, 0.2)',
      color: '#64ffda'
    },
    adminBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: 'rgba(96, 165, 250, 0.2)',
      color: '#60a5fa'
    }
  };

  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = 'rgba(100, 255, 218, 0.1)';
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.6)';
    e.target.style.transform = 'translateY(-2px)';
  };

  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
    e.target.style.transform = 'translateY(0)';
  };

  const handleCardHover = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.3)';
  };

  const handleCardLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.15)';
  };

  // Check if user is blocked
  if (user?.isBlocked) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Account Blocked</h1>
          <button 
            style={styles.backButton}
            onClick={onBackToHome}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            ← Back to Home
          </button>
        </div>
        
        <div style={styles.userInfo}>
          <h2 style={styles.userInfoTitle}>Your account has been blocked</h2>
          <p style={styles.userInfoText}>
            Please contact the administrator at dbe.official@example.com to restore access to your account.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is trying to access admin features without permission
  if (currentView === 'user-management' && user?.role !== 'admin') {
    setCurrentView('main');
    alert('You do not have permission to access User Management');
  }

  // Show User Management view for admins
  if (currentView === 'user-management' && user?.role === 'admin') {
    return (
      <Suspense fallback={
        <div style={styles.container}>
          <div style={{textAlign: 'center', padding: '40px', color: '#e5e7eb'}}>Loading User Management...</div>
        </div>
      }>
        <UserManagement 
          user={user} 
          onBackToHome={() => setCurrentView('main')} 
        />
      </Suspense>
    );
  }

  // Main dashboard view
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <button 
          style={styles.backButton}
          onClick={onBackToHome}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
        >
          ← Back to Home
        </button>
      </div>

      <div style={styles.userInfo}>
        <h2 style={styles.userInfoTitle}>
          Welcome, {user?.firstName} {user?.lastName}!
          <span style={{marginLeft: '10px', ...(user?.role === 'admin' ? styles.adminBadge : styles.roleBadge)}}>
            {user?.role || 'user'}
          </span>
        </h2>
        {user?.phone && <p style={styles.userInfoText}>Phone: {user.phone}</p>}
      </div>

      <div style={styles.cardGrid}>
        {user?.role === 'admin' && (
          <div 
            style={styles.card}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
            onClick={() => setCurrentView('user-management')}
          >
            <h3 style={styles.cardTitle}>User Management</h3>
            <p style={styles.cardText}>Manage user accounts, permissions, and access controls.</p>
          </div>
        )}
        
        <div 
          style={styles.card}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <h3 style={styles.cardTitle}>Booking Management</h3>
          <p style={styles.cardText}>View and manage all band booking requests and schedules.</p>
        </div>
        
        <div 
          style={styles.card}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <h3 style={styles.cardTitle}>Performance History</h3>
          <p style={styles.cardText}>Track past performances, reviews, and client feedback.</p>
        </div>

        <div 
          style={styles.card}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <h3 style={styles.cardTitle}>My Profile</h3>
          <p style={styles.cardText}>Update your personal information and preferences.</p>
        </div>

        <div 
          style={styles.card}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <h3 style={styles.cardTitle}>Notifications</h3>
          <p style={styles.cardText}>View your latest notifications and messages.</p>
        </div>

        <div 
          style={styles.card}
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <h3 style={styles.cardTitle}>Help & Support</h3>
          <p style={styles.cardText}>Get help with using the platform and contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;