# AI Proctoring Module Documentation

The AI Proctoring Module is a comprehensive computer vision and audio processing system designed to monitor online examinations and detect potential violations in real-time.

## Overview

The proctoring system combines multiple detection algorithms to ensure exam integrity:

- **Face Detection & Recognition**: Verify student identity
- **Eye Gaze Tracking**: Monitor attention and focus
- **Head Pose Estimation**: Detect suspicious head movements
- **Object Detection**: Identify unauthorized items
- **Audio Monitoring**: Detect suspicious sounds
- **Behavior Analysis**: Track patterns and anomalies

## Architecture

```
ai_proctoring_module/
├── proctoring_suite.py      # Full-featured proctoring class
├── proctoring_lite.py       # Lightweight version
├── example_usage.py         # Usage examples
├── download_models.py       # Model download utility
├── requirements.txt         # Python dependencies
├── SETUP_GUIDE.md          # Detailed setup instructions
├── object_detection_model/  # YOLO model files
│   ├── config/
│   ├── objectLabels/
│   └── weights/
└── shape_predictor_model/   # Dlib face landmark model
    └── shape_predictor_68_face_landmarks.dat
```

## Features

### ProctoringSuite (Full Version)

The complete proctoring solution with all detection capabilities:

```python
from ai_proctoring_module import ProctoringSuite

# Initialize proctoring system
proctoring = ProctoringSuite(
    enable_face_detection=True,
    enable_object_detection=True,
    enable_audio_detection=True,
    violation_threshold=0.7
)

# Start proctoring session
proctoring.start_proctoring_session()
```

#### Capabilities:
- ✅ Face Detection using Dlib
- ✅ Eye Gaze Detection
- ✅ Blink Detection
- ✅ Head Pose Estimation
- ✅ Mouth Tracking (Speaking Detection)
- ✅ Object Detection using YOLO
- ✅ Audio Detection
- ✅ Activity Logging
- ✅ Real-time Violation Alerts

### ProctoringLite (Lightweight Version)

A streamlined version for basic monitoring:

```python
from ai_proctoring_module import ProctoringLite

# Initialize lite version
proctoring_lite = ProctoringLite()

# Start basic monitoring
proctoring_lite.start_monitoring()
```

#### Capabilities:
- ✅ Face Detection
- ✅ Blink Detection
- ✅ Head Pose Estimation
- ✅ Mouth Tracking
- ✅ Basic Violation Detection

## Installation & Setup

### Prerequisites

```bash
# Python 3.8 or higher
python --version

# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install python3-dev python3-pip
sudo apt-get install libopencv-dev python3-opencv
sudo apt-get install cmake build-essential
```

### Python Dependencies

```bash
# Install required packages
pip install -r requirements.txt
```

Required packages:
- `opencv-python>=4.5.0`
- `dlib>=19.22.0`
- `numpy>=1.21.0`
- `scipy>=1.7.0`
- `imutils>=0.5.4`
- `playsound>=1.2.2`
- `threading`

### Model Setup

1. **Download Dlib Face Landmark Model**:
```bash
python download_models.py --model face_landmarks
```

2. **Download YOLO Object Detection Model**:
```bash
python download_models.py --model yolo
```

3. **Verify Installation**:
```bash
python example_usage.py --test-installation
```

## Usage Examples

### Basic Proctoring Session

```python
from ai_proctoring_module import ProctoringSuite
import cv2

def basic_proctoring_example():
    # Initialize proctoring system
    proctoring = ProctoringSuite(
        enable_face_detection=True,
        enable_object_detection=True,
        enable_audio_detection=False,  # Disable for this example
        violation_threshold=0.6
    )
    
    # Configure violation callbacks
    def on_violation_detected(violation_type, severity, frame):
        print(f"Violation detected: {violation_type} (Severity: {severity})")
        # Log to database, send alert, etc.
    
    proctoring.set_violation_callback(on_violation_detected)
    
    # Start proctoring
    proctoring.start_proctoring_session()
    
    # Run for specified duration or until stopped
    try:
        while True:
            # Process frame
            frame = proctoring.get_current_frame()
            if frame is not None:
                cv2.imshow("Proctoring Feed", frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        proctoring.stop_proctoring_session()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    basic_proctoring_example()
```

### Custom Configuration

