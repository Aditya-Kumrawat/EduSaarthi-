# AI Proctoring Suite - Setup Guide

## Overview
This unified proctoring module combines all detection features from the original AI-based Online Exam Proctoring System into a single, easy-to-use class.

## Features
- 🎯 **Face Detection** using Dlib
- 👁️ **Eye Gaze Detection** 
- 👀 **Blink Detection**
- 🎭 **Head Pose Estimation**
- 👄 **Mouth Tracking** (Speaking Detection)
- 📦 **Object Detection** using YOLO
- 🎤 **Audio Detection**
- 📝 **Activity Logging**

## Installation

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Download Required Models

#### Dlib Shape Predictor Model
```bash
# Create directory
mkdir -p shape_predictor_model

# Download the shape predictor model (68 face landmarks)
# You can download from: http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2
# Extract and place in shape_predictor_model/
```

#### YOLO Model Files
```bash
# Create directories
mkdir -p object_detection_model/weights
mkdir -p object_detection_model/config
mkdir -p object_detection_model/objectLabels

# Download YOLO files:
# 1. yolov3-tiny.weights -> object_detection_model/weights/
# 2. yolov3-tiny.cfg -> object_detection_model/config/
# 3. coco.names -> object_detection_model/objectLabels/
```

### 3. Verify Installation
Run the test script to verify everything is working:
```bash
python proctoring_suite.py
```

## Quick Start

### Basic Usage
```python
from proctoring_suite import ProctoringSuite

# Initialize the suite
proctoring = ProctoringSuite()

# Start a complete proctoring session
proctoring.start_proctoring_session()
```

### Custom Configuration
```python
from proctoring_suite import ProctoringSuite

# Initialize with custom paths and settings
proctoring = ProctoringSuite(
    shape_predictor_path='path/to/shape_predictor_68_face_landmarks.dat',
    yolo_weights_path='path/to/yolov3-tiny.weights',
    yolo_config_path='path/to/yolov3-tiny.cfg',
    coco_names_path='path/to/coco.names',
    audio_threshold=3000,  # Higher threshold for audio detection
    beep_frequency=2000,   # Custom beep frequency
    beep_duration=500      # Custom beep duration
)

# Start session with custom log file
proctoring.start_proctoring_session(
    save_activity_log=True,
    log_filename='my_exam_log.txt'
)
```

### Process Single Frame
```python
import cv2
from proctoring_suite import ProctoringSuite

# Initialize
proctoring = ProctoringSuite()

# Setup camera
proctoring.setup_camera(0)  # Use camera index 0

# Read frame
ret, frame = proctoring.cam.read()

if ret:
    # Process single frame
    results = proctoring.process_frame(frame)
    
    print("Detection Results:")
    print(f"Face Detection: {results['face_detection']}")
    print(f"Violations: {results['violations']}")
```

## API Reference

### ProctoringSuite Class

#### Constructor
```python
ProctoringSuite(
    shape_predictor_path='shape_predictor_model/shape_predictor_68_face_landmarks.dat',
    yolo_weights_path='object_detection_model/weights/yolov3-tiny.weights',
    yolo_config_path='object_detection_model/config/yolov3-tiny.cfg',
    coco_names_path='object_detection_model/objectLabels/coco.names',
    audio_threshold=2000,
    beep_frequency=2500,
    beep_duration=1000
)
```

#### Main Methods

**start_proctoring_session(save_activity_log=True, log_filename='proctoring_activity.txt')**
- Starts a complete proctoring session with all features enabled
- Press 'q' to quit the session

**process_frame(frame)**
- Process a single frame with all detection modules
- Returns dictionary with all detection results

**setup_camera(camera_index=0)**
- Initialize camera for video capture
- Returns True if successful

**start_audio_monitoring()**
- Start audio monitoring in background thread

**stop_audio_monitoring()**
- Stop audio monitoring

#### Individual Detection Methods

**detect_face(frame)**
- Returns: (face_count, faces, remark)

**detect_blinks(faces, frame)**
- Returns: (left_ratio, right_ratio, blink_status)

**detect_gaze(faces, frame)**
- Returns: gaze_direction ('left', 'right', 'center')

**detect_mouth_opening(faces, frame)**
- Returns: mouth_status ('Mouth Open', 'Mouth Close')

**detect_objects(frame)**
- Returns: list of (object_name, confidence) tuples

**detect_head_pose(faces, frame)**
- Returns: head_pose_direction

## Output Format

The `process_frame()` method returns a dictionary with the following structure:

```python
{
    'timestamp': '14:30:25.123456',
    'face_detection': {
        'count': 1,
        'remark': 'Face detection normal'
    },
    'blink_detection': {
        'left_ratio': 4.2,
        'right_ratio': 4.1,
        'status': 'No Blink'
    },
    'gaze_detection': 'Looking Center',
    'mouth_detection': 'Mouth Close',
    'object_detection': [('cell phone', 0.85), ('book', 0.72)],
    'head_pose': 'Head Position Normal',
    'violations': ['Suspicious objects detected: [cell phone, book]']
}
```

## Activity Log Format

The activity log is saved as a text file with detailed information about each frame processed, including:
- Timestamp
- All detection results
- Violations flagged
- Summary statistics

## Troubleshooting

### Common Issues

1. **Camera not working**
   - Check camera permissions
   - Try different camera index (0, 1, 2, etc.)

2. **Model files not found**
   - Verify model files are in correct directories
   - Check file paths in constructor

3. **Audio detection not working**
   - Install PyAudio properly
   - Check microphone permissions
   - Adjust audio_threshold parameter

4. **Dlib installation issues**
   - Install cmake first: `pip install cmake`
   - On Windows: Install Visual Studio Build Tools
   - Alternative: Use conda: `conda install -c conda-forge dlib`

### Performance Tips

1. **Reduce processing load**
   - Process every nth frame instead of all frames
   - Reduce YOLO input resolution
   - Disable unused detection modules

2. **Improve accuracy**
   - Ensure good lighting conditions
   - Use high-quality webcam
   - Adjust detection thresholds

## License
Extracted and unified from the original AI-based Online Exam Proctoring System project.

## Support
For issues and questions, refer to the original project documentation or create an issue in the repository.
