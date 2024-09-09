import { Board } from "@/pages/";
import { act, PropsWithChildren } from "react";
import { BoardColumnType, Task } from "@/types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "@/components";

interface WrapperProps extends PropsWithChildren {}

const supaBaseMockEndpoint = "https://www.url.com";
const mockedUseNavigate = jest.fn();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off
      retry: false,
    },
  },
});
const wrapper = ({ children }: WrapperProps) => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <div id="portal"></div>
      {children}
    </AuthContextProvider>
  </QueryClientProvider>
);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

const mockBoardColumns: BoardColumnType[] = [
  {
    id: 1,
    title: "board title",
    index: 0,
  },
];

const mockTasks: Task[] = [{ id: 1, title: "title", board_id: 1, index: 0 }];

const setupBoard = () =>
  render(
    <MemoryRouter initialEntries={["/board/1"]}>
      <Routes>
        <Route path="/board/:id" element={<Board />} />
      </Routes>
    </MemoryRouter>,
    { wrapper }
  );

const setupNock = () =>
  nock(supaBaseMockEndpoint)
    .persist()
    .get("/rest/v1/boards?select=*&id=eq.1")
    .reply(200, [{ title: "Board", id: 1 }])
    .get("/rest/v1/board_column?select=*&board_id=eq.1")
    .reply(200, mockBoardColumns)
    .get(`/rest/v1/task?select=*&board_id=eq.1&order=index.asc`)
    .reply(200, mockTasks);

describe("Board", () => {
  beforeEach(() => {
    global.structuredClone = jest.fn((val) => {
      return JSON.parse(JSON.stringify(val));
    });
  });
  afterEach(function () {
    nock.cleanAll();
    nock.restore();
    nock.activate();
  });

  test("board renders", async () => {
    setupNock();

    setupBoard();

    await waitFor(() => expect(screen.getByText("Board")).toBeInTheDocument());
  });

  test("it adds a new task to the columns", async () => {
    const user = userEvent.setup();

    setupNock()
      .post("/api/task")
      .reply(200, [{ title: "abc", index: 1, id: 2, boardId: 1 }])
      .post("/rest/v1/task?select=*")
      .reply(200, [{ title: "abc", index: 1, id: 2, boardId: 1 }])
      .get(`/rest/v1/task?select=*&board_id=eq.1`)
      .reply(200, [
        ...mockTasks,
        [{ title: "abc", index: 1, id: 2, boardId: 1 }],
      ]);

    setupBoard();

    await waitFor(() => expect(screen.getByText("Board")).toBeInTheDocument());

    const addTaskButton = screen.getByText("Add new task");
    screen.getByText("board title");
    await act(async () => await user.click(addTaskButton));

    const textArea = screen.getByTestId("textarea");
    await user.type(textArea, "abc{enter}");

    await waitFor(() => screen.getByText("abc"));
  });

  test("it deletes the column", async () => {
    const user = userEvent.setup();

    setupNock().delete("/rest/v1/board_column?id=eq.1").reply(200);

    setupBoard();

    await waitFor(() => expect(screen.getByText("Board")).toBeInTheDocument());

    const deleteButton = screen.getByTestId("deletecolumn");
    const column = screen.getByText("board title");
    await user.click(deleteButton);

    await waitFor(() => expect(column).not.toBeInTheDocument());
  });
  test("it adds a new column", async () => {
    const user = userEvent.setup();
    const columnTitle = "A new column title";

    setupNock()
      .post("/rest/v1/board_column")
      .reply(200, [
        {
          id: 2,
          title: "another",
          index: 1,
        },
      ])
      .post("/rest/v1/board_column?select=*")
      .reply(200, [
        {
          id: 2,
          title: "another",
          index: 1,
        },
      ]);

    setupBoard();

    await waitFor(() => expect(screen.getByText("Board")).toBeInTheDocument());

    const addColumnButton = screen.getByTestId("addcolumn");
    await user.click(addColumnButton);

    expect(screen.getByText("Create a new list")).toBeInTheDocument();
    const textArea = screen.getByTestId("columntitle");
    await user.type(textArea, columnTitle);
    const addButton = screen.getByText("Add new list");
    await user.click(addButton);

    await waitFor(() =>
      expect(screen.getByText(columnTitle)).toBeInTheDocument()
    );
  });

  test("it shows a modal if user clicks on the delete board button", async () => {
    const user = userEvent.setup();

    setupNock()
      .delete("/rest/v1/board?id=eq.1")
      .reply(200)
      .get("/rest/v1/task?select=*&board_id=eq.2&order=index.asc")
      .reply(200, []);

    setupBoard();

    await waitFor(() => expect(screen.getByText("Board")).toBeInTheDocument());

    const openModal = screen.getByTestId("opendeletemodal");
    await user.click(openModal);

    const modal = screen.getByText(
      "Are you sure you want to delete this board?"
    );

    await waitFor(() => expect(modal).toBeInTheDocument());
  });

  test("it deletes the board", async () => {
    const user = userEvent.setup();

    setupNock()
      .delete("/rest/v1/board?id=eq.1")
      .reply(200)
      .get("/rest/v1/task?select=*&board_id=eq.2&order=index.asc")
      .reply(200, []);

    setupBoard();

    await waitFor(() => expect(screen.getByText("Board")).toBeInTheDocument());

    const modalButton = screen.getByTestId("opendeletemodal");
    await user.click(modalButton);

    screen.getByText("Are you sure you want to delete this board?");

    const deleteButton = screen.getByText("Delete");

    await user.click(deleteButton);

    await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalled());
  });
});
