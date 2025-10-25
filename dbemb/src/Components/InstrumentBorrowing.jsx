import React, { useState, useEffect, useMemo } from 'react';
import AuthService from '../services/authService';
import { FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaSpinner, FaChevronLeft, FaChevronRight, FaInfoCircle, FaGuitar } from 'react-icons/fa';

// Borrowing-only component. Minimal UI: select instrument (DB-driven), choose quantity and dates,
// submit a borrow request which goes to /api/instruments/borrow-request and requires approval.

const InstrumentBorrowing = () => {
  const today = new Date();
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [fetchedInstruments, setFetchedInstruments] = useState([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [instrumentsError, setInstrumentsError] = useState(null);
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('davaoBlueEaglesUser') || 'null');
      if (stored) {
        setUser(stored);
        if (stored.firstName || stored.email) {
          setName(stored.firstName ? `${stored.firstName} ${stored.lastName || ''}`.trim() : (stored.email || ''));
          setEmail(stored.email || '');
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingInstruments(true);
      setInstrumentsError(null);
      try {
        const res = await fetch('http://localhost:5000/api/instruments');
        if (!res.ok) throw new Error('Failed to fetch instruments');
        const data = await res.json();
        if (!cancelled) {
          if (data && Array.isArray(data.instruments)) setFetchedInstruments(data.instruments);
          else if (Array.isArray(data)) setFetchedInstruments(data);
          else setFetchedInstruments([]);
        }
      } catch (err) {
        console.warn('InstrumentBorrowing: fetch instruments failed, falling back to localStorage', err);
        try {
          const saved = localStorage.getItem('dbeInventory');
          if (saved) {
            const parsed = JSON.parse(saved);
            const mapped = (Array.isArray(parsed) ? parsed : []).map(it => ({
              instrument_id: it.id || it.instrument_id,
              name: it.name || it.label || '',
              availability_status: it.archived ? 'Unavailable' : (it.status || 'Available'),
              quantity: it.locations ? it.locations.reduce((s,l)=>s+(Number(l.quantity)||0),0) : (it.quantity||0)
            }));
            if (!cancelled) setFetchedInstruments(mapped.filter(i => i.availability_status === 'Available'));
          } else {
            if (!cancelled) setFetchedInstruments([]);
          }
        } catch (e) {
          if (!cancelled) setInstrumentsError(String(err || e));
        }
      } finally {
        if (!cancelled) setLoadingInstruments(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const rentalDays = useMemo(() => {
    if (rentalStartDate && rentalEndDate) {
      const start = new Date(rentalStartDate);
      const end = new Date(rentalEndDate);
      if (end < start) return 0;
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  }, [rentalStartDate, rentalEndDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const storageKey = 'borrowRequests';
      const selectedLabel = (() => {
        if (typeof selectedInstrument === 'string' && selectedInstrument.startsWith('db-')) {
          const id = parseInt(selectedInstrument.replace('db-', ''), 10);
          const inst = fetchedInstruments.find(i => Number(i.instrument_id) === id);
          return inst ? inst.name : selectedInstrument;
        }
        return selectedInstrument;
      })();

      const instrumentIdVar = (typeof selectedInstrument === 'string' && selectedInstrument.startsWith('db-')) ? parseInt(selectedInstrument.replace('db-', ''), 10) : null;

      // Explicitly mark borrow requests as member perks and ensure no pricing fields are sent
      const payload = {
        instrumentId: instrumentIdVar,
        instrumentName: selectedLabel,
        instrumentType: (fetchedInstruments.find(i => Number(i.instrument_id) === instrumentIdVar)?.subcategory || ''),
        quantity: Number(quantity) || 1,
        startDate: rentalStartDate,
        endDate: rentalEndDate,
        purpose: null,
        notes: notes ? notes.trim() : null,
        is_member_perk: true,
        rental_fee: null
      };

      try {
        const resp = await AuthService.post('/instruments/borrow-request', payload);
        if (!resp || resp.success !== true) throw new Error(resp && resp.message ? resp.message : 'Failed to submit borrow request');
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const request = {
          id: resp.requestId || Date.now(),
          userId: user?.id || null,
          userName: name.trim(),
          userEmail: email.trim().toLowerCase(),
          phone: phone.trim(),
          instrument: selectedLabel,
          quantity: Number(quantity) || 1,
          startDate: rentalStartDate,
          endDate: rentalEndDate,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        existing.unshift(request);
        localStorage.setItem(storageKey, JSON.stringify(existing));
        window.dispatchEvent(new Event('borrowRequestsUpdated'));
        setShowSuccess(true);
      } catch (err) {
        // fallback to localStorage only
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const request = {
          id: Date.now(),
          userId: user?.id || null,
          userName: name.trim(),
          userEmail: email.trim().toLowerCase(),
          phone: phone.trim(),
          instrument: selectedLabel,
          quantity: Number(quantity) || 1,
          startDate: rentalStartDate,
          endDate: rentalEndDate,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        existing.unshift(request);
        localStorage.setItem(storageKey, JSON.stringify(existing));
        window.dispatchEvent(new Event('borrowRequestsUpdated'));
        setShowSuccess(true);
      }

      // Reset
      setSelectedInstrument('');
      setRentalStartDate('');
      setRentalEndDate('');
      setQuantity(1);
      setNotes('');
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      alert(error.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = today.toISOString().split('T')[0];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2>Instrument Borrowing (Member Borrow Requests)</h2>
      <div style={{ marginTop: 8, marginBottom: 8, padding: 10, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#065f46' }}>
        Note: Borrowing is a member perk — no price will be applied for approved borrow requests.
      </div>
      {showSuccess && <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: 12, borderRadius: 8 }}>Borrow request submitted for approval.</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label>Instrument<span style={{ color: '#ef4444' }}>*</span>
          <select value={selectedInstrument} onChange={e => setSelectedInstrument(e.target.value)} required>
            <option value="">Select an instrument...</option>
            {loadingInstruments && <option disabled>Loading instruments...</option>}
            {!loadingInstruments && fetchedInstruments.map(inst => (
              <option key={`db-${inst.instrument_id}`} value={`db-${inst.instrument_id}`}>
                {inst.name} {inst.availability_status ? `— ${inst.availability_status}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label>Quantity<span style={{ color: '#ef4444' }}>*</span>
          <input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} required />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ flex: 1 }}>Start Date<span style={{ color: '#ef4444' }}>*</span>
            <input type="date" value={rentalStartDate} onChange={e => setRentalStartDate(e.target.value)} min={minDate} required />
          </label>
          <label style={{ flex: 1 }}>End Date<span style={{ color: '#ef4444' }}>*</span>
            <input type="date" value={rentalEndDate} onChange={e => setRentalEndDate(e.target.value)} min={rentalStartDate || minDate} required />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
          <input placeholder="Address" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>

        <label>Notes
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
        </label>

        <div>
          <button type="submit" disabled={isSubmitting || !selectedInstrument}>
            {isSubmitting ? 'Submitting...' : 'Submit Borrow Request (Submit for Approval)'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstrumentBorrowing;
