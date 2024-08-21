import { BoardColumnFormElement } from "@/types";

interface AddBoardColumnProps {
  callback: (e: React.FormEvent<BoardColumnFormElement>) => void;
}

export const AddBoardColumn = ({ callback }: AddBoardColumnProps) => {
  return (
    <div>
      <form onSubmit={callback}>
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
