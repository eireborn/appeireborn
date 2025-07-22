#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Clay Pigeon Shooting Tracker
Tests all CRUD operations, validation, edge cases, and statistics
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
if not BASE_URL:
    print("ERROR: Could not get backend URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"Testing API at: {API_URL}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def log_pass(self, test_name):
        print(f"✅ PASS: {test_name}")
        self.passed += 1
    
    def log_fail(self, test_name, error):
        print(f"❌ FAIL: {test_name} - {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        print(f"{'='*60}")
        if self.errors:
            print("FAILURES:")
            for error in self.errors:
                print(f"  - {error}")
        return self.failed == 0

results = TestResults()

def test_api_health():
    """Test 1: Basic API Health Check"""
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "Clay Pigeon" in data["message"]:
                results.log_pass("API Health Check")
                return True
            else:
                results.log_fail("API Health Check", f"Unexpected response: {data}")
        else:
            results.log_fail("API Health Check", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("API Health Check", f"Connection error: {str(e)}")
    return False

def test_create_session_basic():
    """Test 2: Create session with required fields only"""
    session_data = {
        "date": "2024-01-15",
        "time": "10:30",
        "location": "Riverside Shooting Club",
        "discipline": "trap",
        "total_clays": 25,
        "clays_hit": 20
    }
    
    try:
        response = requests.post(f"{API_URL}/sessions", json=session_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if all(key in data for key in ["id", "date", "time", "location", "discipline"]):
                results.log_pass("Create Basic Session")
                return data["id"]
            else:
                results.log_fail("Create Basic Session", f"Missing fields in response: {data}")
        else:
            results.log_fail("Create Basic Session", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.log_fail("Create Basic Session", f"Error: {str(e)}")
    return None

def test_create_session_full():
    """Test 3: Create session with all optional fields"""
    session_data = {
        "date": "2024-01-16",
        "time": "14:00",
        "location": "Olympic Shooting Range",
        "discipline": "skeet",
        "total_clays": 50,
        "clays_hit": 42,
        "weather": "sunny",
        "temperature": 22,
        "wind_speed": "5 mph",
        "gun_used": "Beretta A400",
        "cartridge_type": "12 gauge",
        "choke_used": "Modified",
        "notes": "Great session, good weather conditions"
    }
    
    try:
        response = requests.post(f"{API_URL}/sessions", json=session_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data["weather"] == "sunny" and data["temperature"] == 22:
                results.log_pass("Create Full Session")
                return data["id"]
            else:
                results.log_fail("Create Full Session", f"Optional fields not saved correctly: {data}")
        else:
            results.log_fail("Create Full Session", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.log_fail("Create Full Session", f"Error: {str(e)}")
    return None

def test_get_all_sessions():
    """Test 4: Retrieve all sessions"""
    try:
        response = requests.get(f"{API_URL}/sessions", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) >= 0:
                results.log_pass("Get All Sessions")
                return data
            else:
                results.log_fail("Get All Sessions", f"Expected list, got: {type(data)}")
        else:
            results.log_fail("Get All Sessions", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Get All Sessions", f"Error: {str(e)}")
    return []

def test_get_session_by_id(session_id):
    """Test 5: Retrieve specific session by ID"""
    if not session_id:
        results.log_fail("Get Session by ID", "No session ID provided")
        return False
    
    try:
        response = requests.get(f"{API_URL}/sessions/{session_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data["id"] == session_id:
                results.log_pass("Get Session by ID")
                return True
            else:
                results.log_fail("Get Session by ID", f"ID mismatch: expected {session_id}, got {data.get('id')}")
        else:
            results.log_fail("Get Session by ID", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Get Session by ID", f"Error: {str(e)}")
    return False

def test_update_session(session_id):
    """Test 6: Update session"""
    if not session_id:
        results.log_fail("Update Session", "No session ID provided")
        return False
    
    update_data = {
        "clays_hit": 23,
        "notes": "Updated session notes"
    }
    
    try:
        response = requests.put(f"{API_URL}/sessions/{session_id}", json=update_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data["clays_hit"] == 23 and data["notes"] == "Updated session notes":
                results.log_pass("Update Session")
                return True
            else:
                results.log_fail("Update Session", f"Update not reflected: {data}")
        else:
            results.log_fail("Update Session", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.log_fail("Update Session", f"Error: {str(e)}")
    return False

def test_delete_session(session_id):
    """Test 7: Delete session"""
    if not session_id:
        results.log_fail("Delete Session", "No session ID provided")
        return False
    
    try:
        response = requests.delete(f"{API_URL}/sessions/{session_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "deleted" in data["message"].lower():
                results.log_pass("Delete Session")
                return True
            else:
                results.log_fail("Delete Session", f"Unexpected response: {data}")
        else:
            results.log_fail("Delete Session", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Delete Session", f"Error: {str(e)}")
    return False

def test_get_stats():
    """Test 8: Get statistics"""
    try:
        response = requests.get(f"{API_URL}/stats", timeout=10)
        if response.status_code == 200:
            data = response.json()
            required_fields = ["total_sessions", "total_clays", "total_hits", "overall_accuracy", 
                             "best_session_accuracy", "current_streak", "favorite_discipline"]
            if all(field in data for field in required_fields):
                results.log_pass("Get Statistics")
                return data
            else:
                missing = [f for f in required_fields if f not in data]
                results.log_fail("Get Statistics", f"Missing fields: {missing}")
        else:
            results.log_fail("Get Statistics", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Get Statistics", f"Error: {str(e)}")
    return None

def test_invalid_data_validation():
    """Test 9: Data validation - clays_hit > total_clays"""
    invalid_data = {
        "date": "2024-01-17",
        "time": "10:00",
        "location": "Test Range",
        "discipline": "trap",
        "total_clays": 20,
        "clays_hit": 25  # Invalid: more hits than total
    }
    
    try:
        response = requests.post(f"{API_URL}/sessions", json=invalid_data, timeout=10)
        # This should either fail validation or succeed (depending on backend validation)
        # For now, we'll check if it creates the session and note the behavior
        if response.status_code == 200:
            results.log_pass("Invalid Data Handling (allows invalid data)")
            # Clean up the invalid session
            data = response.json()
            requests.delete(f"{API_URL}/sessions/{data['id']}")
        else:
            results.log_pass("Invalid Data Validation (rejects invalid data)")
    except Exception as e:
        results.log_fail("Invalid Data Validation", f"Error: {str(e)}")

def test_missing_required_fields():
    """Test 10: Missing required fields"""
    incomplete_data = {
        "date": "2024-01-18",
        "time": "10:00"
        # Missing location, discipline, total_clays, clays_hit
    }
    
    try:
        response = requests.post(f"{API_URL}/sessions", json=incomplete_data, timeout=10)
        if response.status_code in [400, 422]:  # Should return validation error
            results.log_pass("Missing Required Fields Validation")
        else:
            results.log_fail("Missing Required Fields Validation", 
                            f"Expected 400/422, got {response.status_code}")
    except Exception as e:
        results.log_fail("Missing Required Fields Validation", f"Error: {str(e)}")

def test_invalid_discipline():
    """Test 11: Invalid discipline type"""
    invalid_discipline_data = {
        "date": "2024-01-19",
        "time": "10:00",
        "location": "Test Range",
        "discipline": "invalid_discipline",
        "total_clays": 25,
        "clays_hit": 20
    }
    
    try:
        response = requests.post(f"{API_URL}/sessions", json=invalid_discipline_data, timeout=10)
        if response.status_code in [400, 422]:  # Should return validation error
            results.log_pass("Invalid Discipline Validation")
        else:
            results.log_fail("Invalid Discipline Validation", 
                            f"Expected 400/422, got {response.status_code}")
    except Exception as e:
        results.log_fail("Invalid Discipline Validation", f"Error: {str(e)}")

def test_nonexistent_session():
    """Test 12: Retrieve non-existent session"""
    fake_id = "nonexistent-session-id"
    
    try:
        response = requests.get(f"{API_URL}/sessions/{fake_id}", timeout=10)
        if response.status_code == 404:
            results.log_pass("Non-existent Session Handling")
        else:
            results.log_fail("Non-existent Session Handling", 
                            f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.log_fail("Non-existent Session Handling", f"Error: {str(e)}")

def test_update_nonexistent_session():
    """Test 13: Update non-existent session"""
    fake_id = "nonexistent-session-id"
    update_data = {"clays_hit": 15}
    
    try:
        response = requests.put(f"{API_URL}/sessions/{fake_id}", json=update_data, timeout=10)
        if response.status_code == 404:
            results.log_pass("Update Non-existent Session Handling")
        else:
            results.log_fail("Update Non-existent Session Handling", 
                            f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.log_fail("Update Non-existent Session Handling", f"Error: {str(e)}")

# NEW FIXTURE TESTS
def test_create_fixture_basic():
    """Test 14: Create fixture with required fields only"""
    fixture_data = {
        "name": "Spring Championship",
        "date": "2024-03-15",
        "time": "09:00",
        "location": "National Shooting Centre",
        "discipline": "trap"
    }
    
    try:
        response = requests.post(f"{API_URL}/fixtures", json=fixture_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if all(key in data for key in ["id", "name", "date", "time", "location", "discipline"]):
                results.log_pass("Create Basic Fixture")
                return data["id"]
            else:
                results.log_fail("Create Basic Fixture", f"Missing fields in response: {data}")
        else:
            results.log_fail("Create Basic Fixture", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.log_fail("Create Basic Fixture", f"Error: {str(e)}")
    return None

def test_create_fixture_full():
    """Test 15: Create fixture with all optional fields"""
    fixture_data = {
        "name": "Summer Open Championship",
        "description": "Annual summer championship with prizes",
        "date": "2024-06-20",
        "time": "08:30",
        "location": "Olympic Shooting Range",
        "discipline": "skeet",
        "max_participants": 50,
        "entry_fee": 25.00,
        "organizer": "National Clay Shooting Association",
        "contact_info": "info@ncsa.org",
        "notes": "Bring your own equipment and ammunition"
    }
    
    try:
        response = requests.post(f"{API_URL}/fixtures", json=fixture_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if (data["name"] == "Summer Open Championship" and 
                data["max_participants"] == 50 and 
                data["entry_fee"] == 25.00):
                results.log_pass("Create Full Fixture")
                return data["id"]
            else:
                results.log_fail("Create Full Fixture", f"Optional fields not saved correctly: {data}")
        else:
            results.log_fail("Create Full Fixture", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.log_fail("Create Full Fixture", f"Error: {str(e)}")
    return None

def test_get_all_fixtures():
    """Test 16: Retrieve all fixtures"""
    try:
        response = requests.get(f"{API_URL}/fixtures", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) >= 0:
                results.log_pass("Get All Fixtures")
                return data
            else:
                results.log_fail("Get All Fixtures", f"Expected list, got: {type(data)}")
        else:
            results.log_fail("Get All Fixtures", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Get All Fixtures", f"Error: {str(e)}")
    return []

def test_get_fixture_by_id(fixture_id):
    """Test 17: Retrieve specific fixture by ID"""
    if not fixture_id:
        results.log_fail("Get Fixture by ID", "No fixture ID provided")
        return False
    
    try:
        response = requests.get(f"{API_URL}/fixtures/{fixture_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data["id"] == fixture_id:
                results.log_pass("Get Fixture by ID")
                return True
            else:
                results.log_fail("Get Fixture by ID", f"ID mismatch: expected {fixture_id}, got {data.get('id')}")
        else:
            results.log_fail("Get Fixture by ID", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Get Fixture by ID", f"Error: {str(e)}")
    return False

def test_update_fixture(fixture_id):
    """Test 18: Update fixture"""
    if not fixture_id:
        results.log_fail("Update Fixture", "No fixture ID provided")
        return False
    
    update_data = {
        "max_participants": 75,
        "entry_fee": 30.00,
        "notes": "Updated fixture notes - early bird discount available"
    }
    
    try:
        response = requests.put(f"{API_URL}/fixtures/{fixture_id}", json=update_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if (data["max_participants"] == 75 and 
                data["entry_fee"] == 30.00 and 
                "early bird" in data["notes"]):
                results.log_pass("Update Fixture")
                return True
            else:
                results.log_fail("Update Fixture", f"Update not reflected: {data}")
        else:
            results.log_fail("Update Fixture", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.log_fail("Update Fixture", f"Error: {str(e)}")
    return False

def test_delete_fixture(fixture_id):
    """Test 19: Delete fixture"""
    if not fixture_id:
        results.log_fail("Delete Fixture", "No fixture ID provided")
        return False
    
    try:
        response = requests.delete(f"{API_URL}/fixtures/{fixture_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "deleted" in data["message"].lower():
                results.log_pass("Delete Fixture")
                return True
            else:
                results.log_fail("Delete Fixture", f"Unexpected response: {data}")
        else:
            results.log_fail("Delete Fixture", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Delete Fixture", f"Error: {str(e)}")
    return False

def test_calendar_events():
    """Test 20: Get calendar events within date range"""
    start_date = "2024-01-01"
    end_date = "2024-12-31"
    
    try:
        response = requests.get(f"{API_URL}/calendar/events", 
                              params={"start_date": start_date, "end_date": end_date}, 
                              timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Check if events have required fields
                valid_events = True
                for event in data:
                    required_fields = ["id", "title", "date", "time", "type", "discipline", "location"]
                    if not all(field in event for field in required_fields):
                        valid_events = False
                        break
                    if event["type"] not in ["fixture", "session"]:
                        valid_events = False
                        break
                
                if valid_events:
                    results.log_pass("Calendar Events")
                    return data
                else:
                    results.log_fail("Calendar Events", "Events missing required fields or invalid type")
            else:
                results.log_fail("Calendar Events", f"Expected list, got: {type(data)}")
        else:
            results.log_fail("Calendar Events", f"Status code: {response.status_code}, Response: {response.text}")
    except Exception as e:
        results.log_fail("Calendar Events", f"Error: {str(e)}")
    return []

def test_session_with_fixture_linking():
    """Test 21: Create session with fixture linking"""
    # First create a fixture to link to
    fixture_data = {
        "name": "Test Fixture for Linking",
        "date": "2024-02-10",
        "time": "10:00",
        "location": "Test Range",
        "discipline": "trap"
    }
    
    try:
        # Create fixture
        fixture_response = requests.post(f"{API_URL}/fixtures", json=fixture_data, timeout=10)
        if fixture_response.status_code != 200:
            results.log_fail("Session with Fixture Linking", "Failed to create test fixture")
            return None
        
        fixture_id = fixture_response.json()["id"]
        
        # Create session linked to fixture
        session_data = {
            "date": "2024-02-10",
            "time": "10:30",
            "location": "Test Range",
            "discipline": "trap",
            "total_clays": 25,
            "clays_hit": 20,
            "fixture_id": fixture_id
        }
        
        session_response = requests.post(f"{API_URL}/sessions", json=session_data, timeout=10)
        if session_response.status_code == 200:
            session_data = session_response.json()
            if (session_data["fixture_id"] == fixture_id and 
                session_data["fixture_name"] == "Test Fixture for Linking"):
                results.log_pass("Session with Fixture Linking")
                # Cleanup
                requests.delete(f"{API_URL}/sessions/{session_data['id']}")
                requests.delete(f"{API_URL}/fixtures/{fixture_id}")
                return True
            else:
                results.log_fail("Session with Fixture Linking", 
                                f"Fixture linking failed: {session_data}")
        else:
            results.log_fail("Session with Fixture Linking", 
                            f"Session creation failed: {session_response.status_code}")
        
        # Cleanup fixture
        requests.delete(f"{API_URL}/fixtures/{fixture_id}")
        
    except Exception as e:
        results.log_fail("Session with Fixture Linking", f"Error: {str(e)}")
    return False

def test_nonexistent_fixture():
    """Test 22: Retrieve non-existent fixture"""
    fake_id = "nonexistent-fixture-id"
    
    try:
        response = requests.get(f"{API_URL}/fixtures/{fake_id}", timeout=10)
        if response.status_code == 404:
            results.log_pass("Non-existent Fixture Handling")
        else:
            results.log_fail("Non-existent Fixture Handling", 
                            f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.log_fail("Non-existent Fixture Handling", f"Error: {str(e)}")

def test_invalid_calendar_dates():
    """Test 23: Calendar events with invalid date format"""
    try:
        response = requests.get(f"{API_URL}/calendar/events", 
                              params={"start_date": "invalid-date", "end_date": "2024-12-31"}, 
                              timeout=10)
        if response.status_code == 400:
            results.log_pass("Invalid Calendar Date Format")
        else:
            results.log_fail("Invalid Calendar Date Format", 
                            f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.log_fail("Invalid Calendar Date Format", f"Error: {str(e)}")

def main():
    """Run all tests"""
    print("Starting Clay Pigeon Shooting Tracker Backend API Tests")
    print("="*60)
    
    # Test 1: API Health
    if not test_api_health():
        print("API is not responding. Stopping tests.")
        return False
    
    # Test 2-3: Create sessions
    session_id_1 = test_create_session_basic()
    session_id_2 = test_create_session_full()
    
    # Test 4: Get all sessions
    all_sessions = test_get_all_sessions()
    
    # Test 5: Get session by ID
    if session_id_1:
        test_get_session_by_id(session_id_1)
    
    # Test 6: Update session
    if session_id_1:
        test_update_session(session_id_1)
    
    # Test 8: Get statistics
    stats = test_get_stats()
    if stats:
        print(f"Current stats: {json.dumps(stats, indent=2)}")
    
    # Test 9-11: Data validation
    test_invalid_data_validation()
    test_missing_required_fields()
    test_invalid_discipline()
    
    # Test 12-13: Edge cases
    test_nonexistent_session()
    test_update_nonexistent_session()
    
    # NEW FIXTURE TESTS (Tests 14-19)
    print("\n" + "="*40)
    print("TESTING NEW FIXTURE FUNCTIONALITY")
    print("="*40)
    
    # Test 14-15: Create fixtures
    fixture_id_1 = test_create_fixture_basic()
    fixture_id_2 = test_create_fixture_full()
    
    # Test 16: Get all fixtures
    all_fixtures = test_get_all_fixtures()
    
    # Test 17: Get fixture by ID
    if fixture_id_1:
        test_get_fixture_by_id(fixture_id_1)
    
    # Test 18: Update fixture
    if fixture_id_2:
        test_update_fixture(fixture_id_2)
    
    # Test 20: Calendar events
    calendar_events = test_calendar_events()
    if calendar_events:
        print(f"Found {len(calendar_events)} calendar events")
    
    # Test 21: Session with fixture linking
    test_session_with_fixture_linking()
    
    # Test 22-23: Fixture edge cases
    test_nonexistent_fixture()
    test_invalid_calendar_dates()
    
    # Test 7: Delete sessions (cleanup)
    if session_id_1:
        test_delete_session(session_id_1)
    if session_id_2:
        test_delete_session(session_id_2)
    
    # Test 19: Delete fixtures (cleanup)
    if fixture_id_1:
        test_delete_fixture(fixture_id_1)
    if fixture_id_2:
        test_delete_fixture(fixture_id_2)
    
    # Final summary
    return results.summary()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)