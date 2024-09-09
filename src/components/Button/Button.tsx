import { ButtonStyle } from "@/constants";
import styles from "@/styles/Button.module.scss";
import { PropsWithChildren } from "react";

interface ButtonProps extends PropsWithChildren {
  type: "submit" | "button";
  style: ButtonStyle;
  onClick?: () => void;
  isDanger?: boolean;
  isSmall?: boolean;
  testId?: string;
}

export const Button = ({
  isDanger,
  isSmall,
  type,
  style,
  onClick,
  children,
  testId,
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
      } ${isDanger ? styles.danger : ""}`}
      type={type}
      data-testid={testId || ""}
    >
      {children}
    </button>
  );
};
