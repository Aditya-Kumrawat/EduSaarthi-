"""
Model Download Script
====================

This script downloads the required model files for the AI Proctoring Module.
"""

import os
import urllib.request
import bz2
import shutil
from pathlib import Path

def download_file(url, filename, description):
    """Download a file with progress indication"""
    print(f"📥 Downloading {description}...")
    try:
        urllib.request.urlretrieve(url, filename)
        print(f"✅ Downloaded: {filename}")
        return True
    except Exception as e:
        print(f"❌ Failed to download {description}: {e}")
        return False

def extract_bz2(bz2_file, output_file):
    """Extract bz2 compressed file"""
    print(f"📦 Extracting {bz2_file}...")
    try:
        with bz2.BZ2File(bz2_file, 'rb') as source:
            with open(output_file, 'wb') as target:
                shutil.copyfileobj(source, target)
        os.remove(bz2_file)  # Remove compressed file
        print(f"✅ Extracted: {output_file}")
        return True
    except Exception as e:
        print(f"❌ Failed to extract {bz2_file}: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    dirs = [
        'shape_predictor_model',
        'object_detection_model/weights',
        'object_detection_model/config',
        'object_detection_model/objectLabels'
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {dir_path}")

def download_dlib_model():
    """Download dlib shape predictor model"""
    url = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
    bz2_file = "shape_predictor_model/shape_predictor_68_face_landmarks.dat.bz2"
    dat_file = "shape_predictor_model/shape_predictor_68_face_landmarks.dat"
    
    if os.path.exists(dat_file):
        print(f"✅ Dlib model already exists: {dat_file}")
        return True
    
    if download_file(url, bz2_file, "Dlib 68-point face landmark predictor"):
        return extract_bz2(bz2_file, dat_file)
    return False

def download_yolo_files():
    """Download YOLO model files"""
    files_to_download = [
        {
            'url': 'https://github.com/pjreddie/darknet/blob/master/cfg/yolov3-tiny.cfg?raw=true',
            'path': 'object_detection_model/config/yolov3-tiny.cfg',
            'description': 'YOLO Tiny Config'
        },
        {
            'url': 'https://pjreddie.com/media/files/yolov3-tiny.weights',
            'path': 'object_detection_model/weights/yolov3-tiny.weights',
            'description': 'YOLO Tiny Weights'
        },
        {
            'url': 'https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names',
            'path': 'object_detection_model/objectLabels/coco.names',
            'description': 'COCO Class Names'
        }
    ]
    
    success_count = 0
    for file_info in files_to_download:
        if os.path.exists(file_info['path']):
            print(f"✅ File already exists: {file_info['path']}")
            success_count += 1
        elif download_file(file_info['url'], file_info['path'], file_info['description']):
            success_count += 1
    
    return success_count == len(files_to_download)

def verify_installation():
    """Verify all required files are present"""
    required_files = [
        'shape_predictor_model/shape_predictor_68_face_landmarks.dat',
        'object_detection_model/config/yolov3-tiny.cfg',
        'object_detection_model/weights/yolov3-tiny.weights',
        'object_detection_model/objectLabels/coco.names'
    ]
    
    print("\n🔍 Verifying installation...")
    all_present = True
    
    for file_path in required_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {file_path} ({size:,} bytes)")
        else:
            print(f"❌ Missing: {file_path}")
            all_present = False
    
    return all_present

def main():
    """Main download function"""
    print("AI Proctoring Module - Model Download Script")
    print("=" * 45)
    
    # Create directories
    create_directories()
    
    # Download models
    print("\n📥 Downloading required model files...")
    
    dlib_success = download_dlib_model()
    yolo_success = download_yolo_files()
    
    # Verify installation
    if verify_installation():
        print("\n🎉 All model files downloaded successfully!")
        print("You can now use the AI Proctoring Module.")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run example: python example_usage.py")
    else:
        print("\n⚠️  Some files are missing. Please check the errors above.")
        print("You may need to download them manually.")

if __name__ == "__main__":
    main()
