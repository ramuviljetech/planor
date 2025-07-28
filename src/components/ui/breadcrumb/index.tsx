import React from "react";
import styles from "./styles.module.css";
import { leftArrowBlackIcon } from "@/resources/images";
import Image from "next/image";

export interface BreadcrumbItem {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showBackArrow?: boolean;
  onBackClick?: () => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  showBackArrow = false,
  onBackClick,
}) => {
  return (
    <div className={`${styles.breadcrumb_container} ${className || ""}`}>
      {showBackArrow && (
        <Image
          src={leftArrowBlackIcon}
          alt="left-arrow"
          className={styles.back_arrow}
          onClick={onBackClick}
        />
      )}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <p
            className={`${styles.breadcrumb_item} ${
              item.isActive ? styles.active : styles.inactive
            }`}
            onClick={item.onClick}
          >
            {item.label}
          </p>
          {index < items.length - 1 && (
            <p className={styles.breadcrumb_separator}>/</p>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
