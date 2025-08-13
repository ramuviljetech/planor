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
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const handleRotateLeft = () => setRotation((prev) => prev - 90);
  const handleRotateRight = () => setRotation((prev) => prev + 90);

  // Reset image state when rotation changes to prevent UI issues
  useEffect(() => {
    if (rotation !== 0) {
      setImagePosition({ x: 0, y: 0 });
      if (isZoomed) {
        setZoomLevel(1);
        setIsZoomed(false);
      }
    }
  }, [rotation, isZoomed]);

  const handleZoomToggle = () => {
    if (isZoomed) {
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setIsZoomed(false);
    } else {
      setZoomLevel(2);
      setIsZoomed(true);
    }
  };

  const resetImageState = () => {
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsLoading(true);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setIsLoading(false);
  };

  // Calculate container dimensions based on rotation
  const getContainerDimensions = () => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) {
      // Default dimensions while loading
      return { width: 400, height: 300 };
    }

    const isVertical = rotation % 180 === 90 || rotation % 180 === 270;
    const maxWidth = 800;
    const maxHeight = 600;

    if (isVertical) {
      // When rotated 90° or 270°, swap width and height
      const aspectRatio = imageDimensions.width / imageDimensions.height;
      let width = Math.min(maxHeight, imageDimensions.height);
      let height = width / aspectRatio;

      if (height > maxWidth) {
        height = maxWidth;
        width = height * aspectRatio;
      }

      return { width: Math.round(width), height: Math.round(height) };
    } else {
      // When rotated 0° or 180°, use normal dimensions
      const aspectRatio = imageDimensions.width / imageDimensions.height;
      let width = Math.min(maxWidth, imageDimensions.width);
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      return { width: Math.round(width), height: Math.round(height) };
    }
  };

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
    const newZoom = Math.min(zoomLevel + 0.5, 3);
    setZoomLevel(newZoom);
    if (newZoom > 1) {
      setIsZoomed(true);
    }
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
          // Spacebar toggles between normal view and zoomed view
          if (isZoomed) {
            setZoomLevel(1);
            setImagePosition({ x: 0, y: 0 });
            setIsZoomed(false);
          } else {
            setZoomLevel(2);
            setIsZoomed(true);
          }
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleRotateLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleRotateRight();
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
        // Hand tool toggles between pan mode and normal mode
        if (isZoomed) {
          // If zoomed, reset to normal view
          setZoomLevel(1);
          setImagePosition({ x: 0, y: 0 });
          setIsZoomed(false);
        } else {
          // If not zoomed, zoom in to enable panning
          setZoomLevel(2);
          setIsZoomed(true);
        }
        break;
    }
  };

  const renderImage = () => {
    const containerDims = getContainerDimensions();

    return (
      <div
        className={styles.imageViewer_imageContainer}
        style={{
          width: containerDims.width,
          height: containerDims.height,
          maxWidth: containerDims.width,
          maxHeight: containerDims.height,
        }}
      >
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
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            width: "auto",
            height: "auto",
          }}
          onLoad={handleImageLoad}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            e.stopPropagation();
            if (!isZoomed) {
              // Click to zoom in
              handleZoomIn();
            } else {
              // Click to zoom out when already zoomed
              handleZoomOut();
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
                : btn.type === "zoomIn" && zoomLevel > 1
                ? styles.imageViewer_active
                : btn.type === "zoomOut" && zoomLevel < 1.5
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
            title={`${btn.label}${
              btn.type === "zoomIn" || btn.type === "zoomOut"
                ? ` (${Math.round(zoomLevel * 100)}%)`
                : ""
            }`}
          >
            <img src={btn.icon.src} />
          </div>
        ))}
        {/* Zoom level indicator */}
        {/* {zoomLevel > 1 && (
          <div className={styles.imageViewer_zoomIndicator}>
            {Math.round(zoomLevel * 100)}%
          </div>
        )} */}
        {/* Help tooltip */}
        {/* <div
          className={styles.imageViewer_helpTooltip}
          title="Keyboard shortcuts: Space = Toggle zoom, +/- = Zoom in/out, Arrow keys = Rotate, Esc = Close"
        >
          ?
        </div> */}
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
