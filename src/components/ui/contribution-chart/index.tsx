import React from "react";
import styles from "./styles.module.css";

interface ContributionItem {
  title: string;
  value: number;
  color: string;
  percentage: number;
}

interface ContributionChartProps {
  items: ContributionItem[];
  className?: string;
}

const ContributionChart: React.FC<ContributionChartProps> = ({
  items,
  className = "",
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.chartContainer}>
        {items.map((item, index) => (
          <div
            key={item.title}
            className={styles.bar}
            style={{
              backgroundColor: item.color,
              width: `${item.percentage}%`,
            }}
            title={`${item.title}: ${item.value}K (${item.percentage}%)`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ContributionChart;
