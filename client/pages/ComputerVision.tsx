import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Camera,
  Upload,
  Zap,
  Brain,
  Image as ImageIcon,
  Activity,
  Target,
} from "lucide-react";

export default function ComputerVision() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [selectedModel, setSelectedModel] = useState("image-classification");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [results, setResults] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const fileInputRef = useRef(null);

  // Sample predictions for recommendations
  const samplePredictions = {
    "image-classification": [
      {
        label: "Golden Retriever",
        confidence: 0.94,
        description: "High confidence detection of a Golden Retriever breed",
      },
      {
        label: "Dog",
        confidence: 0.92,
        description: "General canine classification",
      },
      {
        label: "Domestic Animal",
        confidence: 0.88,
        description: "Categorized as household pet",
      },
    ],
    "object-detection": [
      {
        label: "Person",
        confidence: 0.96,
        description: "Human figure detected in image",
        bbox: [120, 80, 200, 300],
      },
      {
        label: "Car",
        confidence: 0.89,
        description: "Vehicle identified in background",
        bbox: [300, 150, 500, 280],
      },
      {
        label: "Building",
        confidence: 0.75,
        description: "Architectural structure visible",
        bbox: [50, 20, 400, 250],
      },
    ],
  };

  // ML Models configuration
  const mlModels = [
    {
      id: "image-classification",
      name: "Image Classification",
      icon: ImageIcon,
      description: "Classify objects and scenes in images",
      accuracy: 94.2,
      type: "Computer Vision",
      status: "active",
      color: "#8b5cf6",
    },
    {
      id: "object-detection",
      name: "Object Detection",
      icon: Target,
      description: "Detect and locate objects in images",
      accuracy: 89.7,
      type: "Computer Vision",
      status: "active",
      color: "#06b6d4",
    },
  ];

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        processImage();
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const processImage = useCallback(() => {
    setIsProcessing(true);
    setConfidence(0);
    setResults(null);

    // Simulate ML processing with progress
    const interval = setInterval(() => {
      setConfidence((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setResults(samplePredictions[selectedModel] || []);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  }, [selectedModel]);

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      {/* Main Content */}
      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dashboard-title">
                Computer Vision & ML
              </h1>
              <p className="text-gray-600 mt-1 dashboard-text">
                Advanced machine learning models for image and video analysis
              </p>
            </div>
          </div>
        </motion.header>

        {/* Available Models Section */}
        <motion.div
          className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/30 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Available Models
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mlModels.map((model, index) => (
              <motion.div
                key={model.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedModel === model.id
                    ? "border-purple-300 bg-purple-50"
                    : "border-white/50 bg-white/30 hover:bg-white/50"
                }`}
                onClick={() => setSelectedModel(model.id)}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${model.color}20` }}
                  >
                    <model.icon
                      style={{ color: model.color }}
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {model.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {model.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {model.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          model.status === "active"
                            ? "bg-green-100 text-green-600"
                            : model.status === "training"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {model.status}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: model.color }}
                      >
                        {model.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Upload & Processing Area */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Upload Area */}
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/30">
              <div className="flex items-center gap-3 mb-6">
                <Camera className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Image Processing
                </h3>
              </div>

              {/* Upload Zone */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload Image for Analysis
                    </h4>
                    <p className="text-gray-600">
                      Drag and drop an image or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports JPG, PNG, WEBP up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Selected Model Info */}
              <div className="mt-6 p-4 bg-white/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-gray-900">
                      Selected Model:
                    </h5>
                    <p className="text-gray-600">
                      {mlModels.find((m) => m.id === selectedModel)?.name}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={!uploadedImage || isProcessing}
                    onClick={processImage}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Processing
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" /> Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Area */}
            {(uploadedImage || isProcessing || results) && (
              <motion.div
                className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Analysis Results
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Preview */}
                  {uploadedImage && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700">
                        Input Image
                      </h4>
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full h-48 object-cover"
                        />
                        {isProcessing && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
                              <p>Processing...</p>
                              <div className="w-32 mx-auto mt-2 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-white h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${confidence}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {results && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700">
                        Recommendations & Predictions
                      </h4>
                      <div className="space-y-3">
                        {results.map((result, index) => (
                          <motion.div
                            key={index}
                            className="p-4 bg-white/60 rounded-lg border border-white/30"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800">
                                {result.label}
                              </span>
                              <span className="text-sm font-bold text-purple-600">
                                {(result.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {result.description}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${result.confidence * 100}%` }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
