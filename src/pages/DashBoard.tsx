import { SyntheticEvent, useState } from "react";
import { useFetchBoards } from "@/hooks/";
import styles from "@/styles/Dashboard.module.scss";
import { Loading, Portal } from "@/components";
import { SaveBoardModal } from "@/components";
import { BoardCard } from "@/components/BoardCard";
import { Error } from "@/components/";
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

  const openBoard = (e: SyntheticEvent, title?: string) => {
    e.preventDefault();
    // eslint-disable-next-line no-console
    console.log(title);
    // TODO: update when board page is available
    navigate("/");
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
