import React from "react";
import styles from "./styles.module.css";
import { AvatarProps } from "@/types/ui";
import Image from "next/image";
import classNames from "classnames";

const Avatar: React.FC<AvatarProps> = ({
  image,
  alt,
  size = "md",
  fallback,
  avatarStyle,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={classNames(styles.avatar_container, styles[size], className)}
    >
      {image ? (
        <Image
          src={image}
          alt={alt || "avatar"}
          className={classNames(styles.avatar_image, avatarStyle)}
        />
      ) : (
        <div className={styles.avatar_fallback}>{fallback || "?"}</div>
      )}
    </div>
  );
};

export default Avatar;
