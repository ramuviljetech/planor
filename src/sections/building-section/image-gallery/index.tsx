import React from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import styles from "./styles.module.css";

interface ImageItem {
  src: string | StaticImageData;
  alt: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onImageClick?: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImageClick,
}) => {
  const imageCount = images.length;

  if (imageCount === 0) {
    return null;
  }

  if (imageCount === 1) {
    return (
      <div className={styles.building_details_images_section}>
        <div className={styles.gallery_single}>
          <div className={styles.singleImage} onClick={() => onImageClick?.(0)}>
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              objectFit="cover"
            />
          </div>
        </div>
      </div>
    );
  }

  if (imageCount === 2) {
    return (
      <div className={styles.building_details_images_section}>
        <div className={styles.gallery_two}>
          <div
            className={styles.twoImageLeft}
            onClick={() => onImageClick?.(0)}
          >
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              objectFit="cover"
            />
          </div>
          <div
            className={styles.twoImageRight}
            onClick={() => onImageClick?.(1)}
          >
            <Image
              src={images[1].src}
              alt={images[1].alt}
              fill
              objectFit="cover"
            />
          </div>
        </div>
      </div>
    );
  }

  if (imageCount === 3) {
    return (
      <div className={styles.building_details_images_section}>
        <div className={styles.gallery_three}>
          <div
            className={styles.threeImageLeft}
            onClick={() => onImageClick?.(0)}
          >
            <Image
              src={images[0].src}
              alt={images[0].alt}
              fill
              objectFit="cover"
            />
          </div>
          <div className={styles.threeImageRight}>
            <div
              className={styles.threeImageTop}
              onClick={() => onImageClick?.(1)}
            >
              <Image
                src={images[1].src}
                alt={images[1].alt}
                fill
                objectFit="cover"
              />
            </div>
            <div
              className={styles.threeImageBottom}
              onClick={() => onImageClick?.(2)}
            >
              <Image
                src={images[2].src}
                alt={images[2].alt}
                fill
                objectFit="cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For 4 or more images, use the original layout with overlay
  return (
    <div className={styles.building_details_images_section}>
      <div className={styles.gallery}>
        <div className={styles.mainImage} onClick={() => onImageClick?.(0)}>
          <Image
            src={images[0].src}
            alt={images[0].alt}
            fill
            objectFit="cover"
          />
        </div>
        <div className={styles.sideImages}>
          <div className={styles.topImage} onClick={() => onImageClick?.(1)}>
            <Image
              src={images[1].src}
              alt={images[1].alt}
              fill
              objectFit="cover"
            />
          </div>
          <div className={styles.bottomImages}>
            <div
              className={styles.bottomLeft}
              onClick={() => onImageClick?.(2)}
            >
              <Image
                src={images[2].src}
                alt={images[2].alt}
                fill
                objectFit="cover"
              />
            </div>
            <div
              onClick={() => onImageClick?.(3)}
              className={styles.bottomRight}
            >
              <Image
                src={images[3]?.src || images[0].src}
                alt="More"
                fill
                objectFit="cover"
              />
              <div className={styles.overlay}>
                <span>{imageCount > 4 ? `${imageCount - 3}+` : "1"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
