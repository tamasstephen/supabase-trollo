import { PropsWithChildren, useEffect } from "react";
import { createPortal } from "react-dom";

export const Portal = ({ children }: PropsWithChildren) => {
  const mount = document.querySelector("#portal");
  const el = document.createElement("div");

  useEffect(() => {
    if (mount) {
      mount.appendChild(el);
    }
    return () => {
      if (mount) {
        mount.removeChild(el);
      }
    };
  });

  return createPortal(children, el);
};
