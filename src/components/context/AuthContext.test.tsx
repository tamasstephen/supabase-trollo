import { useAuthContext } from "@/hooks";
import { AuthContextProvider } from "./AuthContext";
import { render, screen } from "@testing-library/react";
import { useAuth } from "@/hooks";
import userEvent from "@testing-library/user-event";

const mockSetToSignedIn = jest.fn();
const mockSetToSignedOut = jest.fn();
const mockIsSignedIn = false;
const supabaseClient = null;

const TestComponent = () => {
  const { isSignedIn, setToSignedIn, setToSignedOut, supabaseClient } =
    useAuthContext();
  return (
    <div>
      <button onClick={setToSignedIn}>login</button>
      <button onClick={setToSignedOut}>logout</button>
      <p>{isSignedIn.toString()}</p>
      <p>{supabaseClient ? "have clinet" : "no client"}</p>
    </div>
  );
};

jest.mock("../../hooks/useAuth.tsx");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("AuthContext", () => {
  test("AuthContext returns the signedIn state", () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: mockIsSignedIn,
      setToSignedIn: mockSetToSignedIn,
      setToSignedOut: mockSetToSignedOut,
      supabaseClient,
      loading: false,
    });
    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    screen.getByText("false");
  });

  test("setToSignedIn is called", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      setToSignedIn: mockSetToSignedIn,
      setToSignedOut: mockSetToSignedOut,
      supabaseClient: null,
      loading: false,
    });
    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    const button = screen.getByText("login");
    await user.click(button);

    expect(mockSetToSignedIn).toHaveBeenCalled();
  });

  test("setToSignedOut is called", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      setToSignedIn: mockSetToSignedIn,
      setToSignedOut: mockSetToSignedOut,
      supabaseClient: null,
      loading: false,
    });
    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    const button = screen.getByText("logout");
    await user.click(button);

    expect(mockSetToSignedOut).toHaveBeenCalled();
  });

  test("setToSignedOut is called", async () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      setToSignedIn: mockSetToSignedIn,
      setToSignedOut: mockSetToSignedOut,
      supabaseClient: null,
      loading: false,
    });
    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    const p = screen.getByText("no client");

    expect(p.textContent).toEqual("no client");
  });
});
