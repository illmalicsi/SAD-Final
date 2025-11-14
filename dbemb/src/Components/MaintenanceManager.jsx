import React, { useState, useEffect, useMemo } from 'react';
import AuthService from '../services/authService';
import StyledSelect from './StyledSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWrench,
  faSyncAlt,
  faPlus,
  faChartBar,
  faCoins,
  faChartLine,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const MaintenanceManager = ({ user, onBackToHome }) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [instrumentItems, setInstrumentItems] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [stats, setStats] = useState({});
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchInstrumentItems();
    fetchInstruments();
    fetchStats();
    fetchUpcomingMaintenance();
  }, []);

  const fetchMaintenanceRecords = async () => {
    setLoading(true);
    try {
      const response = await AuthService.get('/maintenance');
      setMaintenanceRecords(response.records || []);
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstrumentItems = async () => {
    try {
      const response = await AuthService.get('/instrument-items');
      setInstrumentItems(response.items || []);
    } catch (err) {
      console.error('Error fetching instrument items:', err);
    }
  };

  const fetchInstruments = async () => {
    try {
      const response = await AuthService.get('/instruments');
      // accept several common shapes from backend: .instruments, .items, .data
      setInstruments(response.instruments || response.items || response.data || []);
    } catch (err) {
      console.error('Error fetching instruments:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await AuthService.get('/maintenance/stats/summary');
      setStats(response.stats || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchUpcomingMaintenance = async () => {
    try {
      const response = await AuthService.get('/maintenance/upcoming/scheduled');
      setUpcomingMaintenance(response.upcoming || []);
    } catch (err) {
      console.error('Error fetching upcoming maintenance:', err);
    }
  };

  const handleAddRecord = async (recordData) => {
    try {
      await AuthService.post('/maintenance', recordData);
      setShowAddModal(false);
      fetchMaintenanceRecords();
      fetchStats();
      fetchUpcomingMaintenance();
    } catch (err) {
      alert('Failed to add maintenance record: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUpdateRecord = async (recordId, recordData) => {
    try {
      await AuthService.put(`/maintenance/${recordId}`, recordData);
      setEditingRecord(null);
      fetchMaintenanceRecords();
      fetchStats();
    } catch (err) {
      alert('Failed to update record: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter(r => {
      const q = search.trim().toLowerCase();
      if (q) {
        return (r.instrument_serial_number || '').toLowerCase().includes(q) || 
               (r.description || '').toLowerCase().includes(q);
      }
      return true;
    }).filter(r => (filterStatus ? r.status === filterStatus : true));
  }, [maintenanceRecords, search, filterStatus]);

  // Derived stats from maintenanceRecords as a fallback in case backend doesn't provide or lags
  const derivedStats = useMemo(() => {
    const totalRecords = (maintenanceRecords || []).length;
    let routineCount = 0;
    let repairCount = 0;
    let totalCost = 0;
    (maintenanceRecords || []).forEach(r => {
      const t = r.maintenance_type || '';
      if (String(t).toLowerCase().includes('routine')) routineCount += 1;
      if (String(t).toLowerCase().includes('repair')) repairCount += 1;
      const c = parseFloat(r.cost);
      if (!Number.isNaN(c)) totalCost += c;
    });
    const avgCost = totalRecords > 0 ? (totalCost / totalRecords) : 0;
    return {
      totalRecords,
      routineCount,
      repairCount,
      totalCost,
      avgCost
    };
  }, [maintenanceRecords]);

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '32px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    titleIcon: {
      width: '48px',
      height: '48px',
      backgroundColor: '#06b6d4',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '20px'
    },
    titleContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0
    },
    headerControls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchInput: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      minWidth: '280px',
      fontSize: '14px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
      border: 'none',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
      transition: 'all 0.2s ease'
    },
    secondaryButton: {
      background: 'transparent',
      border: '1px solid #e2e8f0',
      color: '#475569',
      padding: '10px 16px',
      borderRadius: '10px',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.2s ease'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px'
    },
    statContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    statLabel: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '8px'
    },
    tab: {
      padding: '12px 24px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#64748b',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    activeTab: {
      backgroundColor: '#06b6d4',
      color: 'white',
      boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)'
    },
    contentSection: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #f1f5f9',
      marginBottom: '24px'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#0f172a',
      margin: 0
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '20px'
    },
    recordCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #f1f5f9',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px'
    },
    instrumentInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    serialNumber: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    dateText: {
      fontSize: '13px',
      color: '#64748b',
      margin: 0
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    description: {
      fontSize: '14px',
      color: '#475569',
      lineHeight: '1.5',
      margin: 0,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '12px',
      borderTop: '1px solid #f1f5f9'
    },
    cost: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    editButton: {
      background: 'transparent',
      border: '1px solid #e2e8f0',
      color: '#475569',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    upcomingCard: {
      backgroundColor: '#fffbeb',
      border: '1px solid #fef3c7',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    upcomingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    upcomingTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#92400e',
      margin: 0
    },
    upcomingDate: {
      fontSize: '14px',
      color: '#d97706',
      fontWeight: '600',
      margin: 0
    },
    upcomingDescription: {
      fontSize: '14px',
      color: '#92400e',
      lineHeight: '1.5',
      margin: 0
    },
    loadingState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 20px',
      color: '#64748b',
      fontSize: '16px'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      color: '#64748b'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      opacity: 0.5
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '32px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#0f172a',
      margin: 0
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: '#64748b',
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    input: {
      width: '100%',
      backgroundColor: '#f8fafc',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      padding: '12px 16px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease'
    },
    textarea: {
      width: '100%',
      backgroundColor: '#f8fafc',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      padding: '12px 16px',
      fontSize: '14px',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit'
    },
    submitButton: {
      background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
      border: 'none',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      width: '100%',
      marginTop: '8px',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Routine': return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' };
      case 'Repair': return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' };
      case 'Emergency': return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' };
      case 'Inspection': return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' };
      default: return { backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    }
  };

  // Resolve instrument name and serial from instrumentItems (and fallback to instruments)
  const getInstrumentName = (record) => {
    if (!record) return '';
    // try to find matching instrument item first
    const match = (instrumentItems || []).find(i => {
      if (record.instrument_item_id && String(i.item_id) === String(record.instrument_item_id)) return true;
      if (i.serial_number && record.instrument_serial_number && String(i.serial_number) === String(record.instrument_serial_number)) return true;
      return false;
    });
    if (match) {
      // some APIs may include instrument_name on the item; otherwise resolve via instruments list
      if (match.instrument_name) return match.instrument_name;
      if (match.name) return match.name;
      if (match.instrument_id) {
        const inst = (instruments || []).find(it => String(it.instrument_id || it.id) === String(match.instrument_id));
        if (inst) return inst.name || inst.instrument_name || '';
      }
    }

    // fallback: if record itself includes instrument name fields
    if (record.instrument_name) return record.instrument_name;
    if (record.name) return record.name;

    return '';
  };

  const getInstrumentSerial = (record) => {
    if (!record) return '';
    const match = (instrumentItems || []).find(i => {
      if (record.instrument_item_id && String(i.item_id) === String(record.instrument_item_id)) return true;
      if (i.serial_number && record.instrument_serial_number && String(i.serial_number) === String(record.instrument_serial_number)) return true;
      return false;
    });
    if (match && (match.serial_number || match.serial)) return match.serial_number || match.serial;
    // fallback to any serial on the record
    if (record.instrument_serial_number) return record.instrument_serial_number;
    if (record.serial_number) return record.serial_number;
    return '';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' };
      case 'Scheduled': return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' };
      case 'In Progress': return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' };
      case 'Cancelled': return { backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
      default: return { backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    }
  };

  const getStatIconStyle = (index) => {
    const colors = ['#06b6d4', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'];
    return { backgroundColor: `${colors[index]}15`, color: colors[index] };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerControls}>
          <input
            style={styles.searchInput}
            placeholder="Search by serial number or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
            onBlur={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
          />
          <StyledSelect 
            style={{ ...styles.input, minWidth: '160px' }} 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </StyledSelect>
          <button
            style={styles.secondaryButton}
            onClick={fetchMaintenanceRecords}
            aria-label="Refresh"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
            <span style={{ marginLeft: 8 }}>Refresh</span>
          </button>
          <button
            style={styles.primaryButton}
            onClick={() => setShowAddModal(true)}
            aria-label="Add Maintenance"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span style={{ marginLeft: 8 }}>Add Maintenance</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Records', value: (stats.totalRecords ?? derivedStats.totalRecords) || 0, icon: faChartBar },
          { label: 'Routine', value: (stats.routineCount ?? derivedStats.routineCount) || 0, icon: faSyncAlt },
          { label: 'Repairs', value: (stats.repairCount ?? derivedStats.repairCount) || 0, icon: faWrench },
          {
            label: 'Total Cost',
            value: (stats.totalCost != null ? `₱${parseFloat(stats.totalCost).toLocaleString()}` : `₱${derivedStats.totalCost.toLocaleString()}`) || '₱0',
            icon: faCoins
          },
          {
            label: 'Avg Cost',
            value: (stats.avgCost != null ? `₱${parseFloat(stats.avgCost).toLocaleString()}` : `₱${parseFloat(derivedStats.avgCost).toLocaleString()}`) || '₱0',
            icon: faChartLine
          }
        ].map((stat, index) => (
          <div key={stat.label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, ...getStatIconStyle(index) }}>
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'history' && styles.activeTab) }}
          onClick={() => setActiveTab('history')}
        >
          Maintenance History
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'upcoming' && styles.activeTab) }}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Maintenance
        </button>
      </div>

      {/* Content */}
      {activeTab === 'history' ? (
        <div style={styles.contentSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Maintenance History</h2>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingState}>
              <div>Loading maintenance records...</div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <FontAwesomeIcon icon={faWrench} />
              </div>
              <h3 style={{ color: '#475569', marginBottom: '8px' }}>No maintenance records found</h3>
              <p style={{ color: '#64748b', margin: 0 }}>
                {search || filterStatus ? 'Try adjusting your search or filters' : 'Get started by adding your first maintenance record'}
              </p>
            </div>
          ) : (
            <div style={styles.cardGrid}>
              {filteredRecords.map(record => {
                const name = getInstrumentName(record);
                const serial = getInstrumentSerial(record);
                const title = name && serial ? `${name} — ${serial}` : (name || serial || 'Unknown instrument');
                return (
                <div key={record.maintenance_id} style={styles.recordCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.instrumentInfo}>
                      {/* Combined instrument name and serial, bold and slightly larger */}
                      <div style={styles.serialNumber}>
                        <span>{title}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        {new Date(record.completed_date || record.scheduled_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ ...styles.statusBadge, ...getTypeStyle(record.maintenance_type) }}>
                      {record.maintenance_type}
                    </div>
                  </div>
                  
                  <div style={styles.cardContent}>
                    <p style={styles.description}>{record.description}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ ...styles.statusBadge, ...getStatusStyle(record.status) }}>
                        {record.status}
                      </div>
                      {record.performed_by_name && (
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          By: {record.performed_by_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.cost}>
                      {record.cost ? `₱${parseFloat(record.cost).toLocaleString()}` : 'No cost'}
                    </div>
                    <button 
                      style={styles.editButton}
                      onClick={() => setEditingRecord(record)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      ) : (
        <div style={styles.contentSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Upcoming Maintenance</h2>
          </div>

          {upcomingMaintenance.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <h3 style={{ color: '#475569', marginBottom: '8px' }}>No upcoming maintenance</h3>
              <p style={{ color: '#64748b', margin: 0 }}>
                All caught up! Schedule new maintenance as needed.
              </p>
            </div>
          ) : (
            <div style={styles.cardGrid}>
              {upcomingMaintenance.map(record => {
                const name = getInstrumentName(record);
                const serial = getInstrumentSerial(record);
                const title = name && serial ? `${name} — ${serial}` : (name || serial || 'Unknown instrument');
                return (
                <div key={record.maintenance_id} style={styles.upcomingCard}>
                  <div style={styles.upcomingHeader}>
                    <div style={styles.upcomingTitle}>
                      <span>{title}</span>
                    </div>
                    <div style={styles.upcomingDate}>
                      {new Date(record.scheduled_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.upcomingDescription}>
                    <strong>{record.maintenance_type}</strong>: {record.description}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingRecord) && (
        <MaintenanceModal
          record={editingRecord}
          instrumentItems={instrumentItems}
          onClose={() => {
            setShowAddModal(false);
            setEditingRecord(null);
          }}
          onSave={(data) => {
            if (editingRecord) {
              handleUpdateRecord(editingRecord.maintenance_id, data);
            } else {
              handleAddRecord(data);
            }
          }}
          styles={styles}
        />
      )}
    </div>
  );
};

// Maintenance Modal Component (keep the same as original)
const MaintenanceModal = ({ record, instrumentItems, onClose, onSave, styles }) => {
  const [formData, setFormData] = useState({
    instrument_item_id: record?.instrument_item_id || '',
    maintenance_type: record?.maintenance_type || 'Routine',
    description: record?.description || '',
    cost: record?.cost || '',
    performed_by_name: record?.performed_by_name || '',
    scheduled_date: record?.scheduled_date || '',
    completed_date: record?.completed_date || '',
    next_maintenance_date: record?.next_maintenance_date || '',
    status: record?.status || 'Scheduled',
    parts_replaced: record?.parts_replaced || '',
    before_condition: record?.before_condition || '',
    after_condition: record?.after_condition || '',
    notes: record?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {record ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
          </h2>
          <button 
            style={styles.closeButton}
            onClick={onClose}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Instrument Item *</label>
            <StyledSelect
              style={styles.input}
              value={formData.instrument_item_id}
              onChange={(e) => setFormData({ ...formData, instrument_item_id: e.target.value })}
              required
            >
              <option value="">Select Instrument Item</option>
              {instrumentItems.map(item => (
                <option key={item.item_id} value={item.item_id}>
                  {item.serial_number} - {item.instrument_name}
                </option>
              ))}
            </StyledSelect>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Maintenance Type *</label>
            <StyledSelect
              style={styles.input}
              value={formData.maintenance_type}
              onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
              required
            >
              <option value="Routine">Routine</option>
              <option value="Repair">Repair</option>
              <option value="Emergency">Emergency</option>
              <option value="Inspection">Inspection</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Part Replacement">Part Replacement</option>
              <option value="Other">Other</option>
            </StyledSelect>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              style={styles.textarea}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Describe the maintenance work..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cost</label>
            <input
              style={styles.input}
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Performed By</label>
            <input
              style={styles.input}
              type="text"
              value={formData.performed_by_name}
              onChange={(e) => setFormData({ ...formData, performed_by_name: e.target.value })}
              placeholder="Technician name"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Scheduled Date</label>
              <input
                style={styles.input}
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Completed Date</label>
              <input
                style={styles.input}
                type="date"
                value={formData.completed_date}
                onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Next Maintenance Date</label>
            <input
              style={styles.input}
              type="date"
              value={formData.next_maintenance_date}
              onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Status</label>
            <StyledSelect
              style={styles.input}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </StyledSelect>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Parts Replaced</label>
            <textarea
              style={styles.textarea}
              value={formData.parts_replaced}
              onChange={(e) => setFormData({ ...formData, parts_replaced: e.target.value })}
              placeholder="List parts that were replaced..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Before Condition</label>
              <StyledSelect
                style={styles.input}
                value={formData.before_condition}
                onChange={(e) => setFormData({ ...formData, before_condition: e.target.value })}
              >
                <option value="">Select Condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Needs Repair">Needs Repair</option>
              </StyledSelect>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>After Condition</label>
              <StyledSelect
                style={styles.input}
                value={formData.after_condition}
                onChange={(e) => setFormData({ ...formData, after_condition: e.target.value })}
              >
                <option value="">Select Condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Needs Repair">Needs Repair</option>
              </StyledSelect>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Notes</label>
            <textarea
              style={styles.textarea}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>

          <button 
            style={styles.submitButton}
            type="submit"
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {record ? 'Update Record' : 'Add Record'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceManager;