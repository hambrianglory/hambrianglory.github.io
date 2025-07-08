# WhatsApp Webhook Monitor
# This script monitors webhook activity and delivery status

Write-Host "=== WhatsApp Webhook Monitor ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

$webhookLogFile = "private/whatsapp-webhooks/webhook-log.json"
$deliveryStatusFile = "private/whatsapp-webhooks/delivery-status.json"

Write-Host "📊 WEBHOOK ACTIVITY MONITOR:" -ForegroundColor Yellow
Write-Host ""

# Check if webhook logs exist
if (Test-Path $webhookLogFile) {
    Write-Host "✅ Webhook logs found" -ForegroundColor Green
    $webhookLogs = Get-Content $webhookLogFile | ConvertFrom-Json
    
    Write-Host "📋 Recent Webhook Activity (last 10 entries):" -ForegroundColor Cyan
    $recentLogs = $webhookLogs | Select-Object -Last 10
    
    foreach ($log in $recentLogs) {
        $timestamp = $log.timestamp
        $type = $log.type
        $color = switch ($type) {
            "webhook_verified" { "Green" }
            "webhook_received" { "Cyan" }
            "message_status_update" { "Yellow" }
            "incoming_message" { "Blue" }
            "webhook_error" { "Red" }
            default { "White" }
        }
        
        Write-Host "  $timestamp - $type" -ForegroundColor $color
        
        if ($type -eq "message_status_update" -and $log.data.status) {
            Write-Host "    Status: $($log.data.status) | Message: $($log.data.messageId)" -ForegroundColor Gray
        }
        
        if ($type -eq "incoming_message" -and $log.data.text) {
            Write-Host "    From: $($log.data.from) | Text: $($log.data.text)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "📈 Webhook Statistics:" -ForegroundColor Yellow
    $totalWebhooks = $webhookLogs.Count
    $messageStatusUpdates = ($webhookLogs | Where-Object { $_.type -eq "message_status_update" }).Count
    $incomingMessages = ($webhookLogs | Where-Object { $_.type -eq "incoming_message" }).Count
    $errors = ($webhookLogs | Where-Object { $_.type -eq "webhook_error" }).Count
    
    Write-Host "- Total webhook events: $totalWebhooks" -ForegroundColor White
    Write-Host "- Message status updates: $messageStatusUpdates" -ForegroundColor White
    Write-Host "- Incoming messages: $incomingMessages" -ForegroundColor White
    Write-Host "- Errors: $errors" -ForegroundColor White
    
} else {
    Write-Host "⚠️  No webhook logs found" -ForegroundColor Yellow
    Write-Host "   This means either:" -ForegroundColor White
    Write-Host "   - Webhook is not configured yet" -ForegroundColor White
    Write-Host "   - No webhook events have been received" -ForegroundColor White
}

Write-Host ""

# Check delivery status
if (Test-Path $deliveryStatusFile) {
    Write-Host "✅ Delivery status logs found" -ForegroundColor Green
    $deliveryLogs = Get-Content $deliveryStatusFile | ConvertFrom-Json
    
    Write-Host "📱 Recent Message Delivery Status (last 10):" -ForegroundColor Cyan
    $recentDeliveries = $deliveryLogs | Select-Object -Last 10
    
    foreach ($delivery in $recentDeliveries) {
        $status = $delivery.status
        $messageId = $delivery.messageId.Substring(0, 20) + "..."
        $recipient = $delivery.recipient
        
        $statusColor = switch ($status) {
            "sent" { "Yellow" }
            "delivered" { "Green" }
            "read" { "Blue" }
            "failed" { "Red" }
            default { "White" }
        }
        
        Write-Host "  $status - $messageId → $recipient" -ForegroundColor $statusColor
    }
    
    Write-Host ""
    Write-Host "📊 Delivery Statistics:" -ForegroundColor Yellow
    $totalMessages = $deliveryLogs.Count
    $sentMessages = ($deliveryLogs | Where-Object { $_.status -eq "sent" }).Count
    $deliveredMessages = ($deliveryLogs | Where-Object { $_.status -eq "delivered" }).Count
    $readMessages = ($deliveryLogs | Where-Object { $_.status -eq "read" }).Count
    $failedMessages = ($deliveryLogs | Where-Object { $_.status -eq "failed" }).Count
    
    Write-Host "- Total status updates: $totalMessages" -ForegroundColor White
    Write-Host "- Sent: $sentMessages" -ForegroundColor Yellow
    Write-Host "- Delivered: $deliveredMessages" -ForegroundColor Green
    Write-Host "- Read: $readMessages" -ForegroundColor Blue
    Write-Host "- Failed: $failedMessages" -ForegroundColor Red
    
    if ($totalMessages -gt 0) {
        $deliveryRate = [math]::Round(($deliveredMessages / $sentMessages) * 100, 2)
        $readRate = [math]::Round(($readMessages / $deliveredMessages) * 100, 2)
        Write-Host ""
        Write-Host "📈 Performance Metrics:" -ForegroundColor Cyan
        Write-Host "- Delivery Rate: $deliveryRate%" -ForegroundColor White
        Write-Host "- Read Rate: $readRate%" -ForegroundColor White
    }
    
} else {
    Write-Host "⚠️  No delivery status logs found" -ForegroundColor Yellow
    Write-Host "   This means no message status updates have been received via webhook" -ForegroundColor White
}

Write-Host ""

# Real-time monitoring option
Write-Host "🔄 REAL-TIME MONITORING:" -ForegroundColor Green
Write-Host "Would you like to monitor webhook activity in real-time? (y/n): " -NoNewline
$monitor = Read-Host

if ($monitor -eq "y" -or $monitor -eq "yes") {
    Write-Host ""
    Write-Host "🔍 Starting real-time webhook monitoring..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
    Write-Host ""
    
    $lastLogCount = 0
    $lastDeliveryCount = 0
    
    if (Test-Path $webhookLogFile) {
        $logs = Get-Content $webhookLogFile | ConvertFrom-Json
        $lastLogCount = $logs.Count
    }
    
    if (Test-Path $deliveryStatusFile) {
        $deliveries = Get-Content $deliveryStatusFile | ConvertFrom-Json
        $lastDeliveryCount = $deliveries.Count
    }
    
    while ($true) {
        Start-Sleep -Seconds 3
        
        $newActivity = $false
        
        # Check for new webhook logs
        if (Test-Path $webhookLogFile) {
            $currentLogs = Get-Content $webhookLogFile | ConvertFrom-Json
            if ($currentLogs.Count -gt $lastLogCount) {
                $newLogs = $currentLogs | Select-Object -Skip $lastLogCount
                foreach ($log in $newLogs) {
                    Write-Host "📨 NEW: $($log.timestamp) - $($log.type)" -ForegroundColor Cyan
                    if ($log.type -eq "message_status_update") {
                        Write-Host "   Status: $($log.data.status) | Message: $($log.data.messageId)" -ForegroundColor Gray
                    }
                }
                $lastLogCount = $currentLogs.Count
                $newActivity = $true
            }
        }
        
        # Check for new delivery status
        if (Test-Path $deliveryStatusFile) {
            $currentDeliveries = Get-Content $deliveryStatusFile | ConvertFrom-Json
            if ($currentDeliveries.Count -gt $lastDeliveryCount) {
                $newDeliveries = $currentDeliveries | Select-Object -Skip $lastDeliveryCount
                foreach ($delivery in $newDeliveries) {
                    $statusColor = switch ($delivery.status) {
                        "sent" { "Yellow" }
                        "delivered" { "Green" }
                        "read" { "Blue" }
                        "failed" { "Red" }
                        default { "White" }
                    }
                    Write-Host "📊 DELIVERY: $($delivery.status) - $($delivery.messageId.Substring(0,20))..." -ForegroundColor $statusColor
                }
                $lastDeliveryCount = $currentDeliveries.Count
                $newActivity = $true
            }
        }
        
        if (-not $newActivity) {
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "Webhook monitoring complete." -ForegroundColor Green
