import { SyntheticEvent, useState } from "react";
import { useFetchBoards } from "@/hooks/";
import styles from "@/styles/Dashboard.module.scss";
import {
  Error,
  SaveBoardModal,
  BoardCard,
  Loading,
  Portal,
} from "@/components/";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const { error, loading, data: boards } = useFetchBoards();
  const navigate = useNavigate();

  const closeModal = () => setIsPortalOpen(false);

  const openModal = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsPortalOpen(true);
  };

  const openBoard = (e: SyntheticEvent, id: number) => {
    e.preventDefault();

    navigate(`/board/${id}`);
  };

  if (error) {
    return <Error />;
  }

  if (loading) {
    return <Loading />;
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
          {boards &&
            boards.map((board) => {
              return (
                <li key={board.id}>
                  <BoardCard
                    title={board.title}
                    imageUrl={board.imageUrl}
                    callback={(e) => openBoard(e, board.id)}
                  />
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};
