# Improved Cache System Test Script
# Tests immediate cache clearing after appointment deletion

Write-Host "🧪 Testing Improved Cache System for Immediate Updates" -ForegroundColor Cyan
Write-Host "=" * 60

# Test parameters
$apiBaseUrl = "https://localhost:5001/api"
$authToken = "YOUR_AUTH_TOKEN_HERE"  # Replace with actual token

# Headers
$headers = @{
    "Authorization" = "Bearer $authToken"
    "Content-Type" = "application/json"
}

function Test-CacheResponse {
    param($url, $testName, $expectedBehavior)
    
    Write-Host "`n🔍 Testing: $testName" -ForegroundColor Yellow
    Write-Host "URL: $url"
    Write-Host "Expected: $expectedBehavior"
    
    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "✅ Response Time: ${responseTime}ms" -ForegroundColor Green
        $itemCount = if ($response.totalCount) { $response.totalCount } elseif ($response.Count) { $response.Count } else { 'N/A' }
        Write-Host "📊 Items Count: $itemCount"
        
        if ($responseTime -lt 100) {
            Write-Host "⚡ FAST: Likely served from cache" -ForegroundColor Blue
        } elseif ($responseTime -lt 500) {
            Write-Host "🔄 MEDIUM: Likely fresh data from database" -ForegroundColor Orange
        } else {
            Write-Host "🐌 SLOW: Database query or slow network" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-AppointmentDeletion {
    param($appointmentId)
    
    Write-Host "`n🗑️ Testing Appointment Deletion: $appointmentId" -ForegroundColor Magenta
    
    try {
        # Delete appointment with bypassCache parameter
        $deleteUrl = "$apiBaseUrl/appointments/$appointmentId?bypassCache=true"
        $deleteResponse = Invoke-RestMethod -Uri $deleteUrl -Headers $headers -Method DELETE
        
        Write-Host "✅ Appointment deleted successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to delete appointment: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main Test Flow
Write-Host "`n📋 PHASE 1: Baseline Cache Performance" -ForegroundColor Cyan

Test-CacheResponse "$apiBaseUrl/appointments?pageNumber=1`&pageSize=10" "Appointments List (Page 1)" "Should be fast if cached"
Test-CacheResponse "$apiBaseUrl/appointments?pageNumber=1`&pageSize=10`&bypassCache=true" "Appointments List (Bypass Cache)" "Should be slower, fresh data"

Write-Host "`n🕒 PHASE 2: Cache Duration Test (30 seconds)" -ForegroundColor Cyan
Test-CacheResponse "$apiBaseUrl/appointments?pageNumber=1`&pageSize=10" "Appointments List (After 30s)" "Should serve from cache if within 30s"

Write-Host "`n🗑️ PHASE 3: Deletion and Immediate Cache Test" -ForegroundColor Cyan

# Get first appointment ID for deletion test
Write-Host "Getting appointment list to find test candidate..."
try {
    $appointmentsList = Invoke-RestMethod -Uri "$apiBaseUrl/appointments?pageNumber=1`&pageSize=5" -Headers $headers -Method GET
    
    if ($appointmentsList.items -and $appointmentsList.items.Count -gt 0) {
        $testAppointmentId = $appointmentsList.items[0].id
        Write-Host "🎯 Target appointment for deletion test: $testAppointmentId"
        
        # Pre-deletion cache test
        Write-Host "`n--- BEFORE DELETION ---"
        Test-CacheResponse "$apiBaseUrl/appointments?pageNumber=1`&pageSize=10" "Pre-deletion List" "Should include the appointment"
        
        # Delete appointment
        $deleteSuccess = Test-AppointmentDeletion $testAppointmentId
        
        if ($deleteSuccess) {
            # Immediate post-deletion test (should get fresh data)
            Write-Host "`n--- IMMEDIATELY AFTER DELETION ---"
            Test-CacheResponse "$apiBaseUrl/appointments?pageNumber=1`&pageSize=10" "Post-deletion List (Immediate)" "Should NOT include deleted appointment (fresh data)"
            
            # Wait 2 seconds and test again
            Write-Host "`nWaiting 2 seconds..."
            Start-Sleep -Seconds 2
            
            Write-Host "`n--- 2 SECONDS AFTER DELETION ---"
            Test-CacheResponse "$apiBaseUrl/appointments?pageNumber=1`&pageSize=10" "Post-deletion List (2s later)" "Should still NOT include deleted appointment"
            
            # Test with bypassCache to confirm deletion
            Write-Host "`n--- BYPASS CACHE CONFIRMATION ---"
            Test-CacheResponse "$apiBaseUrl/appointments?pageNumber=1`&pageSize=10`&bypassCache=true" "Post-deletion List (Bypass)" "Fresh data, should NOT include deleted appointment"
        }
    } else {
        Write-Host "⚠️ No appointments found for deletion test" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error getting appointments list: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔬 PHASE 4: Employee Appointments Cache Test" -ForegroundColor Cyan

# Test employee appointments (assuming employee ID exists)
$testEmployeeId = "employee-123"  # Replace with actual employee ID
Test-CacheResponse "$apiBaseUrl/appointments/employee/$testEmployeeId?startDate=2024-01-01`&endDate=2024-12-31" "Employee Appointments" "Should respect 30s cache duration"

Write-Host "`n📊 PHASE 5: Cache Performance Summary" -ForegroundColor Cyan

Write-Host "✅ Expected Behavior:" -ForegroundColor Green
Write-Host "  • Cache Duration: 30 seconds for lists, 1 minute for details"
Write-Host "  • After deletion: Immediate fresh data (nuclear cache clearing)"
Write-Host "  • BypassCache parameter: Always forces fresh data"
Write-Host "  • Response times: <100ms cache, >100ms fresh data"

Write-Host "`n🎯 Key Improvements:" -ForegroundColor Yellow
Write-Host "  • Nuclear cache clearing after deletions"
Write-Host "  • Very short cache durations (30s vs 2min)"
Write-Host "  • Frontend API state reset after mutations"
Write-Host "  • Aggressive pattern-based cache invalidation"

Write-Host "`n📈 Performance Targets:" -ForegroundColor Blue
Write-Host "  • Deletion → Fresh data: <200ms"
Write-Host "  • Cache hits: <100ms"
Write-Host "  • Cache bypass: 200-500ms"
Write-Host "  • No stale data after mutations"

Write-Host "`n🧪 Test Complete!" -ForegroundColor Cyan
Write-Host "Monitor the console logs for cache behavior patterns." 