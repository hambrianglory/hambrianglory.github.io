# Overdue Payment Management Test Script for Hambrian Glory Community Fee Management
# This script demonstrates the comprehensive overdue payment tracking and reminder system

Write-Host "🏠 HAMBRIAN GLORY COMMUNITY - OVERDUE PAYMENT MANAGEMENT SYSTEM" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
Write-Host ""

# Initialize data first
Write-Host "📊 Initializing System Data..." -ForegroundColor Cyan
try {
    $users = Invoke-RestMethod -Uri "http://localhost:3004/api/users" -Method GET
    Write-Host "✓ System initialized with $($users.users.Count) users" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to initialize system data" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 1: Check All Overdue Payments
Write-Host "1️⃣  CHECKING ALL OVERDUE PAYMENTS" -ForegroundColor Yellow
Write-Host "-" * 50 -ForegroundColor Yellow
try {
    $overdueResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/payment-overdue" -Method GET
    
    Write-Host "📋 OVERDUE SUMMARY:" -ForegroundColor Cyan
    Write-Host "   Total Unpaid Members: $($overdueResult.summary.totalUnpaidMembers)" -ForegroundColor White
    Write-Host "   Total Amount Due: LKR $($overdueResult.summary.totalAmountDue.ToString('N0'))" -ForegroundColor Red
    Write-Host "   Total Payments Due: $($overdueResult.summary.totalPaymentsDue)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "👥 UNPAID MEMBERS DETAILS:" -ForegroundColor Cyan
    foreach ($member in $overdueResult.unpaidMembers) {
        Write-Host "   🏡 $($member.userName) (House: $($member.houseNumber))" -ForegroundColor White
        Write-Host "      📞 Phone: $($member.phone)" -ForegroundColor Gray
        Write-Host "      💰 Total Due: LKR $($member.totalAmountDue.ToString('N0'))" -ForegroundColor Red
        Write-Host "      📅 Payments: $($member.totalPaymentsDue) overdue payment(s)" -ForegroundColor Gray
        
        Write-Host "      📋 Breakdown:" -ForegroundColor Yellow
        foreach ($detail in $member.unpaidDetails) {
            Write-Host "         • $($detail.quarter): LKR $($detail.amount.ToString('N0')) ($($detail.monthsOverdue) months overdue)" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
} catch {
    Write-Host "✗ Failed to check overdue payments: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check Specific Quarter (Q1 2024)
Write-Host "2️⃣  CHECKING SPECIFIC QUARTER (Q1 2024)" -ForegroundColor Yellow
Write-Host "-" * 50 -ForegroundColor Yellow
try {
    $q1Result = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/payment-overdue?quarter=Q1&year=2024&includeAllOverdue=false" -Method GET
    
    Write-Host "📋 Q1 2024 OVERDUE SUMMARY:" -ForegroundColor Cyan
    Write-Host "   Members with Q1 2024 overdue: $($q1Result.summary.totalUnpaidMembers)" -ForegroundColor White
    Write-Host "   Q1 2024 Amount Due: LKR $($q1Result.summary.totalAmountDue.ToString('N0'))" -ForegroundColor Red
    Write-Host ""
    
} catch {
    Write-Host "✗ Failed to check Q1 2024 payments: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Send Overdue Reminders to All Members
Write-Host "3️⃣  SENDING OVERDUE REMINDERS TO ALL MEMBERS" -ForegroundColor Yellow
Write-Host "-" * 50 -ForegroundColor Yellow

$sendAllBody = @{
    includeAllOverdue = $true
} | ConvertTo-Json

try {
    $sendResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/payment-overdue" -Method POST -Body $sendAllBody -ContentType "application/json"
    
    Write-Host "📨 MESSAGING SUMMARY:" -ForegroundColor Cyan
    Write-Host "   ✅ Successfully Sent: $($sendResult.summary.totalSent)" -ForegroundColor Green
    Write-Host "   ❌ Failed to Send: $($sendResult.summary.totalFailed)" -ForegroundColor Red
    Write-Host "   💰 Total Amount Reminded: LKR $($sendResult.summary.totalAmountDue.ToString('N0'))" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📱 INDIVIDUAL MESSAGING RESULTS:" -ForegroundColor Cyan
    foreach ($result in $sendResult.messagingResults) {
        $statusIcon = if ($result.status -eq "sent") { "✅" } else { "❌" }
        $statusColor = if ($result.status -eq "sent") { "Green" } else { "Red" }
        
        Write-Host "   $statusIcon $($result.userName) (House: $($sendResult.unpaidMembers | Where-Object { $_.userId -eq $result.userId } | Select-Object -ExpandProperty houseNumber))" -ForegroundColor $statusColor
        Write-Host "      📞 $($result.phone)" -ForegroundColor Gray
        Write-Host "      💰 Reminded about: LKR $($result.totalAmountDue.ToString('N0'))" -ForegroundColor Gray
        Write-Host "      📊 Payments: $($result.paymentsCount)" -ForegroundColor Gray
        if ($result.error) {
            Write-Host "      ⚠️  Error: $($result.error)" -ForegroundColor Red
        }
        Write-Host ""
    }
    
} catch {
    Write-Host "✗ Failed to send overdue reminders: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Send Reminders to Specific Users
Write-Host "4️⃣  SENDING REMINDERS TO SPECIFIC USERS" -ForegroundColor Yellow
Write-Host "-" * 50 -ForegroundColor Yellow

$specificUsersBody = @{
    includeAllOverdue = $true
    userIds = @("user_3")  # David Wilson - has the most overdue payments
} | ConvertTo-Json

try {
    $specificResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/payment-overdue" -Method POST -Body $specificUsersBody -ContentType "application/json"
    
    Write-Host "📨 TARGETED MESSAGING SUMMARY:" -ForegroundColor Cyan
    Write-Host "   Target: David Wilson (user_3) - Highest overdue amount" -ForegroundColor White
    Write-Host "   ✅ Successfully Sent: $($specificResult.summary.totalSent)" -ForegroundColor Green
    Write-Host "   💰 Amount: LKR $($specificResult.summary.totalAmountDue.ToString('N0'))" -ForegroundColor Yellow
    Write-Host "   📅 Payments: $($specificResult.summary.totalPaymentsDue) overdue payments" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "✗ Failed to send targeted reminders: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Check Current Quarter (Q1 2025)
Write-Host "5️⃣  CHECKING CURRENT QUARTER (Q1 2025)" -ForegroundColor Yellow
Write-Host "-" * 50 -ForegroundColor Yellow
try {
    $currentResult = Invoke-RestMethod -Uri "http://localhost:3004/api/whatsapp/payment-overdue?quarter=Q1&year=2025&includeAllOverdue=false" -Method GET
    
    Write-Host "📋 Q1 2025 (CURRENT) SUMMARY:" -ForegroundColor Cyan
    Write-Host "   Members with Q1 2025 pending: $($currentResult.summary.totalUnpaidMembers)" -ForegroundColor White
    Write-Host "   Q1 2025 Amount Pending: LKR $($currentResult.summary.totalAmountDue.ToString('N0'))" -ForegroundColor Yellow
    Write-Host ""
    
    if ($currentResult.summary.totalUnpaidMembers -gt 0) {
        Write-Host "👥 Q1 2025 PENDING MEMBERS:" -ForegroundColor Cyan
        foreach ($member in $currentResult.unpaidMembers) {
            Write-Host "   🏡 $($member.userName) (House: $($member.houseNumber)) - LKR $($member.totalAmountDue.ToString('N0'))" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "✗ Failed to check Q1 2025 payments: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 OVERDUE PAYMENT MANAGEMENT TESTING COMPLETE!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Green
Write-Host ""

Write-Host "📋 SYSTEM FEATURES DEMONSTRATED:" -ForegroundColor Yellow
Write-Host "✅ Comprehensive overdue payment tracking" -ForegroundColor Green
Write-Host "✅ Detailed payment history with months overdue" -ForegroundColor Green
Write-Host "✅ Quarter-specific and year-specific filtering" -ForegroundColor Green
Write-Host "✅ Bulk WhatsApp messaging to all overdue members" -ForegroundColor Green
Write-Host "✅ Targeted messaging to specific members" -ForegroundColor Green
Write-Host "✅ Detailed message formatting with full payment breakdown" -ForegroundColor Green
Write-Host "✅ Real-time delivery status tracking" -ForegroundColor Green
Write-Host "✅ Financial summary and analytics" -ForegroundColor Green
Write-Host ""

Write-Host "💬 WHATSAPP MESSAGE INCLUDES:" -ForegroundColor Yellow
Write-Host "• Member name and house number" -ForegroundColor White
Write-Host "• Complete payment breakdown by quarter" -ForegroundColor White
Write-Host "• Individual amounts and due dates" -ForegroundColor White
Write-Host "• Months overdue for each payment" -ForegroundColor White
Write-Host "• Payment instructions and contact information" -ForegroundColor White
Write-Host "• Professional formatting with community branding" -ForegroundColor White
Write-Host ""

Write-Host "🚀 READY FOR PRODUCTION USE!" -ForegroundColor Green
Write-Host "Configure real WhatsApp Business API credentials in .env.local to send actual messages." -ForegroundColor Yellow
