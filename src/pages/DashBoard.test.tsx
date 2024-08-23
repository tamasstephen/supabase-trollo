import { Board } from "@/types";
import { Dashboard } from "./DashBoard";
import { useFetchBoards } from "@/hooks";
import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import userEvent from "@testing-library/user-event";

jest.mock("../hooks/api/useFetchBoards.tsx");

const boards = [
  { id: 1, title: "first board" },
  { id: 2, title: "second board" },
];

const mockedUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

const mockedUseFetchBoards = useFetchBoards as jest.MockedFunction<
  typeof useFetchBoards
>;

jest.mock("../components/Loading/Loading.tsx", () => ({
  Loading: () => <p>Loading</p>,
}));
jest.mock("../components/Error/Error.tsx", () => ({
  Error: () => <p>Error</p>,
}));
jest.mock("../components/Portal/Portal.tsx", () => ({
  Portal: ({ children }: PropsWithChildren) => (
    <div>
      {children}
      <p>Portal</p>
    </div>
  ),
}));

const setupMockUseFetchBoards = (
  loading: boolean,
  error: boolean,
  boards: Board[]
) => {
  return mockedUseFetchBoards.mockReturnValue({
    loading,
    error,
    data: boards,
  });
};

describe("Dashboard", () => {
  test("the dashboard shows the loading screen if boards are loading", () => {
    setupMockUseFetchBoards(true, false, []);
    render(<Dashboard />);

    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  test("the dashboard shows the error screen if an error occurs", () => {
    setupMockUseFetchBoards(false, true, []);
    render(<Dashboard />);

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  test("boards are rendering properly", () => {
    setupMockUseFetchBoards(false, false, boards);
    render(<Dashboard />);

    const firstCard = screen.getByText(boards[0].title);
    const secondCard = screen.getByText(boards[1].title);

    expect(firstCard).toBeInTheDocument();
    expect(secondCard).toBeInTheDocument();
  });

  test("portal is opened when add board is clicked", async () => {
    const user = userEvent.setup();
    setupMockUseFetchBoards(false, false, boards);
    render(<Dashboard />);

    const button = screen.getByText("Add new board");
    await user.click(button);
    const portal = screen.getByText("Portal");

    expect(portal).toBeInTheDocument();
  });

  test("navigates to a new page if board is clicked", async () => {
    const user = userEvent.setup();
    setupMockUseFetchBoards(false, false, boards);
    render(<Dashboard />);

    const button = screen.getByText(boards[0].title);
    await user.click(button);

    expect(mockedUseNavigate).toHaveBeenCalled();
  });
});
