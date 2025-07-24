import React from "react";
import styles from "./styles.module.css";
import { MetricCardProps } from "@/types/ui";
import classNames from "classnames";

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  percentageChange,
  showDot = false,
  dotColor = "#A78BFA", // default light purple
  className = "",
  valueStyle,
  percentStyle,
  titleStyle,
}) => {
  // Format value with commas for better readability
  const formatValue = (val: number) => {
    if (val < 10) {
      return `0${val}`;
    }
    return val.toLocaleString();
  };

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.headerContainer}>
        {showDot && (
          <span className={styles.dot} style={{ backgroundColor: dotColor }} />
        )}
        <span className={classNames(styles.title, titleStyle)}>{title}</span>
      </div>
      <div className={styles.bodyContainer}>
        <span className={classNames(styles.value, valueStyle)}>
          {formatValue(value)} {percentageChange ? "K" : ""}
        </span>
        {percentageChange && (
          <span
            className={classNames(
              styles.percent,
              percentStyle,
              percentageChange > 0 ? styles.positive : styles.negative
            )}
          >
            {percentageChange > 0 ? "+" : ""}
            {percentageChange}%
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
