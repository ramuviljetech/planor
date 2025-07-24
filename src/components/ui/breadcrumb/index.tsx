import React from "react";
import styles from "./styles.module.css";

export interface BreadcrumbItem {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <div className={`${styles.breadcrumb_container} ${className || ""}`}>
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
