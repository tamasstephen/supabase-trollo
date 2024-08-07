import { SupabaseClient } from "@supabase/supabase-js";
import { Board } from "../types/Board";
import { BoardsFormElement } from "../types/FormTypes";

export const saveBoard = async (
  supabaseClient: SupabaseClient,
  event: React.FormEvent<BoardsFormElement>,
  setLoading: (value: boolean) => void,
  setError: (value: boolean) => void
) => {
  event.preventDefault();
  const payload: Omit<Board, "image"> = { name: "" };
  payload.name = event.currentTarget.elements.boardName.value;

  if (event.currentTarget.elements.boardCover.files?.length && supabaseClient) {
    setLoading(true);
    const boardCover = event.currentTarget.elements.boardCover.files[0];
    const { data, error } = await supabaseClient.storage
      .from("board_cover")
      .upload(`board_cover/${boardCover.name}`, boardCover, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      setError(true);
      return;
    }
    payload.background = data.path;
  }
  const response = await supabaseClient.from("boards").insert(payload);
  if (!response || response.error) {
    setError(true);
    return;
  }
  setLoading(false);
};

export const fetchBoards = async (
  supabaseClient: SupabaseClient | null,
  setFetchError: (value: boolean) => void,
  setBoards: (boards: Board[]) => void
) => {
  if (supabaseClient) {
    const { data, error } = await supabaseClient.from("boards").select();
    if (error) {
      setFetchError(true);
      return;
    }
    const boards = data as Board[];
    boards.forEach(async (board) => {
      if (board.background) {
        const { data } = await supabaseClient.storage
          .from("board_cover")
          .download(board.background);
        board.image = data;
      }
    });
    setBoards(boards);
  }
};
