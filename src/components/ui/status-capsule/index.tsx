import React from "react";
import styles from "./styles.module.css";

interface StatusCapsuleProps {
  status: string;
  variant?: "approved" | "pending" | "rejected" | "default";
  className?: string;
}

const StatusCapsule: React.FC<StatusCapsuleProps> = ({
  status,
  variant = "default",
  className = "",
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "approved":
        return styles.approved;
      case "pending":
        return styles.pending;
      case "rejected":
        return styles.rejected;
      default:
        return styles.default;
    }
  };

  return (
    <div
      className={`${styles.status_capsule} ${getVariantClass()} ${className}`}
    >
      <span className={styles.status_text}>{status}</span>
    </div>
  );
};

export default StatusCapsule;