```python
from ai_proctoring_module import ProctoringSuite

# Advanced configuration
config = {
    'face_detection': {
        'enabled': True,
        'confidence_threshold': 0.8,
        'max_faces': 1
    },
    'eye_tracking': {
        'enabled': True,
        'gaze_threshold': 30,  # degrees
        'blink_threshold': 0.25
    },
    'head_pose': {
        'enabled': True,
        'yaw_threshold': 45,   # degrees
        'pitch_threshold': 30,
        'roll_threshold': 20
    },
    'object_detection': {
        'enabled': True,
        'confidence_threshold': 0.5,
        'prohibited_objects': ['cell phone', 'book', 'laptop']
    },
    'audio_detection': {
        'enabled': True,
        'volume_threshold': 0.3,
        'duration_threshold': 2.0  # seconds
    }
}

proctoring = ProctoringSuite(config=config)
```

### Frame-by-Frame Processing

```python
import cv2
from ai_proctoring_module import ProctoringLite

def frame_processing_example():
    proctoring = ProctoringLite()
    cap = cv2.VideoCapture(0)  # Use webcam
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Process single frame
        results = proctoring.process_frame(frame)
        
        # Check for violations
        if results['violations']:
            for violation in results['violations']:
                print(f"Violation: {violation['type']} - {violation['description']}")
        
        # Annotate frame
        annotated_frame = proctoring.annotate_frame(frame, results)
        cv2.imshow("Proctoring", annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
```

## Detection Algorithms

### Face Detection

Uses Dlib's HOG-based face detector with 68-point facial landmarks:

```python
def detect_face(self, frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = self.face_detector(gray)
    
    for face in faces:
        landmarks = self.landmark_predictor(gray, face)
        # Process facial features
        return self.process_facial_landmarks(landmarks)
```

### Eye Gaze Tracking

Estimates gaze direction using eye landmarks:

```python
def estimate_gaze_direction(self, landmarks):
    left_eye = self.extract_eye_region(landmarks, "left")
    right_eye = self.extract_eye_region(landmarks, "right")
    
    # Calculate gaze vector
    gaze_vector = self.calculate_gaze_vector(left_eye, right_eye)
    return gaze_vector
```

### Head Pose Estimation

Uses PnP algorithm to estimate 3D head orientation:

```python
def estimate_head_pose(self, landmarks):
    # 3D model points
    model_points = np.array([
        (0.0, 0.0, 0.0),           # Nose tip
        (0.0, -330.0, -65.0),      # Chin
        (-225.0, 170.0, -135.0),   # Left eye corner
        (225.0, 170.0, -135.0),    # Right eye corner
        (-150.0, -150.0, -125.0),  # Left mouth corner
        (150.0, -150.0, -125.0)    # Right mouth corner
    ])
    
    # Solve PnP
    success, rotation_vector, translation_vector = cv2.solvePnP(
        model_points, image_points, camera_matrix, dist_coeffs
    )
    
    return rotation_vector, translation_vector
```

### Object Detection

Uses YOLO v4 for real-time object detection:

```python
def detect_objects(self, frame):
    blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
    self.yolo_net.setInput(blob)
    outputs = self.yolo_net.forward(self.output_layers)
    
    # Process detections
    boxes, confidences, class_ids = self.process_yolo_outputs(outputs)
    
    # Apply NMS
    indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
    
    return self.filter_prohibited_objects(boxes, confidences, class_ids, indices)
```

## Violation Detection

### Violation Types

1. **No Face Detected**: Student not visible in frame
2. **Multiple Faces**: More than one person detected
3. **Looking Away**: Gaze direction outside acceptable range
4. **Head Movement**: Excessive head pose changes
5. **Prohibited Objects**: Unauthorized items detected
6. **Audio Violations**: Suspicious sounds detected
7. **Mouth Movement**: Extended speaking detected

### Severity Levels

- **Low (0.0-0.3)**: Minor infractions, warnings
- **Medium (0.3-0.7)**: Moderate violations, alerts
- **High (0.7-1.0)**: Serious violations, immediate action

### Violation Handling

```python
class ViolationHandler:
    def __init__(self):
        self.violation_log = []
        self.alert_callbacks = []
    
    def process_violation(self, violation_type, severity, timestamp, frame):
        violation = {
            'type': violation_type,
            'severity': severity,
            'timestamp': timestamp,
            'frame_id': self.get_frame_id(frame)
        }
        
        self.violation_log.append(violation)
        
        # Trigger alerts based on severity
        if severity >= 0.7:
            self.trigger_immediate_alert(violation)
        elif severity >= 0.3:
            self.trigger_warning(violation)
        
        # Call registered callbacks
        for callback in self.alert_callbacks:
            callback(violation)
```

