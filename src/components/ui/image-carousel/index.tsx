import React, { useState } from "react";
import {
  closeRoseIcon,
  rightArrowPinkIcon,
  zoomInPinkIcon,
  zoomOutPinkIcon,
} from "@/resources/images";
import styles from "./styles.module.css";

interface ImageType {
  src: string;
  alt?: string;
}

interface ImageCarouselProps {
  images: ImageType[];
  isOpen: boolean;
  onClose: () => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  isOpen,
  onClose,
}) => {
  // STATES
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSliding, setIsSliding] = useState(false);

  // FUNCTIONS :  to handle sliding and zoom in and out functionalities
  const handlePrevious = () => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
      setZoomLevel(1);
      setIsSliding(false);
    }, 150);
  };

  const handleNext = () => {
    if (isSliding) return;
    setIsSliding(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
      setZoomLevel(1);
      setIsSliding(false);
    }, 150);
  };

  const handleThumbnailClick = (index: number) => {
    if (isSliding || index === currentImageIndex) return;
    setIsSliding(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setZoomLevel(1);
      setIsSliding(false);
    }, 150);
  };

  const handleThumbnailPrev = () => {
    setThumbnailStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const newZoom = prev * 1.2;
      return newZoom > 3 ? 3 : newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = prev / 1.2;
      return newZoom < 1 ? 1 : newZoom;
    });
  };

  if (!isOpen) return null;

  // RENDERS
  const renderMainImage = () => {
    return (
      <div className={styles.imageCarousel_imageContainer}>
        <div className={styles.imageCarousel_closeButton} onClick={onClose}>
          <img src={closeRoseIcon.src} alt="Close" />
        </div>
        <div
          className={`${styles.imageCarousel_navButton} ${styles["imageCarousel_navButton--prev"]}`}
          onClick={handlePrevious}
        >
          <img
            src={rightArrowPinkIcon.src}
            alt="Previous"
            className={styles.imageCarousel_prevArrowIcon}
          />
        </div>
        <div
          className={`${styles.imageCarousel_mainImageWrapper} ${
            isSliding ? styles.imageCarousel_sliding : ""
          }`}
        >
          <img
            src={images[currentImageIndex].src}
            alt={
              images[currentImageIndex].alt || `Image ${currentImageIndex + 1}`
            }
            className={styles.imageCarousel_mainImage}
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>
        <div
          className={`${styles.imageCarousel_navButton} ${styles["imageCarousel_navButton--next"]}`}
          onClick={handleNext}
        >
          <img src={rightArrowPinkIcon.src} alt="Next" />
        </div>
        <div className={styles.imageCarousel_controlButtons}>
          <div
            className={styles.imageCarousel_controlButton}
            onClick={handleZoomIn}
          >
            <img src={zoomInPinkIcon.src} alt="Zoom In" />
          </div>
          <div
            className={styles.imageCarousel_controlButton}
            onClick={handleZoomOut}
          >
            <img src={zoomOutPinkIcon.src} alt="Zoom Out" />
          </div>
        </div>
      </div>
    );
  };

  const renderThumbNailImages = () => {
    return (
      <div className={styles.imageCarousel_thumbnailContainer}>
        {thumbnailStartIndex > 0 && (
          <div
            className={`${styles.imageCarousel_thumbnailNavButton} ${styles["imageCarousel_thumbnailNavButton--prev"]}`}
            onClick={handleThumbnailPrev}
          >
            ‹
          </div>
        )}

        <div className={styles.imageCarousel_thumbnailStrip}>
          {images?.map((image, index) => {
            const actualIndex = thumbnailStartIndex + index;
            return (
              <div
                key={actualIndex}
                className={`${styles.imageCarousel_thumbnail} ${
                  actualIndex === currentImageIndex
                    ? styles["imageCarousel_thumbnail--active"]
                    : ""
                }`}
                onClick={() => handleThumbnailClick(actualIndex)}
              >
                <img
                  src={image?.src}
                  alt={image?.alt || `Thumbnail ${actualIndex + 1}`}
                  className={styles.imageCarousel_thumbnailImage}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.imageCarousel_overlay}>
      <div className={styles.imageCarousel_mainContainer}>
        {renderMainImage()}
        {renderThumbNailImages()}
      </div>
    </div>
  );
};

export { ImageCarousel };
