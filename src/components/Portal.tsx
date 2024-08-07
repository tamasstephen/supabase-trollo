import { PropsWithChildren, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/Portal.module.scss";

interface PortalProps extends PropsWithChildren {
  closeModal: () => void;
}

export const Portal = ({ children, closeModal }: PortalProps) => {
  const mount = document.querySelector("#portal");
  const el = document.createElement("div");
  const divInner = document.createElement("div");
  el.appendChild(divInner);
  el.className = styles.modal;
  const clickTarget = useRef(divInner);

  const handleClickOutSide = (e: MouseEvent) => {
    if (
      clickTarget.current &&
      !clickTarget.current.contains(e.target as Node)
    ) {
      closeModal();
    }
  };

  useEffect(() => {
    if (mount) {
      mount.appendChild(el);
    }
    el.addEventListener("click", handleClickOutSide);
    return () => {
      if (mount) {
        el.removeEventListener("click", closeModal);
        mount.removeChild(el);
      }
    };
  });

  return createPortal(children, divInner);
};
