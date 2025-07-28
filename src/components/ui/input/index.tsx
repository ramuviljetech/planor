import React from "react";
import classNames from "classnames";
import Image from "next/image";
import { InputProps } from "@/types/ui";
import styles from "./styles.module.css";

const Input: React.FC<InputProps> = ({
  label = "Label",
  type = "text",
  placeholder,
  value,
  onChange,
  leftIcon,
  rightIcon,
  leftIconStyle,
  rightIconStyle,
  onClickLeftIcon,
  onClickRightIcon,
  inputReference,
  disabled,
  onKeyDown,
  name,
  id,
  inputStyle,
  error,
  inputContainerClass,
  inputWrapperClass,
  ...rest
}) => {
  // Filter out React-specific props that shouldn't be passed to DOM elements
  const { searchParams, params, ...inputProps } = rest;
  return (
    <div className={classNames(styles.inputContainer, inputContainerClass)}>
      <label className={styles.label}>{label}</label>
      <div
        className={classNames(
          error ? styles.errorBg : styles.inputWrapper,
          inputWrapperClass
        )}
      >
        {leftIcon && (
          <div
            className={classNames(styles.leftIcon, leftIconStyle)}
            onClick={onClickLeftIcon}
          >
            <Image src={leftIcon} alt="Left icon" width={20} height={20} />
          </div>
        )}
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          className={classNames(styles.input, inputStyle)}
          onChange={onChange}
          placeholder={placeholder || ""}
          onKeyDown={onKeyDown}
          ref={inputReference}
          disabled={disabled}
          {...inputProps}
        />
        {rightIcon && (
          <div
            className={classNames(styles.rightIcon, rightIconStyle)}
            onClick={onClickRightIcon}
          >
            <Image src={rightIcon} alt="Right icon" width={20} height={20} />
          </div>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};
export default Input;
