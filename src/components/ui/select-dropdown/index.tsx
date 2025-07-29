import React, { useState, useRef, useMemo } from "react";
import classNames from "classnames";
import {
  chevronDownPinkIcon,
  locationBlackIcon,
  searchIcon,
  tickBlackIcon,
} from "@/resources/images";
import Image from "next/image";
import PopOver from "../popover";
import Input from "../input";
import styles from "./styles.module.css";
import CustomCheckbox from "../checkbox";

interface SelectOption {
  label: string;
  value: string;
  avatar?: string;
}

type SelectOptionType = string | SelectOption;

interface SelectDropDownProps {
  options?: SelectOptionType[];
  placeholder?: string;
  label?: string;
  selected?: string | string[];
  defaultSelected?: string | string[];
  onSelect?: (value: string | string[]) => void;
  showAddProject?: boolean;
  addProjectText?: string;
  onPlusIconClick?: () => void;
  relativeWidth?: boolean;
  containerClass?: string;
  labelClass?: string;
  triggerClass?: string;
  menuWrapperClass?: string;
  menuClass?: string;
  itemClass?: string;
  selectedItemClass?: string;
  addProjectClass?: string;
  iconClass?: string;
  selectedTextClass?: string;
  errorMessage?: string;
  showError?: boolean;
  multiSelect?: boolean;
  searchPlaceholder?: string;
}

const SelectDropDown: React.FC<SelectDropDownProps> = ({
  options = [],
  placeholder = "Select item",
  label = "",
  selected: controlledSelected,
  defaultSelected = "",
  onSelect = () => {},
  //   showAddProject = false,
  //   addProjectText = "Add new project",
  //   addProjectIcon,
  //   onPlusIconClick = () => {},
  relativeWidth = true,
  containerClass = "",
  labelClass = "",
  triggerClass = "",
  menuWrapperClass = "",
  menuClass = "",
  itemClass = "",
  selectedItemClass = "",
  //   addProjectClass = "",
  //   addProjectIconClass = "",
  iconClass = "",
  selectedTextClass = "",
  errorMessage = "",
  showError = false,
  multiSelect = false,
  searchPlaceholder = "Search options...",
}) => {
  const [internalSelected, setInternalSelected] = useState<string | string[]>(
    multiSelect
      ? Array.isArray(defaultSelected)
        ? defaultSelected
        : []
      : defaultSelected
  );
  const selected =
    controlledSelected !== undefined ? controlledSelected : internalSelected;

  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const referenceRef = useRef<HTMLDivElement>(null);

  // Convert selected to array for multi-select
  const selectedArray = Array.isArray(selected)
    ? selected
    : [selected].filter(Boolean);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) => {
      const label = typeof option === "string" ? option : option.label;
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  const handleOptionClick = (option: SelectOptionType) => {
    const value = typeof option === "string" ? option : option.label;

    if (multiSelect) {
      const currentSelected = Array.isArray(selected) ? selected : [];
      const newSelected = currentSelected.includes(value)
        ? currentSelected.filter((item) => item !== value)
        : [...currentSelected, value];

      if (controlledSelected === undefined) setInternalSelected(newSelected);
      onSelect(newSelected);
    } else {
      if (controlledSelected === undefined) setInternalSelected(value);
      onSelect(value);
    }

    setHasUserInteracted(true);
    if (!multiSelect) {
      setShowPopover(false);
    }
  };

  const removeSelectedItem = (itemToRemove: string) => {
    if (multiSelect) {
      const currentSelected = Array.isArray(selected) ? selected : [];
      const newSelected = currentSelected.filter(
        (item) => item !== itemToRemove
      );

      if (controlledSelected === undefined) setInternalSelected(newSelected);
      onSelect(newSelected);
    }
  };

  const getDisplayText = () => {
    if (multiSelect) {
      if (selectedArray.length === 0) return placeholder;
      if (selectedArray.length === 1) return selectedArray[0];
      return `${selectedArray.length} items selected`;
    }
    return selected || placeholder;
  };

  return (
    <div className={classNames(styles.selectDropDown, containerClass)}>
      {label && (
        <p className={classNames(styles.selectDropDownLabel, labelClass)}>
          {label}
        </p>
      )}

      <div
        className={classNames(
          styles.selectDropDownWithDownArrow,
          triggerClass,
          showPopover && styles.selectDropDownFocused,
          showError && styles.selectDropDownError
        )}
        onClick={() => setShowPopover((prev) => !prev)}
        ref={referenceRef}
      >
        <p
          className={classNames(
            selected ? styles.selectedText : styles.placeholder,
            selected && selectedTextClass
          )}
        >
          {getDisplayText()}
        </p>
        <Image
          src={chevronDownPinkIcon}
          alt="down-arrow"
          className={classNames(
            styles.arrowBase,
            selected ? styles.active : styles.unActive,
            showPopover && styles.arrowRotated
          )}
        />
      </div>

      {showError && errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      <PopOver
        reference={referenceRef}
        show={showPopover}
        showOverlay={false}
        relativeWidth={relativeWidth}
        placement="bottom-start"
        offset={[0, 4]}
        container_style={classNames(styles.dropdownContainer, menuWrapperClass)}
        onClose={() => setShowPopover(false)}
      >
        <div className={styles.dropdownMenuWrapper}>
          {/* Search Input */}
          {/* <div className={styles.searchContainer}> */}
          <Input
            type="text"
            label=""
            leftIcon={searchIcon}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputStyle={styles.searchInput}
            inputWrapperClass={styles.searchInputWrapper}
          />
          {/* </div> */}

          {/* Options List */}
          <div className={classNames(styles.dropdownMenu, menuClass)}>
            {filteredOptions.map((option, index) => {
              const value = typeof option === "string" ? option : option.label;
              const avatar = typeof option === "object" ? option.avatar : null;
              const isSelected = selectedArray.includes(value);

              return (
                <div
                  key={value + index}
                  className={classNames(
                    styles.dropdownItem,
                    itemClass,
                    isSelected &&
                      classNames(styles.selectedOption, selectedItemClass)
                  )}
                  onClick={() => handleOptionClick(option)}
                >
                  <CustomCheckbox
                    label={value}
                    checked={isSelected}
                    onChange={() => handleOptionClick(option)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </PopOver>
    </div>
  );
};

export default SelectDropDown;
