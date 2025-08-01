import React, { useState, useRef, useMemo } from "react";
import classNames from "classnames";
import {
  chevronDownPinkIcon,
  closeBlackIcon,
  docIcon,
  fileIcon,
  locationBlackIcon,
  xlsIcon,
  pdfIcon,
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
  onCloseIconClick?: (item: string) => void;
  leftImage?: boolean;
  selectedItemsContainerClass?: string;
}

// Function to get file icon based on file extension
const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return pdfIcon;
    case "docx":
    case "doc":
      return docIcon; // You can add a specific doc icon if available
    case "xlsx":
    case "xls":
      return xlsIcon; // You can add a specific excel icon if available
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return fileIcon; // You can add a specific image icon if available
    default:
      return fileIcon;
  }
};

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
  onCloseIconClick = (item: string) => {},
  leftImage = false,
  selectedItemsContainerClass = "",
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
            selected && selected.length > 0
              ? styles.selectedText
              : styles.placeholder,
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
      {/* // if multi select then show the selected items */}
      {multiSelect && selectedArray.length > 0 && (
        <div
          className={classNames(
            styles.selected_items_container,
            selectedItemsContainerClass
          )}
        >
          {selectedArray.map((item) => (
            <div key={item} className={styles.selected_item}>
              {leftImage && (
                <Image
                  src={getFileIcon(item)}
                  alt={item}
                  width={16}
                  height={16}
                  className={styles.selected_item_image}
                />
              )}
              <p className={styles.selected_item_text}>{item}</p>
              <Image
                onClick={() => onCloseIconClick && onCloseIconClick(item)}
                src={closeBlackIcon}
                alt="close"
                width={16}
                height={16}
                className={classNames(
                  styles.selected_item_close_icon,
                  styles.selected_item_close_icon_image
                )}
              />
            </div>
          ))}
        </div>
      )}

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
