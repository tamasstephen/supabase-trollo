import { BoardColumnFormElement } from "@/types";
import { FormEvent } from "react";

interface AddBoardItemProps {
  callback: (
    e: React.FormEvent<BoardColumnFormElement>,
    id: string | null
  ) => void;
  containerId: string | null;
}

export const AddBoardItem = ({ callback, containerId }: AddBoardItemProps) => {
  return (
    <div>
      <form
        onSubmit={(e: FormEvent<BoardColumnFormElement>) =>
          callback(e, containerId)
        }
      >
        <fieldset>
          <label htmlFor="boardColumnTitle">
            <input type="text" id="boardColumnTitle" name="boardColumnTitle" />
          </label>
          <button>Add board</button>
        </fieldset>
      </form>
    </div>
  );
};
