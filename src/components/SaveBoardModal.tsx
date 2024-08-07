import { SupabaseClient } from "@supabase/supabase-js";
import { saveBoard } from "../api/api";
import { BoardsFormElement } from "../types/FormTypes";
import { Dispatch } from "react";
import styles from "../styles/SaveBoardModal.module.scss";

interface SaveBoardModalProps {
  supabaseClient: SupabaseClient;
  setIsLoading: Dispatch<boolean>;
  setFetchError: Dispatch<boolean>;
  closeModal: () => void;
}

export const SaveBoardModal = ({
  supabaseClient,
  setIsLoading,
  setFetchError,
  closeModal,
}: SaveBoardModalProps) => {
  return (
    <div className={styles.saveBoardWrapper}>
      <button onClick={() => closeModal()}>Close Modal</button>
      <form
        onSubmit={(e: React.FormEvent<BoardsFormElement>) =>
          saveBoard(supabaseClient, e, setIsLoading, setFetchError)
        }
      >
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
          <label htmlFor="boardName">Board title</label>
          <input id="boardName" type="text" />
        </fieldset>
        <button type="submit">Save Table</button>
      </form>
    </div>
  );
};
