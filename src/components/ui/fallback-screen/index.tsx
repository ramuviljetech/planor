import React from "react";
import Image from "next/image";
import classNames from "classnames";
import styles from "./styles.module.css";

interface FallbackScreenProps {
  image?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  imageClassName?: string;
  loaderClassName?: string;
}

const FallbackScreen: React.FC<FallbackScreenProps> = ({
  image,
  imageAlt = "Loading",
  title = "Loading...",
  subtitle,
  className = "",
  imageClassName = "",
  loaderClassName = "",
}) => {
  return (
    <div className={classNames(styles.fallbackScreen, className)}>
      <div className={styles.content}>
        {/* {image && (
          <div className={classNames(styles.imageContainer, imageClassName)}>
            <Image
              src={image}
              alt={imageAlt}
              width={120}
              height={120}
              className={styles.image}
            />
          </div>
        )} */}

        <div className={classNames(styles.loader, loaderClassName)}>
          <div className={styles.spinner}></div>
        </div>

        {title && <h2 className={styles.title}>{title}</h2>}

        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default FallbackScreen;
