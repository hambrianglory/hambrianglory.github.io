# NIC-Based Authentication System

## Overview
The Hambrian Glory Community Fee Management System now uses a secure NIC-based authentication system where users' National Identity Card (NIC) numbers serve as temporary passwords for initial login.

## Features

### 🔐 **Secure Authentication**
- **NIC as Temporary Password**: All users (admin and members) initially use their NIC number as password
- **Forced Password Change**: Users must change their password on first login
- **Encrypted Storage**: All passwords are encrypted using AES-256-CBC and stored in a private directory
- **Account Lockout**: Accounts are locked for 15 minutes after 5 failed login attempts
- **JWT Tokens**: Secure JSON Web Token authentication for session management

### 🛡️ **Password Security**
- **Strong Password Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter  
  - At least one number
- **Salt-based Hashing**: PBKDF2 with 10,000 iterations and unique salt per password
- **Separate Encrypted Storage**: Passwords stored in `/private/passwords/` directory

### 👥 **User Management**
- **Automatic Initialization**: New users automatically get NIC-based temporary passwords
- **Role-based Access**: Admin and member roles with different access levels
- **Profile Management**: Users can change their passwords after initial login

## System Architecture

```
├── src/lib/passwordService.ts     # Core password management
├── src/app/api/auth/login/route.ts # Authentication API
├── private/passwords/             # Encrypted password storage
├── src/app/login/page.tsx         # Login UI with password change
└── .env.example                   # Environment configuration
```

## Configuration

### Environment Variables
Add these to your `.env.local` file:

```bash
# Password Encryption (32-byte hex key)
PASSWORD_ENCRYPTION_KEY=your_32_byte_encryption_key_here

# JWT Secret for authentication tokens
JWT_SECRET=your_jwt_secret_key_here
```

### Generate Encryption Key
```bash
# Generate a secure 32-byte encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Usage Guide

### 1. **Admin First Login**
- **Email**: `admin@hambrianglory.lk`
- **Password**: `198512345678` (NIC number)
- **Action**: System will prompt to change password

### 2. **Member Login Process**
1. Use email address and NIC number as password
2. System detects temporary password
3. Follow password change prompts
4. Use new password for subsequent logins

### 3. **Adding New Members**
- When adding members via admin panel or Excel upload
- System automatically creates NIC-based temporary password
- Member receives email with login instructions

## API Endpoints

### POST `/api/auth/login`
**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "their_nic_or_password"
}
```

**Login Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin|member"
  },
  "requiresPasswordChange": true|false
}
```

**Password Change Request:**
```json
{
  "email": "user@example.com",
  "oldPassword": "current_password",
  "newPassword": "new_secure_password",
  "isChangePassword": true
}
```

## Security Features

### 🔒 **Encryption Details**
- **Algorithm**: AES-256-CBC
- **Key Derivation**: PBKDF2 with SHA-512
- **Salt**: 32 random bytes per password
- **Iterations**: 10,000 for PBKDF2

### 🚫 **Account Protection**
- **Failed Attempts**: Max 5 attempts before lockout
- **Lockout Duration**: 15 minutes
- **Automatic Reset**: Failed attempts reset on successful login

### 📁 **File Storage**
- **Location**: `/private/passwords/{userId}.pwd`
- **Format**: Encrypted JSON with metadata
- **Permissions**: Private directory (excluded from git)

## Testing

### Manual Testing
1. Go to `http://localhost:3000/login`
2. Test admin login: `admin@hambrianglory.lk` / `198512345678`
3. Complete password change process
4. Test new password login

### Automated Testing
```bash
# Run the comprehensive test suite
.\test-nic-authentication.ps1
```

## Password File Structure

```json
{
  "userId": "user_id",
  "hashedPassword": "pbkdf2_hash",
  "salt": "random_salt",
  "isTemporary": true|false,
  "lastChanged": "2025-07-02T10:30:00.000Z",
  "failedAttempts": 0,
  "lockedUntil": "optional_lockout_time"
}
```

## Migration from Old System

### For Existing Users
1. **Admin**: Use NIC `198512345678` as initial password
2. **Members**: Use their respective NIC numbers
3. **First Login**: System will prompt password change
4. **Data Persistence**: All other user data remains unchanged

### For New Installations
- System automatically sets up admin with NIC-based authentication
- All new users get temporary passwords based on their NIC numbers

## Troubleshooting

### Common Issues

**1. "Account is temporarily locked"**
- Wait 15 minutes or contact admin to reset

**2. "Password must meet requirements"**
- Ensure 8+ characters with uppercase, lowercase, and number

**3. "Invalid email or password"**
- Check NIC number formatting (no spaces or dashes)
- Verify email address is correct

**4. Decryption errors after update**
- Clear `/private/passwords/` directory
- Users will need to re-initialize passwords

### Admin Actions
- **Reset User Password**: Delete user's password file to force NIC reset
- **View Failed Attempts**: Check server logs for authentication attempts
- **Unlock Account**: Delete user's password file and recreate

## Best Practices

### For Users
1. **Change Password Immediately** after first login
2. **Use Strong Passwords** meeting all requirements  
3. **Don't Share Credentials** with other community members
4. **Report Issues** to community admin promptly

### For Administrators
1. **Secure Environment Variables** in production
2. **Regular Backups** of encrypted password directory
3. **Monitor Failed Attempts** for security threats
4. **User Education** about password requirements

## Future Enhancements

- [ ] Password expiration policies
- [ ] Two-factor authentication (2FA)
- [ ] Password history to prevent reuse
- [ ] Admin dashboard for user account management
- [ ] Email notifications for security events
- [ ] Integration with community member database

---

*This system provides enterprise-grade security while maintaining simplicity for community members. The NIC-based approach ensures easy initial access while enforcing strong security practices.*
