import { ButtonHTMLAttributes, ReactNode, CSSProperties } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  icon?: string;
  iconContainerClass?: string;
  loaderClass?: string;
  type?: "button" | "submit" | "reset";
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  percentageChange?: string;
  showDot?: boolean;
  dotColor?: string;
  className?: string;
  valueStyle?: string;
  percentStyle?: string;
  titleStyle?: string;
}

export interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  leftIcon?: string;
  rightIcon?: string;
  leftIconStyle?: string;
  rightIconStyle?: string;
  onClickLeftIcon?: () => void;
  onClickRightIcon?: () => void;
  inputReference?: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  inputStyle?: string;
  error?: string;
  inputContainerClass?: string;
  [key: string]: any; // for rest props
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconClick?: () => void;
  className?: string;
  rightIconStyle?: string;
  leftIconStyle?: string;
  inputStyle?: string;
}

export interface MenuItem {
  label: string;
  icon: string;
  active_icon: string;
  route: string;
}
