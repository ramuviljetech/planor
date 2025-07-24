import React from "react";
import styles from "./styles.module.css";
import CustomCheckbox from "@/components/ui/checkbox";

interface TableFilterProps {
  title: string;
  options: string[];
  selectedOptions: string;
  onOptionsChange: (options: string) => void;
  checkbox?: boolean;
}

const TableFilter: React.FC<TableFilterProps> = ({
  title,
  options,
  selectedOptions,
  onOptionsChange,
  checkbox = false,
}) => {
  const handleOptionToggle = (option: string) => {
    if (selectedOptions === option) {
      onOptionsChange("");
    } else {
      onOptionsChange(option);
    }
  };

  return (
    <div className={styles.filter_container}>
      <div className={styles.filter_title_container}>
        <p className={styles.filter_title}>{title}</p>
      </div>
      {options.map((option) => (
        <div
          key={option}
          className={styles.filter_content}
          onClick={() => handleOptionToggle(option)}
        >
          <div className={styles.filter_subcontent}>
            <p
              className={`${styles.filter_subcontent_text} ${
                selectedOptions === option
                  ? styles.filter_subcontent_text_active
                  : ""
              }`}
            >
              {option}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableFilter;
