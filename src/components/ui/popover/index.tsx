import React, { useEffect, useState, RefObject, ReactNode } from "react";
import Portal from "@/components/ui/portal";
import * as PopperJS from "@popperjs/core";
import classNames from "classnames";
import ResizeObserver from "resize-observer-polyfill";
import ClickOutside from "@/components/ui/popover/click-outside";
import styles from "./styles.module.css";
import { PopOverProps } from "@/types/ui";

const PopOver: React.FC<PopOverProps> = ({
  reference,
  showOverlay = false,
  show,
  onClose,
  overlay_style,
  container_style,
  placement = "bottom-start",
  relativeWidth = false,
  offset = [0, 0],
  children,
}) => {
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!popperElement || !reference.current) return;

    const modifiers: any[] = [];

    if (relativeWidth) {
      modifiers.push({
        name: "widthRelative",
        enabled: true,
        fn: ({ state }: any) => {
          if (popperElement && reference.current) {
            popperElement.style.width = `${reference.current.offsetWidth}px`;
          }
          return state;
        },
        phase: "beforeWrite",
        requires: ["computeStyles"],
      });
    }

    if (offset.length > 0) {
      modifiers.push({
        name: "offset",
        options: {
          offset,
        },
      });
    }

    const popperInstance = PopperJS.createPopper(
      reference.current,
      popperElement,
      {
        placement,
        modifiers,
      }
    );

    const resizeObserver = new ResizeObserver(() => popperInstance?.update());

    if (reference.current) {
      resizeObserver?.observe(reference.current);
    }

    return () => {
      resizeObserver?.disconnect();
      popperInstance?.destroy();
    };
  }, [reference, popperElement, placement, relativeWidth, offset]);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "unset";
  }, [show]);

  if (!show) {
    return null;
  }

  // Create ref objects for ClickOutside component
  const popperRef = { current: popperElement };
  const refs = [popperRef, reference];

  return (
    <Portal>
      {showOverlay && (
        <div
          className={classNames(
            styles.overlay,
            styles.overlay_bg_style,
            overlay_style
          )}
        />
      )}
      <ClickOutside reference={refs} onClickOutside={onClose}>
        <div
          className={classNames(styles.container, container_style)}
          onClick={(e) => e.stopPropagation()}
          ref={setPopperElement}
        >
          {children}
        </div>
      </ClickOutside>
    </Portal>
  );
};

export default PopOver;
