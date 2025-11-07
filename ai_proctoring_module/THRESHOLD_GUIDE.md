# AI Proctoring Module - Threshold Configuration Guide

## 🎯 Detector Thresholds and Configuration

This guide shows you exactly where to edit thresholds for each detection module to fine-tune sensitivity.

## 📍 Threshold Locations

### 1. **Blink Detection** (`proctoring_suite.py` line ~166, `proctoring_lite.py` line ~95)

```python
# Blink threshold - higher values = less sensitive
if l_ratio >= 3.6 or r_ratio >= 3.6:  # ← EDIT THIS VALUE
    return (l_ratio, r_ratio, "Blink")
```

**How to adjust:**
- **Increase** (e.g., `4.0`) = Less sensitive, fewer blinks detected
- **Decrease** (e.g., `3.0`) = More sensitive, more blinks detected

### 2. **Eye Gaze Detection** (`proctoring_suite.py` line ~245)

```python
trial_ratio = 1.2  # ← EDIT THIS VALUE

# Gaze direction logic
if right_side_of_right_eye >= trial_ratio * left_side_of_right_eye:
    result = 'Looking Left'
elif left_side_of_left_eye >= trial_ratio * right_side_of_left_eye:
    result = 'Looking Right'
```

**How to adjust:**
- **Increase** (e.g., `1.5`) = Less sensitive, requires more eye movement
- **Decrease** (e.g., `1.1`) = More sensitive, detects smaller eye movements

### 3. **Head Pose Detection** (`proctoring_suite.py` line ~420, `proctoring_lite.py` line ~135)

```python
# Head pose angle thresholds
if ang1 >= 45:  # ← EDIT THIS VALUE (Head Up/Down)
    return "Head Up - LOOKING AWAY"
elif ang1 <= -45:  # ← EDIT THIS VALUE (Head Up/Down)
    return "Head Down - LOOKING AWAY"

# For left/right detection (proctoring_lite.py)
if angle > 30:  # ← EDIT THIS VALUE
    return "HEAD_DOWN"
elif angle < -30:  # ← EDIT THIS VALUE
    return "HEAD_UP"
```

**How to adjust:**
- **Increase** (e.g., `60`) = Less sensitive, allows more head movement
- **Decrease** (e.g., `30`) = More sensitive, detects smaller head movements

### 4. **Object Detection** (`proctoring_suite.py` line ~350)

```python
# Object detection confidence threshold
if confidence > 0.5:  # ← EDIT THIS VALUE
    # Object detected
```

```python
# Non-Maximum Suppression thresholds
indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
#                                               ↑     ↑
#                                    confidence_threshold  nms_threshold
```

**How to adjust:**
- **confidence > 0.5**: Higher = fewer false positives, Lower = more detections
- **NMS threshold 0.5**: Confidence threshold for final detection
- **NMS threshold 0.4**: Overlap threshold for duplicate removal

### 5. **Audio Detection** (`proctoring_suite.py` line ~14)

```python
# Audio threshold in constructor
audio_threshold=2000  # ← EDIT THIS VALUE

# In audio detection loop
if np.max(np.abs(audio_data)) > self.audio_threshold:
    print("🔊 Suspicious audio detected!")
```

**How to adjust:**
- **Increase** (e.g., `3000`) = Less sensitive, ignores quieter sounds
- **Decrease** (e.g., `1500`) = More sensitive, detects quieter sounds

### 6. **Face Detection Violations** (`proctoring_suite.py` line ~32)

```python
def faceCount_detection(faceCount):
    if faceCount > 1:  # ← Multiple faces threshold (usually keep at 1)
        remark = "Multiple faces detected - VIOLATION"
    elif faceCount == 0:  # ← No face threshold (usually keep at 0)
        remark = "No face detected - VIOLATION"
```

## 🛠️ How to Edit Thresholds

### Method 1: Direct File Editing
1. Open the relevant file (`proctoring_suite.py` or `proctoring_lite.py`)
2. Find the threshold using the line numbers above
3. Change the value
4. Save the file

### Method 2: Constructor Parameters (Recommended)
Add threshold parameters to the class constructor:

```python
class ProctoringSuite:
    def __init__(self, 
                 # ... existing parameters ...
                 blink_threshold=3.6,
                 gaze_sensitivity=1.2,
                 head_pose_threshold=45,
                 object_confidence=0.5,
                 audio_threshold=2000):
        
        # Store thresholds
        self.blink_threshold = blink_threshold
        self.gaze_sensitivity = gaze_sensitivity
        self.head_pose_threshold = head_pose_threshold
        self.object_confidence = object_confidence
        # ... etc
```

Then use `self.blink_threshold` instead of hardcoded values.

### Method 3: Configuration File
Create a `config.json` file:

```json
{
    "blink_threshold": 3.6,
    "gaze_sensitivity": 1.2,
    "head_pose_threshold": 45,
    "object_confidence": 0.5,
    "audio_threshold": 2000
}
```

Load in the constructor:
```python
import json

with open('config.json', 'r') as f:
    config = json.load(f)
    self.blink_threshold = config['blink_threshold']
```

## 📊 Recommended Threshold Ranges

| Detector | Current | Sensitive | Normal | Less Sensitive |
|----------|---------|-----------|--------|----------------|
| Blink | 3.6 | 3.0-3.3 | 3.6-4.0 | 4.0-4.5 |
| Gaze | 1.2 | 1.1-1.15 | 1.2-1.3 | 1.4-1.6 |
| Head Pose | 45° | 30°-40° | 45°-50° | 60°-75° |
| Object Confidence | 0.5 | 0.3-0.4 | 0.5-0.6 | 0.7-0.8 |
| Audio | 2000 | 1000-1500 | 2000-2500 | 3000-4000 |

## 🎯 Quick Threshold Modifications

### Make Detection Less Strict (Fewer Violations)
```python
# In proctoring_suite.py or proctoring_lite.py

# Blink detection - line ~166
if l_ratio >= 4.2 or r_ratio >= 4.2:  # Was 3.6

# Gaze detection - line ~245  
trial_ratio = 1.5  # Was 1.2

# Head pose - line ~420
if ang1 >= 60:  # Was 45
elif ang1 <= -60:  # Was -45

# Object detection - line ~350
if confidence > 0.7:  # Was 0.5

# Audio threshold - constructor
audio_threshold=3000  # Was 2000
```

### Make Detection More Strict (More Violations)
```python
# Blink detection
if l_ratio >= 3.0 or r_ratio >= 3.0:  # Was 3.6

# Gaze detection
trial_ratio = 1.1  # Was 1.2

# Head pose
if ang1 >= 30:  # Was 45
elif ang1 <= -30:  # Was -45

# Object detection
if confidence > 0.3:  # Was 0.5

# Audio threshold
audio_threshold=1500  # Was 2000
```

## 🔧 Testing Your Changes

After modifying thresholds, test with:

```bash
python test_module.py
```

Or run a quick test session:

```bash
python main.py
# Choose option 2 (ProctoringLite) for quick testing
```

## 💡 Tips for Threshold Tuning

1. **Start with small changes** (±0.1 to ±0.3)
2. **Test in your actual environment** (lighting, camera quality affect detection)
3. **Consider user comfort** vs security requirements
4. **Document your changes** for future reference
5. **Test with multiple people** if possible

## 🚨 Important Notes

- **Lower thresholds** = More sensitive = More violations detected
- **Higher thresholds** = Less sensitive = Fewer violations detected
- **Audio threshold** depends heavily on microphone sensitivity and environment noise
- **Object detection** confidence depends on YOLO model accuracy
- **Head pose** angles are in degrees from center position
