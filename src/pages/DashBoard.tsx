import { SyntheticEvent, useEffect, useState } from "react";
import { useAuthContext } from "../hooks";
import { Board } from "../types";
import { fetchBoards } from "../api";
import styles from "../styles/Dashboard.module.scss";
import { Portal } from "../components";
import { SaveBoardModal } from "../components";
import { BoardCard } from "../components/BoardCard";

export const Dashboard = () => {
  const { supabaseClient } = useAuthContext();
  const [boards, setBoards] = useState<Board[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  const closeModal = () => setIsPortalOpen(false);

  const openModal = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsPortalOpen(true);
  };

  const openBoard = (e: SyntheticEvent, title?: string) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log(title);
  };

  useEffect(() => {
    fetchBoards(supabaseClient, setFetchError, setBoards, setIsLoading);
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
          <SaveBoardModal closeModal={closeModal} />
        </Portal>
      )}
      <div>
        <h1>Dashboard</h1>
      </div>
      <div>
        <ul className={styles.cardList}>
          <li>
            <BoardCard
              title="Add new board"
              imageUrl=""
              callback={openModal}
              addNewBoard={true}
            />
          </li>
          {boards.length > 0 &&
            boards.map((board) => {
              return (
                <li key={board.id}>
                  <BoardCard
                    title={board.name}
                    imageUrl={board.imageUrl}
                    callback={openBoard}
                  />
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};
