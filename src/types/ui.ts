import {
  ButtonHTMLAttributes,
  ReactNode,
  CSSProperties,
  RefObject,
} from "react";
import * as PopperJS from "@popperjs/core";
import { StaticImageData } from "next/image";
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
  value: number;
  percentageChange?: number;
  showDot?: boolean;
  dotColor?: string;
  className?: string;
  valueStyle?: string;
  percentStyle?: string;
  titleStyle?: string;
  showK?: boolean;
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
  inputWrapperClass?: string;
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

export interface PopOverProps {
  reference: RefObject<HTMLElement>;
  showOverlay?: boolean;
  show: boolean;
  onClose: () => void;
  overlay_style?: string;
  container_style?: string;
  placement?: PopperJS.Placement;
  relativeWidth?: boolean;
  offset?: [number, number];
  children: ReactNode;
  zIndex?: number;
}

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
export interface AvatarProps {
  image?: StaticImageData;
  alt?: string;
  fallback?: string; // like initials or icon
  size?: "sm" | "md" | "lg";
  avatarStyle?: string;
  className?: string;
  onClick?: () => void;
}