## Integration with Web Application

### WebSocket Communication

```python
import socketio

class ProctoringWebSocket:
    def __init__(self, server_url):
        self.sio = socketio.Client()
        self.setup_events()
    
    def setup_events(self):
        @self.sio.event
        def connect():
            print("Connected to proctoring server")
        
        @self.sio.event
        def start_proctoring(data):
            test_id = data['test_id']
            user_id = data['user_id']
            self.start_session(test_id, user_id)
    
    def send_violation(self, violation_data):
        self.sio.emit('proctoring_violation', violation_data)
```

### REST API Integration

```python
import requests

class ProctoringAPI:
    def __init__(self, api_base_url, api_key):
        self.base_url = api_base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def submit_session_data(self, session_id, violations, summary):
        endpoint = f"{self.base_url}/proctoring/sessions/{session_id}"
        data = {
            'violations': violations,
            'summary': summary,
            'timestamp': time.time()
        }
        
        response = requests.post(endpoint, headers=self.headers, json=data)
        return response.json()
```

## Performance Optimization

### Multi-threading

```python
import threading
from queue import Queue

class ThreadedProctoring:
    def __init__(self):
        self.frame_queue = Queue(maxsize=10)
        self.result_queue = Queue()
        self.processing_thread = None
        self.running = False
    
    def start_processing(self):
        self.running = True
        self.processing_thread = threading.Thread(target=self._process_frames)
        self.processing_thread.start()
    
    def _process_frames(self):
        while self.running:
            if not self.frame_queue.empty():
                frame = self.frame_queue.get()
                result = self.process_single_frame(frame)
                self.result_queue.put(result)
```

### GPU Acceleration

```python
# Enable GPU acceleration for OpenCV DNN
net = cv2.dnn.readNetFromDarknet(config_path, weights_path)
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)
```

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   ```python
   # Check camera permissions
   cap = cv2.VideoCapture(0)
   if not cap.isOpened():
       print("Error: Cannot access camera")
   ```

2. **Model Files Missing**
   ```bash
   # Re-download models
   python download_models.py --force
   ```

3. **Performance Issues**
   ```python
   # Reduce frame size for better performance
   frame = cv2.resize(frame, (640, 480))
   ```

### Debug Mode

```python
proctoring = ProctoringSuite(debug=True, log_level='DEBUG')
```

## Testing

### Unit Tests

```bash
# Run all tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_face_detection.py
```

### Performance Benchmarks

```bash
# Benchmark detection algorithms
python benchmark.py --algorithm face_detection --iterations 100
```

## Configuration Reference

### Complete Configuration Schema

```python
DEFAULT_CONFIG = {
    'camera': {
        'device_id': 0,
        'width': 640,
        'height': 480,
        'fps': 30
    },
    'face_detection': {
        'enabled': True,
        'model_path': 'shape_predictor_68_face_landmarks.dat',
        'confidence_threshold': 0.8,
        'max_faces': 1
    },
    'eye_tracking': {
        'enabled': True,
        'gaze_threshold': 30,
        'blink_threshold': 0.25,
        'blink_duration_threshold': 0.5
    },
    'head_pose': {
        'enabled': True,
        'yaw_threshold': 45,
        'pitch_threshold': 30,
        'roll_threshold': 20
    },
    'object_detection': {
        'enabled': True,
        'model_path': 'object_detection_model/',
        'confidence_threshold': 0.5,
        'nms_threshold': 0.4,
        'prohibited_objects': [
            'cell phone', 'book', 'laptop', 'tablet',
            'paper', 'pen', 'pencil', 'calculator'
        ]
    },
    'audio_detection': {
        'enabled': True,
        'volume_threshold': 0.3,
        'duration_threshold': 2.0,
        'sample_rate': 44100
    },
    'logging': {
        'enabled': True,
        'log_level': 'INFO',
        'log_file': 'proctoring.log'
    }
}
```

---

For additional support and advanced configuration options, refer to the [Setup Guide](./SETUP_GUIDE.md) and [API Reference](./api-reference.md).
