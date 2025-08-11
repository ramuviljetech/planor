import { useState, useEffect, ReactNode } from "react";
import ReactDOM from "react-dom";

interface PortalProps {
  children: ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const newContainer = document.createElement("div");
    setContainer(newContainer);
    document.body.appendChild(newContainer);

    return () => {
      if (newContainer && document.body.contains(newContainer)) {
        document.body.removeChild(newContainer);
      }
    };
  }, []);

  return container ? ReactDOM.createPortal(children, container) : null;
};

export default Portal;
