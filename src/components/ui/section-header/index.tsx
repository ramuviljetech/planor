import React from "react";
import styles from "./styles.module.css";
import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";

export interface SectionHeaderProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actionButtonTitle: string;
  onActionButtonClick: () => void;
  filterComponent?: React.ReactNode;
  className?: string;
  searchBarClassName?: string;
  actionButtonClassName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  actionButtonTitle,
  onActionButtonClick,
  filterComponent,
  className,
  searchBarClassName,
  actionButtonClassName,
}) => {
  return (
    <div className={`${styles.section_header_container} ${className || ""}`}>
      <p className={styles.section_header_title}>{title}</p>
      <div className={styles.section_header_right_container}>
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className={`${styles.section_header_search_bar} ${
            searchBarClassName || ""
          }`}
        />
        {filterComponent && (
          <div className={styles.section_header_filter_container}>
            {filterComponent}
          </div>
        )}
        <Button
          title={actionButtonTitle}
          variant="primary"
          onClick={onActionButtonClick}
          className={`${styles.section_header_action_button} ${
            actionButtonClassName || ""
          }`}
        />
      </div>
    </div>
  );
};

export default SectionHeader;
