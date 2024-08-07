import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Board } from "../types/Board";
import { fetchBoards } from "../api/api";
import styles from "../styles/Dashboard.module.scss";
import { Portal } from "../components/Portal";
import { SaveBoardModal } from "../components/SaveBoardModal";

export const Dashboard = () => {
  const { supabaseClient } = useAuthContext();
  const [boards, setBoards] = useState<Board[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  const closeModal = () => setIsPortalOpen(false);

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
    <div className={styles.dashboardWrapper}>
      {isPortalOpen && (
        <Portal>
          <SaveBoardModal
            supabaseClient={supabaseClient}
            setIsLoading={setIsLoading}
            setFetchError={setFetchError}
            closeModal={closeModal}
          />
        </Portal>
      )}
      <div>
        <h1>Dashboard</h1>
      </div>
      <div>
        <div
          role="button"
          aria-label="add new board"
          onClick={() => setIsPortalOpen(true)}
        >
          <p>Add new board</p>
        </div>
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
