# 🎵 Instrument Inventory Management System - Enhancements

## Overview

This document describes the comprehensive enhancements made to the Blue Eagles Music Band inventory management system to support individual instrument tracking, maintenance history, serial numbers, and advanced reporting capabilities.

---

## 🆕 What's New

### 1. **Individual Instrument Tracking**
- Track each physical instrument with unique serial numbers
- Monitor condition, status, and location for every item
- Link to current rentals or borrowings
- Store acquisition dates and purchase costs
- Support barcode/QR code generation

### 2. **Maintenance History System**
- Complete maintenance tracking with types, costs, and dates
- Before/after condition documentation
- Photo documentation support
- Scheduled vs completed maintenance
- Parts replacement tracking
- Automatic condition updates

### 3. **Audit Trail**
- Complete history of all changes
- User attribution for every action
- Before/after value tracking
- Support for compliance and accountability

### 4. **Condition Assessments**
- Check-out and check-in condition tracking
- Damage severity levels
- Photo documentation
- Linked to rentals and borrowings

### 5. **Enhanced Rental/Borrow Tracking**
- Link to specific instrument items
- Condition at checkout/checkin
- Late fee calculations
- Damage fee tracking
- Deposit management

---

## 📊 Database Schema Changes

### New Tables

#### `instrument_items`
Tracks individual physical instruments with unique serial numbers.

