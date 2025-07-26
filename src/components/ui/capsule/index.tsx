import React from "react";
import styles from "./styles.module.css";

interface CapsuleProps {
  items: Array<{
    label: string;
    value: string;
  }>;
  activeValue: string;
  onItemClick: (value: string) => void;
  className?: string;
}

const Capsule: React.FC<CapsuleProps> = ({
  items,
  activeValue,
  onItemClick,
  className = "",
}) => {
  return (
    <div className={`${styles.capsule_container} ${className}`}>
      {items.map((item) => (
        <div
          key={item.value}
          onClick={() => onItemClick(item.value)}
          className={`${styles.capsule_item} ${
            activeValue === item.value ? styles.capsule_item_active : ""
          }`}
        >
          <p
            className={`${styles.capsule_item_text} ${
              activeValue === item.value ? styles.capsule_item_text_active : ""
            }`}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Capsule;
