import React, { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import theme from '../theme';

const InventoryReport = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dbeInventory');
      if (saved) setInventory(JSON.parse(saved));
    } catch (e) {
      setInventory([]);
    }
  }, []);

  const totals = inventory.reduce((acc, item) => {
    if (!acc.byCategory[item.category]) acc.byCategory[item.category] = 0;
    acc.byCategory[item.category]++;
    const totalQty = (item.locations || []).reduce((s, l) => s + (Number(l.quantity) || 0), 0);
    acc.totalUnits += totalQty;
    (item.locations || []).forEach(l => {
      if (!acc.byLocation[l.name]) acc.byLocation[l.name] = 0;
      acc.byLocation[l.name] += Number(l.quantity) || 0;
    });
    return acc;
  }, { byCategory: {}, byLocation: {}, totalUnits: 0 });

  const exportCSV = () => {
    const rows = [['ID','Name','Category','Subcategory','Brand','Condition','Status','Total Quantity','Locations']];
    inventory.forEach(it => {
      const qty = (it.locations || []).reduce((s,l) => s + (Number(l.quantity)||0), 0);
      const locs = (it.locations || []).map(l => `${l.name}:${l.quantity}`).join('|');
      rows.push([it.id, it.name, it.category, it.subcategory, it.brand, it.condition, it.status, qty, locs]);
    });
    const csv = rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 24, fontFamily: theme.fonts.base, background: theme.palette.bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Inventory Report</h2>
        <button onClick={exportCSV} style={{ background: theme.palette.primary, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}><FaDownload /> Export CSV</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: theme.palette.card, padding: 16, borderRadius: 8, border: `1px solid ${theme.palette.border}` }}>
          <h3 style={{ marginTop: 0 }}>Summary</h3>
          <div>Total items: {inventory.length}</div>
          <div>Total units: {totals.totalUnits}</div>
          <h4 style={{ marginBottom: 6, marginTop: 12 }}>By Category</h4>
          <ul>
            {Object.entries(totals.byCategory).map(([k,v]) => <li key={k}>{k}: {v}</li>)}
          </ul>
        </div>

        <div style={{ background: theme.palette.card, padding: 16, borderRadius: 8, border: `1px solid ${theme.palette.border}` }}>
          <h3 style={{ marginTop: 0 }}>By Location</h3>
          <ul>
            {Object.entries(totals.byLocation).map(([k,v]) => <li key={k}>{k}: {v}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;
