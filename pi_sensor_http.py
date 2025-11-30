#!/usr/bin/env python3
"""
HTTP version: Sends sensor status directly to Flask backend via REST API.
No Firebase dependency - just HTTP requests over WiFi.
"""

import lgpio as GPIO
import time
import statistics
import requests
import json

# ============================================================================
# CONFIGURATION - Update these to match your Flask server
# ============================================================================
FLASK_API_URL = "http://20.20.2.218:5000"  # Your laptop's IP
SPOT_ID = "spot_01"
SENSOR_ID = "pi5_sensor_01"
API_TIMEOUT = 5  # seconds

# Sensor pins
TRIG_PIN = 23
ECHO_PIN = 24

# Sampling config
SAMPLE_WINDOW = 5
SAMPLE_INTERVAL = 0.25
OCCUPIED_DISTANCE_CM = 40
OCCUPIED_HYSTERESIS = 2

# ============================================================================
# HTTP Communication Functions
# ============================================================================

def send_status_to_backend(spot_id: str, occupied: bool, median_cm):
    """
    Send sensor status to Flask backend via HTTP POST.
    Endpoint: POST /api/hardware/sensor-update
    """
    url = f"{FLASK_API_URL}/api/hardware/sensor-update"
    
    payload = {
        "spot_id": spot_id,
        "sensor_id": SENSOR_ID,
        "occupied": occupied,
        "distance_cm": float(median_cm) if median_cm is not None else -1.0,
        "timestamp": int(time.time())
    }
    
    try:
        print(f"[HTTP] Sending to {url}: {payload}")
        response = requests.post(
            url,
            json=payload,
            timeout=API_TIMEOUT,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"[HTTP SUCCESS] Server response: {result}")
            
            # Check if payment was triggered
            if result.get('payment_triggered'):
                print(f"💰 PAYMENT TRIGGERED! Session: {result.get('session_id')}")
            
            return True
        else:
            print(f"[HTTP ERROR] Status {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"[HTTP ERROR] Request timeout after {API_TIMEOUT}s")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"[HTTP ERROR] Connection failed: {e}")
        return False
    except Exception as e:
        print(f"[HTTP ERROR] Unexpected error: {e}")
        return False

# ============================================================================
# Sensor Functions
# ============================================================================

# Open GPIO chip
CHIP = GPIO.gpiochip_open(0)
GPIO.gpio_claim_output(CHIP, TRIG_PIN)
GPIO.gpio_claim_input(CHIP, ECHO_PIN)

def read_distance_cm(timeout_s=0.02):
    """Read distance from HC-SR04 ultrasonic sensor."""
    GPIO.gpio_write(CHIP, TRIG_PIN, 0)
    time.sleep(0.000002)
    GPIO.gpio_write(CHIP, TRIG_PIN, 1)
    time.sleep(0.00001)
    GPIO.gpio_write(CHIP, TRIG_PIN, 0)

    start = time.perf_counter()
    while GPIO.gpio_read(CHIP, ECHO_PIN) == 0:
        if time.perf_counter() > start + timeout_s:
            return None
    pulse_start = time.perf_counter()
    
    while GPIO.gpio_read(CHIP, ECHO_PIN) == 1:
        if time.perf_counter() > pulse_start + timeout_s:
            return None
    pulse_end = time.perf_counter()
    
    duration = pulse_end - pulse_start
    return round(duration * 17150, 2)

# ============================================================================
# Main Loop
# ============================================================================

def main():
    readings = []
    occupied = False
    occupied_counter = 0
    free_counter = 0
    last_published = None

    print("=" * 60)
    print("HC-SR04 Parking Sensor - HTTP Mode")
    print(f"Backend: {FLASK_API_URL}")
    print(f"Spot ID: {SPOT_ID}")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    try:
        while True:
            d = read_distance_cm()
            
            if d is None:
                # Sensor timeout - treat as very close (occupied)
                print("⚠️  SENSOR TIMEOUT - Assuming occupied")
                if last_published is not False:
                    print("[SENDING] Occupied status (no distance)")
                    ok = send_status_to_backend(SPOT_ID, occupied=True, median_cm=None)
                    if ok:
                        last_published = False
            else:
                # Valid reading
                readings.append(d)
                if len(readings) > SAMPLE_WINDOW:
                    readings.pop(0)
                
                median = statistics.median(readings)

                # State machine: count consecutive readings
                if median < OCCUPIED_DISTANCE_CM:
                    occupied_counter += 1
                    free_counter = 0
                else:
                    free_counter += 1
                    occupied_counter = 0

                # Transition: Free → Occupied
                if occupied_counter >= OCCUPIED_HYSTERESIS and not occupied:
                    occupied = True
                    print(f"\n🚗 [{time.ctime()}] VEHICLE ENTERED (distance={median:.1f} cm)")
                    print("[SENDING] Occupied=TRUE to backend")
                    
                    ok = send_status_to_backend(SPOT_ID, occupied=True, median_cm=median)
                    if ok:
                        last_published = True
                        print("✅ Payment should start now!")

                # Transition: Occupied → Free
                elif free_counter >= OCCUPIED_HYSTERESIS and occupied:
                    occupied = False
                    print(f"\n🚙 [{time.ctime()}] VEHICLE LEFT (distance={median:.1f} cm)")
                    print("[SENDING] Occupied=FALSE to backend")
                    
                    ok = send_status_to_backend(SPOT_ID, occupied=False, median_cm=median)
                    if ok:
                        last_published = False
                        print("✅ Payment should stop now!")

                # Initial publish on startup
                if last_published is None:
                    print(f"\n[INITIAL] Publishing startup state: occupied={occupied}")
                    ok = send_status_to_backend(SPOT_ID, occupied=occupied, median_cm=median)
                    if ok:
                        last_published = bool(occupied)

                # Status display
                status_icon = "🚗" if occupied else "🅿️"
                print(f"{status_icon} distance={median:.1f}cm | occupied={occupied} | counters: occ={occupied_counter} free={free_counter}")

            time.sleep(SAMPLE_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n⛔ Stopped by user")
    finally:
        GPIO.gpiochip_close(CHIP)
        print("GPIO cleaned up. Goodbye!")

if __name__ == '__main__':
    main()
