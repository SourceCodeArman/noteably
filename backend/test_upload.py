#!/usr/bin/env python
"""
Simple test script for upload endpoint.
Creates a test audio file and uploads it to the API.
"""

import os
import requests
from io import BytesIO

# Configuration
API_URL = "http://localhost:8000/api/process"
SUPABASE_TOKEN = os.getenv("TEST_TOKEN", "YOUR_SUPABASE_JWT_TOKEN_HERE")


def create_test_audio_file():
    """Create a small test MP3 file."""
    # This is a minimal valid MP3 file (silence)
    mp3_header = bytes(
        [
            0xFF,
            0xFB,
            0x90,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
        ]
    )
    return BytesIO(mp3_header * 100)  # ~1.6KB file


def test_upload():
    """Test the upload endpoint."""
    print("🧪 Testing Upload Endpoint")
    print(f"API URL: {API_URL}")
    print(
        f"Token: {SUPABASE_TOKEN[:20]}..."
        if len(SUPABASE_TOKEN) > 20
        else f"Token: {SUPABASE_TOKEN}"
    )
    print()

    # Create test file
    test_file = create_test_audio_file()

    # Prepare request
    files = {"file": ("test_lecture.mp3", test_file, "audio/mp3")}
    data = {
        "material_types": '["summary", "notes"]',  # Will be parsed as JSON by DRF
        "options": "{}",
    }
    headers = {"Authorization": f"Bearer {SUPABASE_TOKEN}"}

    print("📤 Uploading test file...")
    try:
        response = requests.post(API_URL, files=files, data=data, headers=headers)

        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📄 Response Body:")
        print(
            response.json()
            if response.headers.get("content-type") == "application/json"
            else response.text
        )

        if response.status_code == 201:
            print("\n✅ Upload successful!")
            job_data = response.json()
            print(f"   Job ID: {job_data.get('job_id')}")
            print(f"   Status: {job_data.get('status')}")
            print(f"   Estimated Time: {job_data.get('estimated_time')}s")
        elif response.status_code == 401:
            print("\n❌ Authentication failed!")
            print("   Set a valid Supabase JWT token:")
            print("   export TEST_TOKEN='your_supabase_jwt_token'")
        elif response.status_code == 429:
            print("\n⚠️  Quota exceeded!")
        else:
            print(f"\n❌ Upload failed with status {response.status_code}")

    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to server!")
        print("   Make sure the server is running:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    test_upload()
