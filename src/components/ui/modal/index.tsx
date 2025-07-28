import React, { ReactNode } from "react";
import classNames from "classnames";
import Portal from "@/components/ui/portal";
import styles from "./styles.module.css";

interface ModalProps {
  show: boolean;
  onClose?: () => void;
  closeOnOutSideClick?: boolean;
  handleClickOutSide?: () => void;
  children: ReactNode;
  showOverlay?: boolean;
  overlay_style?: string;
  container_style?: string;
}

const Modal: React.FC<ModalProps> = ({
  show,
  onClose,
  closeOnOutSideClick = true,
  handleClickOutSide,
  children,
  showOverlay = true,
  overlay_style,
  container_style,
}) => {
  if (!show) {
    return null;
  }

  const handleOverlayClick = () => {
    if (handleClickOutSide) {
      handleClickOutSide();
    } else if (closeOnOutSideClick && onClose) {
      onClose();
    }
  };

  return (
    <Portal>
      {showOverlay && (
        <div
          className={classNames(styles.overlay, overlay_style)}
          tabIndex={0}
          role="button"
          onClick={handleOverlayClick}
        />
      )}
      <div
        className={classNames(styles.container, container_style)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </Portal>
  );
};

export default Modal;
