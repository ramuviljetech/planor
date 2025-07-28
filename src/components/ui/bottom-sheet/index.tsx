import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import { backButtonIcon, closeRoseIcon } from "@/resources/images";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  backButton?: boolean;
  onBackButton?: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  onBackButton,
  children,
  icon,
  title,
  backButton,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsClosing(false);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // 300ms delay to match the animation duration
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.bottomSheet_overlay} ${
        isClosing ? styles.bottomSheet_overlay_closing : ""
      }`}
      onClick={handleClose}
    >
      <div
        className={`${styles.bottomSheet} ${
          isClosing ? styles.bottomSheet_closing : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.bottomSheet_header}>
          {/* <div className={styles.handle} /> */}
          <div
            onClick={onBackButton}
            className={styles.bottomSheet_header_left}
          >
            {backButton && (
              <Image src={backButtonIcon} alt="back" width={24} height={24} />
            )}
            {title && <p className={styles.bottomSheet_title}>{title}</p>}
          </div>
          <div className={styles.bottomSheet_closeButton} onClick={handleClose}>
            <Image
              src={icon || closeRoseIcon}
              alt="close"
              width={24}
              height={24}
            />
          </div>
        </div>
        <div className={styles.bottomSheet_content}>{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
