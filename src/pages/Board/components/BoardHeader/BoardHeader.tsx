import { ButtonStyle } from "@/constants";
import Plus from "@/assets/plus.svg";
import styles from "@/styles/Board.module.scss";
import { Button } from "@/components/Button";
import { Board } from "@/types";
import { Dispatch, SetStateAction } from "react";

interface BoardHeaderProps {
  boardData: Board | null;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  deleteBoard: () => void;
}

export const BoardHeader = ({
  boardData,
  setIsModalOpen,
  deleteBoard,
}: BoardHeaderProps) => {
  return (
    <div className={styles.header}>
      <h2>{boardData?.title}</h2>
      <div className={styles.headerbuttons}>
        <Button
          style={ButtonStyle.DASHED}
          onClick={deleteBoard}
          type="button"
          isDanger={true}
          isSmall
          testId="opendeletemodal"
        >
          Delete Board
        </Button>
        <Button
          style={ButtonStyle.DASHED}
          onClick={() => {
            setIsModalOpen(true);
          }}
          type="button"
          isSmall
          testId="addcolumn"
        >
          <Plus />
          Add list
        </Button>
      </div>
    </div>
  );
};
