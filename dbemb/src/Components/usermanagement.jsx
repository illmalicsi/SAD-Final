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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
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
            console.log('No auth token found');
            setUsers([]);
            return;
          }

          try {
            const res = await fetch('http://localhost:5000/api/users', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!res.ok) {
              console.error('API response not OK:', res.status, res.statusText);
              throw new Error('Failed to fetch users from API');
            }

            const data = await res.json();
            console.log('Fetched users data:', data);
            if (data && data.users) {
              setUsers(data.users);
              return;
            }

            // No data returned: set empty
            console.log('No users in response');
            setUsers([]);
          } catch (error) {
            console.error('Error fetching users from API:', error);
            // API error: set empty
            setUsers([]);
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

    // Helper function to format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    useEffect(() => {
      // Filter users based on search term and role filter
      console.log('Filtering effect running. Users count:', users.length, 'Search:', searchTerm, 'Role filter:', roleFilter);
      let filtered = users;
      
      if (searchTerm) {
        filtered = filtered.filter(user => 
          (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (roleFilter !== 'all') {
        filtered = filtered.filter(user => user.role === roleFilter);
      }
      
      console.log('Filtered users count:', filtered.length);
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
      // Generate incremental ID based on existing max ID
      const maxId = users.reduce((max, u) => Math.max(max, u.id), 0);
      const newUserWithId = {
        ...newUser,
        id: maxId + 1,
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
      const user = users.find(u => u.id === userId);
      setUserToDelete(user);
      setShowDeleteModal(true);
    };

    const confirmDeleteUser = () => {
      if (userToDelete) {
        const updatedUsers = users.filter(user => user.id !== userToDelete.id);
        setUsers(updatedUsers);
        localStorage.setItem('davaoBlueEaglesUsers', JSON.stringify(updatedUsers));
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    };

    const cancelDeleteUser = () => {
      setShowDeleteModal(false);
      setUserToDelete(null);
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
        background: '#f8fafc',
        padding: '2.5rem',
        color: '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      },
      title: {
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: '2.25rem',
        fontWeight: '700',
        margin: 0,
        color: '#0f172a',
        letterSpacing: '-0.02em'
      },
      backButton: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        color: '#475569',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      },
      buttonContainer: {
        display: 'flex',
        alignItems: 'center'
      },
      statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      },
      statCard: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '2rem',
        textAlign: 'center',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      },
      statNumber: {
        fontSize: '2rem',
        fontWeight: '700',
        fontFamily: "'Inter', -apple-system, sans-serif",
        margin: '0 0 0.5rem 0',
        color: '#0f172a',
        letterSpacing: '-0.02em'
      },
      statLabel: {
        fontSize: '0.875rem',
        color: '#64748b',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      },
      controls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap'
      },
      filterSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      },
      searchInput: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.625rem 1rem',
        color: '#0f172a',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        minWidth: '200px'
      },
      filterSelect: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.625rem 1rem',
        color: '#0f172a',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        minWidth: '150px',
        fontWeight: '500'
      },
      createButton: {
        backgroundColor: '#3b82f6',
        border: '1px solid #3b82f6',
        color: 'white',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        tableLayout: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      },
      tableHeader: {
        backgroundColor: '#f8fafc',
        padding: '0.75rem 1rem',
        textAlign: 'center',
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: '0.6875rem',
        fontWeight: '600',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        borderBottom: '1px solid #e2e8f0'
      },
      tableCell: {
        padding: '1rem 1.25rem',
        borderBottom: '1px solid #f1f5f9',
        textAlign: 'center',
        verticalAlign: 'middle',
        color: '#334155',
        fontSize: '0.875rem'
      },
      nameCell: {
        textAlign: 'left',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        minWidth: '140px',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#0f172a'
      },
      emailCell: {
        textAlign: 'left',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        minWidth: '180px',
        fontSize: '0.8125rem',
        color: '#64748b'
      },
      statusBadge: {
        padding: '0.375rem 0.75rem',
        borderRadius: '100px',
        fontSize: '0.6875rem',
        fontWeight: '600',
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
        display: 'inline-block',
        whiteSpace: 'nowrap'
      },
      actionButton: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        color: '#475569',
        padding: '0.5rem 0.875rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        marginRight: '0.5rem',
        minWidth: '60px'
      },
      editButton: {
        backgroundColor: 'white',
        border: '1px solid #3b82f6',
        color: '#3b82f6',
        padding: '0.375rem 0.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        marginRight: '0',
        minWidth: '48px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap'
      },
      blockButton: {
        backgroundColor: 'white',
        border: '1px solid #f59e0b',
        color: '#f59e0b',
        padding: '0.375rem 0.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        marginRight: '0',
        minWidth: '48px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap'
      },
      deleteButton: {
        backgroundColor: 'white',
        border: '1px solid #ef4444',
        color: '#ef4444',
        padding: '0.375rem 0.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        minWidth: '48px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap'
      },
      actionsCell: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '0.25rem',
        flexWrap: 'nowrap'
      },
      modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      },
      modalContent: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)'
      },
      emptyState: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: '#64748b',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      },
      modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e2e8f0'
      },
      modalTitle: {
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: '1.25rem',
        fontWeight: '600',
        margin: 0,
        color: '#0f172a'
      },
      closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#64748b',
        fontSize: '1.5rem',
        cursor: 'pointer',
        transition: 'color 0.2s'
      },
      form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      },
      formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      },
      formField: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      },
      formLabel: {
        color: '#334155',
        fontSize: '0.875rem',
        fontWeight: '600'
      },
      formInput: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.625rem 0.875rem',
        color: '#0f172a',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'all 0.2s ease'
      },
      formSelect: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.625rem 0.875rem',
        color: '#0f172a',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'all 0.2s ease'
      },
      submitButton: {
        backgroundColor: '#3b82f6',
        border: '1px solid #3b82f6',
        color: 'white',
        padding: '0.75rem 1.25rem',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '0.5rem'
      },
      deleteModalContent: {
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '400px',
        maxWidth: '90vw',
        border: '1px solid #fee2e2',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)'
      },
      deleteModalHeader: {
        padding: '1.5rem 2rem 1rem',
        borderBottom: '1px solid #fee2e2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      deleteModalTitle: {
        margin: 0,
        color: '#ef4444',
        fontSize: '1.25rem',
        fontWeight: '600'
      },
      deleteModalBody: {
        padding: '2rem',
        textAlign: 'center'
      },
      deleteWarningIcon: {
        color: '#ef4444',
        marginBottom: '1rem',
        opacity: 0.8
      },
      deleteMessage: {
        color: '#0f172a',
        fontSize: '1rem',
        marginBottom: '0.5rem',
        lineHeight: '1.5',
        fontWeight: '500'
      },
      deleteSubMessage: {
        color: '#64748b',
        fontSize: '0.875rem',
        margin: 0
      },
      deleteModalActions: {
        padding: '1rem 2rem 2rem',
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end'
      },
      cancelButton: {
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        color: '#475569',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      deleteConfirmButton: {
        backgroundColor: '#ef4444',
        border: '1px solid #ef4444',
        color: 'white',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }
    };

    // Add specific hover effects for different button types
    const handleEditButtonHover = (e) => {
      e.target.style.backgroundColor = '#eff6ff';
      e.target.style.borderColor = '#3b82f6';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
    };

    const handleEditButtonLeave = (e) => {
      e.target.style.backgroundColor = 'white';
      e.target.style.borderColor = '#3b82f6';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    };

    const handleBlockButtonHover = (e) => {
      e.target.style.backgroundColor = '#fef3c7';
      e.target.style.borderColor = '#f59e0b';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
    };

    const handleBlockButtonLeave = (e) => {
      e.target.style.backgroundColor = 'white';
      e.target.style.borderColor = '#f59e0b';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    };

    const handleDeleteButtonHover = (e) => {
      e.target.style.backgroundColor = '#fee2e2';
      e.target.style.borderColor = '#ef4444';
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
    };

    const handleDeleteButtonLeave = (e) => {
      e.target.style.backgroundColor = 'white';
      e.target.style.borderColor = '#ef4444';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    };
    const handleButtonHover = (e) => {
      e.target.style.backgroundColor = '#f8fafc';
      e.target.style.borderColor = '#cbd5e1';
      e.target.style.transform = 'translateY(-1px)';
    };

    const handleButtonLeave = (e) => {
      e.target.style.backgroundColor = 'white';
      e.target.style.borderColor = '#e2e8f0';
      e.target.style.transform = 'translateY(0)';
    };

    const handleCreateButtonHover = (e) => {
      e.target.style.backgroundColor = '#2563eb';
      e.target.style.borderColor = '#2563eb';
      e.target.style.transform = 'translateY(-1px)';
      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
    };

    const handleCreateButtonLeave = (e) => {
      e.target.style.backgroundColor = '#3b82f6';
      e.target.style.borderColor = '#3b82f6';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    };

    const handleInputFocus = (e) => {
      e.target.style.borderColor = '#3b82f6';
      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    };

    const handleInputBlur = (e) => {
      e.target.style.borderColor = '#e2e8f0';
      e.target.style.boxShadow = 'none';
    };

    const handleStatCardHover = (e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    };

    const handleStatCardLeave = (e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
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
            <FaUsers size={24} style={{ marginBottom: '10px', color: '#3b82f6' }} />
            <div style={{...styles.statNumber, color: '#3b82f6'}}>{totalUsers}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <FaUser size={24} style={{ marginBottom: '10px', color: '#10b981' }} />
            <div style={{...styles.statNumber, color: '#10b981'}}>{totalUserRole}</div>
            <div style={styles.statLabel}>Regular Users</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <FaUserShield size={24} style={{ marginBottom: '10px', color: '#f59e0b' }} />
            <div style={{...styles.statNumber, color: '#f59e0b'}}>{totalAdmins}</div>
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
            <FaSearch size={16} style={{marginRight: 8, color: '#64748b'}} />
            <input
              type="text"
              placeholder="Search users..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <FaFilter size={16} style={{marginRight: 8, color: '#64748b'}} />
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
          <div style={{ overflowX: 'auto', borderRadius: '16px' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{...styles.tableHeader, ...styles.nameCell, minWidth: '140px'}}>Name</th>
                  <th style={{...styles.tableHeader, ...styles.emailCell, minWidth: '180px'}}>Email</th>
                  <th style={{...styles.tableHeader, width: 'auto', minWidth: '80px'}}>Role</th>
                  <th style={{...styles.tableHeader, width: 'auto', minWidth: '80px'}}>Status</th>
                  <th style={{...styles.tableHeader, width: 'auto', minWidth: '100px'}}>Created</th>
                  <th style={{...styles.tableHeader, width: 'auto', minWidth: '200px'}}>Actions</th>
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
                        backgroundColor: user.role === 'admin' ? '#dbeafe' : '#d1fae5',
                        color: user.role === 'admin' ? '#1e40af' : '#065f46'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: user.isBlocked ? '#fee2e2' : '#d1fae5',
                        color: user.isBlocked ? '#991b1b' : '#065f46'
                      }}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{formatDate(user.createdAt)}</td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionsCell}>
                        <button
                          style={styles.editButton}
                          onClick={() => handleEditUser(user)}
                          onMouseEnter={handleEditButtonHover}
                          onMouseLeave={handleEditButtonLeave}
                        >
                          <FaEdit size={11} style={{marginRight: 4}} /> Edit
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
                                <><FaCheckCircle size={11} style={{marginRight: 4}} /> Unblock</>
                              ) : (
                                <><FaBan size={11} style={{marginRight: 4}} /> Block</> 
                              )}
                            </button>
                            <button
                              style={styles.deleteButton}
                              onClick={() => handleDeleteUser(user.id)}
                              onMouseEnter={handleDeleteButtonHover}
                              onMouseLeave={handleDeleteButtonLeave}
                            >
                              <FaTrash size={11} style={{marginRight: 4}}/>Delete
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div style={styles.modalOverlay} onClick={cancelDeleteUser}>
            <div style={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.deleteModalHeader}>
                <h2 style={styles.deleteModalTitle}>Confirm Delete</h2>
                <button 
                  style={styles.closeButton}
                  onClick={cancelDeleteUser}
                >
                  ×
                </button>
              </div>
              
              <div style={styles.deleteModalBody}>
                <div style={styles.deleteWarningIcon}>
                  <FaTrash size={48} />
                </div>
                <p style={styles.deleteMessage}>
                  Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
                </p>
                <p style={styles.deleteSubMessage}>
                  This action cannot be undone.
                </p>
              </div>
              
              <div style={styles.deleteModalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={cancelDeleteUser}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={styles.deleteConfirmButton}
                  onClick={confirmDeleteUser}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default UserManagement;  