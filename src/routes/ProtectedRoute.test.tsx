import * as hooks from "@/hooks";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { render, screen, waitFor } from "@testing-library/react";

const mockedAuthContext = jest.spyOn(hooks, "useAuthContext");

const setupMockAuthContext = (isSignedIn: boolean, loading: boolean) =>
  mockedAuthContext.mockReturnValue({
    isSignedIn,
    loading,
    setToSignedIn: jest.fn(),
    setToSignedOut: jest.fn(),
    supabaseClient: null,
  });

jest.mock("../components/Loading", () => ({
  Loading: () => <h2>Load</h2>,
}));

const MockChild = () => <h2>Dashboard</h2>;

describe("ProtectedRoute", () => {
  test("it shows loading screen while loading", () => {
    setupMockAuthContext(false, true);
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockChild />
        </ProtectedRoute>
      </MemoryRouter>
    );
    const loadingScreen = screen.getByText("Load");

    expect(loadingScreen).toBeInTheDocument();
  });

  test("it redirects to the login if user is not logged in", async () => {
    setupMockAuthContext(false, false);
    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MockChild />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Login</p>} />
        </Routes>
      </MemoryRouter>
    );
    const loginScreen = screen.getByText("Login");
    await waitFor(() => expect(loginScreen).toBeInTheDocument());
  });

  test("it renders the protected page", () => {
    setupMockAuthContext(true, false);
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockChild />
        </ProtectedRoute>
      </MemoryRouter>
    );
    const dashboard = screen.getByText("Dashboard");

    expect(dashboard).toBeInTheDocument();
  });
});
