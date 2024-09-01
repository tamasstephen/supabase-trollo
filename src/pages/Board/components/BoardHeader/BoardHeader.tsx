import { ButtonStyle } from "@/constants";
import Plus from "@/assets/plus.svg";
import styles from "@/styles/Board.module.scss";
import { Button } from "@/components/Button";
import { Board } from "@/types";
import { Dispatch, SetStateAction } from "react";

interface BoardHeaderProps {
  boardData: Board | null;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const BoardHeader = ({
  boardData,
  setIsModalOpen,
}: BoardHeaderProps) => {
  return (
    <div className={styles.header}>
      <h2>{boardData?.title}</h2>
      <Button
        style={ButtonStyle.DASHED}
        onClick={() => {
          setIsModalOpen(true);
        }}
        type="button"
        isSmall
      >
        <Plus />
        Add list
      </Button>
    </div>
  );
};
