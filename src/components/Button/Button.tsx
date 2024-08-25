import { ButtonStyle } from "@/constants";
import styles from "@/styles/Button.module.scss";
import { PropsWithChildren } from "react";

interface ButtonProps extends PropsWithChildren {
  type: "submit" | "button";
  style: ButtonStyle;
  onClick?: () => void;
  isSmall?: boolean;
}

export const Button = ({
  isSmall,
  type,
  style,
  onClick,
  children,
}: ButtonProps) => {
  const buttonStyle: Record<ButtonStyle, string> = {
    dashed: styles.dashed,
    primary: styles.primary,
  };

  return (
    <button
      onClick={() => onClick && onClick()}
      className={`${styles.button} ${isSmall ? styles.small : ""}  ${
        buttonStyle[style]
      } `}
      type={type}
    >
      {children}
    </button>
  );
};
