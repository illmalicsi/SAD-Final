import React, { useState } from 'react';
import { FaDrum, FaWind, FaCheckCircle, FaBoxOpen, FaTools } from 'react-icons/fa';

const Inventory = ({ user, onBackToHome }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [viewNote, setViewNote] = useState(null);

  // Initial inventory data with archived property
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Yamaha Black Snare Drum #01', category: 'percussion', subcategory: 'Snare Drums', brand: 'Yamaha', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: '', amount: 1, archived: false },
    { id: 2, name: 'Yamaha Black Snare Drum #02', category: 'percussion', subcategory: 'Snare Drums', brand: 'Yamaha', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: '', amount: 1, archived: false },
    { id: 3, name: 'Yamaha Black Snare Drum (Evans Drum Head) #03', category: 'percussion', subcategory: 'Snare Drums', brand: 'Yamaha', condition: 'Excellent', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Evans drum head', amount: 2, archived: false },
    { id: 4, name: 'Pearl Snare Drum Color White #01', category: 'percussion', subcategory: 'Snare Drums', brand: 'Pearl', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'White color', amount: 0, archived: false },
    { id: 5, name: 'Pearl Snare Drum Color Dirt White #02', category: 'percussion', subcategory: 'Snare Drums', brand: 'Pearl', condition: 'Fair', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Dirt white color', amount: 2, archived: false },
    { id: 6, name: 'Lazer Bass Drum #01', category: 'percussion', subcategory: 'Bass Drums', brand: 'Lazer', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Size 16', amount: 2, archived: false },
    { id: 7, name: 'E-lance Bass Drum #02', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Size 20', amount: 2, archived: false },
    { id: 8, name: 'E-lance Bass Drum #03', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Size 22', amount: 2, archived: false },
    { id: 9, name: 'E-lance Bass Drum #04', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Size 24', amount: 2, archived: false },
    { id: 10, name: 'Fernando Bass Drum #002', category: 'percussion', subcategory: 'Bass Drums', brand: 'Fernando', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Size 20', amount: 1, archived: false },
    { id: 11, name: 'E-lance Percussion Black Tenor Drums', category: 'percussion', subcategory: 'Tenor Drums', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Black color', amount: 2, archived: false },
    { id: 12, name: 'Century Percussion White Tenor Drums', category: 'percussion', subcategory: 'Tenor Drums', brand: 'Century', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'White color', amount: 2, archived: false },
    { id: 13, name: 'Zildjian Marching Cymbals', category: 'percussion', subcategory: 'Cymbals', brand: 'Zildjian', condition: 'Excellent', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Marching cymbals', amount: 2, archived: false },
    { id: 14, name: 'E-lance Percussion Marching Glockenspiel #01', category: 'percussion', subcategory: 'Other Percussion', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Marching glockenspiel', amount: 2, archived: false },
    { id: 15, name: 'E-lance Percussion Marching Glockenspiel #02', category: 'percussion', subcategory: 'Other Percussion', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: 'Marching glockenspiel', amount: 2, archived: false },
    { id: 16, name: 'Yamaha Clarinet', category: 'wind', subcategory: 'Woodwinds', brand: 'Yamaha', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: '', amount: 2, archived: false },
    { id: 17, name: 'Fernando Tuba', category: 'wind', subcategory: 'Brass', brand: 'Fernando', condition: 'Good', status: 'Available', location: 'Shrine Hills, Matina', notes: '', amount: 2, archived: false }
  ]);

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.95), rgba(2, 6, 23, 0.98))',
      padding: '28px',
      color: '#e5e7eb',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    },

    title: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
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
    buttonContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    // Stats row: align with page, no scrollbar (wrap on small screens)
    statsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      margin: '0 auto 26px',
      alignItems: 'stretch',
      padding: '0 20px',
      boxSizing: 'border-box',
      justifyContent: 'space-between',
      maxWidth: '100%'
    },
    // compact, flexible stat cards so six can sit on one line on wide screens
    statCard: {
      flex: '1 1 140px',
      minWidth: 120,
      maxWidth: 180,
      backgroundColor: 'rgba(13,27,42,0.9)',
      border: '1px solid rgba(30,41,59,0.8)',
      borderRadius: 12,
      padding: '10px 12px',
      textAlign: 'left',
      transition: 'all 0.18s ease',
      minHeight: 72,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center'
    },
    statIcon: { marginBottom: 0 },
    statNumber: {
      fontSize: 18,
      fontWeight: 700,
      color: '#fff',
      marginTop: 6
    },
    statLabel: {
      fontSize: 13,
      color: '#94a3b8',
      marginTop: 4
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
    inventoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    inventoryCard: {
      backgroundColor: 'rgba(10, 25, 47, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.15)',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.3s ease'
    },
    cardTitle: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      margin: '0 0 10px 0',
      color: '#e5e7eb'
    },
    cardDetail: {
      color: '#a8b2d1',
      fontSize: '14px',
      margin: '5px 0',
      display: 'flex',
      justifyContent: 'space-between'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    available: {
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      color: '#22c55e'
    },
    inUse: {
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      color: '#f59e0b'
    },
    maintenance: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444'
    },
    conditionBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    excellent: {
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      color: '#22c55e'
    },
    good: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      color: '#3b82f6'
    },
    fair: {
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      color: '#f59e0b'
    },
    poor: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444'
    },
    cardActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px'
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
      fontFamily: 'system-ui, -apple-system, sans-serif',
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
    formTextarea: {
      backgroundColor: 'rgba(2, 6, 23, 0.6)',
      border: '1px solid rgba(100, 255, 218, 0.2)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#e5e7eb',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease',
      minHeight: '80px',
      resize: 'vertical'
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
    },
    // Add these for table/list view and archive
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      background: 'rgba(10, 25, 47, 0.6)',
      borderRadius: '12px',
      overflow: 'hidden',
    },
    th: {
      background: 'rgba(2, 6, 23, 0.9)',
      color: '#64ffda',
      fontWeight: 600,
      fontSize: '15px',
      padding: '12px 8px',
      borderBottom: '1px solid rgba(100,255,218,0.15)',
      textAlign: 'left',
    },
    td: {
      color: '#e5e7eb',
      fontSize: '14px',
      padding: '10px 8px',
      borderBottom: '1px solid rgba(100,255,218,0.08)',
      verticalAlign: 'middle',
    },
    archivedRow: {
      opacity: 0.5,
      background: 'rgba(100,255,218,0.04)'
    },
    categoryHeader: {
      background: 'rgba(59,130,246,0.08)',
      color: '#60a5fa',
      fontWeight: 700,
      fontSize: '18px',
      padding: '12px 8px',
      borderBottom: '2px solid #60a5fa',
    },
    archiveButton: {
      backgroundColor: 'transparent',
      border: '1px solid #fbbf24',
      color: '#fbbf24',
      padding: '6px 14px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      marginRight: '6px',
      transition: 'all 0.3s ease',
      minWidth: '80px'
    },
    unarchiveButton: {
      backgroundColor: 'transparent',
      border: '1px solid #22c55e',
      color: '#22c55e',
      padding: '6px 14px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      marginRight: '6px',
      transition: 'all 0.3s ease',
      minWidth: '80px'
    }
  };

  // Hover effect handlers
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

  // Filter inventory based on search, category, and archived toggle
  const filteredInventory = inventory.filter(item => {
    // Show only archived if toggled, otherwise only unarchived
    if (showArchived ? !item.archived : item.archived) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedByCategory = filteredInventory.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Stats (only count unarchived items)
  const stats = {
    total: inventory.filter(item => !item.archived).length,
    totalAmount: inventory.filter(item => !item.archived).reduce((sum, item) => sum + (item.amount || 0), 0),
    available: inventory.filter(item => item.status === 'Available' && !item.archived).length,
    percussion: inventory.filter(item => item.category === 'percussion' && !item.archived).length,
    wind: inventory.filter(item => item.category === 'wind' && !item.archived).length,
    maintenance: inventory.filter(item => item.status === 'Maintenance' && !item.archived).length
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return { ...styles.statusBadge, ...styles.available };
      case 'In Use': return { ...styles.statusBadge, ...styles.inUse };
      case 'Maintenance': return { ...styles.statusBadge, ...styles.maintenance };
      default: return styles.statusBadge;
    }
  };

  const getConditionStyle = (condition) => {
    switch (condition) {
      case 'Excellent': return { ...styles.conditionBadge, ...styles.excellent };
      case 'Good': return { ...styles.conditionBadge, ...styles.good };
      case 'Fair': return { ...styles.conditionBadge, ...styles.fair };
      case 'Poor': return { ...styles.conditionBadge, ...styles.poor };
      default: return styles.conditionBadge;
    }
  };

  const handleEdit = (item) => setEditingItem({ ...item });

  const handleArchive = (id) => {
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, archived: true } : item
    ));
  };

  const handleUnarchive = (id) => {
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, archived: false } : item
    ));
  };

  const handleSave = () => {
    if (editingItem.id) {
      setInventory(inventory.map(item =>
        item.id === editingItem.id ? { ...editingItem, archived: item.archived } : item
      ));
    } else {
      const newItem = {
        ...editingItem,
        id: Math.max(...inventory.map(i => i.id)) + 1,
        archived: false
      };
      setInventory([...inventory, newItem]);
    }
    setEditingItem(null);
    setShowAddModal(false);
  };

  const handleAddNew = () => {
    setEditingItem({
      name: '',
      category: 'percussion',
      subcategory: '',
      brand: '',
      condition: 'Good',
      status: 'Available',
      location: '',
      notes: '',
      amount: '',
      archived: false
    });
    setShowAddModal(true);
  };

  // Category display names
  const categoryNames = {
    percussion: 'Percussion',
    wind: 'Wind Instruments'
  };

  return (
    <div style={styles.container}>
      {/* Stats Cards */}
      {!showArchived && (
        <div style={styles.statsContainer}>
          {/* First row */}
          <div style={styles.statCard}>
            <FaBoxOpen size={28} color="#60a5fa" style={{ marginBottom: 8 }} />
            <div style={{ ...styles.statNumber, color: '#60a5fa' }}>{stats.total}</div>
            <div style={styles.statLabel}>Total Items</div>
          </div>
          <div style={styles.statCard}>
            <FaCheckCircle size={28} color="#22c55e" style={{ marginBottom: 8 }} />
            <div style={{ ...styles.statNumber, color: '#22c55e' }}>{stats.available}</div>
            <div style={styles.statLabel}>Available</div>
          </div>
          <div style={styles.statCard}>
            <FaDrum size={28} color="#fbbf24" style={{ marginBottom: 8 }} />
            <div style={{ ...styles.statNumber, color: '#fbbf24' }}>{stats.percussion}</div>
            <div style={styles.statLabel}>Percussion</div>
          </div>
          {/* Second row */}
          <div style={styles.statCard}>
            <FaWind size={28} color="#3b82f6" style={{ marginBottom: 8 }} />
            <div style={{ ...styles.statNumber, color: '#3b82f6' }}>{stats.wind}</div>
            <div style={styles.statLabel}>Wind</div>
          </div>
          <div style={styles.statCard}>
            <FaTools size={28} color="#ef4444" style={{ marginBottom: 8 }} />
            <div style={{ ...styles.statNumber, color: '#ef4444' }}>{stats.maintenance}</div>
            <div style={styles.statLabel}>Maintenance</div>
          </div>
          <div style={styles.statCard}>
            <FaBoxOpen size={28} color="#64ffda" style={{ marginBottom: 8 }} />
            <div style={{ ...styles.statNumber, color: '#64ffda' }}>{stats.totalAmount}</div>
            <div style={styles.statLabel}>Total Units</div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div style={styles.controls}>
        <div style={styles.filterSection}>
          <input
            type="text"
            placeholder="Search instruments, brands, or subcategories..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <select
            style={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          >
            <option value="all">All Categories</option>
            <option value="percussion">Percussion</option>
            <option value="wind">Wind Instruments</option>
          </select>
        </div>
        <button
          style={styles.createButton}
          onClick={handleAddNew}
          onMouseEnter={handleCreateButtonHover}
          onMouseLeave={handleCreateButtonLeave}
        >
          + Add Instrument
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 15, color: '#94a3b8', marginRight: 8 }}>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={() => setShowArchived(!showArchived)}
            style={{ marginRight: 6 }}
          />
          Show Archived Instruments
        </label>
      </div>

      {Object.keys(groupedByCategory).length === 0 && (
        <div style={styles.emptyState}>
          <h3>
            {showArchived
              ? 'No archived instruments found'
              : 'No instruments found'}
          </h3>
        </div>
      )}

      {Object.entries(groupedByCategory).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <div style={{
            ...styles.categoryHeader,
            textAlign: 'center', // Center the category name
            fontSize: '22px',
            fontWeight: 700,
            color: '#60a5fa',
            borderBottom: '2px solid #60a5fa'
          }}>
            {categoryNames[cat] || cat}
          </div>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, textAlign: 'center' }}>Name</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Subcategory</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Brand</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Condition</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Location</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Amount</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Notes</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={item.archived ? styles.archivedRow : {}}>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.name}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.subcategory}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.brand}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={getStatusStyle(item.status)}>{item.status}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={getConditionStyle(item.condition)}>{item.condition}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.location}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#64ffda' }}>{item.amount}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span title={item.notes}>{item.notes}</span>
                    {item.notes && item.notes.length > 25 && (
                      <button
                        style={{
                          marginLeft: 8,
                          background: 'none',
                          border: 'none',
                          color: '#60a5fa',
                          cursor: 'pointer',
                          fontSize: 13,
                          textDecoration: 'underline'
                        }}
                        onClick={() => setViewNote(item.notes)}
                      >
                        View
                      </button>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {!showArchived && (
                        <button
                          style={styles.editButton}
                          onClick={() => handleEdit(item)}
                          disabled={item.archived}
                        >
                          Edit
                        </button>
                      )}
                      {showArchived ? (
                        <button
                          style={styles.unarchiveButton}
                          onClick={() => handleUnarchive(item.id)}
                          title="Unarchive"
                        >
                          Unarchive
                        </button>
                      ) : (
                        <button
                          style={styles.archiveButton}
                          onClick={() => handleArchive(item.id)}
                          title="Archive"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Edit/Add Modal */}
      {(editingItem || showAddModal) && (
        <div style={styles.modalOverlay} onClick={() => {
          setEditingItem(null);
          setShowAddModal(false);
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingItem?.id ? 'Edit Instrument' : 'Add New Instrument'}
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => {
                  setEditingItem(null);
                  setShowAddModal(false);
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Instrument Name</label>
                  <input
                    type="text"
                    style={styles.formInput}
                    value={editingItem?.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Category</label>
                  <select
                    style={styles.formSelect}
                    value={editingItem?.category || 'percussion'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  >
                    <option value="percussion">Percussion</option>
                    <option value="wind">Wind Instruments</option>
                  </select>
                </div>
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Subcategory</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={editingItem?.subcategory || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, subcategory: e.target.value })}
                  placeholder="e.g., Snare Drums, Bass Drums, Woodwinds, etc."
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Brand</label>
                  <input
                    type="text"
                    style={styles.formInput}
                    value={editingItem?.brand || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Amount</label>
                  <input
                    type="number"
                    style={styles.formInput}
                    value={editingItem?.amount || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                      if (value < 0) return;
                      setEditingItem({ ...editingItem, amount: value || '' });
                    }}
                    min="0"
                    step="0.1"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Condition</label>
                  <select
                    style={styles.formSelect}
                    value={editingItem?.condition || 'Good'}
                    onChange={(e) => setEditingItem({ ...editingItem, condition: e.target.value })}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Status</label>
                  <select
                    style={styles.formSelect}
                    value={editingItem?.status || 'Available'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Location</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={editingItem?.location || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  placeholder="e.g., Storage A, Band Room, etc."
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel}>Notes</label>
                <textarea
                  style={styles.formTextarea}
                  value={editingItem?.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  placeholder="Additional notes about the instrument..."
                />
              </div>
              <button
                type="button"
                style={styles.submitButton}
                onClick={handleSave}
              >
                {editingItem?.id ? 'Update Instrument' : 'Add Instrument'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewNote && (
        <div style={styles.modalOverlay} onClick={() => setViewNote(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Full Note</h2>
              <button style={styles.closeButton} onClick={() => setViewNote(null)}>×</button>
            </div>
            <div style={{ color: '#e5e7eb', fontSize: 15, whiteSpace: 'pre-wrap' }}>
              {viewNote}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;