# Admin Login Credentials

## 🔐 Admin Account

### Primary Admin Account
- **Email**: `admin@hambrianglory.lk`
- **Password**: `admin123`
- **User**: Community Admin

## 🏠 Member Access
- Members are added via Excel upload or manual entry through the admin panel
- Members must contact the administrator to receive login credentials
- All user data is managed through the admin interface

## 🚀 Quick Access
To access the admin panel:
1. Go to: `http://localhost:3002/login`
2. Use the admin credentials above
3. You'll be redirected to the admin dashboard

## 🛡️ Security Notes
- Only one admin login is available for security
- Admin can add/edit/delete members through the admin panel
- Change the admin password in production by updating the login route
- Consider implementing proper password hashing for production use

## 📱 Admin Features Available
- View community statistics
- Manage members (view, edit, delete, search)
- Upload member/payment data (Excel/CSV)
- Send WhatsApp messages (announcements, reminders)
- Download templates
- View overdue payments
- Manual member addition

## 🔧 Technical Details
- Admin credentials are stored in: `src/app/api/auth/login/route.ts`
- Admin user data is in: `src/lib/data.ts`
- Session managed via JWT tokens
- Demo data has been cleaned up to contain only essential admin user

## 🗂️ Data Management
- System starts with only one admin user
- All members and payments are added through the admin interface
- Excel upload feature allows bulk member/payment import
- Data persists during the session (in-memory storage)
