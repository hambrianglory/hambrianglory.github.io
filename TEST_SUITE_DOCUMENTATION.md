# Test Suite Documentation

## Overview
This project contains **23 test scripts** that cover all aspects of the Community Fee Management System. This document provides a comprehensive guide to understanding, organizing, and running these tests.

## Test Categories

### 🔐 Authentication Tests (`auth/`)
These tests focus on login, password management, and security features.

| Test File | Description | Status | Purpose |
|-----------|-------------|--------|---------|
| `test-argon2-auth.ps1` | **[CURRENT]** Argon2 password encryption and authentication | ✅ Active | Complete authentication workflow with Argon2 |
| `test-final-auth.ps1` | Final authentication system testing | 📝 Legacy | Previous auth implementation |
| `test-login-final.ps1` | Login workflow testing | 📝 Legacy | Login process validation |
| `test-login-diagnosis.ps1` | Login troubleshooting and diagnosis | 📝 Legacy | Debug login issues |
| `test-login-debug.ps1` | Login debugging utilities | 📝 Legacy | Detailed login debugging |
| `test-nic-authentication.ps1` | NIC-based authentication testing | 📝 Legacy | NIC number validation |
| `test-admin-login.ps1` | Admin login functionality | 📝 Legacy | Admin access testing |

**Recommended**: Use `test-argon2-auth.ps1` for current authentication testing.

### 👨‍💼 Admin Tests (`admin/`)
These tests cover administrative functions and account management.

| Test File | Description | Status | Purpose |
|-----------|-------------|--------|---------|
| `test-account-management.ps1` | Admin account management (unlock/reset) | ✅ Active | Account unlock/reset functionality |
| `test-admin-features.ps1` | Admin dashboard and features | ✅ Active | Complete admin interface testing |
| `reset-lockout.ps1` | Reset account lockouts utility | 🔧 Utility | Emergency account unlock |

### 🚀 Feature Tests (`features/`)
These tests cover core application functionality.

| Test File | Description | Status | Purpose |
|-----------|-------------|--------|---------|
| `test-excel-upload.ps1` | Excel file upload functionality | ✅ Active | Bulk data import via Excel |
| `test-actual-upload.ps1` | File upload testing | ✅ Active | General file upload validation |
| `test-overdue-payments.ps1` | Overdue payment tracking | ✅ Active | Payment status management |
| `test-phone-normalization.ps1` | Phone number normalization | ✅ Active | Phone format standardization |
| `test-profile-pictures.ps1` | Profile picture upload/management | ✅ Active | Image upload and storage |
| `test-stats-update.ps1` | Statistics update functionality | ✅ Active | Dashboard statistics |
| `test-whatsapp-api.ps1` | WhatsApp integration | ✅ Active | Messaging integration |
| `test-member-features.ps1` | Member-specific features | ✅ Active | Member role functionality |
| `test-member-tab.ps1` | Member tab functionality | ✅ Active | Member interface testing |
| `test-member-role-persistence.ps1` | Member role persistence | ✅ Active | Role data persistence |
| `test-edit-features.ps1` | Data editing features | ✅ Active | CRUD operations |

### 🎨 UI Tests (`ui/`)
These tests focus on user interface and visual components.

| Test File | Description | Status | Purpose |
|-----------|-------------|--------|---------|
| `test-ui-fixes.ps1` | UI bug fixes and improvements | ✅ Active | Interface functionality |
| `test-colorful-ui-restoration.ps1` | UI color scheme restoration | ✅ Active | Visual theme testing |
| `test-demo-data-cleanup.ps1` | Demo data cleanup | ✅ Active | Data management |

## Test Management

### Quick Start
```powershell
# List all available tests
.\run-tests.ps1 -List

# Run all authentication tests
.\run-tests.ps1 -Category auth

# Run a specific test
.\run-tests.ps1 -TestName test-argon2-auth.ps1

# Organize test files into folders
.\run-tests.ps1 -Organize

# Run all tests (with confirmation)
.\run-tests.ps1
```

### Test Organization
Use the test runner to organize files into logical folders:

```
tests/
├── auth/           # Authentication and security tests
├── admin/          # Administrative function tests
├── features/       # Core feature tests
├── ui/             # User interface tests
└── utils/          # Utility and helper scripts
```

### Current vs Legacy Tests

#### ✅ **Current/Active Tests**
These are the primary tests that should be used for validation:
- `test-argon2-auth.ps1` - **Main authentication test**
- `test-account-management.ps1` - Admin account management
- `test-admin-features.ps1` - Admin dashboard
- All feature tests (Excel upload, payments, etc.)
- All UI tests

