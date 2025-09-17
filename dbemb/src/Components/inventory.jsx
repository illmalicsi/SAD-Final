  import React, { useState } from 'react';

  const Inventory = ({ user, onBackToHome }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Initial inventory data
    const [inventory, setInventory] = useState([
      // Percussion Category - Snare Drums
      { id: 1, name: 'Yamaha Black Snare Drum #01', category: 'percussion', subcategory: 'Snare Drums', brand: 'Yamaha', condition: 'Good', status: 'Available', location: 'Storage A', notes: '', amount: 0 },
      { id: 2, name: 'Yamaha Black Snare Drum #02', category: 'percussion', subcategory: 'Snare Drums', brand: 'Yamaha', condition: 'Good', status: 'Available', location: 'Storage A', notes: '', amount: 0 },
      { id: 3, name: 'Yamaha Black Snare Drum (Evans Drum Head) #03', category: 'percussion', subcategory: 'Snare Drums', brand: 'Yamaha', condition: 'Excellent', status: 'Available', location: 'Storage A', notes: 'Evans drum head', amount: 0 },
      { id: 4, name: 'Pearl Snare Drum Color White #01', category: 'percussion', subcategory: 'Snare Drums', brand: 'Pearl', condition: 'Good', status: 'Available', location: 'Storage A', notes: 'White color', amount: 0 },
      { id: 5, name: 'Pearl Snare Drum Color Dirt White #02', category: 'percussion', subcategory: 'Snare Drums', brand: 'Pearl', condition: 'Fair', status: 'Available', location: 'Storage A', notes: 'Dirt white color', amount: 0 },
      
      // Percussion Category - Bass Drums
      { id: 6, name: 'Lazer Size 16 Bass Drum #01', category: 'percussion', subcategory: 'Bass Drums', brand: 'Lazer', condition: 'Good', status: 'Available', location: 'Storage B', notes: 'Size 16', amount: 0 },
      { id: 7, name: 'E-lance Size 20 Bass Drum #02', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Storage B', notes: 'Size 20', amount: 0 },
      { id: 8, name: 'E-lance Size 22 Bass Drum 03', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Storage B', notes: 'Size 22', amount: 0 },
      { id: 9, name: 'E-lance Size 24 Bass Drum 04', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Storage B', notes: 'Size 24', amount: 0 },
      { id: 10, name: 'Fernando Size 20 Bass Drum 002', category: 'percussion', subcategory: 'Bass Drums', brand: 'Fernando', condition: 'Good', status: 'Available', location: 'Storage B', notes: 'Size 20', amount: 1 },
      
      // Percussion Category - Tenor Drums
      { id: 11, name: 'E-lance Percussion Black Tenor Drums', category: 'percussion', subcategory: 'Tenor Drums', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Storage C', notes: 'Black color', amount: 0 },
      { id: 12, name: 'Century Percussion White Tenor Drums', category: 'percussion', subcategory: 'Tenor Drums', brand: 'Century', condition: 'Good', status: 'Available', location: 'Storage C', notes: 'White color', amount: 0 },
      
      // Percussion Category - Cymbals
      { id: 13, name: 'Zildjian Marching Cymbals', category: 'percussion', subcategory: 'Cymbals', brand: 'Zildjian', condition: 'Excellent', status: 'Available', location: 'Storage D', notes: 'Marching cymbals', amount: 0 },
      
      // Percussion Category - Other
      { id: 14, name: 'E-lance Percussion Marching Glockenspiel 01', category: 'percussion', subcategory: 'Other Percussion', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Storage E', notes: 'Marching glockenspiel', amount: 0 },
      { id: 15, name: 'E-lance Percussion Marching Glockenspiel 02', category: 'percussion', subcategory: 'Other Percussion', brand: 'E-lance', condition: 'Good', status: 'Available', location: 'Storage E', notes: 'Marching glockenspiel', amount: 0 },
      
      // Wind Instruments - Woodwinds
      { id: 16, name: 'Yamaha Clarinet', category: 'wind', subcategory: 'Woodwinds', brand: 'Yamaha', condition: 'Good', status: 'Available', location: 'Wind Storage', notes: '', amount: 0 },
      
      // Wind Instruments - Brass
      { id: 17, name: 'Fernando Tuba', category: 'wind', subcategory: 'Brass', brand: 'Fernando', condition: 'Good', status: 'Available', location: 'Wind Storage', notes: '', amount: 0 }
    ]);

    // Styles consistent with UserManagement design
    const styles = {
      container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.95), rgba(2, 6, 23, 0.98))',
        padding: '20px',
        color: '#e5e7eb'
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
        fontFamily: 'system-ui, -apple-system, sans-serif',
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

    // Filter inventory based on search and category
    const filteredInventory = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Calculate stats
    const stats = {
      total: inventory.length,
      totalAmount: inventory.reduce((sum, item) => sum + (item.amount || 0), 0),
      available: inventory.filter(item => item.status === 'Available').length,
      inUse: inventory.filter(item => item.status === 'In Use').length,
      maintenance: inventory.filter(item => item.status === 'Maintenance').length,
      percussion: inventory.filter(item => item.category === 'percussion').length,
      wind: inventory.filter(item => item.category === 'wind').length
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

    const handleEdit = (item) => {
      setEditingItem({...item});
    };

    const handleDelete = (id) => {
      if (window.confirm('Are you sure you want to delete this item?')) {
        setInventory(inventory.filter(item => item.id !== id));
      }
    };

    const handleSave = () => {
      if (editingItem.id) {
        // Update existing item
        setInventory(inventory.map(item => 
          item.id === editingItem.id ? editingItem : item
        ));
      } else {
        // Add new item
        const newItem = {
          ...editingItem,
          id: Math.max(...inventory.map(i => i.id)) + 1
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
        amount: ''
      });
      setShowAddModal(true);
    };

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.buttonContainer}>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={styles.statsContainer}>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <div style={{...styles.statNumber, color: '#60a5fa'}}>{stats.total}</div>
            <div style={styles.statLabel}>Total Items</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <div style={{...styles.statNumber, color: '#22c55e'}}>{stats.totalAmount}</div>
            <div style={styles.statLabel}>Total Units</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <div style={{...styles.statNumber, color: '#64ffda'}}>{stats.available}</div>
            <div style={styles.statLabel}>Available</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <div style={{...styles.statNumber, color: '#fbbf24'}}>{stats.percussion}</div>
            <div style={styles.statLabel}>Percussion</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={handleStatCardHover}
            onMouseLeave={handleStatCardLeave}
          >
            <div style={{...styles.statNumber, color: '#ef4444'}}>{stats.maintenance}</div>
            <div style={styles.statLabel}>Maintenance</div>
          </div>
        </div>

        <div style={styles.controls}>
          <div style={styles.filterSection}>
            <input
              type="text"
              placeholder="Search instruments..."
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
            Add Instrument
          </button>
        </div>

        {/* Inventory Grid */}
        <div style={styles.inventoryGrid}>
          {filteredInventory.map(item => (
            <div key={item.id} style={styles.inventoryCard}>
              <h3 style={styles.cardTitle}>{item.name}</h3>
              
              <div style={styles.cardDetail}>
                <span>Category:</span>
                <span>{item.subcategory}</span>
              </div>
              
              <div style={styles.cardDetail}>
                <span>Brand:</span>
                <span>{item.brand}</span>
              </div>
              
              <div style={styles.cardDetail}>
                <span>Status:</span>
                <span style={getStatusStyle(item.status)}>{item.status}</span>
              </div>
              
              <div style={styles.cardDetail}>
                <span>Condition:</span>
                <span style={getConditionStyle(item.condition)}>{item.condition}</span>
              </div>
              
              <div style={styles.cardDetail}>
                <span>Location:</span>
                <span>{item.location}</span>
              </div>
              
              <div style={styles.cardDetail}>
                <span>Amount:</span>
                <span style={{fontWeight: '600', color: '#64ffda'}}>{item.amount}</span>
              </div>
              
              {item.notes && (
                <div style={styles.cardDetail}>
                  <span>Notes:</span>
                  <span>{item.notes}</span>
                </div>
              )}
              
              <div style={styles.cardActions}>
                <button
                  style={styles.editButton}
                  onClick={() => handleEdit(item)}
                  onMouseEnter={handleEditButtonHover}
                  onMouseLeave={handleEditButtonLeave}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(item.id)}
                  onMouseEnter={handleDeleteButtonHover}
                  onMouseLeave={handleDeleteButtonLeave}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredInventory.length === 0 && (
          <div style={styles.emptyState}>
            <h3>No instruments found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}

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
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                  
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Category</label>
                    <select
                      style={styles.formSelect}
                      value={editingItem?.category || 'percussion'}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
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
                    onChange={(e) => setEditingItem({...editingItem, subcategory: e.target.value})}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
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
                      onChange={(e) => setEditingItem({...editingItem, brand: e.target.value})}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                  
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Amount</label>
                      <input
                        type="number"
                        style={styles.formInput}
                        value={editingItem?.amount || ''}
                        onChange={(e) => setEditingItem({...editingItem, amount: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        min="0"
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
                      onChange={(e) => setEditingItem({...editingItem, condition: e.target.value})}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
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
                      onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
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
                    onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="e.g., Storage A, Band Room, etc."
                  />
                </div>
                
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Notes</label>
                  <textarea
                    style={styles.formTextarea}
                    value={editingItem?.notes || ''}
                    onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Additional notes about the instrument..."
                  />
                </div>
                
                <button
                  type="button"
                  style={styles.submitButton}
                  onClick={handleSave}
                  onMouseEnter={handleCreateButtonHover}
                  onMouseLeave={handleCreateButtonLeave}
                >
                  {editingItem?.id ? 'Update Instrument' : 'Add Instrument'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Inventory;
