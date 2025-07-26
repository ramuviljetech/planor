"use client";

import React, { useState, useCallback, useEffect } from "react";
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

const ImageViewer = ({ src, alt, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

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

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleMouseDown = (e) => {
    if (isZoomed) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && isZoomed) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
    (e) => {
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
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleKeyDown, isDragging, dragStart, isZoomed]);

  const leftControls = [
    {
      type: "rotateRight",
      icon: rightRotateWhiteIcon,
      label: "Rotate right",
    },
    { type: "rotateLeft", icon: leftRotateWhiteIcon, label: "Rotate left" },
    { type: "zoomIn", icon: zoomInWhiteIcon, label: "Zoom in" },
    { type: "zoomOut", icon: zoomOutWhiteIcon, label: "Zoom out" },
    { type: "handTool", icon: palmWhiteIcon, label: "Hand tool" },
  ];

  // Function to handle actions based on button type
  const handleControlAction = (type) => {
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
      default:
        break;
    }
  };

  return (
    <div className={styles.imageViewer_overlay}>
      <div className={styles.imageViewer_mainContainer}>
        {/* Main Image Container */}
        <div className={styles.imageViewer_imageContainer}>
          {isLoading && (
            <div className={styles.imageViewer_loader}>
              <div className={styles.imageViewer_spinner}></div>
            </div>
          )}

          {/* Close Button */}
          {/* {onClose && (
            <div
              className={styles.imageViewer_closeButton}
              onClick={onClose}
              aria-label="Close viewer"
            >
              <img src={closeBlackIcon.src} />
            </div>
          )} */}

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
            onClick={!isZoomed ? handleZoomToggle : undefined}
            draggable={false}
          />
        </div>

        {/* Control Bar */}
        <div className={styles.imageViewer_controlBar}>
          <div className={styles.imageViewer_leftControlBar}>
            {leftControls.map((btn, index) => (
              <div
                key={index}
                className={`${styles.imageViewer_controlButton} ${
                  btn.type === "handTool" && isZoomed
                    ? styles.imageViewer_active
                    : ""
                }`}
                onClick={() => handleControlAction(btn.type)}
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
          <div className={styles.imageViewer_rightControlBar}>
            <Button
              className={styles.imageViewer_rightControllerBtn}
              title="This building"
              icon={zoomInWhiteIcon}
            />
            <Button
              className={styles.imageViewer_rightControllerBtn}
              title="All buildings"
              icon={zoomOutWhiteIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ImageViewer };
