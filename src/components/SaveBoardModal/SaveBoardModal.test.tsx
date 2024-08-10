import { SaveBoardModal } from "./SaveBoardModal";
import { screen, render, fireEvent } from "@testing-library/react";
import { useSaveBoard } from "@/hooks";
import { BoardsFormElement } from "@/types";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

jest.mock("../../hooks/api/useSaveBoard.tsx");

const mockUseSaveBoard = useSaveBoard as jest.MockedFunction<
  typeof useSaveBoard
>;
const mockCloseModal = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockSaveBoard = jest.fn((event: React.FormEvent<BoardsFormElement>) => {
  event.preventDefault();
  return Promise.resolve();
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

  test("save function is called", () => {
    setupUseSaveBoard(false, false);
    render(<SaveBoardModal closeModal={mockCloseModal} />);

    const saveButton = screen.getByText("Save Board");
    fireEvent.submit(saveButton);

    expect(mockSaveBoard).toHaveBeenCalled();
  });

  test("user is able to type the board name", async () => {
    const user = userEvent.setup();
    const inputValue = "goodboard";
    setupUseSaveBoard(false, false);
    render(<SaveBoardModal closeModal={mockCloseModal} />);

    const input = screen.getByLabelText("Board title *");
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
