import React from "react";
import classNames from "classnames";
import { ButtonProps } from "@/types/ui";
import styles from "./styles.module.css";
import Image from "next/image";

const Button: React.FC<ButtonProps> = ({
  title,
  onClick,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  style,
  icon,
  type = "button",
  iconContainerClass,
  loaderClass,
}) => {
  const isDisabled = disabled || loading;

  const buttonClass = classNames(
    styles.button,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    className
  );

  return (
    <button
      type={type}
      className={buttonClass}
      style={style}
      onClick={onClick}
      disabled={isDisabled}
    >
      <div className={styles.buttonContent}>
        {loading && (
          <span className={classNames(styles.loader, loaderClass)}></span>
        )}
        {icon && (
          <div className={classNames(styles.iconContainer, iconContainerClass)}>
            <Image
              src={icon}
              alt={title}
              width={24}
              height={24}
              className={styles.icon}
            />
          </div>
        )}
        {title}
      </div>
    </button>
  );
};

export default Button;
