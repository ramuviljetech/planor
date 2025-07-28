import { useEffect, RefObject, ReactNode } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(
  ref: RefObject<HTMLElement> | RefObject<HTMLElement>[],
  cb: () => void
): void {
  useEffect(() => {
    if (!ref) return;

    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent): void {
      const target = event.target as Node;

      // Handle single ref
      if (!Array.isArray(ref)) {
        if (ref.current && ref.current.contains(target)) return;
      } else {
        // Handle array of refs
        for (let i = 0; i < ref.length; i++) {
          if (ref[i]?.current && ref[i].current?.contains(target)) return;
        }
      }

      cb && cb();
      event.stopPropagation();
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, cb]);
}

interface ClickOutsideProps {
  reference: RefObject<HTMLElement> | RefObject<HTMLElement>[];
  children: ReactNode;
  onClickOutside: () => void;
}

/**
 * Component that alerts if you click outside of it
 */
export default function ClickOutside({
  reference,
  children,
  onClickOutside,
}: ClickOutsideProps): JSX.Element {
  useOutsideAlerter(reference, onClickOutside);

  return <>{children}</>;
}
