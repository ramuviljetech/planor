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
  showK = false,
}) => {
  // Format value with commas for better readability
  const formatValue = (val: number) => {
    if (showK && val >= 1000) {
      // For values >= 1000, show K format
      const kValue = (val / 1000).toFixed(1);
      // Remove .0 if it's a whole number
      return kValue.endsWith(".0") ? kValue.slice(0, -2) : kValue;
    } else {
      // For values < 1000, show original value
      if (val > 0 && val < 10) {
        return `0${val}`;
      }
      return val.toString();
    }
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
          {formatValue(value)}
          {showK && value >= 1000 ? "K" : ""}
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
