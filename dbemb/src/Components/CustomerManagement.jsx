import React, { useState, useEffect, useMemo } from "react";
import {
  Home,
  Users,
  UserCheck,
  Clock,
  BookOpen,
  BarChart3,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  PlusCircle,
  X,
  Search,
  Filter,
} from "lucide-react";

const CustomerManagement = ({}) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  const adminEmail = "ivanlouiemalicsi@gmail.com";

  // Demo Data
  useEffect(() => {
    setCustomers([
      {
        id: 1,
        name: "Ivan Lim",
        email: "illmalicsi017@gmail.com",
        phone: "09123456789",
        service: "Marching Band",
        status: "pending", // not approved yet
        bookings: 0,
        address: "Davao City",
        lastBooking: "2025-09-01",
      },
      {
        id: 2,
        name: "Justin Nabunturan",
        email: "illmalicsi017@gmail.com",
        phone: "09987654321",
        service: "Event Performance",
        status: "cancelled", // can also be rejected
        bookings: 1,
        address: "Tagum City",
        lastBooking: "2025-08-25",
      },
    ]);
  }, []);

  useEffect(() => {
    let filtered = customers.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (serviceFilter !== "all") {
      filtered = filtered.filter((c) => c.service === serviceFilter);
    }
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter, serviceFilter]);

  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.status === "active").length,
      pending: customers.filter((c) => c.status === "pending").length,
      totalBookings: customers.reduce((a, c) => a + c.bookings, 0),
      avgBookingsPerCustomer:
        customers.length > 0
          ? (
              customers.reduce((a, c) => a + c.bookings, 0) / customers.length
            ).toFixed(1)
          : 0,
    }),
    [customers]
  );

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowBookingModal(false);
      showNotification("Booking confirmed successfully!", "success");
    }, 2000);
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
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
      width: "400px",
      color: "#e5e7eb",
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
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Customer Management</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>
            Admin: {adminEmail}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <Users size={24} color="#60a5fa" />
          <div style={{ fontSize: "22px", fontWeight: "600" }}>
            {stats.total}
          </div>
          <div>Total Customers</div>
        </div>
        <div style={styles.statCard}>
          <UserCheck size={24} color="#22c55e" />
          <div style={{ fontSize: "22px", fontWeight: "600" }}>
            {stats.active}
          </div>
          <div>Active</div>
        </div>
        <div style={styles.statCard}>
          <Clock size={24} color="#f59e0b" />
          <div style={{ fontSize: "22px", fontWeight: "600" }}>
            {stats.pending}
          </div>
          <div>Pending</div>
        </div>
        <div style={styles.statCard}>
          <BookOpen size={24} color="#64ffda" />
          <div style={{ fontSize: "22px", fontWeight: "600" }}>
            {stats.totalBookings}
          </div>
          <div>Total Bookings</div>
        </div>
        <div style={styles.statCard}>
          <BarChart3 size={24} color="#fbbf24" />
          <div style={{ fontSize: "22px", fontWeight: "600" }}>
            {stats.avgBookingsPerCustomer}
          </div>
          <div>Avg/Customer</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <Search size={18} style={{ marginRight: "8px", color: "#64ffda" }} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={18} style={{ color: "#64ffda" }} />
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
            <option value="Marching Band">Marching Band</option>
            <option value="Event Performance">Event Performance</option>
          </select>
        </div>
      </div>

      {/* Customer Cards */}
      <div style={styles.cardGrid}>
        {filteredCustomers.map((c) => (
          <div key={c.id} style={styles.customerCard}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={16} /> {c.name} {getStatusBadge(c.status)}
            </h3>
            <p>
              <Mail size={14} /> {c.email}
            </p>
            <p>
              <Phone size={14} /> {c.phone}
            </p>
            <p>
              <MapPin size={14} /> {c.address}
            </p>
            <p>
              <Calendar size={14} /> Last booking: {c.lastBooking}
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                style={styles.button}
                onClick={() => {
                  setSelectedCustomer(c);
                  setShowCustomerDetails(true);
                }}
              >
                <Eye size={14} /> View
              </button>
              <button
                style={styles.button}
                onClick={() => {
                  setSelectedCustomer(c);
                  setShowBookingModal(true);
                }}
              >
                <PlusCircle size={14} /> Book
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>{selectedCustomer.name}</h2>
            <p>
              <Mail size={14} /> {selectedCustomer.email}
            </p>
            <p>
              <Phone size={14} /> {selectedCustomer.phone}
            </p>
            <p>
              <MapPin size={14} /> {selectedCustomer.address}
            </p>
            <p>Status: {getStatusBadge(selectedCustomer.status)}</p>
            <button
              style={{ ...styles.button, marginTop: "12px" }}
              onClick={() => setShowCustomerDetails(false)}
            >
              <X size={14} /> Close
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedCustomer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Book for {selectedCustomer.name}</h2>
            <p>Select service and confirm booking.</p>
            <button
              style={{ ...styles.button, marginTop: "12px" }}
              onClick={handleBooking}
            >
              <CheckCircle size={14} /> Confirm Booking
            </button>
            <button
              style={{ ...styles.button, marginTop: "12px" }}
              onClick={() => setShowBookingModal(false)}
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <Loader2 size={28} className="spin" color="#64ffda" />
            <p style={{ marginTop: "12px" }}>Processing booking...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
