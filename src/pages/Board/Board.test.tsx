import { Board } from "@/pages/";
import * as hooks from "@/hooks";
import { TaskFormElement } from "@/types/FormTypes";
import {
  Dispatch,
  FormEvent,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  ContainerListProps,
  DraggableBoardContainer,
  UpdateColumnProps,
  UpdateTaskProps,
} from "@/types";
import { BoardPrefixes, TableNames } from "@/constants";
import { DbObject } from "@/types/Board";
import { SavePayload } from "@/hooks/api/useSave";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

interface WrapperProps extends PropsWithChildren {}

const mockedUseNavigate = jest.fn();
const Wrapper = ({ children }: WrapperProps) => (
  <div id="portal">{children}</div>
);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

const mockBoardColumns: DraggableBoardContainer[] = [
  {
    id: `${BoardPrefixes.COLUMN}-1`,
    title: "board title",
    items: [
      { id: `${BoardPrefixes.ITEM}-3`, title: "title" },
      { id: `${BoardPrefixes.ITEM}-4`, title: "title-card2" },
    ],
    index: 1,
  },
  {
    id: `${BoardPrefixes.COLUMN}-2`,
    title: "board title2",
    items: [{ id: `${BoardPrefixes.ITEM}-5`, title: "title" }],
    index: 2,
  },
  {
    id: `${BoardPrefixes.COLUMN}-3`,
    title: "board title3",
    items: [{ id: `${BoardPrefixes.ITEM}-6`, title: "title" }],
    index: 2,
  },
];

const mockUpdateItem = jest.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (payload: UpdateColumnProps | UpdateTaskProps, tableName: TableNames) =>
    Promise.resolve()
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockDeleteItem = jest.fn((itemId: number, tableName: TableNames) =>
  Promise.resolve(undefined)
);

const mockSaveToDb = jest.fn(
  async <T extends DbObject>(
    payload: SavePayload,
    _tabeName: string
  ): Promise<T | undefined> => {
    if (_tabeName === "error") return;
    return payload as T;
  }
) as unknown as <T extends DbObject>(
  payload: SavePayload,
  tabeName: string
) => Promise<T | undefined>;

let columns: DraggableBoardContainer[] = [];

jest.mock("./components/ContainerList", () => ({
  ContainerList: ({
    boardColumns,
    addNewTask,
    deleteBoardContainer,
    deleteTask,
  }: ContainerListProps) => {
    useEffect(() => {
      columns = boardColumns;
    }, [boardColumns]);
    return (
      <div>
        <input type="text" name="taskTitle" id="taskTitle" />
        <button>Add task</button>
        <button
          onClick={() => deleteTask(`${mockBoardColumns[1].items[0].id}`)}
        >
          Delete Task
        </button>
        <button onClick={() => deleteBoardContainer(mockBoardColumns[2].id)}>
          Delete container
        </button>
        <form
          action=""
          onSubmit={(e: FormEvent<TaskFormElement>) =>
            addNewTask(e, mockBoardColumns[0].id)
          }
        >
          <textarea
            id="taskTitle"
            name="taskTitle"
            defaultValue="A new card"
          ></textarea>
          <button type="submit">Add new task</button>
        </form>
        <ul>
          {boardColumns.map((column, id) => (
            <p key={id}>{column.title}</p>
          ))}
        </ul>
      </div>
    );
  },
}));

const mockUseFetchBoard = jest.spyOn(hooks, "useFetchBoard");
const mockUseFetchBoardColumns = jest.spyOn(hooks, "useFetchBoardColumns");
const mockUseUpdate = jest.spyOn(hooks, "useUpdate");
const mockDelete = jest.spyOn(hooks, "useDelete");
const mockSave = jest.spyOn(hooks, "useSave");

beforeEach(() => {
  mockUseFetchBoard.mockImplementation(() => {
    const [error] = useState(false);
    const [loading] = useState(false);
    const [data] = useState({ title: "Board", id: 1 });
    return { error, loading, data };
  });
  mockUseFetchBoardColumns.mockImplementation(
    (
      boardId: number,
      setBoardColumns: Dispatch<SetStateAction<DraggableBoardContainer[]>>
    ) => {
      useEffect(() => {
        setBoardColumns(mockBoardColumns);
      }, [setBoardColumns, boardId]);

      return { error: false, loading: false };
    }
  );
  mockUseUpdate.mockImplementation(() => ({
    error: false,
    loading: false,
    updateItem: mockUpdateItem,
  }));
  mockDelete.mockImplementation(() => ({
    error: false,
    loading: false,
    deleteItem: mockDeleteItem,
  }));
  mockSave.mockImplementation(() => ({
    loading: false,
    error: false,
    saveToDb: mockSaveToDb,
  }));
});

describe("Board", () => {
  test("board renders", async () => {
    render(<Board />);
    await waitFor(() => expect(screen.getByText("Board")).toBeInTheDocument());
  });

  test("it adds a new task to the columns", async () => {
    const user = userEvent.setup();
    render(<Board />);

    const addTaskButton = screen.getByText("Add new task");
    await user.click(addTaskButton);

    expect(columns[0].items.length).toBe(3);
  });

  test("it deletes a board column", async () => {
    const user = userEvent.setup();
    render(<Board />);

    const deleteContainerButton = screen.getByText("Delete container");
    await user.click(deleteContainerButton);

    await waitFor(() => expect(columns.length).toBe(2));
  });

  test("it deletes the task", async () => {
    const user = userEvent.setup();
    render(<Board />);

    const deleteTaskButton = screen.getByText("Delete Task");
    await user.click(deleteTaskButton);

    await waitFor(() => expect(columns[1].items.length).toBe(0));
  });

  test("it opens the add column modal", async () => {
    const user = userEvent.setup();
    render(<Board />, { wrapper: Wrapper });

    const addColumn = screen.getByText("Add list");
    await user.click(addColumn);

    const modalTitle = screen.getByText("Create a new list");

    expect(modalTitle).toBeInTheDocument();
  });

  test("it opens the delete board modal", async () => {
    const user = userEvent.setup();
    render(<Board />, { wrapper: Wrapper });

    const deleteButton = screen.getByText("Delete Board");
    await user.click(deleteButton);

    const modalTitle = screen.getByText(
      "Are you sure you want to delete this board?"
    );

    expect(modalTitle).toBeInTheDocument();
  });
});