#### 📝 **Legacy Tests**
These tests were used during development but are superseded:
- `test-final-auth.ps1` - Replaced by `test-argon2-auth.ps1`
- `test-login-*` series - Consolidated into current auth tests
- `test-nic-authentication.ps1` - Now part of main auth flow

#### 🔧 **Utility Tests**
These are emergency/maintenance tools:
- `reset-lockout.ps1` - Emergency account unlock

## Test Execution Strategy

### 1. Pre-Deployment Testing
```powershell
# Essential tests before deployment
.\run-tests.ps1 -TestName test-argon2-auth.ps1      # Security
.\run-tests.ps1 -TestName test-admin-features.ps1   # Admin functions
.\run-tests.ps1 -TestName test-excel-upload.ps1     # Data import
```

### 2. Full System Testing
```powershell
# Complete test suite
.\run-tests.ps1 -Category auth
.\run-tests.ps1 -Category admin
.\run-tests.ps1 -Category features
.\run-tests.ps1 -Category ui
```

### 3. Regression Testing
```powershell
# After code changes
.\run-tests.ps1 -Category auth     # If auth changes
.\run-tests.ps1 -Category features # If feature changes
```

### 4. Emergency Scenarios
```powershell
# If accounts are locked
.\reset-lockout.ps1

# If authentication issues
.\run-tests.ps1 -TestName test-argon2-auth.ps1
```

## Test Environment Setup

### Prerequisites
1. **Server Running**: `npm run dev` on port 3000/3001
2. **Environment Variables**: `.env.local` configured
3. **Clean State**: Fresh data for consistent results
4. **PowerShell**: Execution policy allows script running

### Test Data Management
```powershell
# Clear test data for fresh start
Remove-Item -Path "private\data\*" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "private\passwords\*" -Force -ErrorAction SilentlyContinue
```

## Test Results Interpretation

### ✅ **Success Indicators**
- Tests complete without errors (exit code 0)
- Green checkmarks in output
- Expected HTTP status codes (200, 201, etc.)
- Proper data persistence

### ❌ **Failure Indicators**
- Red error messages
- HTTP error codes (401, 500, etc.)
- Exception stack traces
- Data inconsistencies

### ⚠️ **Warning Signs**
- Yellow warnings (non-critical issues)
- Performance slower than expected
- Partial functionality working

## Maintenance Guidelines

### Adding New Tests
1. Create test file following naming convention: `test-[feature-name].ps1`
2. Add to appropriate category in `run-tests.ps1`
3. Document in this file
4. Test the test runner integration

### Retiring Old Tests
1. Mark as 📝 Legacy in test runner
2. Move to `tests/legacy/` folder
3. Update documentation
4. Keep for reference but don't run in main suite

### Test Review Schedule
- **Weekly**: Run full test suite
- **Before releases**: Complete regression testing
- **After major changes**: Relevant category testing
- **Monthly**: Review and update test documentation

## Troubleshooting Common Issues

### Server Not Running
```
Error: Connection refused
Solution: Start server with npm run dev
```

### Authentication Failures
```
Error: 401 Unauthorized
Solution: Clear password files and restart server
```

### File Upload Issues
```
Error: File not found
Solution: Check file paths and permissions
```

### Database/Data Issues
```
Error: Data persistence
Solution: Clear private/data folder and reinitialize
```

## Integration with CI/CD

### Automated Testing
```yaml
# Example GitHub Actions integration
- name: Run Authentication Tests
  run: .\run-tests.ps1 -Category auth

- name: Run Feature Tests
  run: .\run-tests.ps1 -Category features
```

### Test Reports
The test runner outputs can be captured for automated reporting:
```powershell
.\run-tests.ps1 -Category auth > test-results.log 2>&1
```

## Best Practices

### 1. Test Order
- Always run auth tests first
- Admin tests after auth is verified
- Feature tests in logical order
- UI tests last

### 2. Data Management
- Use fresh data for each test run
- Clean up after tests
- Don't rely on previous test data

### 3. Error Handling
- Check exit codes
- Capture error output
- Provide clear failure messages

### 4. Performance
- Monitor test execution time
- Identify slow tests
- Optimize critical paths

## Conclusion

This comprehensive test suite ensures the reliability and security of the Community Fee Management System. The organized structure makes it easy to:

- Run targeted tests for specific functionality
- Maintain and update test coverage
- Integrate with development workflows
- Troubleshoot issues efficiently

**Key Recommendations:**
1. Use `test-argon2-auth.ps1` as the primary authentication test
2. Run the full suite before any deployment
3. Organize files using `.\run-tests.ps1 -Organize`
4. Regularly review and update test documentation
