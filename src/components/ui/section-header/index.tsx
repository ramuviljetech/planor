import React from "react";
import styles from "./styles.module.css";
import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import classNames from "classnames";

export interface SectionHeaderProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actionButtonTitle?: string;
  onActionButtonClick?: () => void;
  filterComponent?: React.ReactNode;
  className?: string;
  searchBarStyle?: string;
  actionButtonStyle?: string;
  rightContainerStyle?: string;
  titleStyle?: string;
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
  searchBarStyle,
  actionButtonStyle,
  rightContainerStyle,
  titleStyle,
}) => {
  return (
    <div className={`${styles.section_header_container} ${className || ""}`}>
      <p className={classNames(styles.section_header_title, titleStyle)}>
        {title}
      </p>
      <div
        className={classNames(
          styles.section_header_right_container,
          rightContainerStyle
        )}
      >
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className={classNames(
            styles.section_header_search_bar,
            searchBarStyle
          )}
        />
        {filterComponent && (
          <div className={styles.section_header_filter_container}>
            {filterComponent}
          </div>
        )}
        {actionButtonTitle && (
          <Button
            title={actionButtonTitle}
            variant="primary"
            onClick={onActionButtonClick}
            className={classNames(
              styles.section_header_action_button,
              actionButtonStyle
            )}
          />
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
