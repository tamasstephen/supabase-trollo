import { SyntheticEvent } from "react";
import styles from "../../styles/BordCard.module.scss";
import PlusIcon from "@/assets/plus.svg";

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
    <a
      href="#"
      className={styles.cardPrimaryAction}
      onClick={(e) => callback(e, title)}
    >
      <div
        className={`${styles.boardCard} ${center ? styles.boardCardAdd : ""}`}
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        <div
          data-testid="card-div"
          className={`${styles.boardCard} ${styles.outer}  ${
            center ? styles.center : ""
          }`}
        >
          <div className={`${styles.boardCard} ${styles.inner}`}></div>
          <h3>
            {center && <PlusIcon />}
            {title}
          </h3>
        </div>
      </div>
    </a>
  );
};
