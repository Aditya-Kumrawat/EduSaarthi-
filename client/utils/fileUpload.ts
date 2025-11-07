// File upload utility with Google Drive integration via Make.com webhook

const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/jku6pwlpbfh349x2jq1mnds2qebx4ruu";

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadFileToGoogleDrive = async (
  file: File,
  fileName?: string
): Promise<FileUploadResponse> => {
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName || file.name);
    formData.append('makePublic', 'true'); // Make file public as requested
    
    // Add metadata
    formData.append('uploadedAt', new Date().toISOString());
    formData.append('fileSize', file.size.toString());
    formData.append('fileType', file.type);

    // Send to Make.com webhook
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      url: result.url || result.fileUrl || result.publicUrl,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

export const uploadMultipleFiles = async (
  files: File[]
): Promise<FileUploadResponse[]> => {
  const uploadPromises = files.map(file => uploadFileToGoogleDrive(file));
  return Promise.all(uploadPromises);
};

// Utility to validate file before upload
export const validateFile = (
  file: File,
  maxSizeMB: number = 100,
  allowedTypes?: string[]
): { valid: boolean; error?: string } => {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type if specified
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
};
