# Community Fee Management System

A comprehensive web application for managing community quarterly Sanda fees, payments, and communications. Built with Next.js, TypeScript, and Tailwind CSS.

## 🎉 **Project Status: COMPLETE**

✅ **Mobile Optimization**: Fully responsive design optimized for phone users  
✅ **WhatsApp Integration**: Complete messaging system with Business API support  
✅ **All Features**: Core functionality implemented and tested  
✅ **Production Ready**: Ready for deployment with real WhatsApp Business API  

---

## Features

### 🏠 **Landing Page**
- Modern, responsive design
- Community overview and statistics
- Login button and navigation
- About section with community details

### 👥 **User Management**
- Individual user credentials for all members
- Excel import/export functionality
- User role management (Admin/Member)
- Automated credential generation

### 💰 **Payment Tracking**
- Quarterly Sanda fee payment system (LKR 500 per quarter)
- Individual payment dashboard for users
- Pending payment notifications
- Payment history and quarterly records
- Community balance transparency

### 📊 **Admin Dashboard**
- Complete member management
- Payment oversight and quarterly reporting
- Excel data import/export
- Financial reports and analytics

### 📱 **WhatsApp Integration**
- **Automated Payment Reminders**: Quarterly Sanda fee notifications
- **Community Announcements**: Broadcast important news to all members
- **Emergency Alerts**: Instant notifications for urgent situations
- **Welcome Messages**: Automated onboarding for new members
- **Message Templates**: Customizable templates for different scenarios
- **Bulk Messaging**: Send messages to multiple recipients efficiently
- **Delivery Tracking**: Monitor message delivery and read status
- **Admin Interface**: Easy-to-use WhatsApp management panel
- **Real-time Notifications**: Instant communication with residents

### 📰 **Community Blog/News**
- News and updates section
- Admin-managed blog posts
- Community announcements
- Event notifications

### 🏛️ **Committee Management**
- Committee member profiles
- Role-based information (President, Vice President, etc.)
- Contact information and responsibilities

### 📈 **Financial Transparency**
- Community balance visibility
- Expense tracking and reporting
- Payment collection statistics
- Budget allocation transparency

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Data Management**: Excel files (.xlsx) and Google Sheets (.csv) - no database required
- **Authentication**: JWT-based auth system
- **File Processing**: xlsx library for Excel, CSV parsing for Google Sheets

## Data Management Options

### 📊 **Excel Files (.xlsx)**
- Traditional Excel workbook format
- Download Excel templates from admin dashboard
- Upload .xlsx files directly to the system

### 📈 **Google Sheets (.csv)**
- Modern cloud-based spreadsheet solution
- Download CSV templates compatible with Google Sheets
- Edit in Google Sheets and export as CSV
- Upload CSV files to the system
- See [Google Sheets Integration Guide](./GOOGLE_SHEETS_GUIDE.md) for detailed instructions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd community-fee-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```
   JWT_SECRET=your-super-secret-jwt-key
   NEXTAUTH_SECRET=your-nextauth-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Demo Credentials

### Admin Access
- **Email**: admin@community.com
- **Password**: admin123

### Member Access
- **Email**: john@example.com
- **Password**: member123

## Excel Data Management

### Downloading Templates

The system provides pre-formatted Excel templates to ensure data consistency:

1. **Access Admin Dashboard**: Login as admin and navigate to the admin panel
2. **Find Export Data Section**: Look for the "Export Data" card in the quick actions
3. **Download Templates**: Click on:
   - "Download Users Template" - for importing user data
   - "Download Payments Template" - for importing payment data

### API Endpoints for Templates

You can also download templates directly via API:
- Users Template: `GET /api/templates?type=users`
- Payments Template: `GET /api/templates?type=payments`

### Users Data Format
The system expects Excel files with the following columns for users:

| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique user identifier |
| name | String | Full name |
| email | String | Email address |
| phone | String | Phone number (+94 format for Sri Lanka) |
| nicNumber | String | National Identity Card Number |
| dateOfBirth | Date | Date of Birth (YYYY-MM-DD format) |
| address | String | Full address |
| role | String | 'admin' or 'member' |
| houseNumber | String | House/unit number |
| membershipDate | Date | Join date (YYYY-MM-DD format) |
| isActive | Boolean | Active status (true/false) |

### Payments Data Format

| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique payment identifier |
| userId | String | Reference to user ID |
| amount | Number | Payment amount |
| paymentDate | Date | Payment due/completion date |
| paymentType | String | Type of payment |
| description | String | Payment description |
| receiptNumber | String | Receipt number |
| status | String | 'pending', 'completed', 'overdue' |

## File Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── users/         # User management
│   │   └── dashboard/     # Dashboard data
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── blog/              # Community news
│   ├── committee/         # Committee members
│   ├── about/             # About page
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication service
│   ├── data.ts           # Data management service
│   ├── excel.ts          # Excel processing
│   ├── whatsapp.ts       # WhatsApp integration
│   └── utils.ts          # Utility functions
└── types/                # TypeScript definitions
    └── index.ts          # Type definitions
```

## Features in Detail

### 1. Excel Import/Export
- Bulk user data import from Excel
- Payment data import/export
- Template generation for proper formatting
- Error handling for invalid data

### 2. WhatsApp Notifications
- Payment reminder automation
- Community announcement broadcasting
- Individual member notifications
- Group messaging integration

### 3. Role-Based Access Control
- Admin: Full system access
- Member: Personal data and community info only
- Secure authentication with JWT tokens

### 4. Payment Management
- Individual payment tracking
- Due date notifications
- Payment history
- Receipt management

### 5. Community Transparency
- Real-time balance updates
- Expense tracking
- Budget allocation visibility
- Payment compliance statistics

## Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables for Production
Ensure all environment variables are set in your production environment:
- `JWT_SECRET`: Strong secret key for JWT tokens
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `NEXTAUTH_URL`: Production URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Roadmap

### Upcoming Features
- [ ] Mobile app integration
- [ ] Advanced reporting dashboard
- [ ] Integration with payment gateways
- [ ] Multi-language support
- [ ] Advanced WhatsApp Business API integration
- [ ] Automated backup system
- [ ] Enhanced security features

---

**Built with ❤️ for community management**
