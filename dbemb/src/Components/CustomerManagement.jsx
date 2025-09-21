import React, { useState, useEffect, useMemo } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaClock,
  FaBookOpen,
  FaChartBar,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEye,
  FaTimes,
  FaSearch,
  FaFilter,
  FaThumbsUp,
  FaThumbsDown,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaArchive,
  FaUndo
} from "react-icons/fa";

const CustomerManagement = ({ bookingsData = [] }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lastBooking");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState("cards");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [customerStatusOverrides, setCustomerStatusOverrides] = useState(new Map());

  // Static booking data - this will be replaced by props from your booking system
  const defaultBookingsData = [
    {
      id: 1,
      service: 'Band Gigs',
      name: 'Bongbong Marky',
      email: 'magnanakaw@gmail.com',
      phone: '+63 912 345 6789',
      location: 'Ilocos Norte',
      notes: 'Birthday ni BWS',
      date: '2025-09-25',
      startTime: '14:00',
      endTime: '18:00',
      createdAt: '2025-09-17T10:00:00.000Z',
      status: 'approved'
    },
    {
      id: 2,
      service: 'Music Workshops',
      name: 'Justin Nabunturan',
      email: 'justin@gmail.com',
      phone: '+63 917 654 3210',
      location: 'Nabunturan City',
      notes: 'Saxophone practice for idol Justin',
      date: '2025-09-26',
      startTime: '10:00',
      endTime: '12:00',
      createdAt: '2025-09-17T11:00:00.000Z',
      status: 'pending'
    },
    {
      id: 3,
      service: 'Band Gigs',
      name: 'Ivan Louie Malicsi',
      email: 'ilim@gmail.com',
      phone: '+63 920 111 2222',
      location: 'Jollibee Toril', 
      notes: 'Farewell party (yoko na sa Davao)',
      date: '2025-09-26',
      startTime: '15:00',
      endTime: '19:00',
      createdAt: '2025-09-17T12:00:00.000Z',
      status: 'pending'
    }
  ];

  // State to hold all booking data
  const [allBookingsData, setAllBookingsData] = useState([]);

  // Load bookings from localStorage
  const getStoredBookings = () => {
    try {
      const stored = localStorage.getItem('dbeBookings');
      if (stored && stored !== 'undefined' && stored !== 'null') {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading bookings from localStorage:', error);
    }
    return [];
  };

  // Load customer status overrides from memory
  const loadCustomerOverrides = () => {
    // In a real app, this would come from a database or persistent storage
    // For now, we'll keep it in component state
    return new Map();
  };

  // Load and combine all booking data
  useEffect(() => {
    const loadAllBookings = () => {
      const storedBookings = getStoredBookings();
      console.log('CustomerManagement: Raw stored bookings:', storedBookings);
      
      // Always use stored bookings if they exist, otherwise use default data
      const combinedData = storedBookings.length > 0 ? storedBookings : defaultBookingsData;
      setAllBookingsData(combinedData);
      console.log('CustomerManagement: Final bookings data:', combinedData.length, 'bookings');
    };

    // Load data initially
    loadAllBookings();

    const handleStorageChange = () => {
      console.log('CustomerManagement: Storage change detected');
      loadAllBookings();
    };

    const handleBookingsUpdated = () => {
      console.log('CustomerManagement: Received bookingsUpdated event');
      loadAllBookings();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookingsUpdated', handleBookingsUpdated);
    
    // Check for changes more frequently
    const interval = setInterval(() => {
      loadAllBookings();
    }, 1000); // Check every 1 second

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingsUpdated', handleBookingsUpdated);
      clearInterval(interval);
    };
  }, [refreshTrigger]);

  // Convert booking data to customer data
  useEffect(() => {
    if (allBookingsData.length === 0) return; // Don't process if no data
    
    const customerMap = new Map();
    
    allBookingsData.forEach(booking => {
      const customerKey = booking.email;
      
      if (customerMap.has(customerKey)) {
        const existing = customerMap.get(customerKey);
        existing.bookings.push(booking);
        existing.totalBookings += 1;
        existing.totalRevenue += booking.estimatedValue || 5000;
        
        if (new Date(booking.date) > new Date(existing.lastBooking)) {
          existing.lastBooking = booking.date;
          existing.lastService = booking.service;
        }
        
        // Only update status from bookings if no manual override exists
        if (!customerStatusOverrides.has(customerKey)) {
          const statusPriority = { approved: 4, pending: 3, rejected: 2, cancelled: 1 };
          const currentPriority = statusPriority[existing.status] || 0;
          const newPriority = statusPriority[booking.status] || 0;
          
          if (newPriority > currentPriority) {
            existing.status = booking.status === 'approved' ? 'active' : booking.status;
          }
        }
      } else {
        const customerEmail = booking.email;
        const overrideStatus = customerStatusOverrides.get(customerEmail);
        const defaultStatus = booking.status === 'approved' ? 'active' : booking.status;
        
        customerMap.set(customerKey, {
          id: customerMap.size + 1,
          name: booking.name.trim(),
          email: booking.email,
          phone: booking.phone || 'N/A',
          service: booking.service,
          status: overrideStatus || defaultStatus,
          totalBookings: 1,
          bookings: [booking],
          address: booking.location,
          lastBooking: booking.date,
          lastService: booking.service,
          joinDate: booking.createdAt.split('T')[0],
          totalRevenue: booking.estimatedValue || 5000,
          preferredServices: [booking.service],
          notes: booking.notes || ''
        });
      }
    });
    
    // Apply any existing status overrides
    customerStatusOverrides.forEach((status, email) => {
      const customer = Array.from(customerMap.values()).find(c => c.email === email);
      if (customer) {
        customer.status = status;
      }
    });
    
    customerMap.forEach(customer => {
      const serviceCount = {};
      customer.bookings.forEach(booking => {
        serviceCount[booking.service] = (serviceCount[booking.service] || 0) + 1;
      });
      customer.preferredServices = Object.keys(serviceCount).sort((a, b) => serviceCount[b] - serviceCount[a]);
    });
    
    setCustomers(Array.from(customerMap.values()));
  }, [allBookingsData, customerStatusOverrides]); // Re-run when allBookingsData or overrides change

  // Enhanced filtering and sorting
  useEffect(() => {
    let filtered = customers.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    } else {
      // When showing "all", exclude archived customers by default
      filtered = filtered.filter((c) => c.status !== "archived");
    }
    
    if (serviceFilter !== "all") {
      filtered = filtered.filter((c) => 
        c.bookings.some(booking => booking.service === serviceFilter)
      );
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'lastBooking':
          aVal = new Date(a.lastBooking);
          bVal = new Date(b.lastBooking);
          break;
        case 'totalBookings':
          aVal = a.totalBookings;
          bVal = b.totalBookings;
          break;
        case 'totalRevenue':
          aVal = a.totalRevenue;
          bVal = b.totalRevenue;
          break;
        case 'joinDate':
          aVal = new Date(a.joinDate);
          bVal = new Date(b.joinDate);
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter, serviceFilter, sortBy, sortOrder]);

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.status === "active").length,
      pending: customers.filter((c) => c.status === "pending").length,
      rejected: customers.filter((c) => c.status === "rejected").length,
      cancelled: customers.filter((c) => c.status === "cancelled").length,
      archived: customers.filter((c) => c.status === "archived").length,
      totalBookings: customers.reduce((a, c) => a + c.totalBookings, 0),
      totalRevenue: customers.reduce((a, c) => a + c.totalRevenue, 0),
      avgBookingsPerCustomer:
        customers.length > 0
          ? (customers.reduce((a, c) => a + c.totalBookings, 0) / customers.length).toFixed(1)
          : 0,
      avgRevenuePerCustomer:
        customers.length > 0
          ? (customers.reduce((a, c) => a + c.totalRevenue, 0) / customers.length).toFixed(0)
          : 0,
    }),
    [customers]
  );

  const services = [...new Set(allBookingsData.map(b => b.service))];

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleManualRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    showNotification("Data refreshed successfully!", "success");
  };

  const updateCustomerStatus = (email, newStatus) => {
    setCustomerStatusOverrides(prev => {
      const newMap = new Map(prev);
      newMap.set(email, newStatus);
      return newMap;
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleApprove = (customer) => {
    setIsProcessing(true);
    setTimeout(() => {
      updateCustomerStatus(customer.email, 'active');
      setIsProcessing(false);
      showNotification(`${customer.name} approved successfully!`, "success");
    }, 500);
  };

  const handleReject = (customer) => {
    setIsProcessing(true);
    setTimeout(() => {
      updateCustomerStatus(customer.email, 'rejected');
      setIsProcessing(false);
      showNotification(`${customer.name} rejected.`, "error");
    }, 500);
  };

  const handleArchive = (customer) => {
    setIsProcessing(true);
    setTimeout(() => {
      updateCustomerStatus(customer.email, 'archived');
      setIsProcessing(false);
      showNotification(`${customer.name} archived successfully!`, "success");
    }, 500);
  };

  const handleUnarchive = (customer) => {
    setIsProcessing(true);
    setTimeout(() => {
      updateCustomerStatus(customer.email, 'active');
      setIsProcessing(false);
      showNotification(`${customer.name} unarchived successfully!`, "success");
    }, 500);
  };

  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Status', 'Total Bookings', 'Last Booking', 'Total Revenue', 'Address'],
      ...filteredCustomers.map(c => [
        c.name, c.email, c.phone, c.status, c.totalBookings, 
        formatDate(c.lastBooking), `₱${c.totalRevenue.toLocaleString()}`, c.address
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification("Data exported successfully!", "success");
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "#22c55e",
      pending: "#f59e0b",
      cancelled: "#ef4444",
      rejected: "#ef4444",
      archived: "#6b7280",
    };
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
          backgroundColor: colors[status] + "33",
          color: colors[status],
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString()}`;
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a192f, #020617)",
      padding: "20px",
      color: "#e5e7eb",
      fontFamily: "system-ui, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      flexWrap: "wrap",
      gap: "16px"
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#64ffda",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    button: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "transparent",
      border: "1px solid rgba(100, 255, 218, 0.3)",
      color: "#e5e7eb",
      padding: "8px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      transition: "all 0.3s ease",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "20px",
      marginBottom: "30px",
    },
    statCard: {
      backgroundColor: "rgba(10, 25, 47, 0.6)",
      border: "1px solid rgba(100, 255, 218, 0.15)",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
      transition: "transform 0.2s ease, border-color 0.2s ease",
      cursor: "pointer"
    },
    filterBar: {
      display: "flex",
      gap: "12px",
      marginBottom: "25px",
      alignItems: "center",
      flexWrap: "wrap",
      background: "rgba(10, 25, 47, 0.4)",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid rgba(100, 255, 218, 0.1)"
    },
    input: {
      flex: 1,
      minWidth: "200px",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid rgba(100,255,218,0.2)",
      backgroundColor: "rgba(15,30,60,0.7)",
      color: "#e5e7eb",
      fontSize: "14px"
    },
    select: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid rgba(100,255,218,0.2)",
      backgroundColor: "rgba(15,30,60,0.7)",
      color: "#e5e7eb",
      minWidth: "120px"
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "20px",
    },
    customerCard: {
      background: "rgba(15, 30, 60, 0.8)",
      border: "1px solid rgba(100, 255, 218, 0.15)",
      borderRadius: "14px",
      padding: "20px",
      transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      cursor: "pointer"
    },
    notification: {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "16px 24px",
      borderRadius: "8px",
      color: "#fff",
      fontWeight: "500",
      zIndex: 10000,
      minWidth: "280px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
    },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      backdropFilter: "blur(4px)"
    },
    modal: {
      background: "rgba(10, 25, 47, 0.95)",
      padding: "32px",
      borderRadius: "16px",
      width: "600px",
      maxWidth: "90vw",
      color: "#e5e7eb",
      maxHeight: "85vh",
      overflowY: "auto",
      border: "1px solid rgba(100, 255, 218, 0.2)"
    },
    actionBtn: {
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginRight: "8px",
      background: "#1e293b",
      color: "#fff",
      transition: "all 0.2s",
    },
    rejectBtn: {
      background: "#ef4444",
      color: "#fff",
    },
    approveBtn: {
      background: "#22c55e",
      color: "#fff",
    },
    archiveBtn: {
      background: "#6b7280",
      color: "#fff",
    },
    unarchiveBtn: {
      background: "#8b5cf6",
      color: "#fff",
    },
    bookingItem: {
      background: "rgba(30, 41, 59, 0.5)",
      padding: "16px",
      borderRadius: "10px",
      marginBottom: "12px",
      border: "1px solid rgba(100, 255, 218, 0.1)",
    },
    viewToggle: {
      display: "flex",
      gap: "4px",
      background: "rgba(15, 30, 60, 0.8)",
      padding: "4px",
      borderRadius: "8px",
      border: "1px solid rgba(100, 255, 218, 0.2)"
    },
    toggleBtn: {
      padding: "8px 16px",
      background: "transparent",
      border: "none",
      color: "#94a3b8",
      cursor: "pointer",
      borderRadius: "6px",
      transition: "all 0.2s ease",
      fontSize: "14px"
    },
    activeToggle: {
      background: "#64ffda",
      color: "#0a192f",
      fontWeight: "600"
    }
  };

  return (
    <div style={styles.container}>
      {/* Live Data Indicator */}
      <div style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        background: "rgba(34, 197, 94, 0.1)",
        border: "1px solid rgba(34, 197, 94, 0.3)",
        borderRadius: "8px",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <div style={{
        }}></div>
   
      </div>

      {/* Notification */}
      {notification && (
        <div
          style={{
            ...styles.notification,
            backgroundColor:
              notification.type === "success"
                ? "rgba(34,197,94,0.9)"
                : "rgba(239,68,68,0.9)",
          }}
        >
          {notification.type === "success" ? (
            <FaCheckCircle size={20} />
          ) : (
            <FaTimesCircle size={20} />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FaUsers /> Customer Management
        </h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleManualRefresh}
            style={{
              padding: "8px 16px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#059669"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#10b981"}
          >
            <FaSpinner /> Refresh Data
          </button>
          <div style={{
            padding: "4px 12px",
            backgroundColor: "rgba(100, 255, 218, 0.1)",
            color: "#64ffda",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            {allBookingsData.length} bookings loaded
          </div>
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.toggleBtn,
                ...(viewMode === "cards" ? styles.activeToggle : {})
              }}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                ...(viewMode === "table" ? styles.activeToggle : {})
              }}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>
          </div>
          <button
            style={styles.button}
            onClick={handleExportData}
          >
            <FaDownload size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <FaUsers size={28} color="#60a5fa" />
          <div style={{ fontSize: "24px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>
            {stats.total}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Total Customers</div>
        </div>
        
        <div style={styles.statCard}>
          <FaUserCheck size={28} color="#22c55e" />
          <div style={{ fontSize: "24px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>
            {stats.active}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Active Customers</div>
        </div>
        
        <div style={styles.statCard}>
          <FaClock size={28} color="#f59e0b" />
          <div style={{ fontSize: "24px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>
            {stats.pending}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Pending Approval</div>
        </div>
        
        <div style={styles.statCard}>
          <FaArchive size={28} color="#6b7280" />
          <div style={{ fontSize: "24px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>
            {stats.archived}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Archived</div>
        </div>
        
        <div style={styles.statCard}>
          <FaBookOpen size={28} color="#64ffda" />
          <div style={{ fontSize: "24px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>
            {stats.totalBookings}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Total Bookings</div>
        </div>
        
        <div style={styles.statCard}>
          <FaChartBar size={28} color="#8b5cf6" />
          <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Total Revenue</div>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <div style={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "12px" }}>
          <FaSearch size={18} style={{ color: "#64ffda" }} />
          <input
            type="text"
            placeholder="Search customers by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <FaFilter size={18} style={{ color: "#64ffda" }} />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Services</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="lastBooking">Last Booking</option>
            <option value="name">Name</option>
            <option value="totalBookings">Total Bookings</option>
            <option value="totalRevenue">Revenue</option>
            <option value="joinDate">Join Date</option>
            <option value="status">Status</option>
          </select>

          <button
            style={styles.button}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      {/* Customer Display */}
      <div style={styles.cardGrid}>
        {filteredCustomers.map((c) => (
          <div key={c.id} style={styles.customerCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, color: "#fff", fontSize: "18px" }}>
                <FaUser size={16} color="#64ffda" /> {c.name}
              </h3>
              {getStatusBadge(c.status)}
            </div>
            
            <div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
              <p style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaEnvelope size={12} color="#64ffda" /> {c.email}
              </p>
              <p style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaPhone size={12} color="#64ffda" /> {c.phone}
              </p>
              <p style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaMapMarkerAlt size={12} color="#64ffda" /> {c.address}
              </p>
              <p style={{ margin: "6px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaCalendarAlt size={12} color="#64ffda" /> Last: {formatDate(c.lastBooking)}
              </p>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
              padding: "12px",
              background: "rgba(100, 255, 218, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(100, 255, 218, 0.1)"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#64ffda" }}>
                  {c.totalBookings}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Bookings</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#64ffda" }}>
                  {formatCurrency(c.totalRevenue)}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Revenue</div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                style={styles.button}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCustomer(c);
                  setShowCustomerDetails(true);
                }}
              >
                <FaEye size={14} /> View Details
              </button>
              
              {c.status !== "archived" && c.status !== "pending" && (
                <button
                  style={{ ...styles.button, ...styles.archiveBtn }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(c);
                  }}
                >
                  <FaArchive size={12} /> Archive
                </button>
              )}
              
              {c.status === "archived" && (
                <button
                  style={{ ...styles.button, ...styles.unarchiveBtn }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnarchive(c);
                  }}
                >
                  <FaUndo size={12} /> Unarchive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          color: "#94a3b8", 
          padding: "60px 40px",
          background: "rgba(15, 30, 60, 0.6)",
          borderRadius: "12px",
          border: "1px solid rgba(100, 255, 218, 0.1)"
        }}>
          <FaUser size={48} style={{ marginBottom: "20px", opacity: 0.5, color: "#64ffda" }} />
          <h3 style={{ color: "#fff", marginBottom: "8px" }}>No customers found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <h2 style={{ margin: "0 0 8px 0", color: "#64ffda", fontSize: "24px" }}>
                  {selectedCustomer.name}
                </h2>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                  {getStatusBadge(selectedCustomer.status)}
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                    Customer since {formatDate(selectedCustomer.joinDate)}
                  </span>
                </div>
              </div>
              <button
                style={{ ...styles.button, padding: "8px", minWidth: "auto" }}
                onClick={() => setShowCustomerDetails(false)}
              >
                <FaTimes size={16} />
              </button>
            </div>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
              padding: "16px",
              background: "rgba(100, 255, 218, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(100, 255, 218, 0.1)"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#64ffda" }}>
                  {selectedCustomer.totalBookings}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Total Bookings</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#fbbf24" }}>
                  {formatCurrency(selectedCustomer.totalRevenue)}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Total Revenue</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#22c55e" }}>
                  {selectedCustomer.preferredServices[0] || 'N/A'}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Preferred Service</div>
              </div>
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "#64ffda", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaUser /> Contact Information
              </h3>
              <div style={{
                background: "rgba(30, 41, 59, 0.4)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid rgba(100, 255, 218, 0.1)"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <p style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaEnvelope size={14} color="#64ffda" /> 
                      <span style={{ color: "#fff" }}>{selectedCustomer.email}</span>
                    </p>
                    <p style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaPhone size={14} color="#64ffda" /> 
                      <span style={{ color: "#fff" }}>{selectedCustomer.phone}</span>
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaMapMarkerAlt size={14} color="#64ffda" /> 
                      <span style={{ color: "#fff" }}>{selectedCustomer.address}</span>
                    </p>
                    <p style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaCalendarAlt size={14} color="#64ffda" /> 
                      <span style={{ color: "#fff" }}>Last booking: {formatDate(selectedCustomer.lastBooking)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ color: "#64ffda", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaBookOpen /> Booking History ({selectedCustomer.totalBookings})
              </h3>
              <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                {selectedCustomer.bookings
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((booking) => (
                  <div key={booking.id} style={{
                    ...styles.bookingItem,
                    borderLeft: `4px solid ${
                      booking.status === 'approved' ? '#22c55e' :
                      booking.status === 'pending' ? '#f59e0b' :
                      booking.status === 'rejected' ? '#ef4444' : '#6b7280'
                    }`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <strong style={{ color: "#fff", fontSize: "16px" }}>{booking.service}</strong>
                        <p style={{ margin: "4px 0", fontSize: "13px", color: "#64ffda", fontWeight: "600" }}>
                          Booking #{booking.id}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaCalendarAlt size={12} /> {formatDate(booking.date)}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaClock size={12} /> {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    
                    <p style={{ margin: "4px 0", fontSize: "14px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaMapMarkerAlt size={12} /> {booking.location}
                    </p>
                    
                    {booking.notes && (
                      <div style={{ 
                        marginTop: "12px", 
                        padding: "8px", 
                        background: "rgba(100, 255, 218, 0.05)", 
                        borderRadius: "6px",
                        border: "1px solid rgba(100, 255, 218, 0.1)"
                      }}>
                        <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", fontStyle: "italic" }}>
                          <strong style={{ color: "#64ffda" }}>Notes:</strong> "{booking.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action buttons in modal */}
            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(100, 255, 218, 0.2)",
              flexWrap: "wrap"
            }}>
              {selectedCustomer.status === "pending" && (
                <>
                  <button
                    style={{ ...styles.button, ...styles.approveBtn, flex: 1, justifyContent: "center", padding: "12px" }}
                    onClick={() => {
                      handleApprove(selectedCustomer);
                      setShowCustomerDetails(false);
                    }}
                  >
                    <FaThumbsUp /> Approve Customer
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.rejectBtn, flex: 1, justifyContent: "center", padding: "12px" }}
                    onClick={() => {
                      handleReject(selectedCustomer);
                      setShowCustomerDetails(false);
                    }}
                  >
                    <FaThumbsDown /> Reject Customer
                  </button>
                </>
              )}
              
              {selectedCustomer.status !== "archived" && selectedCustomer.status !== "pending" && (
                <button
                  style={{ ...styles.button, ...styles.archiveBtn, flex: 1, justifyContent: "center", padding: "12px" }}
                  onClick={() => {
                    handleArchive(selectedCustomer);
                    setShowCustomerDetails(false);
                  }}
                >
                  <FaArchive /> Archive Customer
                </button>
              )}
              
              {selectedCustomer.status === "archived" && (
                <button
                  style={{ ...styles.button, ...styles.unarchiveBtn, flex: 1, justifyContent: "center", padding: "12px" }}
                  onClick={() => {
                    handleUnarchive(selectedCustomer);
                    setShowCustomerDetails(false);
                  }}
                >
                  <FaUndo /> Unarchive Customer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div style={styles.modalOverlay}>
          <div style={{
            ...styles.modal,
            width: "300px",
            textAlign: "center",
            padding: "40px"
          }}>
            <FaSpinner size={32} color="#64ffda" style={{ 
              animation: "spin 1s linear infinite",
              marginBottom: "16px"
            }} />
            <p style={{ margin: 0, fontSize: "16px" }}>Processing request...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerManagement;