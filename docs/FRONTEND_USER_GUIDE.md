# Frontend Instrument Inventory Features - User Guide

## Overview
Two new admin-only sections have been added to the dashboard for managing individual instrument items and maintenance tracking.

## Accessing the Features

### From the Dashboard Sidebar
1. **Instrument Items** - Located under "Management" section
   - Icon: 📦 (boxes icon)
   - Admin-only feature
   
2. **Maintenance** - Located under "Management" section
   - Icon: 🔧 (tools icon)
   - Admin-only feature

## Instrument Items Manager

### Features
- **Dashboard Statistics**
  - Total Items count
  - Available Items count
  - Rented Items count
  - Items in Maintenance
  - Total Value (purchase cost sum)

### Filters
- Search by serial number
- Filter by instrument type
- Filter by location
- Filter by status (Available, Rented, Borrowed, Under Maintenance, Reserved, Retired)
- Filter by condition (Excellent, Good, Fair, Poor, Needs Repair)

### Actions
1. **Add New Item**
   - Click "+ Add New Instrument Item" button
   - Fill in required fields:
     - Instrument (select from existing)
     - Serial Number (must be unique)
     - Location
     - Status
     - Condition
     - Acquisition Date
     - Purchase Cost
     - Notes

2. **View Item Details**
   - Click "View" button on any item
   - Shows full item information
   - Displays maintenance history for that item
   - Shows condition assessments

3. **Edit Item**
   - Click "Edit" button on any item
   - Update any field
   - Changes are saved to database

4. **Delete Item**
   - Click "Delete" button (red)
   - Confirms before deletion
   - Soft delete (sets is_active = FALSE)

### Item Table Columns
- Serial Number (bold, unique identifier)
- Instrument Name
- Location
- Status (colored badge)
- Condition (colored badge)
- Acquisition Date
- Actions (View, Edit, Delete)

## Maintenance Manager

### Features
- **Dashboard Statistics**
  - Total Records count
  - Routine Maintenance count
  - Repairs count
  - Total Cost spent
  - Average Cost per maintenance

### Upcoming Maintenance Section
- Displays scheduled maintenance that hasn't been completed
- Shows serial number, date, type, and description
- Yellow highlighted cards for visibility

### Maintenance History Table
- Complete list of all maintenance records
- Columns:
  - Date (completed or scheduled)
  - Serial Number
  - Type (Routine, Repair, Emergency, Inspection, Cleaning, Part Replacement, Other)
  - Description
  - Cost (₱ format)
  - Status (Scheduled, In Progress, Completed, Cancelled)
  - Actions (Edit)

### Actions
1. **Add Maintenance Record**
   - Click "+ Add Maintenance Record" button
   - Fill in form:
     - **Required:**
       - Instrument Item (select by serial number)
       - Maintenance Type
       - Description
     - **Optional:**
       - Cost
       - Performed By (technician name)
       - Scheduled Date
       - Completed Date
       - Next Maintenance Date
       - Status
       - Parts Replaced
       - Before/After Condition
       - Additional Notes

2. **Edit Maintenance Record**
   - Click "Edit" on any record
   - Update fields
   - Changes saved to database
   - If "After Condition" is set, it automatically updates the instrument item's condition

## Color Coding

### Status Badges
- 🟢 **Available** - Green background
- 🟡 **Rented/Borrowed/Reserved** - Orange/yellow background
- 🔴 **Under Maintenance/Retired** - Red background

### Condition Badges
- 🟢 **Excellent** - Green background
- 🔵 **Good** - Blue background
- 🟡 **Fair** - Orange background
- 🔴 **Poor/Needs Repair** - Red background

### Maintenance Type Badges
- 🔵 **Routine/Inspection** - Blue background
- 🟡 **Repair** - Orange background
- 🔴 **Emergency** - Red background

## Integration with Existing System

### Automatic Updates
- When maintenance record is created with "After Condition", the instrument item's condition is automatically updated
- Last maintenance date is tracked automatically
- Audit log records all changes (CREATE, UPDATE, DELETE actions)

### Relationships
- Each instrument item links to:
  - Parent instrument (from instruments table)
  - Current location (from locations table)
  - Current rental/borrow request (if applicable)
  - Maintenance history
  - Condition assessments

## Tips for Best Use

### Serial Number Format
The backend generates serial numbers automatically in format:
```
[CATEGORY-3LETTERS]-[INSTRUMENT_ID]-[LOCATION_ID]-[SEQUENCE]
Example: PER-5-2-0001
```

But you can use any format you prefer when adding manually.

### Regular Maintenance Scheduling
1. Create maintenance records with "Scheduled" status
2. Set "Scheduled Date" and "Next Maintenance Date"
3. They'll appear in "Upcoming Maintenance" section
4. When completed, edit and change status to "Completed" and add "Completed Date"

### Condition Tracking
- Use "Before Condition" and "After Condition" in maintenance records
- System automatically updates item condition based on "After Condition"
- Track degradation over time through maintenance history

### Cost Tracking
- Enter costs for all maintenance activities
- View total and average costs in dashboard
- Use for budgeting and financial reporting

## API Endpoints Used

### Instrument Items
- `GET /api/instrument-items` - List with filters
- `GET /api/instrument-items/:id` - Single item with details
- `POST /api/instrument-items` - Create new item
- `PUT /api/instrument-items/:id` - Update item
- `DELETE /api/instrument-items/:id` - Delete item
- `GET /api/instrument-items/stats/dashboard` - Statistics

### Maintenance
- `GET /api/maintenance` - List all records
- `GET /api/maintenance/:id` - Single record
- `POST /api/maintenance` - Create record
- `PUT /api/maintenance/:id` - Update record
- `GET /api/maintenance/upcoming/scheduled` - Upcoming maintenance
- `GET /api/maintenance/stats/summary` - Statistics

## Next Steps (Optional Enhancements)

1. **Barcode Generation**
   - Install react-barcode: `npm install react-barcode`
   - Add barcode display on item details
   - Print barcode labels

2. **Photo Upload**
   - Add file upload for instrument photos
   - Store in uploads/ directory
   - Display in item details and maintenance records

3. **Export Reports**
   - Export to CSV using react-csv
   - Export to PDF using jsPDF
   - Create maintenance schedules
   - Generate cost reports

## Troubleshooting

### "Failed to fetch instrument items"
- Check that backend server is running (port 5000)
- Verify database migration 010 has been run
- Check browser console for detailed errors

### Items not appearing
- Verify filters aren't too restrictive
- Check that items have is_active = TRUE
- Ensure user is logged in as admin

### Changes not saving
- Check authentication token is valid
- Verify required fields are filled
- Check network tab for API errors
- Ensure database tables exist

## Database Migration Required

Before using these features, you must run the database migration:

```powershell
# From PowerShell in the database/migrations directory
Get-Content 010_add_instrument_items_and_maintenance.sql | mysql -u root -p dbemb
```

This creates:
- instrument_items table
- maintenance_history table
- audit_log table
- condition_assessments table
- Extends rent_requests and borrow_requests tables

## Support
For issues or questions, check:
- INSTRUMENT_ENHANCEMENTS.md - Technical documentation
- ENHANCEMENT_SUMMARY.md - Feature overview
- Backend logs in backend/logs/
- Browser console for frontend errors
