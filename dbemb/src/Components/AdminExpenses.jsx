import React, { useEffect, useState } from 'react';
import AuthService from '../services/authService';

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: '', category: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await AuthService.get('/billing/expenses');
      if (res && res.expenses) setExpenses(res.expenses);
    } catch (e) {
      setError('Failed to fetch expenses');
    } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount || !form.category) return setError('Amount and category required');
    try {
      setLoading(true);
      const payload = { amount: parseFloat(form.amount), category: form.category, description: form.description };
      const resp = await AuthService.post('/billing/expenses', payload);
      if (resp && resp.expense) {
        setForm({ amount: '', category: '', description: '' });
        fetchExpenses();
      } else {
        setError(resp?.message || 'Failed to create expense');
      }
    } catch (err) {
      setError(err.message || 'Error creating expense');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Expenses</h2>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ background: '#fff', padding: 14, borderRadius: 8, boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
            <h3 style={{ marginTop: 0 }}>Add Expense</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 8 }}>
                <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" />
                <input name="category" value={form.category} onChange={handleChange} placeholder="Category (eg. rental, supplies)" />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description (optional)" rows={3} />
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={{ padding: '8px 12px' }}>{loading ? 'Saving...' : 'Save Expense'}</button>
                  <button type="button" onClick={() => setForm({ amount: '', category: '', description: '' })} style={{ padding: '8px 12px' }}>Reset</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div style={{ flex: 2 }}>
          <div style={{ background: '#fff', padding: 14, borderRadius: 8, boxShadow: '0 6px 18px rgba(16,24,40,0.04)' }}>
            <h3 style={{ marginTop: 0 }}>Recent Expenses</h3>
            {loading ? (
              <div>Loading...</div>
            ) : expenses.length === 0 ? (
              <div style={{ color: '#64748b' }}>No expenses recorded.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #eef2f7' }}>
                    <th>When</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((ex) => (
                    <tr key={ex.expense_id} style={{ borderBottom: '1px solid #f3f6f9' }}>
                      <td style={{ padding: 8 }}>{new Date(ex.incurred_at || ex.created_at).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{ex.category}</td>
                      <td style={{ padding: 8 }}>{ex.description || '-'}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }}>₱{parseFloat(ex.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExpenses;
