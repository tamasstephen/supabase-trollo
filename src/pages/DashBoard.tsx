import { SyntheticEvent, useState } from "react";
import styles from "@/styles/Dashboard.module.scss";
import {
  Error,
  SaveBoardModal,
  BoardCard,
  Loading,
  Portal,
} from "@/components/";
import { useNavigate } from "react-router-dom";
import { useFetch, useFetchBoardCovers } from "@/hooks";
import { TableNames } from "@/constants";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const { data, isError, isPending } = useFetch(
    "board",
    TableNames.BOARD,
    false
  );

  const {
    data: boards,
    isError: coverError,
    isPending: coverPending,
  } = useFetchBoardCovers(data);

  const closeModal = () => setIsPortalOpen(false);

  const openModal = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsPortalOpen(true);
  };

  const openBoard = (e: SyntheticEvent, id: number) => {
    e.preventDefault();

    navigate(`/board/${id}`);
  };

  if (isError || coverError) {
    return <Error />;
  }

  if (isPending || coverPending) {
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
        <h1>Boards</h1>
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
