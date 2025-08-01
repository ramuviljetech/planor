import React, { MouseEvent, useRef } from "react";
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const buttonClass = classNames(
    styles.button,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    className
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const ripple = document.createElement("span");
    ripple.className = styles.ripple;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;

    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    button.appendChild(ripple);

    // Remove the ripple after animation
    setTimeout(() => ripple.remove(), 600);

    if (onClick && !isDisabled) onClick(e);
  };

  return (
    <button
      type={type}
      ref={buttonRef}
      className={buttonClass}
      style={style}
      onClick={handleClick}
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
