import { TableNames } from "@/constants";
import { useFetch } from "@/hooks";
import { Outlet, useNavigate } from "react-router-dom";
import styles from "@/styles/SideBar.module.scss";
import BoardIcon from "@/assets/table.svg";

export const SideBar = () => {
  const navigate = useNavigate();
  const {
    data: boards,
    isError,
    isLoading,
  } = useFetch("board", TableNames.BOARD, false);
  if (isError) {
    return <div>Error</div>;
  }
  if (isLoading) {
    return <div>Loading</div>;
  }
  return (
    <div className={styles.wrapper}>
      <section>
        <div>
          <div className={styles.header}>
            <BoardIcon />
            <h3>Your Boards</h3>
          </div>
          <ul>
            {boards?.map((board) => (
              <li key={board.id}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`board/${board.id}`);
                  }}
                  href=""
                >
                  {board.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section>
        <Outlet />
      </section>
    </div>
  );
};
