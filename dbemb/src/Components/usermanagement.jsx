import React, { useState, useEffect } from 'react';

const UserManagement = ({ user, onBackToHome }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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
    // Initialize with sample data for this demo (avoiding localStorage as per artifact guidelines)
    setUsers(sampleUsers);
    setFilteredUsers(sampleUsers);
  }, []);

  useEffect(() => {
    // Filter users based on search term and role filter
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const toggleBlockUser = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user
    );
    
    setUsers(updatedUsers);
  };

  const handleCreateUser = () => {
    const newUserWithId = {
      ...newUser,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedUsers = [...users, newUserWithId];
    setUsers(updatedUsers);
    
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

  const handleEditUser = (userToEdit) => {
    setEditingUser({ ...userToEdit });
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    
    setUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Calculate counts
  const totalUsers = users.length;
  const totalUserRole = users.filter(user => user.role === 'user').length;
  const totalAdmins = users.filter(user => user.role === 'admin').length;
  const totalBlocked = users.filter(user => user.isBlocked).length;

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
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'rgba(10, 25, 47, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.15)',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: '700',
      fontFamily: 'Marcellus, serif',
      margin: '0 0 8px 0'
    },
    statLabel: {
      fontSize: '14px',
      color: '#94a3b8',
      fontWeight: '500'
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '20px',
      flexWrap: 'wrap'
    },
    filterSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap'
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
      minWidth: '250px'
    },
    filterSelect: {
      backgroundColor: 'rgba(2, 6, 23, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.2)',
      borderRadius: '8px',
      padding: '10px 16px',
      color: '#e5e7eb',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      minWidth: '150px'
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
      textAlign: 'center',
      fontFamily: 'Marcellus, serif',
      fontSize: '16px',
      fontWeight: '600'
    },
    tableCell: {
      padding: '16px',
      borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
      textAlign: 'center',
      verticalAlign: 'middle'
    },
    nameCell: {
      textAlign: 'left'
    },
    emailCell: {
      textAlign: 'left'
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
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      marginRight: '6px',
      minWidth: '70px'
    },
    editButton: {
      backgroundColor: 'transparent',
      border: '1px solid rgba(59, 130, 246, 0.5)',
      color: '#60a5fa',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      marginRight: '6px',
      minWidth: '70px'
    },
    blockButton: {
      backgroundColor: 'transparent',
      border: '1px solid rgba(245, 158, 11, 0.5)',
      color: '#f59e0b',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      marginRight: '6px',
      minWidth: '70px'
    },
    deleteButton: {
      backgroundColor: 'transparent',
      border: '1px solid rgba(239, 68, 68, 0.5)',
      color: '#ef4444',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      minWidth: '70px'
    },
    actionsCell: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '6px',
      flexWrap: 'wrap'
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

  // Add specific hover effects for different button types
  const handleEditButtonHover = (e) => {
    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
  };

  const handleEditButtonLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  const handleBlockButtonHover = (e) => {
    e.target.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
    e.target.style.borderColor = 'rgba(245, 158, 11, 0.8)';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
  };

  const handleBlockButtonLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.borderColor = 'rgba(245, 158, 11, 0.5)';
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  const handleDeleteButtonHover = (e) => {
    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    e.target.style.borderColor = 'rgba(239, 68, 68, 0.8)';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
  };

  const handleDeleteButtonLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
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

  const handleStatCardHover = (e) => {
    e.target.style.transform = 'translateY(-4px)';
    e.target.style.boxShadow = '0 8px 20px rgba(100, 255, 218, 0.15)';
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
  };

  const handleStatCardLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
    e.target.style.borderColor = 'rgba(100, 255, 218, 0.15)';
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
          Dashboard
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsContainer}>
        <div 
          style={styles.statCard}
          onMouseEnter={handleStatCardHover}
          onMouseLeave={handleStatCardLeave}
        >
          <div style={{...styles.statNumber, color: '#60a5fa'}}>{totalUsers}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div 
          style={styles.statCard}
          onMouseEnter={handleStatCardHover}
          onMouseLeave={handleStatCardLeave}
        >
          <div style={{...styles.statNumber, color: '#64ffda'}}>{totalUserRole}</div>
          <div style={styles.statLabel}>Regular Users</div>
        </div>
        <div 
          style={styles.statCard}
          onMouseEnter={handleStatCardHover}
          onMouseLeave={handleStatCardLeave}
        >
          <div style={{...styles.statNumber, color: '#fbbf24'}}>{totalAdmins}</div>
          <div style={styles.statLabel}>Administrators</div>
        </div>
        <div 
          style={styles.statCard}
          onMouseEnter={handleStatCardHover}
          onMouseLeave={handleStatCardLeave}
        >
          <div style={{...styles.statNumber, color: '#ef4444'}}>{totalBlocked}</div>
          <div style={styles.statLabel}>Blocked Users</div>
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.filterSection}>
          <input
            type="text"
            placeholder="Search users..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <select
            style={styles.filterSelect}
            value={roleFilter}
            onChange={handleRoleFilterChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          >
            <option value="all">All Roles</option>
            <option value="user">Users Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
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
                <th style={{...styles.tableHeader, ...styles.nameCell}}>Name</th>
                <th style={{...styles.tableHeader, ...styles.emailCell}}>Email</th>
                <th style={styles.tableHeader}>Role</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Created</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={{...styles.tableCell, ...styles.nameCell}}>{user.firstName} {user.lastName}</td>
                  <td style={{...styles.tableCell, ...styles.emailCell}}>{user.email}</td>
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
                    <div style={styles.actionsCell}>
                      <button
                        style={styles.editButton}
                        onClick={() => handleEditUser(user)}
                        onMouseEnter={handleEditButtonHover}
                        onMouseLeave={handleEditButtonLeave}
                      >
                        Edit
                      </button>
                      {user.role !== 'admin' && (
                        <>
                          <button
                            style={styles.blockButton}
                            onClick={() => toggleBlockUser(user.id)}
                            onMouseEnter={handleBlockButtonHover}
                            onMouseLeave={handleBlockButtonLeave}
                          >
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            style={styles.deleteButton}
                            onClick={() => handleDeleteUser(user.id)}
                            onMouseEnter={handleDeleteButtonHover}
                            onMouseLeave={handleDeleteButtonLeave}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p>No users found{searchTerm || roleFilter !== 'all' ? ` with current filters` : ''}.</p>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit User</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    style={styles.formInput}
                    value={editingUser.firstName}
                    onChange={handleEditInputChange}
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
                    value={editingUser.lastName}
                    onChange={handleEditInputChange}
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
                  value={editingUser.email}
                  onChange={handleEditInputChange}
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
                  value={editingUser.role}
                  onChange={handleEditInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <button
                type="button"
                style={styles.submitButton}
                onClick={handleUpdateUser}
                onMouseEnter={handleCreateButtonHover}
                onMouseLeave={handleCreateButtonLeave}
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
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
            
            <div style={styles.form}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;