import React, { useEffect, useRef } from "react";
import OTPInput from "react-otp-input";
import styles from "./styles.module.css";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
  disabled?: boolean;
  className?: string;
}

const OTPInputComponent: React.FC<OTPInputProps> = ({
  value,
  onChange,
  numInputs = 6,
  disabled = false,
  className = "",
}) => {
  const inputRef = useRef<any>(null);

  // Ensure the first input is focused when component mounts
  useEffect(() => {
    if (!disabled && inputRef.current) {
      const timer = setTimeout(() => {
        const firstInput = inputRef.current?.querySelector("input");
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  return (
    <div
      className={`${styles.otp_input_container} ${className}`}
      ref={inputRef}
    >
      <OTPInput
        value={value}
        onChange={onChange}
        numInputs={numInputs}
        renderInput={(props) => (
          <input
            {...props}
            disabled={disabled}
            placeholder="_"
            type="text"
            autoComplete="one-time-code"
          />
        )}
        inputType="text"
        shouldAutoFocus={true}
        containerStyle={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
        }}
      />
    </div>
  );
};

export default OTPInputComponent;
