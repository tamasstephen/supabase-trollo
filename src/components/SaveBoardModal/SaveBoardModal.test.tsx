import { SaveBoardModal } from "./SaveBoardModal";
import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "../context";
import nock from "nock";

const supaBaseMockEndpoint = "https://www.url.com";
interface WrapperProps extends PropsWithChildren {}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off
      retry: false,
    },
  },
});

const setupNock = (
  code: 200 | 404 = 200,
  payload: { title: string; id: number }[] | Error = [{ title: "Board", id: 1 }]
) =>
  nock(supaBaseMockEndpoint)
    .post("/rest/v1/boards")
    .reply(code, payload)
    .post("/rest/v1/boards?select=*")
    .reply(code, payload);

const wrapper = ({ children }: WrapperProps) => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <div id="portal"></div>
      {children}
    </AuthContextProvider>
  </QueryClientProvider>
);

const mockedUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

const mockCloseModal = jest.fn();

jest.mock("./SaveLoading.tsx", () => ({
  SaveLoading: () => <p>Loading</p>,
}));
jest.mock("./SaveError.tsx", () => ({
  SaveError: () => <p>Error</p>,
}));

describe("SaveBoardModal", () => {
  afterEach(function () {
    nock.cleanAll();
    nock.restore();
    nock.activate();
  });

  test("SaveBoardModal appears on the screen", () => {
    render(<SaveBoardModal closeModal={mockCloseModal} />, { wrapper });

    screen.getByText("Save Board");
  });

  test("Error appears during fetching", async () => {
    const user = userEvent.setup();
    const inputValue = "goodboard";
    setupNock(404, new Error("unable to connect"));
    render(<SaveBoardModal closeModal={mockCloseModal} />, { wrapper });

    const saveButton = screen.getByText("Save Board");

    const input = screen.getByTestId("boardname");
    await user.type(input, inputValue);
    await user.click(saveButton);

    await waitFor(() => expect(screen.getByText("Error")).toBeInTheDocument());
  });

  test("close function is called after clicking the close button", async () => {
    const user = userEvent.setup();

    render(<SaveBoardModal closeModal={mockCloseModal} />, { wrapper });

    const closeButton = screen.getByTestId("close");
    await user.click(closeButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });

  test("post request has been sent, and it shows a loading screen", async () => {
    setupNock();
    const user = userEvent.setup();
    const inputValue = "goodboard";
    render(<SaveBoardModal closeModal={mockCloseModal} />, { wrapper });

    const saveButton = screen.getByText("Save Board");

    const input = screen.getByTestId("boardname");
    await user.type(input, inputValue);
    await user.click(saveButton);

    await waitFor(() =>
      expect(screen.getByText("Loading")).toBeInTheDocument()
    );
  });

  test("user is able to type the board name", async () => {
    const user = userEvent.setup();
    const inputValue = "goodboard";

    render(<SaveBoardModal closeModal={mockCloseModal} />, { wrapper });

    const input = screen.getByTestId("boardname");
    await user.type(input, inputValue);

    expect(input).toHaveValue(inputValue);
  });

  test("user is able to interact with the file upload input", async () => {
    const user = userEvent.setup();
    const file = new File(["foo"], "foo.png", { type: "image/png" });

    render(<SaveBoardModal closeModal={mockCloseModal} />, { wrapper });

    const input = screen.getByLabelText("Board cover") as HTMLInputElement;
    await user.upload(input, file);
    const inputFiles = input.files;
    const inputValue = inputFiles ? inputFiles.length : null;

    expect(inputValue).toBeTruthy();
  });
});
