import React, { forwardRef } from "react";
import classNames from "classnames";
import styles from "./styles.module.css";

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  labelClassName?: string;
  textareaClassName?: string;
  name?: string;
  id?: string;
  maxLength?: number;
  minLength?: number;
  readOnly?: boolean;
  autoFocus?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({
    label,
    placeholder = "",
    rows = 4,
    value,
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    required = false,
    error,
    className = "",
    labelClassName = "",
    textareaClassName = "",
    name,
    id,
    maxLength,
    minLength,
    readOnly = false,
    autoFocus = false,
  }) =>
    // ref
    {
      const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (onChange) {
          onChange(e.target.value);
        }
      };

      return (
        <div className={classNames(styles.text_area_container, className)}>
          {label && (
            <p className={classNames(styles.text_area_label, labelClassName)}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </p>
          )}
          <textarea
            //   ref={ref}
            className={classNames(
              styles.text_area,
              textareaClassName,
              error && styles.text_area_error
            )}
            placeholder={placeholder}
            rows={rows}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            name={name}
            id={id}
            maxLength={maxLength}
            minLength={minLength}
            readOnly={readOnly}
            autoFocus={autoFocus}
          />
          {error && <p className={styles.error_message}>{error}</p>}
        </div>
      );
    }
);

export default TextArea;
