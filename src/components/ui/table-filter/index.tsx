import React from "react";
import styles from "./styles.module.css";
import CustomCheckbox from "@/components/ui/checkbox";

interface TableFilterProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onOptionsChange: (options: string[]) => void;
}

const TableFilter: React.FC<TableFilterProps> = ({
  title,
  options,
  selectedOptions,
  onOptionsChange,
}) => {
  const handleOptionToggle = (option: string) => {
    if (selectedOptions.includes(option)) {
      onOptionsChange(selectedOptions.filter((o) => o !== option));
    } else {
      onOptionsChange([...selectedOptions, option]);
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
            <CustomCheckbox
              checked={selectedOptions.includes(option)}
              onChange={() => handleOptionToggle(option)}
              label={option}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableFilter;
