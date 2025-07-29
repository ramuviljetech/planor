import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "./styles.module.css";
import {
  closeBlackIcon,
  fileIcon,
  galleryIcon,
  pdfIcon,
  uploadBlackIcon,
} from "@/resources/images";

interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
}

interface FileUploadProps {
  allowedTypes?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  allowDuplicates?: boolean;
  uploadedFiles?: FileItem[];
  onFilesAdded?: (files: FileItem[]) => void;
  onFileRemoved?: (fileId: string) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadComplete?: (fileId: string) => void;
  onUploadError?: (fileId: string, error: string) => void;
  supportedText?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  allowedTypes = ["image/*", "application/pdf", ".ifc", ".rvt"],
  maxSize = 50,
  maxFiles = 10,
  allowDuplicates = false,
  uploadedFiles = [],
  onFilesAdded,
  onFileRemoved,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  supportedText = "Supported files are IFC / Images / PDFs up to Max 50 MB",
  className = "",
}) => {
  const [files, setFiles] = useState<FileItem[]>(uploadedFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal files state with uploadedFiles prop
  useEffect(() => {
    // Ensure files that are already completed (100% progress) maintain their status
    const updatedFiles = uploadedFiles.map((file) => ({
      ...file,
      status: file.progress === 100 ? "completed" : file.status || "uploading",
    }));
    setFiles(updatedFiles);
  }, [uploadedFiles]);

  const generateFileId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return (
          <img
            src={pdfIcon.src}
            alt="pdf-icon"
            className={styles.fileUpload_icon}
          />
        );
      case "ifc":
      case "rvt":
        return (
          <img
            src={fileIcon.src}
            alt="ifc-icon"
            className={styles.fileUpload_icon}
          />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "svg":
        return (
          <img
            src={galleryIcon.src}
            alt="image-icon"
            className={styles.fileUpload_icon}
          />
        );
      default:
        return (
          <img
            src={fileIcon.src}
            alt="file-icon"
            className={styles.fileUpload_icon}
          />
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize} MB limit`;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isAllowed = allowedTypes.some((type) => {
      if (type.startsWith(".")) {
        return type === fileExtension;
      }
      if (type.includes("/")) {
        return file.type.startsWith(type.split("/")[0]);
      }
      return false;
    });

    if (!isAllowed) {
      return "File type not supported";
    }

    // Check duplicates
    if (!allowDuplicates) {
      const isDuplicate = files.some(
        (existingFile) =>
          existingFile.file.name === file.name &&
          existingFile.file.size === file.size
      );
      if (isDuplicate) {
        return "File already exists";
      }
    }

    return null;
  };

  const simulateUpload = (fileItem: FileItem) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, progress: 100, status: "completed" }
              : f
          )
        );
        onUploadComplete?.(fileItem.id);
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, progress: Math.round(progress) } : f
          )
        );
        onUploadProgress?.(fileItem.id, Math.round(progress));
      }
    }, 100);
  };

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newFiles: FileItem[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        if (files.length + newFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          return;
        }

        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
          return;
        }

        const fileItem: FileItem = {
          id: generateFileId(),
          file,
          progress: 0,
          status: "uploading",
        };

        newFiles.push(fileItem);
      });

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        onFilesAdded?.(newFiles);

        // Simulate upload for each file
        newFiles.forEach((fileItem) => {
          simulateUpload(fileItem);
        });
      }

      if (errors.length > 0) {
        console.error("File upload errors:", errors);
      }
    },
    [files, maxFiles, allowDuplicates, onFilesAdded]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    onFileRemoved?.(fileId);
  };

  const acceptedTypes = allowedTypes.join(",");

  return (
    <div className={`${styles.fileUpload_mainContainer} ${className}`}>
      <div
        className={`${styles.fileUpload_dropZone} ${
          isDragOver ? styles.fileUpload_dropZone__dragOver : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleChooseFile}
      >
        <div className={styles.fileUpload_cloudIcon}>
          <img src={uploadBlackIcon.src} alt="uploadBlackIcon" />
        </div>
        <div className={styles.fileUpload_text}>
          <p className={styles.fileUpload_mainText}>
            Choose a file or drag & drop it here
          </p>
          <p className={styles.fileUpload_supportText}>{supportedText}</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className={styles.fileUpload_hiddenInput}
      />

      {files.length > 0 && (
        <div className={styles.fileUpload_fileList}>
          {files.map((fileItem) => (
            <div key={fileItem.id} className={styles.fileUpload_fileItem}>
              <div className={styles.fileUpload_fileIcon}>
                {getFileIcon(fileItem.file.name)}
              </div>
              <div className={styles.fileUpload_fileDetails}>
                <div className={styles.fileUpload_fileName}>
                  {fileItem.file.name}
                </div>
                <div className={styles.fileUpload_fileProgress}>
                  <span className={styles.fileUpload_progressText}>
                    {fileItem.progress}% complete •{" "}
                    {formatFileSize(fileItem.file.size)}
                  </span>

                  {/* //TODO : IF NEED ADD PROGRESS PERCENTAGE ALSO */}
                  {/* <div className={styles.fileUpload_progressBar}>
                    <div
                      className={styles.fileUpload_progressFill}
                      style={{ width: `${fileItem.progress}%` }}
                    />
                  </div> */}
                </div>
              </div>
              <div
                className={styles.fileUpload_removeButton}
                onClick={() => handleRemoveFile(fileItem.id)}
                aria-label="Remove file"
              >
                <img src={closeBlackIcon.src} alt="close-black-icon" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
