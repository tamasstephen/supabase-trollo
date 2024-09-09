import { Dashboard } from "./DashBoard";
import { render, screen, waitFor } from "@testing-library/react";
import { PropsWithChildren } from "react";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "@/components";

const supaBaseMockEndpoint = "https://www.url.com";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off
      retry: false,
    },
  },
});

interface WrapperProps extends PropsWithChildren {}
const wrapper = ({ children }: WrapperProps) => (
  <QueryClientProvider client={queryClient}>
    <div id="portal"></div>
    <AuthContextProvider>{children}</AuthContextProvider>
  </QueryClientProvider>
);

const boards = [
  { id: 1, title: "first board" },
  { id: 2, title: "second board" },
];
const setupNock = (
  code: 200 | 404 = 200,
  payload: { id: number; title: string }[] | Error = boards
) => {
  return nock(supaBaseMockEndpoint)
    .get("/rest/v1/boards?select=*")
    .reply(code, payload);
};

const mockedUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

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

describe("Dashboard", () => {
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
  test("the dashboard shows the loading screen if boards are loading", async () => {
    //setupNock();
    setupNock(404, new Error("no connection"));
    render(<Dashboard />, { wrapper });

    await waitFor(() =>
      expect(screen.getByText("Loading")).toBeInTheDocument()
    );
  });

  test("the dashboard shows the error screen if an error occurs", async () => {
    setupNock(404, new Error("no connection"));
    render(<Dashboard />, { wrapper });

    await waitFor(() => expect(screen.getByText("Error")).toBeInTheDocument());
  });

  test("boards are rendering properly", async () => {
    setupNock();
    render(<Dashboard />, { wrapper });

    const firstCard = await screen.findByText(boards[0].title);
    const secondCard = await screen.findByText(boards[1].title);

    await waitFor(() => {
      expect(firstCard).toBeInTheDocument();
      expect(secondCard).toBeInTheDocument();
    });
  });

  test("portal is opened when add board is clicked", async () => {
    setupNock();
    const user = userEvent.setup();
    render(<Dashboard />, { wrapper });

    const button = await screen.findByText("Add new board");
    await user.click(button);
    const portal = await screen.findByText("Portal");

    expect(portal).toBeInTheDocument();
  });

  test("navigates to a new page if board is clicked", async () => {
    setupNock();
    const user = userEvent.setup();
    render(<Dashboard />, { wrapper });

    const button = await screen.findByText(boards[0].title);
    await user.click(button);

    expect(mockedUseNavigate).toHaveBeenCalled();
  });
});
