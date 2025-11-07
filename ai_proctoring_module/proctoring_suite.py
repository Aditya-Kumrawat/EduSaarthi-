import cv2
import numpy as np
import dlib
import time
import math
import pyaudio
import winsound
from math import hypot
from datetime import datetime
from imutils import face_utils
import threading
import os


class ProctoringSuite:
    """
    Unified proctoring suite combining all detection modules
    """
    
    def __init__(self, 
                 shape_predictor_path='shape_predictor_model/shape_predictor_68_face_landmarks.dat',
                 yolo_weights_path='object_detection_model/weights/yolov3-tiny.weights',
                 yolo_config_path='object_detection_model/config/yolov3-tiny.cfg',
                 coco_names_path='object_detection_model/objectLabels/coco.names',
                 audio_threshold=2500, # Increased default
                 beep_frequency=2500,
                 beep_duration=1000,
                 gaze_violation_threshold_sec=20, # Increased default
                 tuning_mode=False):
        """
        Initialize the ProctoringSuite with all necessary models and parameters
        """
        
        self.shape_predictor_path = shape_predictor_path
        self.yolo_weights_path = yolo_weights_path
        self.yolo_config_path = yolo_config_path
        self.coco_names_path = coco_names_path
        self.audio_threshold = audio_threshold
        self.beep_frequency = beep_frequency
        self.beep_duration = beep_duration
        self._initialize_models()
        self.data_record = []
        self.running = True
        self.audio_monitoring = False
        self.cam = None
        self.gaze_bottom_left_start_time = None
        self.gaze_bottom_right_start_time = None
        self.gaze_violation_threshold_sec = gaze_violation_threshold_sec
        self.gaze_violation_flagged = {'bottom_left': False, 'bottom_right': False}
        self.violation_counter = 0
        self.last_frame_violations = set()
        self.tuning_mode = tuning_mode
        self.last_head_pose_data = {'yaw': 0, 'pitch': 0, 'roll': 0, 'status': "N/A"}
        self.last_audio_amplitude = 0
        
        ## --- CHANGE 1: ADD GRACE PERIOD (PERSISTENCE) FOR HEAD POSE ---
        # We will require the head to be turned away for a certain number of consecutive frames
        # before flagging a violation. Assuming ~30 FPS, 15 frames is about 0.5 seconds.
        self.HEAD_POSE_PERSISTENCE = 15 # Number of frames to persist before violation
        self.head_pose_violation_frames = 0 # Counter for consecutive violation frames

    def _initialize_models(self):
        """Initialize all AI models"""
        try:
            # Initialize dlib face detector and shape predictor
            self.face_detector = dlib.get_frontal_face_detector()
            self.shape_predictor = dlib.shape_predictor(self.shape_predictor_path)
            
            # Initialize YOLO object detection
            self.yolo_net = cv2.dnn.readNet(self.yolo_weights_path, self.yolo_config_path)
            
            # Load COCO class names
            with open(self.coco_names_path, "r") as file:
                self.label_classes = [name.strip() for name in file.readlines()]
            
            # YOLO layer names
            layer_names = self.yolo_net.getLayerNames()
            self.output_layers = [layer_names[layer-1] for layer in self.yolo_net.getUnconnectedOutLayers()]
            
            # Colors for object detection visualization
            self.colors = np.random.uniform(0, 255, size=(len(self.label_classes), 3))
            
            # Head pose estimation setup
            self.model_points = np.array([
                (0.0, 0.0, 0.0),            # Nose tip
                (0.0, -330.0, -65.0),       # Chin
                (-255.0, 170.0, -135.0),    # Left eye left corner
                (225.0, 170.0, -135.0),     # Right eye right corner
                (-150.0, -150.0, -125.0),   # Left mouth corner
                (150.0, -150.0, -125.0)     # Right mouth corner
            ])
            
            print("✅ All models initialized successfully!")
            
        except Exception as e:
            print(f"❌ Error initializing models: {e}")
            raise
    
    # ... (No changes to setup_camera, detect_face, detect_blinks) ...
    def setup_camera(self, camera_index=0):
        """Setup camera for video capture"""
        self.cam = cv2.VideoCapture(camera_index)
        if not self.cam.isOpened():
            self.cam.open(camera_index)
        return self.cam.isOpened()
    
    def detect_face(self, frame):
        """
        Detect faces in the frame
        
        Args:
            frame: Input video frame
            
        Returns:
            tuple: (face_count, faces, remark)
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_detector(gray, 0)
        face_count = len(faces)
        
        # Draw face landmarks and rectangles
        for face in faces:
            x, y, w, h = face.left(), face.top(), face.width(), face.height()
            
            # Draw fancy corners
            cv2.line(frame, (x, y), (x + 20, y), (0, 255, 255), 2)
            cv2.line(frame, (x, y), (x, y + 20), (0, 255, 255), 2)
            cv2.line(frame, (x + w, y), (x + w - 20, y), (0, 255, 255), 2)
            cv2.line(frame, (x + w, y), (x + w, y + 20), (0, 255, 255), 2)
            cv2.line(frame, (x, y + h), (x + 20, y + h), (0, 255, 255), 2)
            cv2.line(frame, (x, y + h), (x, y + h - 20), (0, 255, 255), 2)
            cv2.line(frame, (x + w, y + h), (x + w - 20, y + h), (0, 255, 255), 2)
            cv2.line(frame, (x + w, y + h), (x + w, y + h - 20), (0, 255, 255), 2)
            
            # Draw facial landmarks
            facial_landmarks = self.shape_predictor(gray, face)
            facial_landmarks = face_utils.shape_to_np(facial_landmarks)
            
            for (a, b) in facial_landmarks:
                cv2.circle(frame, (a, b), 2, (255, 255, 0), -1)
        
        # Generate remark based on face count
        if face_count > 1:
            remark = "Multiple faces detected" # Removed VIOLATION here, will be handled in process_frame
        elif face_count == 0:
            remark = "No face detected"
        else:
            remark = "Face detection normal"
            
        return face_count, faces, remark
    
    def detect_blinks(self, faces, frame, gray_frame):
        """
        Detect eye blinks
        
        Args:
            faces: Detected faces
            frame: Input video frame (BGR)
            gray_frame: Grayscale version of the input frame
            
        Returns:
            tuple: (left_ratio, right_ratio, blink_status)
        """
        if not faces:
            return (0, 0, "No face detected")
        
        for face in faces:
            facial_landmarks = self.shape_predictor(gray_frame, face)
            
            # Left eye calculations
            l_left = (facial_landmarks.part(36).x, facial_landmarks.part(36).y)
            l_right = (facial_landmarks.part(39).x, facial_landmarks.part(39).y)
            l_top = self._midpoint(facial_landmarks.part(37), facial_landmarks.part(38))
            l_bottom = self._midpoint(facial_landmarks.part(40), facial_landmarks.part(41))
            
            left_hor_len = self._euclidean_distance(l_left, l_right)
            left_ver_len = self._euclidean_distance(l_top, l_bottom)
            
            # Right eye calculations
            r_left = (facial_landmarks.part(42).x, facial_landmarks.part(42).y)
            r_right = (facial_landmarks.part(45).x, facial_landmarks.part(45).y)
            r_top = self._midpoint(facial_landmarks.part(43), facial_landmarks.part(44))
            r_bottom = self._midpoint(facial_landmarks.part(46), facial_landmarks.part(47))
            
            right_hor_len = self._euclidean_distance(r_left, r_right)
            right_ver_len = self._euclidean_distance(r_top, r_bottom)
            
            # Calculate ratios
            l_ratio = left_hor_len / left_ver_len if left_ver_len > 0 else 0
            r_ratio = right_hor_len / right_ver_len if right_ver_len > 0 else 0
            
            # Determine blink status
            if l_ratio >= 3.6 or r_ratio >= 3.6:
                cv2.putText(frame, "BLINK", (50, 140), cv2.FONT_HERSHEY_PLAIN, 2, (64, 64, 64), 2)
                return (l_ratio, r_ratio, "Blink")
            else:
                return (l_ratio, r_ratio, "No Blink")
        
        return (0, 0, "No face detected")

    def detect_head_pose(self, faces, frame, gray_frame):
        """Detect head pose estimation."""
        if not faces:
            self.last_head_pose_data = {'yaw': 0, 'pitch': 0, 'roll': 0, 'status': "No face detected"}
            return "No face detected"
        
        size = frame.shape
        focal_length = size[1]
        center = (size[1] / 2, size[0] / 2)
        
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype="double")
        
        for face in faces:
            marks = self.shape_predictor(gray_frame, face)
            image_points = np.array([
                [marks.part(30).x, marks.part(30).y], [marks.part(8).x, marks.part(8).y],
                [marks.part(36).x, marks.part(36).y], [marks.part(45).x, marks.part(45).y],
                [marks.part(48).x, marks.part(48).y], [marks.part(54).x, marks.part(54).y]
            ], dtype="double")
            
            dist_coeffs = np.zeros((4, 1))
            (success, rotation_vector, translation_vector) = cv2.solvePnP(
                self.model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_UPNP)
            
            (nose_end_point2D, _) = cv2.projectPoints(
                np.array([(0.0, 0.0, 1000.0)]), rotation_vector, translation_vector, camera_matrix, dist_coeffs)
            
            p1 = (int(image_points[0][0]), int(image_points[0][1]))
            p2 = (int(nose_end_point2D[0][0][0]), int(nose_end_point2D[0][0][1]))
            cv2.line(frame, p1, p2, (255, 0, 0), 2)

            try:
                rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
                sy = math.sqrt(rotation_matrix[0,0]**2 +  rotation_matrix[1,0]**2)
                singular = sy < 1e-6
                if not singular:
                    pitch, yaw, roll = [math.atan2(rotation_matrix[2,1], rotation_matrix[2,2]),
                                        math.atan2(-rotation_matrix[2,0], sy),
                                        math.atan2(rotation_matrix[1,0], rotation_matrix[0,0])]
                else:
                    pitch, yaw, roll = [math.atan2(-rotation_matrix[1,2], rotation_matrix[1,1]),
                                        math.atan2(-rotation_matrix[2,0], sy), 0]

                yaw_degrees, pitch_degrees, roll_degrees = [math.degrees(angle) for angle in [yaw, pitch, roll]]
                
                # --- WIDENED SENSITIVITY THRESHOLDS ---
                yaw_threshold = 30
                pitch_threshold = 25

                status = "Head Position Normal"
                if abs(yaw_degrees) > yaw_threshold or abs(pitch_degrees) > pitch_threshold:
                    status = "Head Turned Away"
                
                self.last_head_pose_data = {'yaw': yaw_degrees, 'pitch': pitch_degrees, 'roll': roll_degrees, 'status': status}
                return status
            except Exception as e:
                self.last_head_pose_data = {'yaw': 0, 'pitch': 0, 'roll': 0, 'status': "Calculation Error"}
                return "Head Pose Calculation Error"
        return "No face detected"

    # ... (No changes to audio methods, pupil/gaze detection methods) ...
    def start_audio_monitoring(self):
        """Start audio monitoring in a separate thread"""
        if not self.audio_monitoring:
            self.audio_monitoring = True
            audio_thread = threading.Thread(target=self._audio_detection_loop, daemon=True)
            audio_thread.start()
    
    def stop_audio_monitoring(self):
        """Stop audio monitoring"""
        self.audio_monitoring = False
    
    def _audio_detection_loop(self):
        """Audio detection loop. Now stores max amplitude for tuning display."""
        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 44100
        
        try:
            p = pyaudio.PyAudio()
            stream = p.open(format=FORMAT,
                          channels=CHANNELS,
                          rate=RATE,
                          input=True,
                          frames_per_buffer=CHUNK)
            
            print("🎤 Audio monitoring started...")
            
            while self.audio_monitoring:
                try:
                    data = stream.read(CHUNK, exception_on_overflow=False)
                    audio_data = np.frombuffer(data, dtype=np.int16)
                    max_amplitude = np.max(np.abs(audio_data))
                    
                    self.last_audio_amplitude = max_amplitude

                    if max_amplitude > self.audio_threshold:
                        print(f"🔊 Suspicious audio detected! Max amplitude: {max_amplitude}")
                        winsound.Beep(self.beep_frequency, self.beep_duration)
                        
                except Exception as e:
                    print(f"Audio detection error: {e}")
                    if not self.running:
                        break
            
            stream.stop_stream()
            stream.close()
            p.terminate()
            print("🎤 Audio monitoring stopped")
            
        except Exception as e:
            print(f"Failed to initialize audio monitoring: {e}")

    def _get_pupil_center_from_eye(self, eye_frame):
        """
        Detects the pupil center within a given eye frame.
        Returns (cx, cy) relative to eye_frame, or None if not found.
        """
        if eye_frame is None or eye_frame.size == 0 or eye_frame.shape[0] == 0 or eye_frame.shape[1] == 0:
            return None

        gray_eye = cv2.cvtColor(eye_frame, cv2.COLOR_BGR2GRAY)

        _, threshold_eye = cv2.threshold(gray_eye, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        kernel = np.ones((3, 3), np.uint8)
        threshold_eye = cv2.erode(threshold_eye, kernel, iterations=1)
        threshold_eye = cv2.dilate(threshold_eye, kernel, iterations=1)

        contours, _ = cv2.findContours(threshold_eye, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            
            if cv2.contourArea(largest_contour) < 10: 
                return None

            M = cv2.moments(largest_contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                return (cx, cy)
        return None

    def _get_avg_pupil_gaze_point(self, frame, facial_landmarks):
        """
        Estimates a single average gaze point (pupil center) on the frame.
        Returns (global_x, global_y) or None.
        """
        left_eye_points = [36, 37, 38, 39, 40, 41]
        right_eye_points = [42, 43, 44, 45, 46, 47]

        pupil_global_coords = []

        for eye_pts_indices in [left_eye_points, right_eye_points]:
            eye_region_pts = np.array([(facial_landmarks.part(i).x, facial_landmarks.part(i).y) for i in eye_pts_indices])
            x, y, w, h = cv2.boundingRect(eye_region_pts)

            if w > 0 and h > 0 and x >= 0 and y >= 0 and x + w <= frame.shape[1] and y + h <= frame.shape[0]:
                eye_frame = frame[y:y+h, x:x+w].copy()
                pupil_center_local = self._get_pupil_center_from_eye(eye_frame)

                if pupil_center_local:
                    pupil_global_coords.append((x + pupil_center_local[0], y + pupil_center_local[1]))

        if pupil_global_coords:
            avg_x = sum(p[0] for p in pupil_global_coords) // len(pupil_global_coords)
            avg_y = sum(p[1] for p in pupil_global_coords) // len(pupil_global_coords)
            return (avg_x, avg_y)
        return None

    def _monitor_gaze_regions(self, frame, gaze_point, results):
        """
        Monitors if the gaze_point is within defined screen regions for a period
        and updates results with gaze tracking status and violations.
        """
        if gaze_point is None:
            self.gaze_bottom_left_start_time = None
            self.gaze_bottom_right_start_time = None
            self.gaze_violation_flagged['bottom_left'] = False
            self.gaze_violation_flagged['bottom_right'] = False
            results['gaze_region_tracking'] = {
                'status': "Gaze point not detected",
                'bottom_left_timer': 0,
                'bottom_right_timer': 0,
                'bottom_left_violation_flagged': False,
                'bottom_right_violation_flagged': False,
                'gaze_point_on_frame': None
            }
            return

        frame_height, frame_width, _ = frame.shape
        current_time = time.time()

        region_height_ratio = 0.25
        region_width_ratio = 0.25

        bottom_left_x_start = 0
        bottom_left_x_end = int(frame_width * region_width_ratio)
        bottom_left_y_start = int(frame_height * (1 - region_height_ratio))
        bottom_left_y_end = frame_height

        bottom_right_x_start = int(frame_width * (1 - region_width_ratio))
        bottom_right_x_end = frame_width
        bottom_right_y_start = int(frame_height * (1 - region_height_ratio))
        bottom_right_y_end = frame_height

        gaze_x, gaze_y = gaze_point

        is_looking_bottom_left = (
            bottom_left_x_start <= gaze_x <= bottom_left_x_end and
            bottom_left_y_start <= gaze_y <= bottom_left_y_end
        )
        is_looking_bottom_right = (
            bottom_right_x_start <= gaze_x <= bottom_right_x_end and
            bottom_right_y_start <= gaze_y <= bottom_right_y_end
        )

        cv2.rectangle(frame, (bottom_left_x_start, bottom_left_y_start), (bottom_left_x_end, bottom_left_y_end), (255, 128, 0), 2)
        cv2.putText(frame, "BL", (bottom_left_x_start + 5, bottom_left_y_start + 20), cv2.FONT_HERSHEY_PLAIN, 1, (255, 128, 0), 1)

        cv2.rectangle(frame, (bottom_right_x_start, bottom_right_y_start), (bottom_right_x_end, bottom_right_y_end), (0, 128, 255), 2)
        cv2.putText(frame, "BR", (bottom_right_x_start + 5, bottom_right_y_start + 20), cv2.FONT_HERSHEY_PLAIN, 1, (0, 128, 255), 1)

        cv2.circle(frame, gaze_point, 5, (0, 255, 255), -1)

        gaze_status_text = "Normal"
        bl_elapsed_time = 0
        br_elapsed_time = 0

        if is_looking_bottom_left:
            if self.gaze_bottom_left_start_time is None:
                self.gaze_bottom_left_start_time = current_time
            
            bl_elapsed_time = current_time - self.gaze_bottom_left_start_time
            if bl_elapsed_time >= self.gaze_violation_threshold_sec and not self.gaze_violation_flagged['bottom_left']:
                violation_msg = f"Gaze Violation: Looking Bottom-Left"
                results['violations'].append(violation_msg)
                self.gaze_violation_flagged['bottom_left'] = True
            
            cv2.putText(frame, f"BL Gaze: {int(bl_elapsed_time)}s", (bottom_left_x_start + 5, bottom_left_y_start + 40), cv2.FONT_HERSHEY_PLAIN, 1, (255, 128, 0), 1)
            gaze_status_text = "Looking Bottom-Left"

            self.gaze_bottom_right_start_time = None
            self.gaze_violation_flagged['bottom_right'] = False
            
        else:
            self.gaze_bottom_left_start_time = None
            self.gaze_violation_flagged['bottom_left'] = False

        if is_looking_bottom_right:
            if self.gaze_bottom_right_start_time is None:
                self.gaze_bottom_right_start_time = current_time
            
            br_elapsed_time = current_time - self.gaze_bottom_right_start_time
            if br_elapsed_time >= self.gaze_violation_threshold_sec and not self.gaze_violation_flagged['bottom_right']:
                violation_msg = f"Gaze Violation: Looking Bottom-Right"
                results['violations'].append(violation_msg)
                self.gaze_violation_flagged['bottom_right'] = True
                
            cv2.putText(frame, f"BR Gaze: {int(br_elapsed_time)}s", (bottom_right_x_start + 5, bottom_right_y_start + 40), cv2.FONT_HERSHEY_PLAIN, 1, (0, 128, 255), 1)
            gaze_status_text = "Looking Bottom-Right"
            
            self.gaze_bottom_left_start_time = None
            self.gaze_violation_flagged['bottom_left'] = False
        else:
            self.gaze_bottom_right_start_time = None
            self.gaze_violation_flagged['bottom_right'] = False
            
        if not is_looking_bottom_left and not is_looking_bottom_right:
             self.gaze_bottom_left_start_time = None
             self.gaze_bottom_right_start_time = None
             self.gaze_violation_flagged['bottom_left'] = False
             self.gaze_violation_flagged['bottom_right'] = False
             gaze_status_text = "Normal (not BL/BR regions)"

        results['gaze_region_tracking'] = {
            'status': gaze_status_text,
            'bottom_left_timer_sec': bl_elapsed_time,
            'bottom_right_timer_sec': br_elapsed_time,
            'bottom_left_violation_flagged': self.gaze_violation_flagged['bottom_left'],
            'bottom_right_violation_flagged': self.gaze_violation_flagged['bottom_right'],
            'gaze_point_on_frame': gaze_point
        }

    def process_frame(self, frame):
        """Process a single frame with all detection modules"""
        current_time = datetime.now().strftime("%H:%M:%S.%f")
        results = {'timestamp': current_time, 'violations': []}
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # --- Face Detection ---
        face_count, faces, face_remark = self.detect_face(frame)
        results['face_detection'] = {'count': face_count, 'remark': face_remark}
        if face_count != 1:
            results['violations'].append(face_remark)

        # --- Object Detection ---
        ## --- CHANGE 2: TARGETED OBJECT DETECTION ---
        # Define a list of objects that are considered suspicious
        SUSPICIOUS_OBJECTS = {'cell phone', 'person','book', 'laptop'} 
        
        detected_objects = self.detect_objects(frame)
        results['object_detection'] = detected_objects
        found_suspicious_objects = []
        for obj_label, confidence in detected_objects:
            if obj_label in SUSPICIOUS_OBJECTS:
                found_suspicious_objects.append(obj_label)
        if found_suspicious_objects:
            results['violations'].append(f"Suspicious object(s): {', '.join(found_suspicious_objects)}")

        # --- Modules that require a single face ---
        if face_count == 1:
            face = faces[0]
            facial_landmarks = self.shape_predictor(gray, face)
            
            # Blink detection
            results['blink_detection'] = self.detect_blinks(faces, frame, gray)
            
            # Head Pose with Grace Period
            head_pose_status = self.detect_head_pose(faces, frame, gray)
            results['head_pose'] = head_pose_status
            
            ## --- CHANGE 3: HEAD POSE GRACE PERIOD LOGIC ---
            if "Away" in head_pose_status:
                self.head_pose_violation_frames += 1 # Increment counter
                if self.head_pose_violation_frames >= self.HEAD_POSE_PERSISTENCE:
                    # Only add violation if counter exceeds persistence threshold
                    results['violations'].append("Head Turned Away (Sustained)")
            else:
                self.head_pose_violation_frames = 0 # Reset counter if looking forward

            # Gaze Region Tracking
            avg_pupil_gaze_point = self._get_avg_pupil_gaze_point(frame, facial_landmarks)
            self._monitor_gaze_regions(frame, avg_pupil_gaze_point, results)

            ## --- (DISABLED) GENERAL GAZE ---
            # The following lines for general gaze are commented out to reduce noise.
            # gaze_result_general = self.detect_gaze(faces, frame, gray)
            # results['gaze_detection'] = gaze_result_general
            # if 'Left' in gaze_result_general or 'Right' in gaze_result_general:
            #     results['violations'].append(f"General Gaze: {gaze_result_general}")
            
        else: # No face or multiple faces
            # Reset persistence counter if face is lost
            self.head_pose_violation_frames = 0

        # --- Update Violation Counter ---
        current_violations_set = set(results['violations'])
        newly_triggered_violations = current_violations_set - self.last_frame_violations
        if newly_triggered_violations:
            self.violation_counter += len(newly_triggered_violations)
            winsound.Beep(self.beep_frequency, self.beep_duration) # Beep for any new violation
        self.last_frame_violations = current_violations_set

        return results

    # The rest of the code (start_proctoring_session, stop_session, helpers) is mostly unchanged
    # but I include it here for completeness.
    
    def start_proctoring_session(self, save_activity_log=True, log_filename='proctoring_activity.txt'):
        """
        Start a complete proctoring session. Displays tuning data if tuning_mode is True.
        """
        if not self.setup_camera():
            print("❌ Failed to setup camera! Please check if camera is connected and available.")
            return
        
        self.violation_counter = 0
        self.last_frame_violations = set()
        
        self.start_audio_monitoring()
        
        print(f"🚀 Proctoring session started! Press 'q' to quit.")
        if self.tuning_mode:
            print("✅ TUNING MODE is ON. Raw sensor data will be displayed on screen.")

        try:
            while self.running:
                ret, frame = self.cam.read()
                if not ret:
                    print("❌ Failed to read frame from camera. Exiting.")
                    break
                
                results = self.process_frame(frame)
                self.data_record.append(results)
                
                if results['violations']:
                    print(f"⚠️  VIOLATIONS at {results['timestamp']}: {results['violations']}")
                
                # --- Violation Counter Display ---
                violation_text = f"VIOLATIONS: {self.violation_counter}"
                font = cv2.FONT_HERSHEY_DUPLEX
                font_scale = 0.7
                thickness = 2
                (text_width, text_height), baseline = cv2.getTextSize(violation_text, font, font_scale, thickness)
                text_x = frame.shape[1] - text_width - 20
                text_y = 30
                rect_start = (text_x - 10, text_y - text_height - 5)
                rect_end = (text_x + text_width + 10, text_y + baseline)
                sub_frame = frame[rect_start[1]:rect_end[1], rect_start[0]:rect_end[0]]
                black_rect = np.zeros(sub_frame.shape, dtype=np.uint8)
                res = cv2.addWeighted(sub_frame, 0.5, black_rect, 0.5, 1.0)
                frame[rect_start[1]:rect_end[1], rect_start[0]:rect_end[0]] = res
                cv2.putText(frame, violation_text, (text_x, text_y), font, font_scale, (0, 0, 255), thickness)

                # --- Display Tuning Data ---
                if self.tuning_mode:
                    yaw = self.last_head_pose_data['yaw']
                    pitch = self.last_head_pose_data['pitch']
                    pose_text_1 = f"Yaw (L/R): {yaw:.1f}"
                    pose_text_2 = f"Pitch (U/D): {pitch:.1f}"
                    cv2.putText(frame, "--- TUNING DATA ---", (10, 30), cv2.FONT_HERSHEY_PLAIN, 1, (0, 255, 0), 1)
                    cv2.putText(frame, pose_text_1, (10, 50), cv2.FONT_HERSHEY_PLAIN, 1, (0, 255, 0), 1)
                    cv2.putText(frame, pose_text_2, (10, 70), cv2.FONT_HERSHEY_PLAIN, 1, (0, 255, 0), 1)
                    
                    audio_text = f"Audio Level: {self.last_audio_amplitude}"
                    cv2.putText(frame, audio_text, (10, frame.shape[0] - 20), cv2.FONT_HERSHEY_PLAIN, 1, (0, 255, 0), 1)

                cv2.imshow('AI Proctoring Suite', frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
        except KeyboardInterrupt:
            print("\n🛑 Proctoring session interrupted by user")
        
        finally:
            self.stop_session(save_activity_log, log_filename)
    
    def stop_session(self, save_activity_log=True, log_filename='proctoring_activity.txt'):
        """Stop the proctoring session and cleanup"""
        self.running = False
        self.stop_audio_monitoring()
        
        if self.cam:
            self.cam.release()
        cv2.destroyAllWindows()
        
        if save_activity_log and self.data_record:
            self._save_activity_log(log_filename)
        
        print("✅ Proctoring session ended successfully!")
    
    def _save_activity_log(self, filename):
        """Save activity log to file"""
        try:
            with open(filename, 'w') as file:
                file.write("AI-Based Online Exam Proctoring - Activity Log\n")
                file.write("=" * 50 + "\n\n")
                
                for record in self.data_record:
                    file.write(f"Timestamp: {record['timestamp']}\n")
                    # ... log all the record details ...
                    if record.get('violations'):
                        file.write(f"🚨 VIOLATIONS: {record['violations']}\n")
                    file.write("-" * 30 + "\n")
                
                file.write(f"\nSUMMARY:\nTotal Violation Incidents: {self.violation_counter}\n")
            
            print(f"📝 Activity log saved to: {filename}")
            
        except Exception as e:
            print(f"❌ Failed to save activity log: {e}")
    
    # Helper methods (unchanged)
    def _midpoint(self, point_a, point_b):
        x = int((point_a.x + point_b.x) / 2)
        y = int((point_a.y + point_b.y) / 2)
        return (x, y)
    
    def _euclidean_distance(self, point_a, point_b):
        return hypot((point_a[0] - point_b[0]), (point_a[1] - point_b[1]))
    
    def _create_mask(self, frame):
        height, width, _ = frame.shape
        return np.zeros((height, width), np.uint8)
    
    def _extract_eye(self, mask, regions, frame):
        cv2.polylines(mask, regions, True, 255, 2)
        cv2.fillPoly(mask, regions, 255)
        return cv2.bitwise_and(frame, frame, mask=mask)
        
    def detect_objects(self, frame):
        """Detects objects and returns a list of (label, confidence) tuples."""
        # This is a simplified placeholder. In the full code, it's more complex.
        height, width, _ = frame.shape
        blob = cv2.dnn.blobFromImage(frame, 0.00392, (220, 220), (0, 0, 0), True, crop=False)
        self.yolo_net.setInput(blob)
        outs = self.yolo_net.forward(self.output_layers)
        
        detected_objects = []
        boxes, confidences, class_ids = [], [], []
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.5: # Confidence threshold
                    center_x, center_y, w, h = (detection[0:4] * np.array([width, height, width, height])).astype('int')
                    x, y = int(center_x - w / 2), int(center_y - h / 2)
                    boxes.append([x, y, int(w), int(h)])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
                    
        indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
        if len(indexes) > 0:
            for i in indexes.flatten():
                label = str(self.label_classes[class_ids[i]])
                detected_objects.append((label, confidences[i]))
                x, y, w, h = boxes[i]
                color = self.colors[class_ids[i]]
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, label, (x, y - 5), cv2.FONT_HERSHEY_PLAIN, 1, color, 1)

        return detected_objects

if __name__ == "__main__":
    # Initialize with less sensitive defaults and tuning mode OFF by default now
    proctoring_suite = ProctoringSuite(
        gaze_violation_threshold_sec=20, # More time allowed for looking at corners
        tuning_mode=False 
    )
    
    proctoring_suite.start_proctoring_session()