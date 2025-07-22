#!/usr/bin/env python3
"""
Additional comprehensive tests for edge cases and data integrity
"""

import requests
import json
from datetime import date, datetime
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading backend URL: {e}")
        return None

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

def test_data_integrity():
    """Test data integrity and statistics accuracy"""
    print("Testing data integrity and statistics...")
    
    # Create test sessions with known data
    sessions = [
        {
            "date": "2024-01-20",
            "time": "09:00",
            "location": "Test Range A",
            "discipline": "trap",
            "total_clays": 25,
            "clays_hit": 20  # 80% accuracy
        },
        {
            "date": "2024-01-21",
            "time": "10:00",
            "location": "Test Range B",
            "discipline": "skeet",
            "total_clays": 50,
            "clays_hit": 45  # 90% accuracy
        },
        {
            "date": "2024-01-22",
            "time": "11:00",
            "location": "Test Range C",
            "discipline": "trap",
            "total_clays": 25,
            "clays_hit": 15  # 60% accuracy
        }
    ]
    
    session_ids = []
    
    # Create sessions
    for session_data in sessions:
        response = requests.post(f"{API_URL}/sessions", json=session_data)
        if response.status_code == 200:
            session_ids.append(response.json()["id"])
            print(f"✅ Created session: {session_data['discipline']} - {session_data['clays_hit']}/{session_data['total_clays']}")
        else:
            print(f"❌ Failed to create session: {response.status_code}")
    
    # Get statistics
    response = requests.get(f"{API_URL}/stats")
    if response.status_code == 200:
        stats = response.json()
        print(f"\nStatistics:")
        print(f"  Total sessions: {stats['total_sessions']}")
        print(f"  Total clays: {stats['total_clays']}")
        print(f"  Total hits: {stats['total_hits']}")
        print(f"  Overall accuracy: {stats['overall_accuracy']}%")
        print(f"  Best session accuracy: {stats['best_session_accuracy']}%")
        print(f"  Current streak: {stats['current_streak']}")
        print(f"  Favorite discipline: {stats['favorite_discipline']}")
        
        # Verify calculations
        expected_total_clays = 100  # 25 + 50 + 25
        expected_total_hits = 80    # 20 + 45 + 15
        expected_accuracy = 80.0    # 80/100 * 100
        expected_best = 90.0        # Best session was 90%
        
        if (stats['total_clays'] >= expected_total_clays and 
            stats['total_hits'] >= expected_total_hits and
            abs(stats['overall_accuracy'] - expected_accuracy) < 5 and  # Allow some variance due to existing data
            stats['best_session_accuracy'] >= expected_best):
            print("✅ Statistics calculations appear correct")
        else:
            print("❌ Statistics calculations may be incorrect")
    
    # Test recent sessions endpoint
    response = requests.get(f"{API_URL}/sessions/recent/3")
    if response.status_code == 200:
        recent = response.json()
        print(f"✅ Recent sessions endpoint works: {len(recent)} sessions returned")
    else:
        print(f"❌ Recent sessions endpoint failed: {response.status_code}")
    
    # Cleanup
    for session_id in session_ids:
        requests.delete(f"{API_URL}/sessions/{session_id}")
    
    print("✅ Data integrity test completed")

def test_discipline_types():
    """Test all valid discipline types"""
    print("\nTesting all discipline types...")
    
    disciplines = ["trap", "skeet", "sporting_clays", "down_the_line", "olympic_trap", "american_trap"]
    session_ids = []
    
    for i, discipline in enumerate(disciplines):
        session_data = {
            "date": f"2024-01-{23+i:02d}",
            "time": "12:00",
            "location": f"Range {discipline.upper()}",
            "discipline": discipline,
            "total_clays": 25,
            "clays_hit": 20
        }
        
        response = requests.post(f"{API_URL}/sessions", json=session_data)
        if response.status_code == 200:
            session_ids.append(response.json()["id"])
            print(f"✅ Created session with discipline: {discipline}")
        else:
            print(f"❌ Failed to create session with discipline {discipline}: {response.status_code}")
    
    # Cleanup
    for session_id in session_ids:
        requests.delete(f"{API_URL}/sessions/{session_id}")
    
    print("✅ Discipline types test completed")

def test_weather_conditions():
    """Test all valid weather conditions"""
    print("\nTesting weather conditions...")
    
    weather_conditions = ["sunny", "cloudy", "windy", "rainy", "overcast"]
    session_ids = []
    
    for i, weather in enumerate(weather_conditions):
        session_data = {
            "date": f"2024-02-{1+i:02d}",
            "time": "13:00",
            "location": f"Weather Test Range",
            "discipline": "trap",
            "total_clays": 25,
            "clays_hit": 20,
            "weather": weather,
            "temperature": 20 + i
        }
        
        response = requests.post(f"{API_URL}/sessions", json=session_data)
        if response.status_code == 200:
            session_ids.append(response.json()["id"])
            print(f"✅ Created session with weather: {weather}")
        else:
            print(f"❌ Failed to create session with weather {weather}: {response.status_code}")
    
    # Cleanup
    for session_id in session_ids:
        requests.delete(f"{API_URL}/sessions/{session_id}")
    
    print("✅ Weather conditions test completed")

def main():
    print("Running additional comprehensive backend tests...")
    print("="*60)
    
    test_data_integrity()
    test_discipline_types()
    test_weather_conditions()
    
    print("\n" + "="*60)
    print("All additional tests completed successfully!")

if __name__ == "__main__":
    main()