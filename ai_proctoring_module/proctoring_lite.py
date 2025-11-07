"""
AI Proctoring Suite - Lightweight Version
=========================================

A simplified version of the proctoring suite for easy integration into other projects.
This version focuses on core functionality with minimal dependencies.
"""

import cv2
import numpy as np
import dlib
import math
from math import hypot
from datetime import datetime
import os


class ProctoringLite:
    """
    Lightweight proctoring module with essential features only
    """
    
    def __init__(self, shape_predictor_path='shape_predictor_model/shape_predictor_68_face_landmarks.dat'):
        """
        Initialize lightweight proctoring with minimal dependencies
        
        Args:
            shape_predictor_path: Path to dlib shape predictor model
        """
        self.shape_predictor_path = shape_predictor_path
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialize essential models"""
        try:
            self.face_detector = dlib.get_frontal_face_detector()
            self.shape_predictor = dlib.shape_predictor(self.shape_predictor_path)
            
            # Head pose model points
            self.model_points = np.array([
                (0.0, 0.0, 0.0),            # Nose tip
                (0.0, -330.0, -65.0),       # Chin
                (-255.0, 170.0, -135.0),    # Left eye left corner
                (225.0, 170.0, -135.0),     # Right eye right corner
                (-150.0, -150.0, -125.0),   # Left mouth corner
                (150.0, -150.0, -125.0)     # Right mouth corner
            ])
            
            print("✅ Lite models initialized successfully!")
            
        except Exception as e:
            print(f"❌ Error initializing models: {e}")
            raise
    
    def detect_face(self, frame):
        """Detect faces and return count with basic analysis"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_detector(gray, 0)
        face_count = len(faces)
        
        # Simple face count analysis
        if face_count == 0:
            return face_count, faces, "NO_FACE"
        elif face_count > 1:
            return face_count, faces, "MULTIPLE_FACES"
        else:
            return face_count, faces, "NORMAL"
    
    def detect_blinks(self, faces, frame):
        """Simplified blink detection"""
        if not faces:
            return "NO_FACE"
        
        for face in faces:
            landmarks = self.shape_predictor(frame, face)
            
            # Left eye points
            left_eye = [landmarks.part(i) for i in range(36, 42)]
            right_eye = [landmarks.part(i) for i in range(42, 48)]
            
            # Calculate eye aspect ratios
            left_ear = self._eye_aspect_ratio(left_eye)
            right_ear = self._eye_aspect_ratio(right_eye)
            
            avg_ear = (left_ear + right_ear) / 2.0
            
            # Blink threshold
            if avg_ear < 0.25:
                return "BLINK"
            else:
                return "OPEN"
        
        return "NO_FACE"
    
    def detect_head_pose(self, faces, frame):
        """Simplified head pose detection"""
        if not faces:
            return "NO_FACE"
        
        size = frame.shape
        focal_length = size[1]
        center = (size[1] / 2, size[0] / 2)
        
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype="double")
        
        for face in faces:
            landmarks = self.shape_predictor(frame, face)
            
            # 2D image points
            image_points = np.array([
                [landmarks.part(30).x, landmarks.part(30).y],    # Nose tip
                [landmarks.part(8).x, landmarks.part(8).y],      # Chin
                [landmarks.part(36).x, landmarks.part(36).y],    # Left eye left corner
                [landmarks.part(45).x, landmarks.part(45).y],    # Right eye right corner
                [landmarks.part(48).x, landmarks.part(48).y],    # Left mouth corner
                [landmarks.part(54).x, landmarks.part(54).y]     # Right mouth corner
            ], dtype="double")
            
            dist_coeffs = np.zeros((4, 1))
            success, rotation_vector, translation_vector = cv2.solvePnP(
                self.model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_UPNP)
            
            if success:
                # Project nose direction
                nose_end_point2D, _ = cv2.projectPoints(
                    np.array([(0.0, 0.0, 1000.0)]), rotation_vector, translation_vector, camera_matrix, dist_coeffs)
                
                p1 = (int(image_points[0][0]), int(image_points[0][1]))
                p2 = (int(nose_end_point2D[0][0][0]), int(nose_end_point2D[0][0][1]))
                
                try:
                    angle = math.degrees(math.atan2(p2[1] - p1[1], p2[0] - p1[0]))
                    
                    if angle > 30:
                        return "HEAD_DOWN"
                    elif angle < -30:
                        return "HEAD_UP"
                    elif abs(p2[0] - p1[0]) > 50:
                        if p2[0] > p1[0]:
                            return "HEAD_RIGHT"
                        else:
                            return "HEAD_LEFT"
                    else:
                        return "NORMAL"
                except:
                    return "NORMAL"
        
        return "NO_FACE"
    
    
    def quick_analysis(self, frame):
        """
        Quick analysis of a frame with essential detections
        
        Args:
            frame: Input video frame
            
        Returns:
            dict: Analysis results
        """
        timestamp = datetime.now().strftime("%H:%M:%S.%f")
        
        # Face detection
        face_count, faces, face_status = self.detect_face(frame)
        
        results = {
            'timestamp': timestamp,
            'face_count': face_count,
            'face_status': face_status,
            'violations': []
        }
        
        # Add violation if face issues
        if face_status != "NORMAL":
            results['violations'].append(f"Face issue: {face_status}")
        
        # If exactly one face, do other detections
        if face_count == 1:
            # Blink detection
            blink_status = self.detect_blinks(faces, frame)
            results['blink_status'] = blink_status
            
            # Head pose
            head_pose = self.detect_head_pose(faces, frame)
            results['head_pose'] = head_pose
            if head_pose not in ["NORMAL", "NO_FACE"]:
                results['violations'].append(f"Head pose: {head_pose}")
            
        
        return results
    
    def monitor_stream(self, camera_index=0, duration_seconds=None):
        """
        Monitor camera stream with real-time analysis
        
        Args:
            camera_index: Camera index to use
            duration_seconds: Duration to monitor (None for infinite)
        """
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            print("❌ Failed to open camera")
            return
        
        print("🚀 Monitoring started. Press 'q' to quit.")
        
        start_time = datetime.now()
        violation_count = 0
        frame_count = 0
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Analyze every 3rd frame to reduce load
                if frame_count % 3 == 0:
                    results = self.quick_analysis(frame)
                    
                    # Display violations
                    if results['violations']:
                        violation_count += len(results['violations'])
                        print(f"⚠️  {results['timestamp']}: {', '.join(results['violations'])}")
                    
                    # Draw status on frame
                    self._draw_status(frame, results)
                
                # Show frame
                cv2.imshow('Proctoring Lite Monitor', frame)
                
                # Check for quit or duration limit
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                
                if duration_seconds:
                    elapsed = (datetime.now() - start_time).total_seconds()
                    if elapsed >= duration_seconds:
                        break
        
        except KeyboardInterrupt:
            print("\n🛑 Monitoring interrupted")
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
            
            elapsed = (datetime.now() - start_time).total_seconds()
            print(f"✅ Monitoring ended. Duration: {elapsed:.1f}s, Violations: {violation_count}")
    
    def _eye_aspect_ratio(self, eye_points):
        """Calculate eye aspect ratio for blink detection"""
        # Vertical distances
        A = hypot(eye_points[1].x - eye_points[5].x, eye_points[1].y - eye_points[5].y)
        B = hypot(eye_points[2].x - eye_points[4].x, eye_points[2].y - eye_points[4].y)
        
        # Horizontal distance
        C = hypot(eye_points[0].x - eye_points[3].x, eye_points[0].y - eye_points[3].y)
        
        # Eye aspect ratio
        ear = (A + B) / (2.0 * C)
        return ear
    
    def _draw_status(self, frame, results):
        """Draw status information on frame"""
        y_offset = 30
        
        # Face status
        color = (0, 255, 0) if results['face_status'] == 'NORMAL' else (0, 0, 255)
        cv2.putText(frame, f"Face: {results['face_status']}", (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        y_offset += 25
        
        # Other statuses if available
        if 'head_pose' in results:
            color = (0, 255, 0) if results['head_pose'] == 'NORMAL' else (0, 165, 255)
            cv2.putText(frame, f"Head: {results['head_pose']}", (10, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            y_offset += 25
        
        # Violations
        if results['violations']:
            cv2.putText(frame, f"VIOLATIONS: {len(results['violations'])}", (10, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)


# Example usage
if __name__ == "__main__":
    print("AI Proctoring Suite - Lite Version")
    print("=" * 35)
    
    # Initialize
    proctoring = ProctoringLite()
    
    # Start monitoring
    proctoring.monitor_stream(camera_index=0, duration_seconds=30)  # Monitor for 30 seconds
