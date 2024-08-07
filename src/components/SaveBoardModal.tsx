import { SupabaseClient } from "@supabase/supabase-js";
import { saveBoard } from "../api/api";
import { BoardsFormElement } from "../types/FormTypes";
import { Dispatch } from "react";

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
    <div>
      <button onClick={() => closeModal()}>Close Modal</button>
      <form
        onSubmit={(e: React.FormEvent<BoardsFormElement>) =>
          saveBoard(supabaseClient, e, setIsLoading, setFetchError)
        }
      >
        <input
          type="file"
          id="boardCover"
          name="boardCover"
          accept="image/png, image/jpeg"
        />
        <label htmlFor="boardName">
          <input id="boardName" type="text" />
        </label>
        <button type="submit">Save Table</button>
      </form>
    </div>
  );
};
