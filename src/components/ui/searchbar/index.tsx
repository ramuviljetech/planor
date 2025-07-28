import React from "react";
import styles from "./styles.module.css";
import clsx from "clsx";
import { SearchBarProps } from "@/types/ui";
import Image from "next/image";
import classNames from "classnames";
import { searchIcon } from "@/resources/images";

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  leftIcon,
  rightIcon,
  onRightIconClick,
  className,
  rightIconStyle,
  leftIconStyle,
  inputStyle,
}) => {
  return (
    <div className={clsx(styles.searchbar_container, className)}>
      <Image
        src={leftIcon || searchIcon}
        alt="search"
        width={20}
        height={20}
        className={classNames(styles.searchbar_leftIcon, leftIconStyle)}
      />
      <input
        type="text"
        className={classNames(styles.searchbar_input, inputStyle)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {rightIcon && (
        <Image
          src={rightIcon}
          alt="search"
          width={20}
          height={20}
          onClick={onRightIconClick}
          className={classNames(styles.searchbar_rightIcon, rightIconStyle)}
        />
      )}
    </div>
  );
};

export default SearchBar;
