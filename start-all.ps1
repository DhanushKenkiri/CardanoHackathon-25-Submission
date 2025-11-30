# ParknGo Complete System Startup Script
# Starts all services with one command

Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "  PARKNGO COMPLETE SYSTEM STARTUP" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Green

if (!(Test-Path .env)) {
    Write-Host "  ERROR: .env file not found!" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $env:FIREBASE_CREDENTIALS_PATH)) {
    Write-Host "  ERROR: Firebase credentials file not found!" -ForegroundColor Red
    Write-Host "  Looking for: $env:FIREBASE_CREDENTIALS_PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "  - .env file: OK" -ForegroundColor Green
Write-Host "  - Firebase credentials: OK" -ForegroundColor Green

# Step 2: Stop any existing Masumi containers from masumi/ folder
Write-Host "`n[2/5] Stopping existing Masumi containers..." -ForegroundColor Green

$masumiContainers = docker ps -a --filter "name=masumi" --format "{{.Names}}"
if ($masumiContainers) {
    Write-Host "  Stopping: $($masumiContainers -join ', ')" -ForegroundColor Yellow
    docker stop $masumiContainers 2>$null
    docker rm $masumiContainers 2>$null
}

Write-Host "  - Old containers removed" -ForegroundColor Green

# Step 3: Build Docker images
Write-Host "`n[3/5] Building Docker images..." -ForegroundColor Green
Write-Host "  This may take a few minutes on first run..." -ForegroundColor Yellow

docker-compose build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "  - Build complete" -ForegroundColor Green

# Step 4: Start all services
Write-Host "`n[4/5] Starting all services..." -ForegroundColor Green
Write-Host "  Services: API, Firebase Listener, Masumi Payment, Masumi Registry, PostgreSQL x2" -ForegroundColor Yellow

docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host "  - All containers started" -ForegroundColor Green

# Step 5: Wait for services to be healthy
Write-Host "`n[5/5] Waiting for services to be healthy..." -ForegroundColor Green
Write-Host "  This may take 30-60 seconds..." -ForegroundColor Yellow

$maxWait = 120  # 2 minutes
$elapsed = 0
$interval = 5

while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds $interval
    $elapsed += $interval
    
    # Check health
    $apiHealth = docker inspect --format='{{.State.Health.Status}}' parkngo-api 2>$null
    $paymentHealth = docker inspect --format='{{.State.Health.Status}}' masumi-payment-service 2>$null
    $registryHealth = docker inspect --format='{{.State.Health.Status}}' masumi-registry-service 2>$null
    
    Write-Host "  [${elapsed}s] API: $apiHealth | Payment: $paymentHealth | Registry: $registryHealth" -ForegroundColor Cyan
    
    if ($apiHealth -eq "healthy" -and $paymentHealth -eq "healthy" -and $registryHealth -eq "healthy") {
        Write-Host "  - All services are healthy!" -ForegroundColor Green
        break
    }
}

# Step 6: Show service status
Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "  SYSTEM STATUS" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

docker-compose ps

Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "  SERVICE ENDPOINTS" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""
Write-Host "  ParknGo API:        http://localhost:5000" -ForegroundColor Green
Write-Host "  Health Check:       http://localhost:5000/api/health" -ForegroundColor Green
Write-Host "  Masumi Payment:     http://localhost:3001" -ForegroundColor Green
Write-Host "  Masumi Registry:    http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "  TESTING" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""
Write-Host "  Test system health:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:5000/api/health | ConvertFrom-Json" -ForegroundColor White
Write-Host ""
Write-Host "  Run hardware simulator (in new terminal):" -ForegroundColor Cyan
Write-Host "  python hardware_simulator.py" -ForegroundColor White
Write-Host ""
Write-Host "  Run production tests:" -ForegroundColor Cyan
Write-Host "  python test_production.py" -ForegroundColor White
Write-Host ""

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "  LOGS" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""
Write-Host "  View all logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "  View specific service:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f parkngo-api" -ForegroundColor White
Write-Host "  docker-compose logs -f firebase-listener" -ForegroundColor White
Write-Host ""

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "  STOPPING" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""
Write-Host "  To stop all services:" -ForegroundColor Cyan
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""

Write-Host "=" * 80 -ForegroundColor Green
Write-Host "  SYSTEM READY!" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Green
Write-Host ""
