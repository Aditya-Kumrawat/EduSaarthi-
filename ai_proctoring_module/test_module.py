"""
Test Script for AI Proctoring Module
====================================

This script tests the functionality of both ProctoringSuite and ProctoringLite classes.
"""

import cv2
import os
import sys
from datetime import datetime

def test_imports():
    """Test if all modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from proctoring_suite import ProctoringSuite
        print("✅ ProctoringSuite imported successfully")
    except Exception as e:
        print(f"❌ Failed to import ProctoringSuite: {e}")
        return False
    
    try:
        from proctoring_lite import ProctoringLite
        print("✅ ProctoringLite imported successfully")
    except Exception as e:
        print(f"❌ Failed to import ProctoringLite: {e}")
        return False
    
    return True

def test_model_files():
    """Test if required model files exist"""
    print("\n🧪 Testing model files...")
    
    required_files = [
        'shape_predictor_model/shape_predictor_68_face_landmarks.dat',
        'object_detection_model/config/yolov3-tiny.cfg',
        'object_detection_model/weights/yolov3-tiny.weights',
        'object_detection_model/objectLabels/coco.names'
    ]
    
    all_present = True
    for file_path in required_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {file_path} ({size:,} bytes)")
        else:
            print(f"❌ Missing: {file_path}")
            all_present = False
    
    return all_present

def test_proctoring_lite():
    """Test ProctoringLite initialization"""
    print("\n🧪 Testing ProctoringLite...")
    
    try:
        from proctoring_lite import ProctoringLite
        proctoring = ProctoringLite()
        print("✅ ProctoringLite initialized successfully")
        return True
    except Exception as e:
        print(f"❌ ProctoringLite initialization failed: {e}")
        return False

def test_proctoring_suite():
    """Test ProctoringSuite initialization"""
    print("\n🧪 Testing ProctoringSuite...")
    
    try:
        from proctoring_suite import ProctoringSuite
        proctoring = ProctoringSuite()
        print("✅ ProctoringSuite initialized successfully")
        return True
    except Exception as e:
        print(f"❌ ProctoringSuite initialization failed: {e}")
        return False

def test_camera_access():
    """Test camera access"""
    print("\n🧪 Testing camera access...")
    
    try:
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print(f"✅ Camera working - Frame size: {frame.shape}")
                cap.release()
                return True
            else:
                print("❌ Camera opened but failed to read frame")
        else:
            print("❌ Failed to open camera")
        cap.release()
        return False
    except Exception as e:
        print(f"❌ Camera test failed: {e}")
        return False

def test_single_frame_processing():
    """Test processing a single frame"""
    print("\n🧪 Testing single frame processing...")
    
    try:
        from proctoring_lite import ProctoringLite
        
        # Initialize
        proctoring = ProctoringLite()
        
        # Try to get a frame
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Cannot test frame processing - camera not available")
            return False
        
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            print("❌ Cannot test frame processing - failed to capture frame")
            return False
        
        # Process frame
        results = proctoring.quick_analysis(frame)
        print(f"✅ Frame processed successfully")
        print(f"   Face status: {results.get('face_status', 'N/A')}")
        print(f"   Violations: {len(results.get('violations', []))}")
        
        return True
        
    except Exception as e:
        print(f"❌ Frame processing test failed: {e}")
        return False

def run_comprehensive_test():
    """Run all tests"""
    print("AI Proctoring Module - Comprehensive Test")
    print("=" * 42)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Import Test", test_imports),
        ("Model Files Test", test_model_files),
        ("ProctoringLite Test", test_proctoring_lite),
        ("ProctoringSuite Test", test_proctoring_suite),
        ("Camera Access Test", test_camera_access),
        ("Frame Processing Test", test_single_frame_processing)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        if test_func():
            passed += 1
        else:
            print(f"⚠️  {test_name} failed - check requirements and setup")
    
    print(f"\n{'='*50}")
    print(f"TEST SUMMARY: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The module is ready to use.")
        print("\nNext steps:")
        print("1. Run: python example_usage.py")
        print("2. Or import in your own project:")
        print("   from ai_proctoring_module import ProctoringSuite")
    else:
        print("⚠️  Some tests failed. Please check:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Download models: python download_models.py")
        print("3. Check camera permissions")
    
    return passed == total

if __name__ == "__main__":
    run_comprehensive_test()
