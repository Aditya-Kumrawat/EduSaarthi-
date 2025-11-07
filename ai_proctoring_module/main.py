"""
AI Proctoring Module - Main Entry Point
======================================

Interactive main script that allows users to choose between ProctoringSuite and ProctoringLite.
"""

import os
import sys
from datetime import datetime

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_banner():
    """Print the application banner"""
    print("╔" + "═" * 60 + "╗")
    print("║" + " " * 15 + "AI PROCTORING MODULE" + " " * 25 + "║")
    print("║" + " " * 10 + "Unified Exam Monitoring System" + " " * 19 + "║")
    print("╚" + "═" * 60 + "╝")
    print()

def print_menu():
    """Print the main menu"""
    print("📋 SELECT PROCTORING MODE:")
    print()
    print("1️⃣  ProctoringSuite (Full Version)")
    print("   ✅ Face Detection")
    print("   ✅ Eye Gaze Tracking")
    print("   ✅ Blink Detection")
    print("   ✅ Head Pose Estimation")
    print("   ✅ Mouth Tracking")
    print("   ✅ Object Detection (YOLO)")
    print("   ✅ Audio Monitoring")
    print("   ✅ Activity Logging")
    print()
    print("2️⃣  ProctoringLite (Lightweight Version)")
    print("   ✅ Face Detection")
    print("   ✅ Blink Detection")
    print("   ✅ Head Pose Estimation")
    print("   ✅ Mouth Tracking")
    print("   ✅ Basic Violation Detection")
    print()
    print("3️⃣  Test Module")
    print("   🧪 Run comprehensive tests")
    print()
    print("4️⃣  Download Models")
    print("   📥 Download required AI models")
    print()
    print("0️⃣  Exit")
    print()

def check_dependencies():
    """Check if required dependencies are available"""
    try:
        import cv2
        import numpy as np
        import dlib
        return True
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("💡 Please install requirements: pip install -r requirements.txt")
        return False

def check_models():
    """Check if required model files exist"""
    required_files = [
        'shape_predictor_model/shape_predictor_68_face_landmarks.dat'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("⚠️  Missing model files:")
        for file in missing_files:
            print(f"   - {file}")
        print("💡 Run option 4 to download models or run: python download_models.py")
        return False
    
    return True

def run_proctoring_suite():
    """Run the full ProctoringSuite"""
    print("🚀 Starting ProctoringSuite...")
    print("Press 'q' in the video window to quit")
    print()
    
    try:
        from proctoring_suite import ProctoringSuite
        
        # Get configuration options
        print("⚙️  Configuration Options:")
        
        # Audio monitoring
        audio_choice = input("Enable audio monitoring? (y/n) [default: y]: ").strip().lower()
        enable_audio = audio_choice != 'n'
        
        # Activity logging
        log_choice = input("Save activity log? (y/n) [default: y]: ").strip().lower()
        save_log = log_choice != 'n'
        
        if save_log:
            log_filename = input("Log filename [default: proctoring_session.txt]: ").strip()
            if not log_filename:
                log_filename = f"proctoring_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        print()
        print("🎯 Initializing ProctoringSuite...")
        
        # Initialize with default settings
        proctoring = ProctoringSuite()
        
        if not enable_audio:
            print("🔇 Audio monitoring disabled")
        else:
            print("🎤 Audio monitoring enabled")
        
        print("📹 Starting proctoring session...")
        print("=" * 50)
        
        # Start proctoring session
        proctoring.start_proctoring_session(
            save_activity_log=save_log,
            log_filename=log_filename if save_log else None
        )
        
    except Exception as e:
        print(f"❌ Error running ProctoringSuite: {e}")
        input("Press Enter to continue...")

def run_proctoring_lite():
    """Run the lightweight ProctoringLite"""
    print("🚀 Starting ProctoringLite...")
    print("Press 'q' in the video window to quit")
    print()
    
    try:
        from proctoring_lite import ProctoringLite
        
        # Get duration
        duration_input = input("Session duration in seconds [default: unlimited]: ").strip()
        duration = None
        if duration_input.isdigit():
            duration = int(duration_input)
        
        print()
        print("🎯 Initializing ProctoringLite...")
        
        # Initialize
        proctoring = ProctoringLite()
        
        print("📹 Starting monitoring session...")
        print("=" * 50)
        
        # Start monitoring
        proctoring.monitor_stream(
            camera_index=0,
            duration_seconds=duration
        )
        
    except Exception as e:
        print(f"❌ Error running ProctoringLite: {e}")
        input("Press Enter to continue...")

def run_tests():
    """Run the test module"""
    print("🧪 Running comprehensive tests...")
    print()
    
    try:
        from test_module import run_comprehensive_test
        run_comprehensive_test()
        
    except Exception as e:
        print(f"❌ Error running tests: {e}")
    
    input("\nPress Enter to continue...")

def download_models():
    """Run the model download script"""
    print("📥 Downloading required models...")
    print()
    
    try:
        from download_models import main as download_main
        download_main()
        
    except Exception as e:
        print(f"❌ Error downloading models: {e}")
    
    input("\nPress Enter to continue...")

def main():
    """Main application loop"""
    while True:
        clear_screen()
        print_banner()
        
        # Check system status
        deps_ok = check_dependencies()
        models_ok = check_models()
        
        if deps_ok and models_ok:
            print("✅ System Status: Ready")
        else:
            print("⚠️  System Status: Setup Required")
        
        print()
        print_menu()
        
        try:
            choice = input("👆 Select an option (0-4): ").strip()
            
            if choice == '0':
                print("\n👋 Goodbye!")
                break
            
            elif choice == '1':
                if not deps_ok:
                    print("❌ Cannot run ProctoringSuite - dependencies missing")
                    input("Press Enter to continue...")
                    continue
                if not models_ok:
                    print("❌ Cannot run ProctoringSuite - models missing")
                    input("Press Enter to continue...")
                    continue
                clear_screen()
                run_proctoring_suite()
            
            elif choice == '2':
                if not deps_ok:
                    print("❌ Cannot run ProctoringLite - dependencies missing")
                    input("Press Enter to continue...")
                    continue
                if not models_ok:
                    print("❌ Cannot run ProctoringLite - models missing")
                    input("Press Enter to continue...")
                    continue
                clear_screen()
                run_proctoring_lite()
            
            elif choice == '3':
                clear_screen()
                run_tests()
            
            elif choice == '4':
                clear_screen()
                download_models()
            
            else:
                print("❌ Invalid choice. Please select 0-4.")
                input("Press Enter to continue...")
        
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            input("Press Enter to continue...")

if __name__ == "__main__":
    print("Starting AI Proctoring Module...")
    main()
