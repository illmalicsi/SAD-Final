import React, { useState, useEffect } from 'react';
import { FaMusic, FaEdit, FaSave, FaTimes, FaPlus, FaToggleOn, FaToggleOff, FaUsers, FaTruck, FaUtensils, FaChevronDown, FaChevronUp, FaConciergeBell } from '../icons/fa';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [bandPackages, setBandPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [expandedPackageId, setExpandedPackageId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageEditForm, setPackageEditForm] = useState({});
  const [showAddPackageForm, setShowAddPackageForm] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    default_price: '',
    duration_minutes: '',
    is_active: 1
  });
  const [newPackage, setNewPackage] = useState({
    package_key: '',
    package_name: '',
    description: '',
    price: '',
    num_players: '',
    includes_food: false,
    includes_transport: false,
    display_order: 0
  });

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%)',
    paddingBottom: '48px'
  };

  const pageInner = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  };

  const headerStyle = {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    marginBottom: '24px'
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(2,6,23,0.08)',
    border: '1px solid #e6eef8',
    padding: '24px',
    marginBottom: '16px'
  };

  const buttonStyle = {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    transition: 'all 0.2s'
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services/all', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBandPackages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/band-packages/all', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setBandPackages(data.packages);
      }
    } catch (error) {
      console.error('Error fetching band packages:', error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBandPackages();
  }, []);

  const handleEdit = (service) => {
    setEditingId(service.service_id);
    setExpandedServiceId(service.service_id);
    setEditForm({ ...service });
  };

  const handleSave = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Service updated successfully!');
        setEditingId(null);
        fetchServices();
      } else {
        alert(data.message || 'Failed to update service');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('An error occurred');
    }
  };

  const handleAddService = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });

      const data = await response.json();
      if (data.success) {
        alert('Service created successfully!');
        setShowAddForm(false);
        setNewService({
          name: '',
          description: '',
          default_price: '',
          duration_minutes: '',
          is_active: 1
        });
        fetchServices();
      } else {
        alert(data.message || 'Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert('An error occurred');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setExpandedServiceId(null);
    setEditForm({});
  };

  const handleEditPackage = (pkg) => {
    setEditingPackageId(pkg.package_id);
    setExpandedPackageId(pkg.package_id);
    setPackageEditForm({ ...pkg });
  };

  const handleSavePackage = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/band-packages/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageEditForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Band package updated successfully!');
        setEditingPackageId(null);
        fetchBandPackages();
      } else {
        alert(data.message || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('An error occurred');
    }
  };

  const handleAddPackage = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/band-packages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPackage)
      });

      const data = await response.json();
      if (data.success) {
        alert('Band package created successfully!');
        setShowAddPackageForm(false);
        setNewPackage({
          package_key: '',
          package_name: '',
          description: '',
          price: '',
          num_players: '',
          includes_food: false,
          includes_transport: false,
          display_order: 0
        });
        fetchBandPackages();
      } else {
        alert(data.message || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      alert('An error occurred');
    }
  };

  const handleCancelPackage = () => {
    setEditingPackageId(null);
    setExpandedPackageId(null);
    setPackageEditForm({});
  };

  const toggleServiceExpand = (serviceId) => {
    if (expandedServiceId === serviceId) {
      setExpandedServiceId(null);
      setEditingId(null);
    } else {
      setExpandedServiceId(serviceId);
    }
  };

  const togglePackageExpand = (packageId) => {
    if (expandedPackageId === packageId) {
      setExpandedPackageId(null);
      setEditingPackageId(null);
    } else {
      setExpandedPackageId(packageId);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaConciergeBell style={{ width: 28, height: 28, color: '#fff' }} />
              </div>
              <div>
                <p style={{ color: '#475569', marginTop: '6px', marginBottom: 0 }}>
                  Manage services and pricing
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                ...buttonStyle,
                background: showAddForm ? '#ef4444' : '#10b981',
                color: 'white'
              }}
            >
              {showAddForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Service</>}
            </button>
          </div>
        </div>
      </div>

      <div style={pageInner}>
        {/* Services Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaConciergeBell /> Services
          </h2>
          
          {showAddForm && (
            <div style={{ ...cardStyle, border: '2px solid #10b981', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                Add New Service
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="e.g., Band Gigs"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Default Price (₱) *
                  </label>
                  <input
                    type="number"
                    value={newService.default_price}
                    onChange={(e) => setNewService({ ...newService, default_price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({ ...newService, duration_minutes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="120"
                  />
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAddService}
                  style={{
                    ...buttonStyle,
                    background: '#10b981',
                    color: 'white'
                  }}
                  disabled={!newService.name || !newService.default_price}
                >
                  <FaSave /> Create Service
                </button>
              </div>
            </div>
          )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : (
          services.map(service => (
            <div key={service.service_id} style={{ ...cardStyle, marginBottom: '8px' }}>
              {/* Collapsed Header - Always Visible */}
              <div 
                onClick={() => toggleServiceExpand(service.service_id)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: expandedServiceId === service.service_id ? '0 0 16px 0' : '0',
                  borderBottom: expandedServiceId === service.service_id ? '1px solid #e2e8f0' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {service.name}
                  </h3>
                  {service.is_active ? (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      background: '#d1fae5',
                      color: '#065f46',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      Active
                    </span>
                  ) : (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>
                    ₱{parseFloat(service.default_price).toLocaleString()}
                  </div>
                  {expandedServiceId === service.service_id ? (
                    <FaChevronUp style={{ color: '#64748b', fontSize: '16px' }} />
                  ) : (
                    <FaChevronDown style={{ color: '#64748b', fontSize: '16px' }} />
                  )}
                </div>
              </div>

              {/* Expanded Content - Edit Form */}
              {expandedServiceId === service.service_id && (
                <div style={{ paddingTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                  {editingId === service.service_id ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Service Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Default Price (₱)
                          </label>
                          <input
                            type="number"
                            value={editForm.default_price}
                            onChange={(e) => setEditForm({ ...editForm, default_price: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Description
                          </label>
                          <input
                            type="text"
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={editForm.duration_minutes || ''}
                            onChange={(e) => setEditForm({ ...editForm, duration_minutes: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleSave(service.service_id)}
                          style={{
                            ...buttonStyle,
                            background: '#10b981',
                            color: 'white'
                          }}
                        >
                          <FaSave /> Save
                        </button>
                        <button
                          onClick={handleCancel}
                          style={{
                            ...buttonStyle,
                            background: '#6b7280',
                            color: 'white'
                          }}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {service.description && (
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px 0' }}>
                          {service.description}
                        </p>
                      )}
                      {service.duration_minutes && (
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                          Duration: <strong>{service.duration_minutes} minutes</strong>
                        </p>
                      )}
                      <button
                        onClick={() => handleEdit(service)}
                        style={{
                          ...buttonStyle,
                          background: '#3b82f6',
                          color: 'white'
                        }}
                      >
                        <FaEdit /> Edit Service
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        </div>

        {/* Band Packages Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaUsers /> Band Packages
            </h2>
            <button
              onClick={() => setShowAddPackageForm(!showAddPackageForm)}
              style={{
                ...buttonStyle,
                background: showAddPackageForm ? '#ef4444' : '#10b981',
                color: 'white'
              }}
            >
              {showAddPackageForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Package</>}
            </button>
          </div>

          {showAddPackageForm && (
            <div style={{ ...cardStyle, border: '2px solid #10b981', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                Add New Band Package
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Package Key * (e.g., '20-players-with')
                  </label>
                  <input
                    type="text"
                    value={newPackage.package_key}
                    onChange={(e) => setNewPackage({ ...newPackage, package_key: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="e.g., 20-players-with"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={newPackage.package_name}
                    onChange={(e) => setNewPackage({ ...newPackage, package_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="e.g., 20 Players (with Food & Transport)"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Number of Players
                  </label>
                  <input
                    type="number"
                    value={newPackage.num_players}
                    onChange={(e) => setNewPackage({ ...newPackage, num_players: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="20"
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                    placeholder="Optional description"
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                    <input
                      type="checkbox"
                      checked={newPackage.includes_food}
                      onChange={(e) => setNewPackage({ ...newPackage, includes_food: e.target.checked })}
                    />
                    <FaUtensils /> Includes Food
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                    <input
                      type="checkbox"
                      checked={newPackage.includes_transport}
                      onChange={(e) => setNewPackage({ ...newPackage, includes_transport: e.target.checked })}
                    />
                    <FaTruck /> Includes Transport
                  </label>
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAddPackage}
                  style={{
                    ...buttonStyle,
                    background: '#10b981',
                    color: 'white'
                  }}
                  disabled={!newPackage.package_key || !newPackage.package_name || !newPackage.price}
                >
                  <FaSave /> Create Package
                </button>
              </div>
            </div>
          )}

          {bandPackages.map(pkg => (
            <div key={pkg.package_id} style={{ ...cardStyle, marginBottom: '8px' }}>
              {/* Collapsed Header - Always Visible */}
              <div 
                onClick={() => togglePackageExpand(pkg.package_id)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: expandedPackageId === pkg.package_id ? '0 0 16px 0' : '0',
                  borderBottom: expandedPackageId === pkg.package_id ? '1px solid #e2e8f0' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {pkg.package_name}
                  </h3>
                  {pkg.is_active ? (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      background: '#d1fae5',
                      color: '#065f46',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      Active
                    </span>
                  ) : (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#7c3aed' }}>
                    ₱{parseFloat(pkg.price).toLocaleString()}
                  </div>
                  {expandedPackageId === pkg.package_id ? (
                    <FaChevronUp style={{ color: '#64748b', fontSize: '16px' }} />
                  ) : (
                    <FaChevronDown style={{ color: '#64748b', fontSize: '16px' }} />
                  )}
                </div>
              </div>

              {/* Expanded Content - Edit Form */}
              {expandedPackageId === pkg.package_id && (
                <div style={{ paddingTop: '16px' }} onClick={(e) => e.stopPropagation()}>
                  {editingPackageId === pkg.package_id ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Package Key
                          </label>
                          <input
                            type="text"
                            value={packageEditForm.package_key}
                            onChange={(e) => setPackageEditForm({ ...packageEditForm, package_key: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Package Name
                          </label>
                          <input
                            type="text"
                            value={packageEditForm.package_name}
                            onChange={(e) => setPackageEditForm({ ...packageEditForm, package_name: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Price (₱)
                          </label>
                          <input
                            type="number"
                            value={packageEditForm.price}
                            onChange={(e) => setPackageEditForm({ ...packageEditForm, price: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Number of Players
                          </label>
                          <input
                            type="number"
                            value={packageEditForm.num_players || ''}
                            onChange={(e) => setPackageEditForm({ ...packageEditForm, num_players: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Description
                          </label>
                          <input
                            type="text"
                            value={packageEditForm.description || ''}
                            onChange={(e) => setPackageEditForm({ ...packageEditForm, description: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                            <input
                              type="checkbox"
                              checked={packageEditForm.includes_food}
                              onChange={(e) => setPackageEditForm({ ...packageEditForm, includes_food: e.target.checked })}
                            />
                            <FaUtensils /> Includes Food
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                            <input
                              type="checkbox"
                              checked={packageEditForm.includes_transport}
                              onChange={(e) => setPackageEditForm({ ...packageEditForm, includes_transport: e.target.checked })}
                            />
                            <FaTruck /> Includes Transport
                          </label>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleSavePackage(pkg.package_id)}
                          style={{
                            ...buttonStyle,
                            background: '#10b981',
                            color: 'white'
                          }}
                        >
                          <FaSave /> Save
                        </button>
                        <button
                          onClick={handleCancelPackage}
                          style={{
                            ...buttonStyle,
                            background: '#6b7280',
                            color: 'white'
                          }}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        style={{
                          ...buttonStyle,
                          background: '#7c3aed',
                          color: 'white'
                        }}
                      >
                        <FaEdit /> Edit Package
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;