```sql
CREATE TABLE instrument_items (
  item_id INT PRIMARY KEY AUTO_INCREMENT,
  instrument_id INT NOT NULL,                    -- Link to instruments master
  serial_number VARCHAR(100) UNIQUE NOT NULL,    -- Unique identifier
  location_id INT NULL,                          -- Current location
  status ENUM('Available','Rented','Borrowed','Under Maintenance','Reserved','Retired'),
  condition_status ENUM('Excellent','Good','Fair','Poor','Needs Repair'),
  acquisition_date DATE NULL,
  purchase_cost DECIMAL(10,2) NULL,
  current_rental_id INT NULL,                    -- Active rental
  current_borrow_id INT NULL,                    -- Active borrow
  last_maintenance_date DATE NULL,
  notes TEXT,
  photo_url VARCHAR(500) NULL,
  barcode_data VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Features:**
- Unique serial number constraint
- Links to both master instruments and locations
- Tracks current rental/borrow status
- Maintains maintenance history reference

#### `maintenance_history`
Comprehensive maintenance tracking.

```sql
CREATE TABLE maintenance_history (
  maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
  instrument_item_id INT NOT NULL,
  maintenance_type ENUM('Routine','Repair','Emergency','Inspection','Cleaning','Part Replacement','Other'),
  description TEXT NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0.00,
  performed_by INT NULL,                         -- User who performed
  performed_by_name VARCHAR(255) NULL,
  scheduled_date DATE NULL,
  completed_date DATE NULL,
  next_maintenance_date DATE NULL,
  status ENUM('Scheduled','In Progress','Completed','Cancelled'),
  parts_replaced TEXT NULL,
  before_condition ENUM('Excellent','Good','Fair','Poor','Needs Repair'),
  after_condition ENUM('Excellent','Good','Fair','Poor','Needs Repair'),
  before_photo_url VARCHAR(500) NULL,
  after_photo_url VARCHAR(500) NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Features:**
- Supports scheduled and completed maintenance
- Before/after condition tracking
- Cost tracking for budgeting
- Photo documentation
- Next maintenance scheduling

#### `audit_log`
Complete audit trail of all system changes.

```sql
CREATE TABLE audit_log (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  table_name VARCHAR(64) NOT NULL,
  record_id INT NOT NULL,
  action ENUM('CREATE','UPDATE','DELETE','CHECKOUT','CHECKIN','APPROVE','REJECT','ARCHIVE'),
  user_id INT NULL,
  user_email VARCHAR(255) NULL,
  before_value JSON NULL,                        -- Before state
  after_value JSON NULL,                         -- After state
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `condition_assessments`
Detailed condition tracking for check-in/check-out.

```sql
CREATE TABLE condition_assessments (
  assessment_id INT PRIMARY KEY AUTO_INCREMENT,
  instrument_item_id INT NOT NULL,
  assessment_type ENUM('checkout','checkin','inspection','damage_report'),
  related_rental_id INT NULL,
  related_borrow_id INT NULL,
  condition_status ENUM('Excellent','Good','Fair','Poor','Needs Repair'),
  damage_description TEXT NULL,
  damage_severity ENUM('None','Minor','Moderate','Severe'),
  photo_url VARCHAR(500) NULL,
  assessed_by INT NULL,
  assessed_by_name VARCHAR(255) NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Extended Tables

#### `rent_requests` - New Columns
```sql
ALTER TABLE rent_requests ADD COLUMN
  instrument_item_id INT NULL,              -- Specific item rented
  checkout_condition ENUM(...) NULL,        -- Condition at checkout
  checkin_condition ENUM(...) NULL,         -- Condition at checkin
  late_fee DECIMAL(10,2) DEFAULT 0.00,
  damage_fee DECIMAL(10,2) DEFAULT 0.00,
  deposit_amount DECIMAL(10,2) DEFAULT 0.00,
  deposit_returned BOOLEAN DEFAULT FALSE;
```

#### `borrow_requests` - New Columns
```sql
ALTER TABLE borrow_requests ADD COLUMN
  instrument_item_id INT NULL,
  checkout_condition ENUM(...) NULL,
  checkin_condition ENUM(...) NULL,
  damage_fee DECIMAL(10,2) DEFAULT 0.00,
  deposit_amount DECIMAL(10,2) DEFAULT 0.00,
  deposit_returned BOOLEAN DEFAULT FALSE;
```

---

## 🔌 API Endpoints

### Instrument Items API

#### `GET /api/instrument-items`
Get all instrument items with optional filters.

**Query Parameters:**
- `instrumentId` - Filter by master instrument
- `locationId` - Filter by location
- `status` - Filter by status (Available, Rented, etc.)
- `condition` - Filter by condition
- `serialNumber` - Search by serial number (partial match)
- `search` - Full-text search across serial, name, brand

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "item_id": 1,
      "serial_number": "PER-15-1-0001",
      "instrument_name": "Yamaha Black Snare Drum #01",
      "category": "percussion",
      "status": "Available",
      "condition_status": "Good",
      "location_name": "Shrine Hills, Matina Crossing",
      "maintenance_count": 3,
      "last_maintenance": "2025-10-15"
    }
  ],
  "total": 1
}
```

#### `GET /api/instrument-items/:id`
Get detailed information about a specific instrument item.

**Response:**
```json
{
  "success": true,
  "item": {
    "item_id": 1,
    "serial_number": "PER-15-1-0001",
    "instrument_name": "Yamaha Black Snare Drum #01",
    "status": "Available",
    "condition_status": "Good",
    "acquisition_date": "2024-06-15",
    "purchase_cost": 15000.00,
    "maintenanceHistory": [...],
    "conditionAssessments": [...]
  }
}
```

#### `POST /api/instrument-items`
Create a new instrument item.

**Request Body:**
```json
{
  "instrument_id": 15,
  "serial_number": "PER-15-1-0005",
  "location_id": 1,
  "status": "Available",
  "condition_status": "Excellent",
  "acquisition_date": "2025-11-07",
  "purchase_cost": 18000.00,
  "notes": "Brand new instrument"
}
```

#### `PUT /api/instrument-items/:id`
Update an instrument item.

#### `DELETE /api/instrument-items/:id`
Soft delete an instrument item (sets `is_active = FALSE`).

#### `GET /api/instrument-items/stats/dashboard`
Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 50,
    "available": 35,
    "rented": 10,
    "borrowed": 3,
    "under_maintenance": 2,
    "condition_excellent": 20,
    "condition_good": 25,
    "condition_fair": 5
  },
  "byLocation": [...],
  "byCategory": [...]
}
```

### Maintenance API

#### `GET /api/maintenance`
Get all maintenance records with filters.

