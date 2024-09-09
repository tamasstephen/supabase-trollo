import { Button } from "@/components";
import { ButtonStyle } from "@/constants";
import styles from "@/styles/Board.module.scss";

interface DeleteBoardProps {
  onDelete: () => void;
  onCancel: () => void;
}

export const DeleteBoard = ({ onCancel, onDelete }: DeleteBoardProps) => {
  return (
    <div className={styles.deleteModal}>
      <h2>Are you sure you want to delete this board?</h2>
      <div className={styles.buttonHolder}>
        <Button type="button" onClick={onCancel} style={ButtonStyle.PRIMARY}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onDelete}
          isDanger={true}
          style={ButtonStyle.DASHED}
          testId="deleteboard"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
