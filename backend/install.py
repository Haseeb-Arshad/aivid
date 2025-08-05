#!/usr/bin/env python3
"""
Installation script for the AI Video Editor backend
"""
import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    try:
        print("Installing Python dependencies...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✓ Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False

def check_ffmpeg():
    """Check if FFmpeg is available"""
    try:
        subprocess.run(["ffmpeg", "-version"], 
                      capture_output=True, check=True)
        print("✓ FFmpeg is available")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠ FFmpeg not found. Please install FFmpeg:")
        print("  Windows: Download from https://ffmpeg.org/download.html")
        print("  macOS: brew install ffmpeg")
        print("  Linux: sudo apt-get install ffmpeg")
        return False

def create_env_file():
    """Create .env file from example if it doesn't exist"""
    if not os.path.exists(".env"):
        if os.path.exists(".env.example"):
            import shutil
            shutil.copy(".env.example", ".env")
            print("✓ Created .env file from example")
        else:
            with open(".env", "w") as f:
                f.write("SECRET_KEY=dev-secret-key-change-in-production\n")
                f.write("DATABASE_URL=sqlite:///./video_editor.db\n")
            print("✓ Created basic .env file")
    else:
        print("✓ .env file already exists")

def main():
    """Run installation"""
    print("AI Video Editor Backend Installation")
    print("=" * 40)
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    success = True
    
    # Install Python dependencies
    if not install_requirements():
        success = False
    
    # Check FFmpeg
    if not check_ffmpeg():
        success = False
    
    # Create .env file
    create_env_file()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 Installation completed successfully!")
        print("\nNext steps:")
        print("1. Review and update the .env file with your settings")
        print("2. Run: python run.py")
        print("3. Visit: http://localhost:8000/docs")
    else:
        print("❌ Installation completed with warnings.")
        print("Please address the issues above before running the server.")

if __name__ == "__main__":
    main()