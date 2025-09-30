  import React, { useState, useEffect } from 'react';
  import { 
    FaUsers, 
    FaUser, 
    FaUserShield, 
    FaUserSlash, 
    FaUserPlus, 
    FaEdit, 
    FaBan, 
    FaTrash, 
    FaCheckCircle, 
    FaTimes, 
    FaSearch, 
    FaFilter 
  } from "react-icons/fa";

  const UserManagement = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [newUser, setNewUser] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: '',
      isBlocked: false
    });

    // No sample users: user list will come from the backend API

    useEffect(() => {
        // Try to load users from backend API (requires auth token)
        const fetchUsersFromApi = async () => {
          const token = localStorage.getItem('authToken');
          if (!token) {
            // Not authenticated: set empty users list
            setUsers([]);
            setFilteredUsers([]);
            return;
          }

          try {
            const res = await fetch('http://localhost:5000/api/users', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!res.ok) throw new Error('Failed to fetch users from API');

            const data = await res.json();
            if (data && data.users) {
              setUsers(data.users);
              setFilteredUsers(data.users);
              return;
            }

            // No data returned: set empty
            setUsers([]);
            setFilteredUsers([]);
          } catch (error) {
            console.error('Error fetching users from API:', error);
            // API error: set empty
            setUsers([]);
            setFilteredUsers([]);
          }
        };

        fetchUsersFromApi();

        // Fetch roles from backend (not protected)
        const fetchRoles = async () => {
          try {
            const res = await fetch('http://localhost:5000/api/roles');
            if (!res.ok) throw new Error('Failed to fetch roles');
            const data = await res.json();
            if (data && data.roles) {
              setRoles(data.roles);
              // set default newUser.role to first role if not set
              if (!newUser.role && data.roles.length > 0) {
                setNewUser(prev => ({ ...prev, role: data.roles[0].role_name }));
              }
            }
          } catch (err) {
            console.error('Error fetching roles:', err);
            setRoles([]);
          }
        };
        fetchRoles();
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

    const handleEditUser = (userToEdit) => {
      setEditingUser({ ...userToEdit });
      setShowEditModal(true);
    };

    const handleUpdateUser = () => {
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? editingUser : user
      );
      
      setUsers(updatedUsers);
      localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));
      setShowEditModal(false);
      setEditingUser(null);
    };

    const handleDeleteUser = (userId) => {
      if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));
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
        padding: '12px',
        color: '#e5e7eb'
      },
      title: {
        fontFamily: 'Msystem-ui, -apple-system, sans-serif',
        fontSize: '20px',
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
      buttonContainer: {
        display: 'flex',
        alignItems: 'center'
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
        borderRadius: '10px',
        padding: '12px',
        textAlign: 'center',
        transition: 'all 0.2s ease'
      },
      statNumber: {
        fontSize: '20px',
        fontWeight: '700',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: '0 0 6px 0'
      },
      statLabel: {
        fontSize: '12px',
        color: '#94a3b8',
        fontWeight: '500'
      },
      controls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        gap: '12px',
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
        borderRadius: '6px',
        padding: '6px 10px',
        color: '#e5e7eb',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s ease',
        minWidth: '180px'
      },
      filterSelect: {
        backgroundColor: 'rgba(2, 6, 23, 0.6)',
        border: '1px solid rgba(100, 255, 218, 0.2)',
        borderRadius: '6px',
        padding: '6px 10px',
        color: '#e5e7eb',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s ease',
        minWidth: '120px'
      },
      createButton: {
        backgroundColor: '#64ffda',
        border: '2px solid #64ffda',
        color: '#0b1a2c',
        padding: '6px 12px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'rgba(10, 25, 47, 0.6)',
        border: '1px solid rgba(100, 255, 218, 0.15)',
        borderRadius: '12px',
        overflow: 'hidden',
        tableLayout: 'fixed'
      },
      tableHeader: {
        backgroundColor: 'rgba(100, 255, 218, 0.1)',
        padding: '10px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        fontWeight: '600'
      },
      tableCell: {
        padding: '10px',
        borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
        textAlign: 'center',
        verticalAlign: 'middle'
      },
      nameCell: {
        textAlign: 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '160px',
        fontSize: '13px'
      },
      emailCell: {
        textAlign: 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '200px',
        fontSize: '13px'
      },
      statusBadge: {
        padding: '4px 8px',
        borderRadius: '16px',
        fontSize: '11px',
        fontWeight: '600'
      },
      actionButton: {
        backgroundColor: 'transparent',
        border: '1px solid rgba(100, 255, 218, 0.3)',
        color: '#e5e7eb',
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        marginRight: '6px',
        minWidth: '56px'
      },
      editButton: {
        backgroundColor: 'transparent',
        border: '1px solid rgba(59, 130, 246, 0.5)',
        color: '#60a5fa',
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        marginRight: '6px',
        minWidth: '56px'
      },
      blockButton: {
        backgroundColor: 'transparent',
        border: '1px solid rgba(245, 158, 11, 0.5)',
        color: '#f59e0b',
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        marginRight: '6px',
        minWidth: '56px'
      },
      deleteButton: {
        backgroundColor: 'transparent',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        color: '#ef4444',
        padding: '6px 10px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        minWidth: '56px'
      },
      actionsCell: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'nowrap'
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
        borderRadius: '10px',
        padding: '18px',
        width: '100%',
        maxWidth: '420px',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)'
      },
      emptyState: {
        backgroundColor: 'rgba(10, 25, 47, 0.6)',
        border: '1px solid rgba(100, 255, 218, 0.1)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#94a3b8'
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
        fontFamily: 'Msystem-ui, -apple-system, sans-serif',
        fontSize: '16px',
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
        gap: '10px'
      },
      formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      },
      formField: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      },
      formLabel: {
        color: '#e5e7eb',
        fontSize: '13px',
        fontWeight: '500'
      },
      formInput: {
        backgroundColor: 'rgba(2, 6, 23, 0.6)',
        border: '1px solid rgba(100, 255, 218, 0.2)',
        borderRadius: '6px',
        padding: '8px 10px',
        color: '#e5e7eb',
        fontSize: '13px',
        outline: 'none',
        transition: 'all 0.2s ease'
      },
      formSelect: {
        backgroundColor: 'rgba(2, 6, 23, 0.6)',
        border: '1px solid rgba(100, 255, 218, 0.2)',
        borderRadius: '6px',
        padding: '8px 10px',
        color: '#e5e7eb',
        fontSize: '13px',
        outline: 'none',
        transition: 'all 0.2s ease'
      },
      submitButton: {
        backgroundColor: '#64ffda',
        border: '2px solid #64ffda',
        color: '#0b1a2c',
        padding: '8px 14px',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '8px'
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
          <div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={styles.statsContainer}>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <FaUsers size={24} style={{ marginBottom: '10px', color: '#60a5fa' }} />
            <div style={{...styles.statNumber, color: '#60a5fa'}}>{totalUsers}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <FaUser size={24} style={{ marginBottom: '10px', color: '#64ffda' }} />
            <div style={{...styles.statNumber, color: '#64ffda'}}>{totalUserRole}</div>
            <div style={styles.statLabel}>Regular Users</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <FaUserShield size={24} style={{ marginBottom: '10px', color: '#fbbf24' }} />
            <div style={{...styles.statNumber, color: '#fbbf24'}}>{totalAdmins}</div>
            <div style={styles.statLabel}>Administrators</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <FaUserSlash size={24} style={{ marginBottom: '10px', color: '#ef4444' }} />
            <div style={{...styles.statNumber, color: '#ef4444'}}>{totalBlocked}</div>
            <div style={styles.statLabel}>Blocked Users</div>
          </div>
        </div>

        <div style={styles.controls}>
          <div style={styles.filterSection}>
            <FaSearch size={16} style={{marginRight: 8, color: '#64ffda'}} />
            <input
              type="text"
              placeholder="Search users..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <FaFilter size={16} style={{marginRight: 8, color: '#64ffda'}} />
            <select
              style={styles.filterSelect}
              value={roleFilter}
              onChange={handleRoleFilterChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              <option value="all">All Roles</option>
              {roles.map(r => (
                <option key={r.role_id} value={r.role_name}>{r.role_name}</option>
              ))}
            </select>
          </div>
          <button
            style={styles.createButton}
            onClick={() => setShowCreateModal(true)}
            onMouseEnter={handleCreateButtonHover}
            onMouseLeave={handleCreateButtonLeave}
          >
            <FaUserPlus style={{marginRight: 8}} /> Create User
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
                  <th style={{...styles.tableHeader, width: '260px'}}>Actions</th>
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
                          <FaEdit style={{marginRight: 6}} /> Edit
                        </button>
                        {user.role !== 'admin' && (
                          <>
                            <button
                              style={styles.blockButton}
                              onClick={() => toggleBlockUser(user.id)}
                              onMouseEnter={handleBlockButtonHover}
                              onMouseLeave={handleBlockButtonLeave}
                            >
                              {user.isBlocked ? (
                                <><FaCheckCircle style={{marginRight: 6}} /> Unblock</>
                              ) : (
                                <><FaBan style={{marginRight: 6}} /> Block</> 
                              )}
                            </button>
                            <button
                              style={styles.deleteButton}
                              onClick={() => handleDeleteUser(user.id)}
                              onMouseEnter={handleDeleteButtonHover}
                              onMouseLeave={handleDeleteButtonLeave}
                            >
                              <FaTrash style={{marginRight: 6}}/>Delete
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
                    {roles.map(r => (
                      <option key={r.role_id} value={r.role_name}>{r.role_name}</option>
                    ))}
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
                    {roles.map(r => (
                      <option key={r.role_id} value={r.role_name}>{r.role_name}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="button"
                  style={styles.submitButton}
                  onClick={handleCreateUser}
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