import React from "react";
import Image from "next/image";
import classNames from "classnames";
import styles from "./styles.module.css";

interface CapsuleProps {
  items: Array<{
    label: string;
    value: string;
    leftImage?: string;
    rightImage?: string;
  }>;
  activeValue?: string;
  onItemClick?: (value: string) => void;
  className?: string;
  custom_item_container?: string;
  onClickRightImage?: () => void;
}

const Capsule: React.FC<CapsuleProps> = ({
  items,
  activeValue,
  onItemClick,
  className = "",
  custom_item_container = "",
  onClickRightImage,
}) => {
  return (
    <div className={classNames(styles.capsule_container, className)}>
      {items.map((item) => (
        <div
          key={item.value}
          onClick={() => onItemClick && onItemClick(item.value)}
          className={classNames(
            styles.capsule_item,
            activeValue === item.value ? styles.capsule_item_active : "",
            custom_item_container
          )}
        >
          {item.leftImage && (
            <Image
              src={item.leftImage}
              alt={`${item.label} left icon`}
              width={16}
              height={16}
              className={classNames(styles.capsule_item_left_image)}
            />
          )}
          <p
            className={`${styles.capsule_item_text} ${
              activeValue === item.value ? styles.capsule_item_text_active : ""
            }`}
          >
            {item.label}
          </p>
          {item.rightImage && (
            <Image
              onClick={() => onClickRightImage && onClickRightImage()}
              src={item.rightImage}
              alt={`${item.label} right icon`}
              width={16}
              height={16}
              className={styles.capsule_item_right_image}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Capsule;
