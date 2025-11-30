# 🔧 Raspberry Pi HTTP Sensor Setup Guide

## Overview
This guide shows you how to set up the Raspberry Pi sensor to communicate directly with your Flask backend via HTTP (no Firebase required on Pi side).

## Architecture
```
Raspberry Pi (Sensor)  ----WiFi/HTTP---→  Flask Backend (Laptop)
       ↓                                         ↓
  HC-SR04 Sensor                          Firebase RTDB
       ↓                                         ↓
  Distance Reading                        Real-time Updates
       ↓                                         ↓
  POST /api/hardware/sensor-update         React Frontend
```

---

## Step 1: Find Your Laptop's IP Address

### On macOS:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### On Windows:
```bash
ipconfig
```

### On Linux:
```bash
hostname -I
```

**Example output:** `192.168.1.100`

---

## Step 2: Update Flask Backend

The endpoint is already added to `app.py`:
```
POST http://YOUR_LAPTOP_IP:5000/api/hardware/sensor-update
```

Make sure Flask is running and accessible on your network:
```bash
# Start Flask
python app.py

# Or with specific host binding
python app.py --host 0.0.0.0
```

---

## Step 3: Configure Pi Sensor Script

1. Copy `pi_sensor_http.py` to your Raspberry Pi:
```bash
scp pi_sensor_http.py pi@raspberrypi.local:/home/pi/parkngo/
```

2. Edit the configuration in the script:
```python
FLASK_API_URL = "http://192.168.1.100:5000"  # ← Change to your laptop IP
SPOT_ID = "spot_01"                           # ← Match your spot ID
```

3. Install required Python package on Pi:
```bash
pip3 install requests
```

---

## Step 4: Test Connection

### Test from Raspberry Pi:
```bash
curl -X POST http://192.168.1.100:5000/api/hardware/sensor-update \
  -H "Content-Type: application/json" \
  -d '{"spot_id":"spot_01","sensor_id":"test","occupied":true,"distance_cm":25.5}'
```

Expected response:
```json
{
  "success": true,
  "message": "Sensor data received",
  "occupied": true,
  "payment_triggered": false
}
```

---

## Step 5: Run the Sensor

On Raspberry Pi:
```bash
cd /home/pi/parkngo
python3 pi_sensor_http.py
```

You should see:
```
============================================================
HC-SR04 Parking Sensor - HTTP Mode
Backend: http://192.168.1.100:5000
Spot ID: spot_01
Press Ctrl+C to stop
============================================================
🅿️ distance=120.5cm | occupied=False | counters: occ=0 free=0
```

---

## Step 6: Test Payment Trigger

1. **Book a slot** via the dashboard first (this creates a payment session)

2. **Place an object** in front of the sensor (< 40cm)

3. **Watch the logs:**

**Pi side:**
```
🚗 [Sun Nov 30 10:07:00 2025] VEHICLE ENTERED (distance=25.3 cm)
[SENDING] Occupied=TRUE to backend
[HTTP SUCCESS] Server response: {'success': True, 'payment_triggered': True}
✅ Payment should start now!
💰 PAYMENT TRIGGERED! Session: sess_123456
```

**Flask side:**
```
📡 Hardware sensor update: spot=spot_01, occupied=True, distance=25.3cm
✅ Firebase updated for spot_01
💰 Active session found: sess_123456
```

**Frontend:**
- MapView shows "Spot Occupied - Payment Started!"
- Redirects to Dashboard
- Real-time payment monitoring active

---

## How It Works

### When Vehicle Enters (occupied: false → true):

1. **Pi sensor** detects distance < 40cm for 2+ consecutive readings
2. **HTTP POST** sent to Flask: `{"occupied": true, "distance_cm": 25.3}`
3. **Flask backend**:
   - Updates Firebase `/parking_spots/spot_01/occupied = true`
   - Checks for active payment session
   - Returns response with `payment_triggered: true`
4. **React MapView** (subscribed to Firebase):
   - Detects `occupied` change via `subscribeToSpot()`
   - Triggers payment navigation
   - Shows "Payment Started!" message

### When Vehicle Leaves (occupied: true → false):

1. **Pi sensor** detects distance > 40cm for 2+ consecutive readings
2. **HTTP POST** sent to Flask: `{"occupied": false, "distance_cm": 120.5}`
3. **Flask backend** updates Firebase
4. **Payment monitor** stops charging

---

## Troubleshooting

### Pi can't reach Flask:
```bash
# Check if Flask is accessible
curl http://192.168.1.100:5000/api/health

# Check firewall (macOS)
sudo pfctl -d  # Disable temporarily

# Check firewall (Linux)
sudo ufw allow 5000
```

### HTTP timeout errors:
- Increase `API_TIMEOUT` in `pi_sensor_http.py`
- Check WiFi signal strength
- Verify both devices on same network

### Payment not triggering:
- Ensure you booked a slot first via dashboard
- Check Flask logs for active session
- Verify Firebase `payment_sessions` has an active entry

### Firebase still not updating:
- Backend updates Firebase on your behalf
- Check Flask logs for Firebase errors
- Verify Firebase credentials in `secrets/`

---

## Advantages Over Firebase on Pi

✅ **Simpler setup** - no Firebase SDK on Pi  
✅ **Lower latency** - direct HTTP to your laptop  
✅ **Better debugging** - see HTTP request/response logs  
✅ **Network independence** - works across different networks  
✅ **Easier testing** - use curl to simulate sensor  
✅ **Less dependencies** - just `requests` library  

---

## Production Deployment

For permanent installation:

1. **Auto-start on boot** (systemd service):
```bash
sudo nano /etc/systemd/system/parking-sensor.service
```

```ini
[Unit]
Description=ParknGo Parking Sensor
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/parkngo/pi_sensor_http.py
WorkingDirectory=/home/pi/parkngo
StandardOutput=journal
StandardError=journal
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable parking-sensor
sudo systemctl start parking-sensor
sudo systemctl status parking-sensor
```

2. **Monitor logs:**
```bash
sudo journalctl -u parking-sensor -f
```

---

## API Endpoint Reference

### POST `/api/hardware/sensor-update`

**Request:**
```json
{
  "spot_id": "spot_01",
  "sensor_id": "pi5_sensor_01",
  "occupied": true,
  "distance_cm": 25.5,
  "timestamp": 1701345678
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Sensor data received",
  "spot_id": "spot_01",
  "occupied": true,
  "distance_cm": 25.5,
  "payment_triggered": true,
  "session_id": "sess_xyz123",
  "timestamp": 1701345678
}
```

**Response (no active session):**
```json
{
  "success": true,
  "message": "Sensor data received",
  "spot_id": "spot_01",
  "occupied": true,
  "distance_cm": 25.5,
  "payment_triggered": false,
  "session_id": null,
  "timestamp": 1701345678
}
```

---

## Quick Test Script

Save as `test_sensor.sh`:
```bash
#!/bin/bash
LAPTOP_IP="192.168.1.100"  # Change this

echo "Testing sensor endpoint..."
curl -X POST http://$LAPTOP_IP:5000/api/hardware/sensor-update \
  -H "Content-Type: application/json" \
  -d '{
    "spot_id": "spot_01",
    "sensor_id": "test_sensor",
    "occupied": true,
    "distance_cm": 25.5
  }'
```

```bash
chmod +x test_sensor.sh
./test_sensor.sh
```

---

**Ready to test! 🚀**
