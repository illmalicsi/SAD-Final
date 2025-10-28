import React, { useState, useRef, useEffect } from 'react';
import { FaDrum, FaWind, FaCheckCircle, FaBoxOpen, FaTools, FaEllipsisH, FaEye, FaEdit, FaArchive, FaUndo } from 'react-icons/fa';
import theme from '../theme';


const Inventory = ({ user, onBackToHome, viewOnly = false, onRequestBorrow, onRequestRent }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [viewNote, setViewNote] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [requestStatuses, setRequestStatuses] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  useEffect(() => {
    if (openMenuId !== null) {
      // focus first menu item when opening
      const firstRef = menuRefs.current[openMenuId]?.[0];
      if (firstRef && firstRef.focus) firstRef.focus();
      const handleKey = (e) => {
        if (e.key === 'Escape') setOpenMenuId(null);
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [openMenuId]);


  // Initial inventory data with archived property
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Yamaha Black Snare Drum #01',
      category: 'percussion',
      subcategory: 'Snare Drums',
      brand: 'Yamaha',
      condition: 'Good',
      status: 'Available',
      notes: '',
      locations: [{ name: 'Shrine Hills, Matina', quantity: 1 }],
      archived: false
    },
    { id: 2, name: 'Yamaha Black Snare Drum #02', category: 'percussion', subcategory: 'Snare Drums', brand: 'Yamaha', condition: 'Good', status: 'Available', notes: '', locations: [{ name: 'Shrine Hills, Matina', quantity: 1 }], archived: false },
    { id: 3, name: 'Yamaha Black Snare Drum (Evans Drum Head) #03', category: 'percussion', subcategory: 'Snare Drums', brand: 'Yamaha', condition: 'Excellent', status: 'Available', notes: 'Evans drum head', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 4, name: 'Pearl Snare Drum Color White #01', category: 'percussion', subcategory: 'Snare Drums', brand: 'Pearl', condition: 'Good', status: 'Available', notes: 'White color', locations: [{ name: 'Shrine Hills, Matina', quantity: 0 }], archived: false },
    { id: 5, name: 'Pearl Snare Drum Color Dirt White #02', category: 'percussion', subcategory: 'Snare Drums', brand: 'Pearl', condition: 'Fair', status: 'Available', notes: 'Dirt white color', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 6, name: 'Lazer Bass Drum #01', category: 'percussion', subcategory: 'Bass Drums', brand: 'Lazer', condition: 'Good', status: 'Available', notes: 'Size 16', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 7, name: 'E-lance Bass Drum #02', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', notes: 'Size 20', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 8, name: 'E-lance Bass Drum #03', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', notes: 'Size 22', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 9, name: 'E-lance Bass Drum #04', category: 'percussion', subcategory: 'Bass Drums', brand: 'E-lance', condition: 'Good', status: 'Available', notes: 'Size 24', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 10, name: 'Fernando Bass Drum #002', category: 'percussion', subcategory: 'Bass Drums', brand: 'Fernando', condition: 'Good', status: 'Available', notes: 'Size 20', locations: [{ name: 'Shrine Hills, Matina', quantity: 1 }], archived: false },
    { id: 11, name: 'E-lance Percussion Black Tenor Drums', category: 'percussion', subcategory: 'Tenor Drums', brand: 'E-lance', condition: 'Good', status: 'Available', notes: 'Black color', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 12, name: 'Century Percussion White Tenor Drums', category: 'percussion', subcategory: 'Tenor Drums', brand: 'Century', condition: 'Good', status: 'Available', notes: 'White color', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 13, name: 'Zildjian Marching Cymbals', category: 'percussion', subcategory: 'Cymbals', brand: 'Zildjian', condition: 'Excellent', status: 'Available', notes: 'Marching cymbals', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 14, name: 'E-lance Percussion Marching Glockenspiel #01', category: 'percussion', subcategory: 'Other Percussion', brand: 'E-lance', condition: 'Good', status: 'Available', notes: 'Marching glockenspiel', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    {
      id: 15,
      name: 'E-lance Percussion Marching Glockenspiel #02',
      category: 'percussion',
      subcategory: 'Other Percussion',
      brand: 'E-lance',
      condition: 'Good',
      status: 'Available',
      notes: 'Marching glockenspiel',
      locations: [
        { name: 'Storage A', quantity: 10 },
        { name: 'Storage B', quantity: 5 }
      ],
      archived: false
    },
    { id: 16, name: 'Yamaha Clarinet', category: 'wind', subcategory: 'Woodwinds', brand: 'Yamaha', condition: 'Good', status: 'Available', notes: '', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false },
    { id: 17, name: 'Fernando Tuba', category: 'wind', subcategory: 'Brass', brand: 'Fernando', condition: 'Good', status: 'Available', notes: '', locations: [{ name: 'Shrine Hills, Matina', quantity: 2 }], archived: false }
  ]);

  // Load inventory from localStorage if present (persisted inventory)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dbeInventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) setInventory(parsed);
      }
    } catch (e) {
      // ignore parsing errors and keep default
    }
  }, []);

  // Persist inventory to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('dbeInventory', JSON.stringify(inventory));
    } catch (e) {}
  }, [inventory]);


  // Load and monitor borrow/rent request statuses
  React.useEffect(() => {
    const loadRequestStatuses = () => {
      const borrowReqs = JSON.parse(localStorage.getItem('borrowRequests') || '[]');
      const rentReqs = JSON.parse(localStorage.getItem('rentRequests') || '[]');

      const statuses = {};

      // Check borrow requests for this user
      borrowReqs.forEach(req => {
        if (req.userId === user?.id) {
          statuses[`borrow-${req.instrumentId}`] = req.status;
        }
      });

      // Check rent requests for this user
      rentReqs.forEach(req => {
        if (req.userId === user?.id) {
          statuses[`rent-${req.instrumentId}`] = req.status;
        }
      });

      setRequestStatuses(statuses);
    };

    loadRequestStatuses();

    // Listen for updates
    window.addEventListener('borrowRequestsUpdated', loadRequestStatuses);
    window.addEventListener('rentRequestsUpdated', loadRequestStatuses);

    return () => {
      window.removeEventListener('borrowRequestsUpdated', loadRequestStatuses);
      window.removeEventListener('rentRequestsUpdated', loadRequestStatuses);
    };
  }, [user?.id]);


  // Styles
  const styles = {
    container: {
      // removed visible container so inventory blends with parent layout
      minHeight: 'auto',
      background: 'transparent',
      padding: 0,
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },


    title: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '28px',
      fontWeight: '600',
      margin: 0,
      background: `linear-gradient(45deg, ${theme.palette.primary}, ${theme.palette.primaryDark})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    backButton: {
      backgroundColor: 'transparent',
      border: '1px solid #cbd5e1',
      color: '#0f172a',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    buttonContainer: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: 8
    },
    // Updated Stats row: closer together, bigger, centered content
    statsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px', // Reduced gap to move cards closer together
      margin: '0 auto 26px',
      alignItems: 'stretch',
      padding: '0 20px',
      boxSizing: 'border-box',
      justifyContent: 'space-between',
      maxWidth: '100%'
    },
    // Updated stat cards: bigger and centered content
    statCard: {
      flex: '1 1 160px', // Increased minimum width
      minWidth: 140, // Increased minimum width
      maxWidth: 200, // Increased maximum width
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '16px 14px', // Increased padding for bigger appearance
      textAlign: 'center', // Center all content
      transition: 'all 0.18s ease',
      minHeight: 90, // Increased height
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Center horizontally
      justifyContent: 'center', // Center vertically
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    statIcon: { 
      marginBottom: 8, // Consistent margin
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    statNumber: {
      fontSize: '22px', // Increased font size
      fontWeight: 700,
      color: '#0f172a',
      marginTop: 6,
      textAlign: 'center'
    },
    statLabel: {
      fontSize: '14px', // Slightly increased font size
      color: '#64748b',
      marginTop: 4,
      textAlign: 'center'
    },
    controls: {
      display: 'flex',
      justifyContent: 'flex-end', // move controls to the right so filter sits beside the button
      alignItems: 'center',
      marginBottom: '20px',
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
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '10px 16px',
      color: '#0f172a',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      minWidth: '250px'
    },
    filterSelect: {
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '10px 16px',
      color: '#0f172a',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      minWidth: '150px'
    },
    createButton: {
      background: 'linear-gradient(135deg, #1e40af 0%, #06b6d4 100%)',
      border: 'none',
      color: 'white',
      padding: '10px 20px',
      borderRadius: theme.borderRadius,
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
      backgroundColor: theme.palette.card,
      border: `1px solid ${theme.palette.border}`,
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.3s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    cardTitle: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fontWeight: '600',
      margin: '0 0 10px 0',
      color: '#0f172a'
    },
    cardDetail: {
      color: '#64748b',
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
      border: `1px solid ${theme.palette.primary}`,
      color: theme.palette.primary,
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
      border: `1px solid ${theme.palette.danger}`,
      color: theme.palette.danger,
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      minWidth: '70px'
    },
    /* Three-dot menu button */
    menuButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748b'
    },
    menuDropdown: {
      position: 'absolute',
      top: '36px',
      right: 0,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(2,6,23,0.12)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
      padding: '6px',
      alignItems: 'center'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 10px',
      fontSize: 14,
      color: '#0f172a',
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      borderRadius: 6
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '30px',
      width: '100%',
      maxWidth: '640px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxSizing: 'border-box'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      background: '#ffffff',
      zIndex: 10,
      paddingTop: 8
    },
    modalTitle: {
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '22px',
      fontWeight: '600',
      margin: 0,
      color: '#0f172a'
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#64748b',
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
      color: '#0f172a',
      fontSize: '14px',
      fontWeight: '500'
    },
    formInput: {
      backgroundColor: '#f8fafc',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#0f172a',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease'
    },

    modalFooter: {
      position: 'sticky',
      bottom: 0,
      background: '#ffffff',
      paddingTop: 12,
      paddingBottom: 12,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      boxShadow: '0 -8px 20px rgba(2,6,23,0.04)',
      zIndex: 12
    },
    formSelect: {
      backgroundColor: '#f8fafc',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#0f172a',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    formTextarea: {
      backgroundColor: '#f8fafc',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '10px 14px',
      color: '#0f172a',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease',
      minHeight: '80px',
      resize: 'vertical'
    },
    submitButton: {
      backgroundColor: '#3b82f6',
      border: '2px solid #3b82f6',
      color: '#ffffff',
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
      color: '#64748b'
    },
    // Add these for table/list view and archive
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      background: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
    },
    th: {
      color: '#3b82f6',
      fontWeight: 600,
      fontSize: '15px',
      padding: '12px 8px',
      borderBottom: '1px solid #e2e8f0',
      textAlign: 'left',
    },
    td: {
      color: '#0f172a',
      fontSize: '14px',
      padding: '10px 8px',
      borderBottom: '1px solid #f1f5f9',
      verticalAlign: 'middle',
    },
    archivedRow: {
      opacity: 0.5,
      background: '#f8fafc'
    },
    categoryHeader: {
      // removed background so header blends with page,
      // increased size and weight and left-aligned for emphasis
      background: 'transparent',
      color: '#60a5fa',
      fontWeight: 800,
      fontSize: '24px',
      padding: '6px 8px',
      borderBottom: 'none',
      marginBottom: '8px',
      textAlign: 'left'    // move label to left side
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
    },
    borrowButton: {
      backgroundColor: 'transparent',
      border: '1px solid #3b82f6',
      color: '#3b82f6',
      padding: '6px 14px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      minWidth: '100px'
    }
  };


  // Hover effect handlers
  const handleButtonHover = (e) => {
    e.target.style.backgroundColor = '#f1f5f9';
    e.target.style.borderColor = '#94a3b8';
    e.target.style.transform = 'translateY(-2px)';
  };


  const handleButtonLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.borderColor = '#cbd5e1';
    e.target.style.transform = 'translateY(0)';
  };


  const handleCreateButtonHover = (e) => {
    e.target.style.backgroundColor = '#1d4ed8';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
  };


  const handleCreateButtonLeave = (e) => {
    e.target.style.backgroundColor = '#3b82f6';
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };


  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
  };


  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#cbd5e1';
    e.target.style.boxShadow = 'none';
  };


  const handleStatCardHover = (e) => {
    e.target.style.transform = 'translateY(-4px)';
    e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
    e.target.style.borderColor = '#cbd5e1';
  };


  const handleStatCardLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    e.target.style.borderColor = '#e2e8f0';
  };


  const handleEditButtonHover = (e) => {
    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    e.target.style.borderColor = '#1d4ed8';
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
  };


  const handleEditButtonLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.borderColor = '#3b82f6';
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
    // If user is a member, show only available instruments
    if (user?.role !== 'admin' && item.status !== 'Available') return false;
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
    totalQuantity: inventory.filter(item => !item.archived).reduce((sum, item) => sum + (item.quantity || 0), 0),
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
    // Basic validation
    const errors = {};
    if (!editingItem?.name || editingItem.name.trim().length < 2) errors.name = 'Name is required (min 2 characters)';
    if (!editingItem?.brand || editingItem.brand.trim().length < 2) errors.brand = 'Brand is required';
    if (editingItem?.quantity !== '' && (isNaN(editingItem.quantity) || editingItem.quantity < 0)) errors.quantity = 'Quantity must be a positive number';

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    if (editingItem.id) {
      setInventory(inventory.map(item =>
        item.id === editingItem.id ? { ...editingItem, archived: item.archived } : item
      ));
    } else {
      const newItem = {
        ...editingItem,
        id: inventory.length ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
        archived: false
      };
      setInventory([...inventory, newItem]);
    }
    setEditingItem(null);
    setShowAddModal(false);
    setFormErrors({});
  };


  const handleAddNew = () => {
    setEditingItem({
      name: '',
      category: 'percussion',
      subcategory: '',
      brand: '',
      condition: 'Good',
      status: 'Available',
      notes: '',
      locations: [{ name: '', quantity: '' }],
      archived: false
    });
    setFormErrors({});
    setShowAddModal(true);
  };


  // Category display names
  const categoryNames = {
    percussion: 'Percussion',
    wind: 'Wind Instruments'
  };


  // Helper to get total quantity
  const getTotalQuantity = (item) =>
    item.locations?.reduce((sum, loc) => sum + (loc.quantity || 0), 0);


  return (
    <div style={styles.container}>
      {/* Stats Cards */}
      {!showArchived && (
        <div style={styles.statsContainer}>
          {/* First row */}
          <div style={styles.statCard}>
            <FaBoxOpen size={32} color="#60a5fa" style={styles.statIcon} />
            <div style={{ ...styles.statNumber, color: '#60a5fa' }}>{stats.total}</div>
            <div style={styles.statLabel}>Total Items</div>
          </div>
          <div style={styles.statCard}>
            <FaCheckCircle size={32} color="#22c55e" style={styles.statIcon} />
            <div style={{ ...styles.statNumber, color: '#22c55e' }}>{stats.available}</div>
            <div style={styles.statLabel}>Available</div>
          </div>
          <div style={styles.statCard}>
            <FaDrum size={32} color="#fbbf24" style={styles.statIcon} />
            <div style={{ ...styles.statNumber, color: '#fbbf24' }}>{stats.percussion}</div>
            <div style={styles.statLabel}>Percussion</div>
          </div>
          {/* Second row */}
          <div style={styles.statCard}>
            <FaWind size={32} color="#3b82f6" style={styles.statIcon} />
            <div style={{ ...styles.statNumber, color: '#3b82f6' }}>{stats.wind}</div>
            <div style={styles.statLabel}>Wind</div>
          </div>
          <div style={styles.statCard}>
            <FaTools size={32} color="#ef4444" style={styles.statIcon} />
            <div style={{ ...styles.statNumber, color: '#ef4444' }}>{stats.maintenance}</div>
            <div style={styles.statLabel}>Maintenance</div>
          </div>
          <div style={styles.statCard}>
            <FaBoxOpen size={32} color="#64ffda" style={styles.statIcon} />
            <div style={{ ...styles.statNumber, color: '#64ffda' }}>{stats.totalQuantity}</div>
            <div style={styles.statLabel}>Total Units</div>
          </div>
        </div>
      )}


      {/* Controls Section */}
      <div style={styles.controls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

          <div style={styles.buttonContainer}>
            {!viewOnly && (
              <button
                style={styles.createButton}
                onClick={handleAddNew}
                onMouseEnter={handleCreateButtonHover}
                onMouseLeave={handleCreateButtonLeave}
              >
                Add Instrument
              </button>
            )}
          </div>
        </div>
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
            // category header with right-aligned "Show Archived" for Percussion
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <div style={{
              ...styles.categoryHeader,
              textAlign: 'left',
              fontSize: '35px',
              fontWeight: 800,
              color: '#60a5fa',
              margin: 0
            }}>
              {categoryNames[cat] || cat}
            </div>

            {/* Show the archived toggle to the right of the Percussion header */}
            {!viewOnly && cat === 'percussion' && (
              <label style={{ fontSize: 15, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={() => setShowArchived(!showArchived)}
                  style={{ marginRight: 6 }}
                />
                Show Archived Instruments
              </label>
            )}
          </div>
          <table style={{ ...styles.table, marginTop: 0 }}>
            <thead>
              <tr>
                <th style={{ ...styles.th, textAlign: 'center' }}>Name</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Subcategory</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Brand</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Condition</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Quantity</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Primary Location</th>
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
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ fontWeight: '500', color: '#0f172a' }}>{getTotalQuantity(item)}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {(() => {
                      const primary = item.locations && item.locations.length
                        ? item.locations.find(l => Number(l.quantity) > 0) || item.locations[0]
                        : null;
                      return primary ? `${primary.name} (${primary.quantity})` : '—';
                    })()}
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
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        style={styles.menuButton}
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        aria-haspopup="true"
                        aria-expanded={openMenuId === item.id}
                        title="Actions"
                      >
                        <FaEllipsisH />
                      </button>

                      {openMenuId === item.id && (
                        <div style={styles.menuDropdown} onMouseLeave={() => setOpenMenuId(null)}>
                          {(() => {
                            // prepare refs container
                            if (!menuRefs.current[item.id]) menuRefs.current[item.id] = [];
                            const refs = menuRefs.current[item.id];
                            let idx = 0;
                            return (
                              <>
                                <button
                                  ref={el => { refs[0] = el; }}
                                  style={styles.menuItem}
                                  onClick={() => {
                                    setViewDetails(item);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <FaEye /> View
                                </button>
                                {!viewOnly && !showArchived && (
                                  <button
                                    ref={el => { refs[1] = el; }}
                                    style={styles.menuItem}
                                    onClick={() => {
                                      handleEdit(item);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <FaEdit /> Edit
                                  </button>
                                )}
                                {viewOnly && item.status === 'Available' && (onRequestBorrow || onRequestRent) && (
                                  <button
                                    ref={el => { refs[2] = el; }}
                                    style={styles.menuItem}
                                    onClick={() => {
                                      const requestType = onRequestBorrow ? 'borrow' : 'rent';
                                      const statusKey = `${requestType}-${item.id}`;
                                      if (onRequestBorrow) onRequestBorrow(item.id, item.name);
                                      if (onRequestRent) onRequestRent(item.id, item.name);
                                      setRequestStatuses(prev => ({ ...prev, [statusKey]: 'pending' }));
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    {onRequestBorrow ? <><FaBoxOpen /> Request</> : <><FaBoxOpen /> Request</>}
                                  </button>
                                )}
                                <button
                                  ref={el => { refs[3] = el; }}
                                  style={styles.menuItem}
                                  onClick={() => {
                                    if (showArchived) handleUnarchive(item.id);
                                    else handleArchive(item.id);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  {showArchived ? <><FaUndo /> Unarchive</> : <><FaArchive /> Archive</>}
                                </button>
                              </>
                            );
                          })()}
                        </div>
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
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 520px', minWidth: 360 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Instrument Name</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editingItem?.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    />
                    {formErrors.name && <div style={{ color: '#ef4444', marginTop: 6 }}>{formErrors.name}</div>}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
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

                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Brand</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={editingItem?.brand || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                    />
                    {formErrors.brand && <div style={{ color: '#ef4444', marginTop: 6 }}>{formErrors.brand}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Quantity</label>
                    <input
                      type="number"
                      style={styles.formInput}
                      value={editingItem?.quantity || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                        if (value < 0) return;
                        setEditingItem({ ...editingItem, quantity: value || '' });
                      }}
                      min="0"
                      step="0.1"
                      placeholder="Enter quantity"
                    />
                    {formErrors.quantity && <div style={{ color: '#ef4444', marginTop: 6 }}>{formErrors.quantity}</div>}
                  </div>

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
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={styles.formLabel}>Status</label>
                  <select
                    style={{ ...styles.formSelect, width: '220px' }}
                    value={editingItem?.status || 'Available'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ flex: '1 1 260px', minWidth: 260 }}>
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Notes</label>
                  <textarea
                    style={{ ...styles.formTextarea, minHeight: 160 }}
                    value={editingItem?.notes || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    placeholder="Additional notes about the instrument..."
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={styles.formLabel}>Locations</label>
                  <div>
                    {editingItem?.locations?.map((loc, index) => (
                      <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          style={{ ...styles.formInput, flex: 1 }}
                          value={loc.name}
                          onChange={(e) => {
                            const newLocations = [...editingItem.locations];
                            newLocations[index].name = e.target.value;
                            setEditingItem({ ...editingItem, locations: newLocations });
                          }}
                          placeholder="Location name"
                        />
                        <input
                          type="number"
                          style={{ ...styles.formInput, width: '120px' }}
                          value={loc.quantity}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                            if (value < 0) return;
                            const newLocations = [...editingItem.locations];
                            newLocations[index].quantity = value || '';
                            setEditingItem({ ...editingItem, locations: newLocations });
                          }}
                          min="0"
                          step="0.1"
                          placeholder="Qty"
                        />
                        <button
                          style={{
                            ...styles.deleteButton,
                            padding: '8px 12px',
                            minWidth: '40px',
                            display: loc.name ? 'flex' : 'none',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => {
                            const newLocations = editingItem.locations.filter((_, i) => i !== index);
                            setEditingItem({ ...editingItem, locations: newLocations });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      style={{
                        ...styles.createButton,
                        padding: '10px 20px',
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        const newLocation = { name: '', quantity: '' };
                        setEditingItem({ ...editingItem, locations: [...editingItem.locations, newLocation] });
                      }}
                    >
                      + Add Location
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div style={styles.modalFooter}>
              <button
                style={{ ...styles.closeButton, background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: 8 }}
                onClick={() => { setEditingItem(null); setShowAddModal(false); setFormErrors({}); }}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.submitButton, padding: '10px 20px' }}
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
      <div style={{ ...styles.modalContent, color: '#0f172a' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Full Note</h2>
              <button style={styles.closeButton} onClick={() => setViewNote(null)}>×</button>
            </div>
            <div style={{ color: '#0f172a', fontSize: 15, whiteSpace: 'pre-wrap' }}>
              {viewNote}
            </div>
          </div>
        </div>
      )}


      {viewDetails && (
        <div style={styles.modalOverlay} onClick={() => setViewDetails(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Instrument Details</h2>
              <button style={styles.closeButton} onClick={() => setViewDetails(null)}>×</button>
            </div>
            <div style={{ color: '#0f172a', fontSize: 15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '10px 20px', alignItems: 'start' }}>
                <div style={{ fontWeight: 700, color: '#475569' }}>Name</div>
                <div style={{ fontWeight: 600 }}>{viewDetails.name}</div>

                <div style={{ fontWeight: 700, color: '#475569' }}>Category</div>
                <div>{categoryNames[viewDetails.category] || viewDetails.category}</div>

                <div style={{ fontWeight: 700, color: '#475569' }}>Subcategory</div>
                <div>{viewDetails.subcategory}</div>

                <div style={{ fontWeight: 700, color: '#475569' }}>Brand</div>
                <div>{viewDetails.brand}</div>

                <div style={{ fontWeight: 700, color: '#475569' }}>Condition</div>
                <div>{viewDetails.condition}</div>

                <div style={{ fontWeight: 700, color: '#475569' }}>Status</div>
                <div>{viewDetails.status}</div>

                <div style={{ fontWeight: 700, color: '#475569' }}>Notes</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{viewDetails.notes || '—'}</div>

                <div style={{ fontWeight: 700, color: '#475569' }}>Locations</div>
                <div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {viewDetails.locations.map((loc, idx) => (
                      <li key={idx}>{loc.name}: {loc.quantity}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 8 }}><strong>Total Quantity:</strong> {getTotalQuantity(viewDetails)}</div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Primary Location:</strong>{' '}
                    {(() => {
                      const primary = viewDetails.locations && viewDetails.locations.length
                        ? viewDetails.locations.find(l => Number(l.quantity) > 0) || viewDetails.locations[0]
                        : null;
                      return primary ? `${primary.name} (${primary.quantity})` : '—';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Inventory;
