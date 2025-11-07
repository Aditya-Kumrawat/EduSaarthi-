"""
Example Usage of AI Proctoring Suite
====================================

This file demonstrates different ways to use the unified proctoring module.
"""

from proctoring_suite import ProctoringSuite
import cv2
import time

def example_1_basic_session():
    """Example 1: Basic proctoring session"""
    print("=== Example 1: Basic Proctoring Session ===")
    
    # Initialize with default settings
    proctoring = ProctoringSuite()
    
    # Start complete session (press 'q' to quit)
    proctoring.start_proctoring_session(
        save_activity_log=True,
        log_filename='basic_session_log.txt'
    )

def example_2_custom_configuration():
    """Example 2: Custom configuration"""
    print("=== Example 2: Custom Configuration ===")
    
    # Initialize with custom settings
    proctoring = ProctoringSuite(
        audio_threshold=3000,  # Higher threshold for noisy environments
        beep_frequency=1500,   # Lower frequency beep
        beep_duration=500      # Shorter beep duration
    )
    
    # Start session
    proctoring.start_proctoring_session(
        save_activity_log=True,
        log_filename='custom_session_log.txt'
    )

def example_3_frame_by_frame_processing():
    """Example 3: Process frames manually"""
    print("=== Example 3: Frame-by-Frame Processing ===")
    
    proctoring = ProctoringSuite()
    
    # Setup camera
    if not proctoring.setup_camera(0):
        print("Failed to setup camera!")
        return
    
    # Start audio monitoring
    proctoring.start_audio_monitoring()
    
    frame_count = 0
    violation_count = 0
    
    try:
        while True:
            ret, frame = proctoring.cam.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Process every 5th frame to reduce load
            if frame_count % 5 == 0:
                results = proctoring.process_frame(frame)
                
                # Count violations
                if results['violations']:
                    violation_count += len(results['violations'])
                    print(f"Frame {frame_count}: {len(results['violations'])} violations detected")
                    for violation in results['violations']:
                        print(f"  - {violation}")
                
                # Display some stats
                if frame_count % 50 == 0:  # Every 50 frames
                    print(f"Processed {frame_count} frames, {violation_count} total violations")
            
            # Show frame
            cv2.imshow('Manual Processing', frame)
            
            # Quit on 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    except KeyboardInterrupt:
        print("Session interrupted by user")
    
    finally:
        proctoring.stop_session(save_activity_log=False)
        print(f"Session ended. Total frames: {frame_count}, Total violations: {violation_count}")

def example_4_individual_detections():
    """Example 4: Use individual detection methods"""
    print("=== Example 4: Individual Detection Methods ===")
    
    proctoring = ProctoringSuite()
    
    if not proctoring.setup_camera(0):
        print("Failed to setup camera!")
        return
    
    try:
        for i in range(10):  # Process 10 frames
            ret, frame = proctoring.cam.read()
            if not ret:
                break
            
            print(f"\n--- Frame {i+1} ---")
            
            # Individual detections
            face_count, faces, face_remark = proctoring.detect_face(frame)
            print(f"Face Detection: {face_remark}")
            
            if face_count == 1:
                blink_result = proctoring.detect_blinks(faces, frame)
                print(f"Blink Status: {blink_result[2]}")
                
                gaze_result = proctoring.detect_gaze(faces, frame)
                print(f"Gaze Direction: {gaze_result}")
                
                
                head_pose = proctoring.detect_head_pose(faces, frame)
                print(f"Head Pose: {head_pose}")
            
            # Object detection
            objects = proctoring.detect_objects(frame)
            if objects:
                print(f"Objects Detected: {[obj[0] for obj in objects]}")
            else:
                print("No objects detected")
            
            # Show frame
            cv2.imshow('Individual Detections', frame)
            cv2.waitKey(1000)  # Wait 1 second between frames
            
    except KeyboardInterrupt:
        print("Session interrupted by user")
    
    finally:
        proctoring.stop_session(save_activity_log=False)

def example_5_violation_monitoring():
    """Example 5: Focus on violation detection"""
    print("=== Example 5: Violation Monitoring ===")
    
    proctoring = ProctoringSuite()
    
    if not proctoring.setup_camera(0):
        print("Failed to setup camera!")
        return
    
    # Start audio monitoring
    proctoring.start_audio_monitoring()
    
    violation_log = []
    
    try:
        start_time = time.time()
        
        while time.time() - start_time < 30:  # Run for 30 seconds
            ret, frame = proctoring.cam.read()
            if not ret:
                break
            
            results = proctoring.process_frame(frame)
            
            # Log violations with timestamp
            if results['violations']:
                for violation in results['violations']:
                    violation_entry = {
                        'timestamp': results['timestamp'],
                        'violation': violation
                    }
                    violation_log.append(violation_entry)
                    print(f"🚨 {results['timestamp']}: {violation}")
            
            cv2.imshow('Violation Monitoring', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        # Summary
        print(f"\n=== VIOLATION SUMMARY ===")
        print(f"Total violations detected: {len(violation_log)}")
        
        # Group violations by type
        violation_types = {}
        for entry in violation_log:
            violation = entry['violation']
            if 'face' in violation.lower():
                violation_types['Face Violations'] = violation_types.get('Face Violations', 0) + 1
            elif 'gaze' in violation.lower():
                violation_types['Gaze Violations'] = violation_types.get('Gaze Violations', 0) + 1
            elif 'speaking' in violation.lower():
                violation_types['Speaking Violations'] = violation_types.get('Speaking Violations', 0) + 1
            elif 'object' in violation.lower():
                violation_types['Object Violations'] = violation_types.get('Object Violations', 0) + 1
            elif 'head' in violation.lower():
                violation_types['Head Pose Violations'] = violation_types.get('Head Pose Violations', 0) + 1
        
        for vtype, count in violation_types.items():
            print(f"{vtype}: {count}")
            
    except KeyboardInterrupt:
        print("Session interrupted by user")
    
    finally:
        proctoring.stop_session(save_activity_log=False)

if __name__ == "__main__":
    print("AI Proctoring Suite - Example Usage")
    print("=" * 40)
    
    while True:
        print("\nSelect an example to run:")
        print("1. Basic proctoring session")
        print("2. Custom configuration")
        print("3. Frame-by-frame processing")
        print("4. Individual detection methods")
        print("5. Violation monitoring")
        print("0. Exit")
        
        try:
            choice = input("\nEnter your choice (0-5): ").strip()
            
            if choice == '0':
                print("Goodbye!")
                break
            elif choice == '1':
                example_1_basic_session()
            elif choice == '2':
                example_2_custom_configuration()
            elif choice == '3':
                example_3_frame_by_frame_processing()
            elif choice == '4':
                example_4_individual_detections()
            elif choice == '5':
                example_5_violation_monitoring()
            else:
                print("Invalid choice. Please select 0-5.")
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"Error running example: {e}")
