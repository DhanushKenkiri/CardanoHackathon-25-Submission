#!/usr/bin/env python3
"""
HTTP version: Sends sensor status directly to Flask backend via REST API.
No Firebase dependency - just HTTP requests over WiFi.
"""

import lgpio as GPIO
import time
import statistics
import requests

# ============================================================================
# CONFIGURATION
# ============================================================================
FLASK_API_URL = "http://20.20.2.218:5000"  # Your backend URL
SPOT_ID = "spot_01"
SENSOR_ID = "pi5_sensor_01"
API_TIMEOUT = 5  # seconds

TRIG_PIN = 23
ECHO_PIN = 24

SAMPLE_WINDOW = 5
SAMPLE_INTERVAL = 0.25
OCCUPIED_DISTANCE_CM = 40
OCCUPIED_HYSTERESIS = 2

# ============================================================================
# HTTP Communication
# ============================================================================
def send_status_to_backend(spot_id: str, occupied: bool, median_cm):
    url = f"{FLASK_API_URL}/api/hardware/sensor-update"

    payload = {
        "spot_id": spot_id,
        "sensor_id": SENSOR_ID,
        "occupied": bool(occupied),
        "distance_cm": float(median_cm) if median_cm is not None else -1.0,
        "timestamp": int(time.time())
    }

    try:
        print(f"[HTTP] Sending to {url}: {payload}")
        response = requests.post(url, json=payload, timeout=API_TIMEOUT)

        if response.status_code == 200:
            try:
                print(f"[HTTP SUCCESS] {response.json()}")
            except:
                print("[HTTP SUCCESS] Response OK (no JSON)")
            return True

        print(f"[HTTP ERROR] Status {response.status_code}: {response.text}")
        return False

    except Exception as e:
        print(f"[HTTP ERROR] {e}")
        return False

# ============================================================================
# SENSOR
# ============================================================================
CHIP = GPIO.gpiochip_open(0)
GPIO.gpio_claim_output(CHIP, TRIG_PIN)
GPIO.gpio_claim_input(CHIP, ECHO_PIN)

def read_distance_cm(timeout_s=0.02):
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

    duration = time.perf_counter() - pulse_start
    return round(duration * 17150, 2)

# ============================================================================
# MAIN LOOP
# ============================================================================
def main():
    readings = []
    occupied = False
    occ_count = free_count = 0
    last_published = None

    print("=" * 60)
    print("HC-SR04 Parking Sensor - HTTP Mode")
    print(f"Backend: {FLASK_API_URL}")
    print("=" * 60)

    try:
        while True:
            d = read_distance_cm()

            if d is not None:
                readings.append(d)
                if len(readings) > SAMPLE_WINDOW: readings.pop(0)
                median = statistics.median(readings)

                if median < OCCUPIED_DISTANCE_CM:
                    occ_count += 1; free_count = 0
                else:
                    free_count += 1; occ_count = 0

                if occ_count >= OCCUPIED_HYSTERESIS and not occupied:
                    occupied = True
                    print("🚗 VEHICLE ENTERED")
                    if send_status_to_backend(SPOT_ID, True, median): last_published = True

                if free_count >= OCCUPIED_HYSTERESIS and occupied:
                    occupied = False
                    print("🅿️ VEHICLE LEFT")
                    if send_status_to_backend(SPOT_ID, False, median): last_published = False

                print(f"distance={median}cm | occupied={occupied}")

            time.sleep(SAMPLE_INTERVAL)

    except KeyboardInterrupt:
        print("\n⛔ Stopped")

    finally:
        GPIO.gpiochip_close(CHIP)

if __name__ == "__main__":
    main()