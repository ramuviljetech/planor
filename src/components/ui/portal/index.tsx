import { useState, useEffect, ReactNode } from "react";
import ReactDOM from "react-dom";

interface PortalProps {
  children: ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container) {
      setContainer(document.createElement("div"));
      return;
    }
    document.body.appendChild(container);
    return () => {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, [container]);

  return container ? ReactDOM.createPortal(children, container) : null;
};

export default Portal;
