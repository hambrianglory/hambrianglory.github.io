# Google Sheets Integration Guide

This guide explains how to use Google Sheets instead of Excel files for managing your community fee data.

## Quick Start

### 1. Download CSV Templates

In the Admin Dashboard, you can download CSV templates that are compatible with Google Sheets:

- **Users Template**: Download the CSV version of the users template
- **Payments Template**: Download the CSV version of the payments template

### 2. Import to Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Go to **File > Import**
4. Upload the downloaded CSV template
5. Choose "Replace spreadsheet" and click "Import data"

### 3. Edit Your Data

#### Users Sheet Columns:
- `id`: Unique identifier for each user
- `name`: Full name of the member
- `email`: Email address
- `phone`: Phone number (include country code, e.g., +94112345678)
- `nicNumber`: National Identity Card number
- `dateOfBirth`: Date of birth (YYYY-MM-DD format)
- `address`: Full address
- `role`: Either "admin" or "member"
- `houseNumber`: House/unit number
- `membershipDate`: Date when membership started (YYYY-MM-DD format)
- `isActive`: "true" or "false"

#### Payments Sheet Columns:
- `id`: Unique identifier for each payment
- `userId`: Must match a user ID from the users sheet
- `amount`: Payment amount in LKR cents (50000 = LKR 500.00)
- `paymentDate`: Date of payment (YYYY-MM-DD format)
- `paymentType`: Always use "quarterly_sanda_fee"
- `description`: Description of the payment
- `status`: "pending", "completed", or "overdue"
- `quarter`: "Q1", "Q2", "Q3", or "Q4"
- `year`: Payment year (e.g., 2025)
- `method`: Payment method (e.g., "cash", "bank_transfer", "online")
- `receiptNumber`: Receipt or transaction number (optional)

### 4. Export from Google Sheets

1. In Google Sheets, go to **File > Download**
2. Choose **Comma-separated values (.csv, current sheet)**
3. Save the file

### 5. Upload to System

1. In the Admin Dashboard, use the file upload section
2. Select your CSV file
3. The system will automatically detect the format and process the data

## Quarterly Payment System

The system uses a quarterly payment structure:

- **Q1**: January - March (Due: March 31)
- **Q2**: April - June (Due: June 30)
- **Q3**: July - September (Due: September 30)
- **Q4**: October - December (Due: December 31)

Each quarter, members pay **LKR 500** (entered as **50000** in the amount field).

## Sample Data

### Users Sample:
```csv
id,name,email,phone,nicNumber,dateOfBirth,address,role,houseNumber,membershipDate,isActive
user_001,John Doe,john@example.com,+94112345678,199012345678,1990-03-22,"123 Galle Road, Colombo 03",member,A-101,2024-01-01,true
user_002,Jane Smith,jane@example.com,+94112345679,199212345678,1992-08-15,"456 Marine Drive, Colombo 03",member,B-205,2024-02-01,true
```

### Payments Sample:
```csv
id,userId,amount,paymentDate,paymentType,description,status,quarter,year,method,receiptNumber
payment_001,user_001,50000,2025-03-31,quarterly_sanda_fee,Q1 2025 Annual Sanda Fee,completed,Q1,2025,cash,RCP001
payment_002,user_001,50000,2025-06-30,quarterly_sanda_fee,Q2 2025 Annual Sanda Fee,pending,Q2,2025,bank_transfer,
payment_003,user_002,50000,2025-03-31,quarterly_sanda_fee,Q1 2025 Annual Sanda Fee,completed,Q1,2025,online,RCP003
```

## Tips for Google Sheets

1. **Use Data Validation**: Set up dropdown lists for status, quarter, role, and method columns
2. **Format Dates**: Use the date format YYYY-MM-DD for consistency
3. **Freeze Headers**: Freeze the first row to keep column headers visible
4. **Sort Data**: Sort by user ID or payment date for better organization
5. **Share Carefully**: Only share with authorized community administrators

## Troubleshooting

### Common Issues:

1. **Date Format Errors**: Ensure dates are in YYYY-MM-DD format
2. **Amount Format**: Enter amounts in cents (50000 for LKR 500)
3. **Missing Required Fields**: All columns except houseNumber are required
4. **Invalid Status Values**: Use only "pending", "completed", or "overdue"
5. **Quarter Format**: Use only "Q1", "Q2", "Q3", or "Q4"

### Error Messages:

- If you see "Invalid file format", ensure you're uploading a .csv file
- If data import fails, check that all required columns are present
- If user references fail, ensure userId in payments matches id in users sheet

## Advanced Features

### Batch Operations:
- Import multiple quarters of payments at once
- Update member status in bulk
- Generate payment reports for specific quarters

### Integration with Google Sheets API:
- Future versions may support direct Google Sheets API integration
- This would allow real-time synchronization without file uploads
- Contact support for enterprise integration options

## Support

For additional help with Google Sheets integration:
1. Check the system logs in Admin Dashboard
2. Verify your CSV format matches the templates
3. Contact your system administrator for assistance
