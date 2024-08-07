import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Board } from "../types/Board";
import { BoardsFormElement } from "../types/FormTypes";
import { fetchBoards, saveBoard } from "../api/api";

export const Dashboard = () => {
  const { supabaseClient } = useAuthContext();
  const [boards, setBoards] = useState<Board[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBoards(supabaseClient, setFetchError, setBoards);
  }, [supabaseClient]);

  if (fetchError || !supabaseClient) {
    return <div>An error has occured during the board loading...</div>;
  }

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div>
      Dashboard
      <div>
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
      <div>
        {boards.length > 0 &&
          boards.map((board) => {
            return (
              <div key={board.id}>
                <img
                  src={board.imageUrl}
                  style={{ width: "300px", height: "300px" }}
                />
                <div>{board.name}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
