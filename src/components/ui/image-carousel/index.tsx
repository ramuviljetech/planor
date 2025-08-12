import React, { useState, useEffect } from "react";
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
  initialIndex?: number;
}

const THUMBNAIL_VISIBLE_COUNT = 10;

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSliding, setIsSliding] = useState(false);

  // Update current image when initialIndex changes
  useEffect(() => {
    setCurrentImageIndex(initialIndex);
  }, [initialIndex]);

  // Adjust visible thumbnails if active image goes out of view
  useEffect(() => {
    if (
      currentImageIndex < thumbnailStartIndex ||
      currentImageIndex >= thumbnailStartIndex + THUMBNAIL_VISIBLE_COUNT
    ) {
      const newStart = Math.max(
        0,
        Math.min(
          currentImageIndex - Math.floor(THUMBNAIL_VISIBLE_COUNT / 2),
          images.length - THUMBNAIL_VISIBLE_COUNT
        )
      );
      setThumbnailStartIndex(newStart);
    }
  }, [currentImageIndex]);

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

  const handleThumbnailNext = () => {
    const maxStartIndex = images.length - THUMBNAIL_VISIBLE_COUNT;
    setThumbnailStartIndex((prev) =>
      Math.min(prev + 1, Math.max(0, maxStartIndex))
    );
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.2, 1));
  };

  if (!isOpen) return null;

  const renderMainImage = () => (
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

  const renderThumbNailImages = () => {
    const visibleThumbnails = images.slice(
      thumbnailStartIndex,
      thumbnailStartIndex + THUMBNAIL_VISIBLE_COUNT
    );

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
          {visibleThumbnails.map((image, i) => {
            const actualIndex = thumbnailStartIndex + i;
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
        {/* 
        {thumbnailStartIndex + THUMBNAIL_VISIBLE_COUNT < images.length && (
          <div
            className={`${styles.imageCarousel_thumbnailNavButton} ${styles["imageCarousel_thumbnailNavButton--next"]}`}
            onClick={handleThumbnailNext}
          >
            ›
          </div>
        )} */}
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
