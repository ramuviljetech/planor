import Image from "next/image";
import React, { useState, useRef, useCallback } from "react";
import styles from "./styles.module.css";
import {
  closeRoseIcon,
  uploadBlackIcon,
  imageRoseIcon,
  i3DGrayIcon,
} from "@/resources/images";
import Input from "../input";

interface UploadFileProps {
  onFileSelect?: (files: File[]) => void;
  multiple?: boolean;
}

interface FileWithProgress {
  file: File;
  progress: number;
  id: string;
}

const UploadFile: React.FC<UploadFileProps> = ({
  onFileSelect,
  multiple = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file types
  const supportedTypes = {
    ifc: "application/octet-stream",
    "image/jpeg": "image/jpeg",
    "image/png": "image/png",
    "image/gif": "image/gif",
    "image/webp": "image/webp",
    "application/pdf": "application/pdf",
  };

  // File size limit (50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

  const getFileTypeIcon = (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const fileType = file.type;

    if (fileExtension === "ifc" || fileType === "application/octet-stream") {
      return i3DGrayIcon; // 3D icon for IFC files
    } else if (fileType.startsWith("image/")) {
      return imageRoseIcon; // Image icon for image files
    } else if (fileType === "application/pdf") {
      return uploadBlackIcon; // Default upload icon for PDF (you can add a specific PDF icon)
    }

    return uploadBlackIcon; // Default icon
  };

  const getFileTypeName = (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const fileType = file.type;

    if (fileExtension === "ifc" || fileType === "application/octet-stream") {
      return "IFC";
    } else if (fileType.startsWith("image/")) {
      return "Image";
    } else if (fileType === "application/pdf") {
      return "PDF";
    }

    return "File";
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: `File size exceeds 50MB limit` };
    }

    // Check file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const isValidType = Object.keys(supportedTypes).some((type) => {
      if (type === "ifc") {
        return fileExtension === "ifc";
      }
      return file.type === type;
    });

    if (!isValidType) {
      return {
        isValid: false,
        error: `File type not supported. Supported types: IFC, Images (JPEG, PNG, GIF, WebP), PDF`,
      };
    }

    return { isValid: true };
  };

  const simulateUploadProgress = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15; // Random progress increment
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }

      setSelectedFiles((prev) =>
        prev.map((fileWithProgress) =>
          fileWithProgress.id === fileId
            ? { ...fileWithProgress, progress: Math.min(progress, 100) }
            : fileWithProgress
        )
      );
    }, 200); // Update every 200ms
  };

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (errors.length > 0) {
        alert(`Some files were rejected:\n${errors.join("\n")}`);
      }

      if (validFiles.length > 0) {
        const newFilesWithProgress: FileWithProgress[] = validFiles.map(
          (file) => ({
            file,
            progress: 0,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
          })
        );

        setSelectedFiles((prev) =>
          multiple ? [...prev, ...newFilesWithProgress] : newFilesWithProgress
        );
        onFileSelect?.(validFiles);

        // Start upload simulation for new files
        newFilesWithProgress.forEach((fileWithProgress) => {
          simulateUploadProgress(fileWithProgress.id);
        });
      }
    },
    [multiple, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) =>
      prev.filter((fileWithProgress) => fileWithProgress.id !== fileId)
    );
  }, []);

  return (
    <div className={styles.upload_wrapper}>
      <div
        className={`${styles.upload_file_container} ${
          isDragOver ? styles.drag_over : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ position: "relative" }}
      >
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept=".ifc,.jpg,.jpeg,.png,.gif,.webp,.pdf"
          onChange={handleFileInputChange}
          className={styles.hidden_input}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            zIndex: 1,
          }}
        />

        <Image
          src={uploadBlackIcon}
          alt="upload-file"
          className={styles.upload_file_icon}
        />
        <div className={styles.upload_data_desc}>
          <p className={styles.choose_file_text}>
            Choose a file or drag & drop it here
          </p>
          <p className={styles.supported_formats_text}>
            Supported files are IFC / Images / PDFs up to Max 50 MB
          </p>
        </div>
      </div>

      {/* Selected files display */}
      {selectedFiles.length > 0 && (
        <div className={styles.selected_files}>
          {selectedFiles.map((fileWithProgress) => (
            <div
              key={fileWithProgress.id}
              className={styles.selected_file_item}
            >
              <div className={styles.selected_files_left}>
                <Image
                  src={getFileTypeIcon(fileWithProgress.file)}
                  alt="upload-file"
                  className={styles.selected_file_icon}
                />
                <div>
                  <p className={styles.selected_file_name}>
                    {fileWithProgress.file.name}
                  </p>
                  <p className={styles.upload_percentage_and_size}>
                    {fileWithProgress.progress}% complete •{" "}
                    <span>
                      {(fileWithProgress.file.size / (1024 * 1024)).toFixed(2)}{" "}
                      MB
                    </span>
                  </p>
                </div>
              </div>
              <Image
                src={closeRoseIcon}
                alt="close"
                width={20}
                height={20}
                onClick={() => removeFile(fileWithProgress.id)}
                style={{ cursor: "pointer" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadFile;
