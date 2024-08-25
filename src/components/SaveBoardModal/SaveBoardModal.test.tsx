import { SaveBoardModal } from "./SaveBoardModal";
import {
  screen,
  render,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { useSaveBoard } from "@/hooks";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

jest.mock("../../hooks/api/useSaveBoard.tsx");

const mockedUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

const mockUseSaveBoard = useSaveBoard as jest.MockedFunction<
  typeof useSaveBoard
>;
const mockCloseModal = jest.fn();
const mockSaveBoard = jest.fn(() => {
  return Promise.resolve({ id: 1, title: "title" });
});

jest.mock("./SaveLoading.tsx", () => ({
  SaveLoading: () => <p>Loading</p>,
}));
jest.mock("./SaveError.tsx", () => ({
  SaveError: () => <p>Error</p>,
}));

const setupUseSaveBoard = (loading: boolean, error: boolean) => {
  return mockUseSaveBoard.mockReturnValue({
    loading,
    error,
    saveBoard: mockSaveBoard,
  });
};

describe("SaveBoardModal", () => {
  test("SaveBoardModal appears on the screen", () => {
    setupUseSaveBoard(false, false);
    render(<SaveBoardModal closeModal={mockCloseModal} />);

    screen.getByText("Save Board");
  });

  test("Loading appears during fetching", () => {
    setupUseSaveBoard(true, false);
    render(<SaveBoardModal closeModal={mockCloseModal} />);

    screen.getByText("Loading");
  });

  test("Loading appears during fetching", () => {
    setupUseSaveBoard(false, true);
    render(<SaveBoardModal closeModal={mockCloseModal} />);

    screen.getByText("Error");
  });

  test("close function is called after clicking the close button", async () => {
    const user = userEvent.setup();
    setupUseSaveBoard(false, false);
    render(<SaveBoardModal closeModal={mockCloseModal} />);

    const closeButton = screen.getByTestId("close");
    await user.click(closeButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });

  test("save function is called", async () => {
    setupUseSaveBoard(false, false);
    const user = userEvent.setup();
    const inputValue = "goodboard";
    render(<SaveBoardModal closeModal={mockCloseModal} />);

    const saveButton = screen.getByText("Save Board");

    const input = screen.getByTestId("boardname");
    await user.type(input, inputValue);
    act(() => fireEvent.submit(saveButton));

    await waitFor(() => expect(mockSaveBoard).toHaveBeenCalled());
  });

  test("user is able to type the board name", async () => {
    const user = userEvent.setup();
    const inputValue = "goodboard";
    setupUseSaveBoard(false, false);
    render(<SaveBoardModal closeModal={mockCloseModal} />);

    const input = screen.getByTestId("boardname");
    await user.type(input, inputValue);

    expect(input).toHaveValue(inputValue);
  });

  test("user is able to interact with the file upload input", async () => {
    const user = userEvent.setup();
    const file = new File(["foo"], "foo.png", { type: "image/png" });
    setupUseSaveBoard(false, false);

    render(<SaveBoardModal closeModal={mockCloseModal} />);

    const input = screen.getByLabelText("Board cover") as HTMLInputElement;
    await user.upload(input, file);
    const inputFiles = input.files;
    const inputValue = inputFiles ? inputFiles.length : null;

    expect(inputValue).toBeTruthy();
  });
});
