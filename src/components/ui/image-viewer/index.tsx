"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  MouseEvent,
  KeyboardEvent,
} from "react";
import {
  closeBlackIcon,
  leftRotateWhiteIcon,
  palmWhiteIcon,
  rightRotateWhiteIcon,
  zoomInWhiteIcon,
  zoomOutWhiteIcon,
} from "@/resources/images";
import Button from "@/components/ui/button";
import styles from "./styles.module.css";

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose?: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface ControlButton {
  type: "rotateRight" | "rotateLeft" | "zoomIn" | "zoomOut" | "handTool";
  icon: { src: string };
  label: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onClose }) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState<Position>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleRotateLeft = () => setRotation((prev) => prev - 90);
  const handleRotateRight = () => setRotation((prev) => prev + 90);

  const handleZoomToggle = () => {
    if (isZoomed) {
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
    } else {
      setZoomLevel(2);
    }
    setIsZoomed(!isZoomed);
  };

  const resetImageState = () => {
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsLoading(true);
  };

  const handleImageLoad = () => setIsLoading(false);

  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (isZoomed) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent<Document>) => {
    if (isDragging && isZoomed) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setIsZoomed(false);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<Document>) => {
      switch (e.key) {
        case "Escape":
          onClose && onClose();
          break;
        case " ":
          e.preventDefault();
          handleZoomToggle();
          break;
      }
    },
    [onClose, isZoomed]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown as any);
    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown as any);
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleKeyDown, isDragging, dragStart, isZoomed]);

  const leftControls: ControlButton[] = [
    { type: "rotateRight", icon: rightRotateWhiteIcon, label: "Rotate right" },
    { type: "rotateLeft", icon: leftRotateWhiteIcon, label: "Rotate left" },
    { type: "zoomIn", icon: zoomInWhiteIcon, label: "Zoom in" },
    { type: "zoomOut", icon: zoomOutWhiteIcon, label: "Zoom out" },
    { type: "handTool", icon: palmWhiteIcon, label: "Hand tool" },
  ];

  const handleControlAction = (type: ControlButton["type"]) => {
    switch (type) {
      case "rotateRight":
        handleRotateRight();
        break;
      case "rotateLeft":
        handleRotateLeft();
        break;
      case "zoomIn":
        handleZoomIn();
        break;
      case "zoomOut":
        handleZoomOut();
        break;
      case "handTool":
        handleZoomToggle();
        break;
    }
  };

  const renderImage = () => {
    return (
      <div className={styles.imageViewer_imageContainer}>
        {isLoading && (
          <div className={styles.imageViewer_loader}>
            <div className={styles.imageViewer_spinner}></div>
          </div>
        )}

        <img
          src={src}
          alt={alt}
          className={`${styles.imageViewer_mainImage} ${
            isZoomed ? styles.imageViewer_zoomed : ""
          }`}
          style={{
            transform: `scale(${zoomLevel}) translate(${
              imagePosition.x / zoomLevel
            }px, ${imagePosition.y / zoomLevel}px) rotate(${rotation}deg)`,
            cursor: isZoomed ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            display: isLoading ? "none" : "block",
          }}
          onLoad={handleImageLoad}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            e.stopPropagation();
            if (!isZoomed) {
              handleZoomToggle();
            }
          }}
          draggable={false}
        />
      </div>
    );
  };

  const renderLeftControllers = () => {
    return (
      <div className={styles.imageViewer_leftControlBar}>
        {leftControls.map((btn, index) => (
          <div
            key={index}
            className={`${styles.imageViewer_controlButton} ${
              btn.type === "handTool" && isZoomed
                ? styles.imageViewer_active
                : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleControlAction(btn.type);
            }}
            aria-label={
              btn.type === "handTool" && isZoomed
                ? "Hand tool active"
                : btn.label
            }
          >
            <img src={btn.icon.src} />
          </div>
        ))}
      </div>
    );
  };

  const renderRightControllers = () => {
    return (
      <div className={styles.imageViewer_rightControlBar}>
        <Button
          className={styles.imageViewer_rightControllerBtn}
          title="This building"
          icon={zoomInWhiteIcon}
          onClick={(e) => {
            e.stopPropagation();
            // handleZoomIn();
          }}
        />
        <Button
          className={styles.imageViewer_rightControllerBtn}
          title="All buildings"
          icon={zoomOutWhiteIcon}
          onClick={(e) => {
            e.stopPropagation();
            // handleZoomOut();
          }}
        />
      </div>
    );
  };

  return (
    <div onClick={onClose} className={styles.imageViewer_overlay}>
      <div className={styles.imageViewer_mainContainer}>
        {renderImage()}
        <div className={styles.imageViewer_controlBar}>
          {renderLeftControllers()}
          {renderRightControllers()}
        </div>
      </div>
    </div>
  );
};

export { ImageViewer };
