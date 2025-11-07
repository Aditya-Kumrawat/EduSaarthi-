# AI Proctoring Module

A unified, portable proctoring suite extracted from the AI-based Online Exam Proctoring System. This module combines all detection features into easy-to-use classes that can be integrated into any project.

## Features

### Full Suite (ProctoringSuite)
- 🎯 Face Detection using Dlib
- 👁️ Eye Gaze Detection  
- 👀 Blink Detection
- 🎭 Head Pose Estimation
- 👄 Mouth Tracking (Speaking Detection)
- 📦 Object Detection using YOLO
- 🎤 Audio Detection
- 📝 Activity Logging

### Lite Version (ProctoringLite)
- 🎯 Face Detection
- 👀 Blink Detection
- 🎭 Head Pose Estimation
- 👄 Mouth Tracking
- 📝 Basic Violation Detection

## Quick Start

```python
from ai_proctoring_module import ProctoringSuite

# Initialize and start proctoring
proctoring = ProctoringSuite()
proctoring.start_proctoring_session()
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Download model files (see SETUP_GUIDE.md for details)

3. Run example:
```bash
python example_usage.py
```

## Files Structure

- `proctoring_suite.py` - Full-featured proctoring class
- `proctoring_lite.py` - Lightweight version
- `example_usage.py` - Usage examples
- `requirements.txt` - Dependencies
- `SETUP_GUIDE.md` - Detailed setup instructions
- `shape_predictor_model/` - Dlib face landmark model
- `object_detection_model/` - YOLO model files

## Usage Examples

See `example_usage.py` for comprehensive examples including:
- Basic proctoring session
- Custom configuration
- Frame-by-frame processing
- Individual detection methods
- Violation monitoring

## License

Extracted and unified from the original AI-based Online Exam Proctoring System project.
