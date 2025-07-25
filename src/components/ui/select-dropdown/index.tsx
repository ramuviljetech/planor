import React, { useState, useRef } from "react";
import classNames from "classnames";
import { locationBlackIcon } from "@/resources/images";
import Image from "next/image";
import PopOver from "../popover";
import styles from "./styles.module.css";

interface SelectOption {
  label: string;
  avatar?: string;
}

type SelectOptionType = string | SelectOption;

interface SelectDropDownProps {
  options?: SelectOptionType[];
  placeholder?: string;
  label?: string;
  selected?: string;
  defaultSelected?: string;
  onSelect?: (value: string) => void;
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
}

const SelectDropDown: React.FC<SelectDropDownProps> = ({
  options = [],
  placeholder = "Select a project",
  label = "Select Project",
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
}) => {
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const selected =
    controlledSelected !== undefined ? controlledSelected : internalSelected;

  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const referenceRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: SelectOptionType) => {
    const value = typeof option === "string" ? option : option.label;
    if (controlledSelected === undefined) setInternalSelected(value);
    onSelect(value);
    setHasUserInteracted(true);
    setShowPopover(false);
  };

  return (
    <div className={classNames(styles.selectDropDown, containerClass)}>
      {label && (
        <h5 className={classNames(styles.selectDropDownLabel, labelClass)}>
          {label}
        </h5>
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
        <span
          className={classNames(
            selected ? styles.selectedText : styles.placeholder,
            selected && selectedTextClass
          )}
        >
          {selected || placeholder}
        </span>
        <Image
          src={locationBlackIcon}
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
          <div className={classNames(styles.dropdownMenu, menuClass)}>
            {options.map((option, index) => {
              const value = typeof option === "string" ? option : option.label;
              const avatar = typeof option === "object" ? option.avatar : null;
              const isSelected = selected === value;

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
                  <div className={styles.optionContent}>
                    {avatar && (
                      <Image
                        src={avatar}
                        alt={value}
                        className={styles.optionAvatar}
                      />
                    )}
                    <span>{value}</span>
                  </div>

                  {isSelected && hasUserInteracted && (
                    <Image
                      src={locationBlackIcon}
                      alt="tick-icon"
                      className={classNames(
                        styles.optionIcon,
                        iconClass,
                        styles.iconVisible
                      )}
                    />
                  )}
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
