import { BoardsFormElement } from "@/types";

import CloseIcon from "@/assets/close.svg";
import styles from "@/styles/SaveBoardModal.module.scss";
import { useSaveBoard } from "@/hooks/";
import { SaveLoading } from "./SaveLoading";
import { SaveError } from "./SaveError";

interface SaveBoardModalProps {
  closeModal: () => void;
}

export const SaveBoardModal = ({ closeModal }: SaveBoardModalProps) => {
  const { loading, error, saveBoard } = useSaveBoard();

  if (loading) {
    return <SaveLoading />;
  }

  if (error) {
    return <SaveError />;
  }

  return (
    <div className={styles.saveBoardWrapper}>
      <button
        className={styles.close}
        onClick={() => closeModal()}
        aria-label="close modal"
        data-testid="close"
      >
        <CloseIcon />
      </button>
      <h3>Create a board</h3>
      <form onSubmit={(e: React.FormEvent<BoardsFormElement>) => saveBoard(e)}>
        <fieldset>
          <label htmlFor="boardCover">Board cover</label>
          <input
            type="file"
            id="boardCover"
            name="boardCover"
            accept="image/png, image/jpeg"
          />
        </fieldset>
        <fieldset>
          <label htmlFor="boardName">
            Board title <span className={styles.mandatory}>*</span>
          </label>
          <input
            className={styles.input}
            id="boardName"
            name="boardName"
            type="text"
            required
          />
        </fieldset>
        <button className={styles.submit} type="submit">
          Save Board
        </button>
      </form>
    </div>
  );
};
