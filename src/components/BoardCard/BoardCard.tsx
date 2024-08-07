import { SyntheticEvent } from "react";
import styles from "../../styles/BordCard.module.scss";

interface BoardCardProps {
  title: string;
  imageUrl: string | undefined;
  callback: (e: SyntheticEvent, title?: string) => void;
  addNewBoard?: boolean;
}

export const BoardCard = ({
  title,
  imageUrl,
  callback,
  addNewBoard: center,
}: BoardCardProps) => {
  return (
    <div
      className={`${styles.boardCard}`}
      style={{
        backgroundImage: `url(${imageUrl})`,
      }}
      role="button"
    >
      <div
        className={`${styles.boardCard} ${styles.outer}  ${
          center ? styles.center : ""
        }`}
      >
        <div className={`${styles.boardCard} ${styles.inner}`}></div>
        <a
          className={styles.cardPrimaryAction}
          onClick={(e) => callback(e, title)}
        >
          {title}
        </a>
      </div>
    </div>
  );
};