**Query Parameters:**
- `instrumentItemId` - Filter by specific item
- `instrumentId` - Filter by master instrument
- `maintenanceType` - Filter by type
- `status` - Filter by status
- `fromDate` - Start date filter
- `toDate` - End date filter

#### `GET /api/maintenance/:id`
Get specific maintenance record.

#### `POST /api/maintenance`
Create new maintenance record.

**Request Body:**
```json
{
  "instrument_item_id": 1,
  "maintenance_type": "Routine",
  "description": "Regular cleaning and tuning",
  "cost": 500.00,
  "completed_date": "2025-11-07",
  "before_condition": "Good",
  "after_condition": "Excellent",
  "notes": "Replaced drum head"
}
```

#### `PUT /api/maintenance/:id`
Update maintenance record.

#### `GET /api/maintenance/upcoming/scheduled`
Get upcoming scheduled maintenance.

#### `GET /api/maintenance/stats/summary`
Get maintenance statistics.

---

## 🚀 Installation & Setup

### 1. Run Database Migration

**Option A: MySQL Client**
```sql
SOURCE c:/Users/limni/Downloads/SAD-Final/database/migrations/010_add_instrument_items_and_maintenance.sql;
```

**Option B: PowerShell Script**
```powershell
cd c:\Users\limni\Downloads\SAD-Final
.\run-migration-010.ps1
```

**Option C: Manual Copy-Paste**
Open `database/migrations/010_add_instrument_items_and_maintenance.sql` and execute in MySQL Workbench.

### 2. Verify Migration

```sql
USE dbemb;

-- Check tables exist
SHOW TABLES LIKE '%instrument%';
SHOW TABLES LIKE '%maintenance%';
SHOW TABLES LIKE '%audit%';

-- Check instrument_items data
SELECT COUNT(*) as total_items FROM instrument_items;

-- Check sample data
SELECT 
  ii.serial_number,
  i.name,
  ii.status,
  ii.condition_status,
  l.location_name
FROM instrument_items ii
JOIN instruments i ON ii.instrument_id = i.instrument_id
LEFT JOIN locations l ON ii.location_id = l.location_id
LIMIT 10;
```

### 3. Restart Backend

```powershell
cd backend
npm install  # Install any new dependencies
node server.js
```

The server will now expose the new endpoints.

---

## 📱 Frontend Integration (To Be Implemented)

### Dashboard Statistics Component

```jsx
import { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

function DashboardStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const response = await AuthService.get('/instrument-items/stats/dashboard');
    if (response.success) {
      setStats(response.stats);
    }
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="stats-grid">
      <StatCard 
        title="Total Instruments"
        value={stats.total}
        color="blue"
      />
      <StatCard 
        title="Available"
        value={stats.available}
        percentage={(stats.available / stats.total * 100).toFixed(1)}
        color="green"
      />
      <StatCard 
        title="Rented"
        value={stats.rented}
        percentage={(stats.rented / stats.total * 100).toFixed(1)}
        color="purple"
      />
      <StatCard 
        title="Under Maintenance"
        value={stats.under_maintenance}
        percentage={(stats.under_maintenance / stats.total * 100).toFixed(1)}
        color="yellow"
      />
    </div>
  );
}
```

### Serial Number Filter

```jsx
function InventoryFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: '',
    locationId: '',
    status: '',
    condition: ''
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search by serial number, name, or brand..."
        value={filters.search}
        onChange={(e) => handleChange('search', e.target.value)}
      />
      
      <select 
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
      >
        <option value="">All Status</option>
        <option value="Available">Available</option>
        <option value="Rented">Rented</option>
        <option value="Borrowed">Borrowed</option>
        <option value="Under Maintenance">Under Maintenance</option>
        <option value="Reserved">Reserved</option>
      </select>

      <select
        value={filters.condition}
        onChange={(e) => handleChange('condition', e.target.value)}
      >
        <option value="">All Conditions</option>
        <option value="Excellent">Excellent</option>
        <option value="Good">Good</option>
        <option value="Fair">Fair</option>
        <option value="Poor">Poor</option>
        <option value="Needs Repair">Needs Repair</option>
      </select>
    </div>
  );
}
```

