# AI Proctoring Module - System Architecture

## Simplified Architecture Diagram

```mermaid
graph TB
    %% Main Entry Point
    Main[main.py<br/>CLI Interface] --> Suite[ProctoringSuite]
    Main --> Lite[ProctoringLite]
    
    %% Core Detection Modules
    subgraph "Detection Engine"
        Face[Face Detection]
        Blink[Blink Detection]
        Gaze[Gaze Tracking]
        HeadPose[Head Pose]
        Objects[Object Detection]
        Audio[Audio Monitoring]
    end
    
    %% AI Models
    subgraph "AI Models"
        DlibModel[Dlib Face Model]
        YOLOModel[YOLO Object Model]
    end
    
    %% Processing Flow
    Camera[Camera Input] --> FrameProcessor[Frame Processor]
    FrameProcessor --> Face
    FrameProcessor --> Blink
    FrameProcessor --> Gaze
    FrameProcessor --> HeadPose
    FrameProcessor --> Objects
    FrameProcessor --> Audio
    
    %% Model Dependencies
    Face --> DlibModel
    Blink --> DlibModel
    Gaze --> DlibModel
    HeadPose --> DlibModel
    Objects --> YOLOModel
    
    %% Core Classes
    Suite --> Face
    Suite --> Blink
    Suite --> Gaze
    Suite --> HeadPose
    Suite --> Objects
    Suite --> Audio
    
    Lite --> Face
    Lite --> Blink
    Lite --> HeadPose
    
    %% Output
    Face --> ViolationDetector[Violation Engine]
    Blink --> ViolationDetector
    Gaze --> ViolationDetector
    HeadPose --> ViolationDetector
    Objects --> ViolationDetector
    Audio --> ViolationDetector
    
    ViolationDetector --> Output[Alerts & Logs]
    
    %% Styling
    classDef core fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef detection fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef model fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef process fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    
    class Suite,Lite core
    class Face,Blink,Gaze,HeadPose,Objects,Audio detection
    class DlibModel,YOLOModel model
    class Camera,FrameProcessor,ViolationDetector,Output process
```

## Component Details

### Core Classes
- **ProctoringSuite**: Full-featured proctoring with all detection modules
- **ProctoringLite**: Lightweight version with essential features only

### Detection Modules
- **Face Detection**: Uses Dlib for face detection and landmark extraction
- **Blink Detection**: Eye aspect ratio calculation for blink detection
- **Gaze Detection**: Pupil tracking and gaze direction analysis
- **Head Pose Estimation**: 3D head orientation using PnP algorithm
- **Mouth Tracking**: Mouth opening detection for speaking analysis
- **Object Detection**: YOLO-based suspicious object detection
- **Audio Detection**: Real-time audio amplitude monitoring

### External Dependencies
- **OpenCV**: Primary computer vision library
- **Dlib**: Face detection and facial landmark prediction
- **NumPy**: Numerical computations and array operations
- **PyAudio**: Audio input/output processing
- **YOLO Models**: Pre-trained object detection weights and configuration

### Data Flow
1. Camera captures video frames
2. Frame processor coordinates all detection modules
3. Each module performs specific analysis
4. Violation detector applies rules and thresholds
5. Results logged and displayed in real-time

### Key Features
- Modular architecture with pluggable detection components
- Real-time processing with configurable thresholds
- Comprehensive logging and violation tracking
- Both full-featured and lightweight implementations
- Automated model downloading and setup
