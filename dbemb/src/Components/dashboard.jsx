import React from 'react';

const Dashboard = ({ user, onBackToHome }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#333'
      }}>
        <h1>Welcome, {user?.firstName || 'User'}!</h1>
        <p>You have successfully logged in.</p>
        <button 
          onClick={onBackToHome}
          style={{
            padding: '10px 20px',
            backgroundColor: '#64ffda',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default Dashboard;