---

## 🎯 Key Features Implemented

### ✅ Completed
- [x] Individual instrument tracking with serial numbers
- [x] Maintenance history system
- [x] Audit trail logging
- [x] Condition assessment tracking
- [x] Extended rental/borrow tracking
- [x] API endpoints for all features
- [x] Database migrations
- [x] Foreign key relationships
- [x] Unique constraints for data integrity

### 🔄 Pending Frontend Implementation
- [ ] Dashboard statistics UI
- [ ] Serial number filters
- [ ] Maintenance schedule view
- [ ] Barcode generation/scanning
- [ ] Photo upload for condition tracking
- [ ] Reports component with location comparisons
- [ ] Export to PDF/CSV
- [ ] Damage assessment forms
- [ ] Late fee calculations UI

---

## 📖 Usage Examples

### Create Instrument Item

```javascript
const newItem = await AuthService.post('/instrument-items', {
  instrument_id: 15,
  serial_number: 'PER-15-1-0010',
  location_id: 1,
  status: 'Available',
  condition_status: 'Excellent',
  acquisition_date: '2025-11-07',
  purchase_cost: 18000.00
});
```

### Log Maintenance

```javascript
const maintenance = await AuthService.post('/maintenance', {
  instrument_item_id: 5,
  maintenance_type: 'Repair',
  description: 'Fixed broken snare wire',
  cost: 800.00,
  completed_date: '2025-11-07',
  before_condition: 'Poor',
  after_condition: 'Good',
  parts_replaced: 'Snare wire'
});
```

### Get Dashboard Stats

```javascript
const stats = await AuthService.get('/instrument-items/stats/dashboard');
console.log(`Total: ${stats.stats.total}`);
console.log(`Available: ${stats.stats.available}`);
console.log(`Under Maintenance: ${stats.stats.under_maintenance}`);
```

---

## 🔒 Security & Permissions

All endpoints require authentication via `authenticateToken` middleware.

**Recommended Role-Based Access:**
- **Admin**: Full access to all endpoints
- **Staff**: Read access + create/update maintenance
- **Members**: Read-only access to available items

Implement in middleware:
```javascript
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  // Only admins can create items
});
```

---

## 📈 Performance Considerations

### Indexed Fields
All critical foreign keys and search fields are indexed:
- `instrument_items.serial_number`
- `instrument_items.instrument_id`
- `instrument_items.location_id`
- `instrument_items.status`
- `maintenance_history.instrument_item_id`
- `audit_log.table_name, record_id`

### Query Optimization
- Use specific filters to reduce dataset size
- Limit results when appropriate
- Use JOIN efficiently with proper indexes

---

## 🐛 Troubleshooting

### Migration Issues

**Problem:** Foreign key constraint fails  
**Solution:** Ensure parent tables (instruments, locations, users) exist and have data

**Problem:** Duplicate serial number error  
**Solution:** Serial numbers must be unique across all items

### API Issues

**Problem:** 401 Unauthorized  
**Solution:** Ensure valid JWT token in Authorization header

**Problem:** 404 Not Found  
**Solution:** Verify backend routes are registered in `server.js`

---

## 📝 Next Steps

1. **Run Migration**: Execute `010_add_instrument_items_and_maintenance.sql`
2. **Test API**: Use Postman or similar to test new endpoints
3. **Build Frontend**: Implement dashboard and filters
4. **Add Photos**: Implement upload functionality
5. **Generate Barcodes**: Integrate barcode library
6. **Create Reports**: Build reporting UI
7. **Export Features**: Add PDF/CSV export

---

## 📞 Support

For issues or questions:
1. Check database migration logs
2. Review API response messages
3. Check browser console for errors
4. Verify authentication tokens

---

**Version:** 2.0  
**Last Updated:** November 7, 2025  
**Migration File:** `database/migrations/010_add_instrument_items_and_maintenance.sql`
