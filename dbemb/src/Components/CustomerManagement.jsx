import React, { useState, useEffect, useMemo } from "react";
import {
  FaHome,
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
} from "react-icons/fa";

const CustomerManagement = ({ }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Static booking data from your Booking component
  const bookingsData = [
    {
      id: 1,
      service: 'Band Gigs',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+63 912 345 6789',
      location: 'Ayala Malls Abreeza',
      notes: 'Corporate event',
      date: '2025-09-25',
      startTime: '14:00',
      endTime: '18:00',
      createdAt: '2025-09-17T10:00:00.000Z',
      status: 'approved'
    },
    {
      id: 2,
      service: 'Music Workshops',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+63 917 654 3210',
      location: 'SM City Davao',
      notes: 'Guitar workshop for beginners',
      date: '2025-09-26',
      startTime: '10:00',
      endTime: '12:00',
      createdAt: '2025-09-17T11:00:00.000Z',
      status: 'pending'
    },
    {
      id: 3,
      service: 'Band Gigs',
      name: 'Mark Johnson',
      email: 'mark@example.com',
      phone: '+63 920 111 2222',
      location: 'Gmall of Davao',
      notes: 'Birthday party',
      date: '2025-09-26',
      startTime: '15:00',
      endTime: '19:00',
      createdAt: '2025-09-17T12:00:00.000Z',
      status: 'pending'
    }
  ];

  // Convert booking data to customer data
  useEffect(() => {
    const customerMap = new Map();
    
    bookingsData.forEach(booking => {
      const customerKey = booking.email; // Use email as unique identifier
      
      if (customerMap.has(customerKey)) {
        // Update existing customer
        const existing = customerMap.get(customerKey);
        existing.bookings.push(booking);
        existing.totalBookings += 1;
        
        // Update last booking date if this booking is more recent
        if (new Date(booking.date) > new Date(existing.lastBooking)) {
          existing.lastBooking = booking.date;
          existing.lastService = booking.service;
        }
        
        // Update status based on most recent booking
        if (booking.status === 'approved') {
          existing.status = 'active';
        } else if (booking.status === 'pending' && existing.status !== 'active') {
          existing.status = 'pending';
        } else if (booking.status === 'rejected' && existing.status !== 'active' && existing.status !== 'pending') {
          existing.status = 'rejected';
        } else if (booking.status === 'cancelled' && existing.status !== 'active' && existing.status !== 'pending' && existing.status !== 'rejected') {
          existing.status = 'cancelled';
        }
      } else {
        // Create new customer
        customerMap.set(customerKey, {
          id: customerMap.size + 1,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          service: booking.service,
          status: booking.status === 'approved' ? 'active' : booking.status,
          totalBookings: 1,
          bookings: [booking],
          address: booking.location,
          lastBooking: booking.date,
          lastService: booking.service,
          joinDate: booking.createdAt.split('T')[0]
        });
      }
    });
    
    setCustomers(Array.from(customerMap.values()));
  }, []);

  useEffect(() => {
    let filtered = customers.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (serviceFilter !== "all") {
      filtered = filtered.filter((c) => 
        c.bookings.some(booking => booking.service === serviceFilter)
      );
    }
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter, serviceFilter]);

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.status === "active").length,
      pending: customers.filter((c) => c.status === "pending").length,
      rejected: customers.filter((c) => c.status === "rejected").length,
      cancelled: customers.filter((c) => c.status === "cancelled").length,
      totalBookings: customers.reduce((a, c) => a + c.totalBookings, 0),
      avgBookingsPerCustomer:
        customers.length > 0
          ? (
            customers.reduce((a, c) => a + c.totalBookings, 0) / customers.length
          ).toFixed(1)
          : 0,
    }),
    [customers]
  );

  // Get unique services for filter
  const services = [...new Set(bookingsData.map(b => b.service))];

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Approve customer (set status to 'active')
  const handleApprove = (id) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "active" } : c
      )
    );
    showNotification("Customer approved!", "success");
  };

  // Reject customer (set status to 'rejected')
  const handleReject = (id) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "rejected" } : c
      )
    );
    showNotification("Customer rejected.", "error");
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "#22c55e",
      pending: "#f59e0b",
      cancelled: "#ef4444",
      rejected: "#ef4444",
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
      borderBottom: "1px solid rgba(100, 255, 218, 0.2)",
      paddingBottom: "16px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      background: "linear-gradient(45deg, #60a5fa, #3b82f6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0,
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
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    statCard: {
      backgroundColor: "rgba(10, 25, 47, 0.6)",
      border: "1px solid rgba(100, 255, 218, 0.15)",
      borderRadius: "12px",
      padding: "16px",
      textAlign: "center",
    },
    filterBar: {
      display: "flex",
      gap: "12px",
      marginBottom: "25px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    input: {
      flex: 1,
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid rgba(100,255,218,0.2)",
      backgroundColor: "rgba(15,30,60,0.7)",
      color: "#e5e7eb",
    },
    select: {
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid rgba(100,255,218,0.2)",
      backgroundColor: "rgba(15,30,60,0.7)",
      color: "#e5e7eb",
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "20px",
    },
    customerCard: {
      background: "rgba(15, 30, 60, 0.8)",
      border: "1px solid rgba(100, 255, 218, 0.15)",
      borderRadius: "14px",
      padding: "18px",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    modal: {
      background: "rgba(10, 25, 47, 0.95)",
      padding: "24px",
      borderRadius: "12px",
      width: "500px",
      maxWidth: "90vw",
      color: "#e5e7eb",
      maxHeight: "80vh",
      overflowY: "auto",
    },
    actionBtn: {
      padding: "6px 12px",
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
      transition: "background 0.2s",
    },
    rejectBtn: {
      background: "#ef4444",
      color: "#fff",
    },
    approveBtn: {
      background: "#22c55e",
      color: "#fff",
    },
    bookingItem: {
      background: "rgba(30, 41, 59, 0.5)",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "8px",
      border: "1px solid rgba(100, 255, 218, 0.1)",
    },
  };

  return (
    <div style={styles.container}>
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
        <h1 style={styles.title}>Customer Management</h1>
      </div>

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <FaUsers size={24} color="#60a5fa" />
          <div style={{ fontSize: "22px", fontWeight: "600", marginTop: "8px" }}>
            {stats.total}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Total Customers</div>
        </div>
        <div style={styles.statCard}>
          <FaUserCheck size={24} color="#22c55e" />
          <div style={{ fontSize: "22px", fontWeight: "600", marginTop: "8px" }}>
            {stats.active}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Active</div>
        </div>
        <div style={styles.statCard}>
          <FaClock size={24} color="#f59e0b" />
          <div style={{ fontSize: "22px", fontWeight: "600", marginTop: "8px" }}>
            {stats.pending}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <FaTimesCircle size={24} color="#ef4444" />
          <div style={{ fontSize: "22px", fontWeight: "600", marginTop: "8px" }}>
            {stats.rejected + stats.cancelled}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Rejected/Cancelled</div>
        </div>
        <div style={styles.statCard}>
          <FaBookOpen size={24} color="#64ffda" />
          <div style={{ fontSize: "22px", fontWeight: "600", marginTop: "8px" }}>
            {stats.totalBookings}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Total Bookings</div>
        </div>
        <div style={styles.statCard}>
          <FaChartBar size={24} color="#fbbf24" />
          <div style={{ fontSize: "22px", fontWeight: "600", marginTop: "8px" }}>
            {stats.avgBookingsPerCustomer}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>Avg/Customer</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <FaSearch size={18} style={{ marginRight: "8px", color: "#64ffda" }} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
        </div>
      </div>

      {/* Customer Cards */}
      <div style={styles.cardGrid}>
        {filteredCustomers.map((c) => (
          <div key={c.id} style={styles.customerCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <FaUser size={16} /> {c.name}
              </h3>
              {getStatusBadge(c.status)}
            </div>
            
            <div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
              <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaEnvelope size={12} /> {c.email}
              </p>
              <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaPhone size={12} /> {c.phone}
              </p>
              <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaMapMarkerAlt size={12} /> {c.address}
              </p>
              <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCalendarAlt size={12} /> Last booking: {formatDate(c.lastBooking)}
              </p>
              <p style={{ margin: "4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaBookOpen size={12} /> {c.totalBookings} booking{c.totalBookings !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
              <button
                style={styles.button}
                onClick={() => {
                  setSelectedCustomer(c);
                  setShowCustomerDetails(true);
                }}
              >
                <FaEye size={14} /> View Details
              </button>
              
              {/* Approve/Reject buttons for pending customers */}
              {c.status === "pending" && (
                <>
                  <button
                    style={{ ...styles.actionBtn, ...styles.approveBtn }}
                    onClick={() => handleApprove(c.id)}
                  >
                    <FaThumbsUp /> Approve
                  </button>
                  <button
                    style={{ ...styles.actionBtn, ...styles.rejectBtn }}
                    onClick={() => handleReject(c.id)}
                  >
                    <FaThumbsDown /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
          <FaUser size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
          <p>No customers found matching your criteria.</p>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: "0 0 8px 0" }}>{selectedCustomer.name}</h2>
                {getStatusBadge(selectedCustomer.status)}
              </div>
              <button
                style={{ ...styles.button, padding: "8px" }}
                onClick={() => setShowCustomerDetails(false)}
              >
                <FaTimes size={16} />
              </button>
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ color: "#64ffda", marginBottom: "12px" }}>Contact Information</h3>
              <p style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaEnvelope size={14} /> {selectedCustomer.email}
              </p>
              <p style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaPhone size={14} /> {selectedCustomer.phone}
              </p>
              <p style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaMapMarkerAlt size={14} /> {selectedCustomer.address}
              </p>
              <p style={{ margin: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCalendarAlt size={14} /> Joined: {formatDate(selectedCustomer.joinDate)}
              </p>
            </div>
            
            <div>
              <h3 style={{ color: "#64ffda", marginBottom: "12px" }}>
                Booking History ({selectedCustomer.totalBookings})
              </h3>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {selectedCustomer.bookings.map(booking => (
                  <div key={booking.id} style={styles.bookingItem}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <strong style={{ color: "#fff" }}>{booking.service}</strong>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p style={{ margin: "4px 0", fontSize: "14px", color: "#94a3b8" }}>
                      <FaCalendarAlt size={12} /> {formatDate(booking.date)} • {booking.startTime} - {booking.endTime}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: "14px", color: "#94a3b8" }}>
                      <FaMapMarkerAlt size={12} /> {booking.location}
                    </p>
                    {booking.notes && (
                      <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#cbd5e1", fontStyle: "italic" }}>
                        "{booking.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ textAlign: "center" }}>
              <FaSpinner size={28} className="spin" color="#64ffda" />
              <p style={{ marginTop: "12px" }}>Processing request...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;