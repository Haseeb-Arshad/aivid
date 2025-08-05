#!/usr/bin/env python3
"""
Simple test script to verify the backend setup
"""
import sys
import os

def test_imports():
    """Test that all required modules can be imported"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import jose
        import passlib
        import PIL
        import ffmpeg
        print("✓ All required packages imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_directories():
    """Test that required directories can be created"""
    try:
        upload_dir = "./uploads"
        thumbnail_dir = "./thumbnails"
        
        os.makedirs(upload_dir, exist_ok=True)
        os.makedirs(thumbnail_dir, exist_ok=True)
        
        print("✓ Upload and thumbnail directories created")
        return True
    except Exception as e:
        print(f"✗ Directory creation error: {e}")
        return False

def test_database():
    """Test database connection"""
    try:
        # Add current directory to Python path
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        import database
        import models
        
        # Create tables
        database.create_tables()
        
        # Test database session
        db = database.SessionLocal()
        db.close()
        
        print("✓ Database setup successful")
        return True
    except Exception as e:
        print(f"✗ Database error: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing AI Video Editor Backend Setup...")
    print("-" * 40)
    
    tests = [
        test_imports,
        test_directories,
        test_database
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        print()
    
    print(f"Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 Backend setup is ready!")
        return 0
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())