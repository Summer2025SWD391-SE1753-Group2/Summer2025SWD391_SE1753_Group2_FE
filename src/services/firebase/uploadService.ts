import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../../firebase";

export interface UploadProgress {
  progress: number;
  status: "uploading" | "completed" | "error";
}

export interface UploadResult {
  url: string;
  fileName: string;
}

/**
 * Upload single file to Firebase Storage
 */
export const uploadFile = async (
  file: File,
  path: string = "posts",
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Tạo tên file unique
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fullPath = `${path}/${fileName}`;

    const storageRef = ref(storage, fullPath);

    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress({
              progress,
              status: "uploading",
            });
          },
          (error) => {
            onProgress({
              progress: 0,
              status: "error",
            });
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              onProgress({
                progress: 100,
                status: "completed",
              });
              resolve({
                url: downloadURL,
                fileName,
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        url: downloadURL,
        fileName,
      };
    }
  } catch (error) {
    console.error("Firebase upload error:", error);
    throw error;
  }
};

export const uploadMultipleFiles = async (
  files: File[],
  path: string = "posts",
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file, index) =>
    uploadFile(
      file,
      path,
      onProgress ? (progress) => onProgress(index, progress) : undefined
    )
  );

  return Promise.all(uploadPromises);
};

export const validateFile = (
  file: File,
  maxSizeMB: number = 10
): { isValid: boolean; error?: string } => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Chỉ hỗ trợ file ảnh (JPEG, PNG, WebP)",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File không được vượt quá ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
};
