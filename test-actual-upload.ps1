# Simple test to upload a users CSV file to the server
Write-Host "Testing actual file upload..." -ForegroundColor Yellow

# Read the sample file and test upload
$filePath = "$PWD\sample_users_upload.csv"
$boundary = [System.Guid]::NewGuid().ToString()

# Create form data
$LF = "`r`n"
$fileContent = [System.IO.File]::ReadAllBytes($filePath)

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"type`"$LF",
    "users",
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"sample_users_upload.csv`"",
    "Content-Type: text/csv$LF",
    [System.Text.Encoding]::UTF8.GetString($fileContent),
    "--$boundary--$LF"
) -join $LF

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/upload" -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    Write-Host "Upload successful! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error response: $responseBody" -ForegroundColor Red
    }
}

# Check users after upload
try {
    Write-Host "`nChecking users after upload..." -ForegroundColor Yellow
    $usersResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/debug-users" -Method GET
    Write-Host "Users check: $($usersResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to check users: $($_.Exception.Message)" -ForegroundColor Red
}
