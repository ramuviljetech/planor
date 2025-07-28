import React from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

const Info: React.FC<{ title: string; value: string; className?: string }> = ({
  title,
  value,
  className,
}) => {
  return (
    <div className={classNames(styles.info_container, className)}>
      <p className={styles.info_title}>{title}</p>
      <p className={styles.info_value}>{value}</p>
    </div>
  );
};

export default Info;
