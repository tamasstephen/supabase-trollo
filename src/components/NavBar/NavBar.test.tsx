import { NavBar } from "./NavBar";
import { render, screen, act } from "@testing-library/react";
import * as hooks from "@/hooks/useAuthContext";
import { SupabaseClient } from "@supabase/supabase-js";
import { MemoryRouter } from "react-router";
import { Dispatch, useState } from "react";
import userEvent from "@testing-library/user-event";

let setSignedIn: Dispatch<boolean>;
const mockedUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

const mockUseAuthContext = jest.spyOn(hooks, "useAuthContext");

const mockSetToSignedIn = jest.fn();
const mockSetToSignedOut = jest.fn();

const setUpMockedAuthContext = (initialSignIn: boolean, session?: object) => {
  return mockUseAuthContext.mockImplementation(() => {
    const [isSignedIn, setIsSignedIn] = useState(initialSignIn);
    setSignedIn = setIsSignedIn;
    return {
      loading: false,
      isSignedIn,
      setToSignedIn: mockSetToSignedIn,
      setToSignedOut: mockSetToSignedOut,
      supabaseClient: {
        auth: {
          signOut: () => {},
          getSession: () => Promise.resolve({ data: session }), //Promise.resolve({ data: "{}" }),
          onAuthStateChange: () => ({ data: { session: {} } }),
        },
      } as unknown as SupabaseClient,
    };
  });
};

describe("Navbar", () => {
  test("NavBar shoud render correctly", () => {
    setUpMockedAuthContext(false, {});
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    screen.getByTestId("navbar");
  });

  test("Navbar should call should render logout if user is signed in", () => {
    setUpMockedAuthContext(false, {});
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    act(() => setSignedIn(true));

    screen.getByText("logout");
  });

  test("Navbar should call should render logout if user is signed in", async () => {
    setUpMockedAuthContext(false, {});
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    act(() => setSignedIn(true));

    const button = screen.getByText("logout");
    await user.click(button);

    expect(mockSetToSignedOut).toHaveBeenCalled();
  });

  test("Navbar renders with logout button if initial state is signed in", async () => {
    setUpMockedAuthContext(true, { session: "text" });
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );

    screen.getByText("logout");
  });

  test("Navbar navigates when logo is clicked", async () => {
    setUpMockedAuthContext(true, { session: "text" });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    const logo = screen.getByRole("link");
    await user.click(logo);

    expect(mockedUseNavigate).toHaveBeenCalled();
  });
});
