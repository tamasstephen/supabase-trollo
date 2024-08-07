import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks";
import { Board } from "../types";
import { fetchBoards } from "../api";
import styles from "../styles/Dashboard.module.scss";
import { Portal } from "../components";
import { SaveBoardModal } from "../components";

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
        <Portal closeModal={closeModal}>
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
        <ul className={styles.cardList}>
          <li>
            <div
              role="button"
              aria-label="add new board"
              onClick={() => setIsPortalOpen(true)}
            >
              <p>Add new board</p>
            </div>
          </li>
          {boards.length > 0 &&
            boards.map((board) => {
              return (
                <li>
                  <div
                    className={styles.boardCard}
                    key={board.id}
                    style={{
                      backgroundImage: `url(${board.imageUrl})`,
                    }}
                  >
                    <div>{board.name}</div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};
