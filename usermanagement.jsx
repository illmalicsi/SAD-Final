import React, { useState, useEffect } from 'react';

const UserManagement = ({ user, onBackToHome }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    isBlocked: false
  });

  // Sample user data - in a real app, this would come from an API
  const sampleUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'admin', isBlocked: false, createdAt: '2023-01-15' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'user', isBlocked: false, createdAt: '2023-02-20' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', role: 'user', isBlocked: true, createdAt: '2023-03-10' },
    { id: 4, firstName: 'Alice', lastName: 'Williams', email: 'alice@example.com', role: 'user', isBlocked: false, createdAt: '2023-04-05' },
  ];

  useEffect(() => {
    // Load users from localStorage or use sample data
    const storedUsers = localStorage.getItem('davaoBlueEaglesUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
      setFilteredUsers(JSON.parse(storedUsers));
    } else {
      setUsers(sampleUsers);
      setFilteredUsers(sampleUsers);
      localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(sampleUsers));
    }
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleBlockUser = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user
    );
    
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));
  };

  const handleCreateUser = () => {
    const newUserWithId = {
      ...newUser,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedUsers = [...users, newUserWithId];
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));
    
    setShowCreateModal(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
      isBlocked: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Styles consistent with your design
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
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '20px'
    },
    searchInput: {
      backgroundColor: 'rgba(2, 6, 23, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.2)',
      borderRadius: '8px',
      padding: '10px 16px',
      color: '#e5e7eb',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      flex: 1,
      maxWidth: '400px'
    },
    createButton: {
      backgroundColor: '#64ffda',
      border: '2px solid #64ffda',
      color: '#0b1a2c',
      padding: '10px 20px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'rgba(10, 25, 47, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.15)',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    tableHeader: {
      backgroundColor: 'rgba(100, 255, 218, 0.1)',
      padding: '16px',
      textAlign: 'left',
      fontFamily: 'Marcellus, serif',
      fontSize: '16px',
      fontWeight: '600'
    },
    tableCell: {
      padding: '16px',
      borderBottom: '1px solid rgba(100, 255, 218, 0.1)'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    actionButton: {
      backgroundColor: 'transparent',
      border: '1px solid rgba(100, 255, 218, 0.3)',
      color: '#e5e7eb',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.3s ease',
      marginRight: '8px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'rgba(10, 25, 47, 0.95)',
      border: '1px solid rgba(100, 255, 218, 0.2)',
      borderRadius: '12px',
      padding: '30px',
      width: '100%',
      maxWidth: '500px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid rgba(100, 255, 218, 0.2)'
    },
    modalTitle: {
      fontFamily: 'Marcellus, serif',
      fontSize: '22px',
      fontWeight: '600',
      margin: 0
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#e5e7eb',
      fontSize: '20px',
      cursor: 'pointer'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px'
    },
    formField: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    formLabel: {
      color: '#e5e7eb',
      fontSize: '14px',
      fontWeight: '500'
    },
    formInput: {
      backgroundColor: 'rgba(2, 6, 23, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.2)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#e5e7eb',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    formSelect: {
      backgroundColor: 'rgba(2, 6, 23, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.2)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#e5e7eb',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    submitButton: {
      backgroundColor: '#64ffda',
      border: '2px solid #64ffda',
      color: '#0b1a2c',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#94a3b8'
    }
  };

  // Add hover effects
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

  const handleCreateButtonHover = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.color = '#64ffda';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 8px 20px rgba(100, 255, 218, 0.3)';
  };

  const handleCreateButtonLeave = (e) => {
    e.target.style.backgroundColor = '#64ffda';
    e.target.style.color = '#0b1a2c';
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.6)';
    e.target.style.boxShadow = '0 0 0 3px rgba(100, 255, 218, 0.1)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.2)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <button 
          style={styles.backButton}
          onClick={onBackToHome}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
        >
          ← Back
        </button>
      </div>

      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search users..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <button
          style={styles.createButton}
          onClick={() => setShowCreateModal(true)}
          onMouseEnter={handleCreateButtonHover}
          onMouseLeave={handleCreateButtonLeave}
        >
          Create User
        </button>
      </div>

      {filteredUsers.length > 0 ? (
        <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Role</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Created</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={styles.tableCell}>{user.firstName} {user.lastName}</td>
                  <td style={styles.tableCell}>{user.email}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: user.role === 'admin' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(100, 255, 218, 0.2)',
                      color: user.role === 'admin' ? '#60a5fa' : '#64ffda'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: user.isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: user.isBlocked ? '#ef4444' : '#22c55e'
                    }}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{user.createdAt}</td>
                  <td style={styles.tableCell}>
                    <button
                      style={styles.actionButton}
                      onClick={() => toggleBlockUser(user.id)}
                      onMouseEnter={handleButtonHover}
                      onMouseLeave={handleButtonLeave}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p>No users found{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
        </div>
      )}

      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New User</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form style={styles.form} onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
              <div style={styles.formRow}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    style={styles.formInput}
                    value={newUser.firstName}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    style={styles.formInput}
                    value={newUser.lastName}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formField}>
                <label style={styles.formLabel}>Email</label>
                <input
                  type="email"
                  name="email"
                  style={styles.formInput}
                  value={newUser.email}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
              
              <div style={styles.formField}>
                <label style={styles.formLabel}>Password</label>
                <input
                  type="password"
                  name="password"
                  style={styles.formInput}
                  value={newUser.password}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                />
              </div>
              
              <div style={styles.formField}>
                <label style={styles.formLabel}>Role</label>
                <select
                  name="role"
                  style={styles.formSelect}
                  value={newUser.role}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <button
                type="submit"
                style={styles.submitButton}
                onMouseEnter={handleCreateButtonHover}
                onMouseLeave={handleCreateButtonLeave}
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;