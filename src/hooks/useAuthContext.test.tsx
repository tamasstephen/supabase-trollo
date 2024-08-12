import { AuthContextProvider } from "@/components";
import { act, PropsWithChildren } from "react";
import { useAuthContext } from "./useAuthContext";
import { renderHook } from "@testing-library/react";

const wrapper = ({ children }: PropsWithChildren) => (
  <AuthContextProvider>{children}</AuthContextProvider>
);

describe("useAuthContext", () => {
  test("useAuthContext contains the initial values", () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.supabaseClient).toBeTruthy();
  });
  test("user is able to sign in", () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    act(() => result.current.setToSignedIn());

    expect(result.current.isSignedIn).toBe(true);
  });
  test("user is able to sign out", () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    act(() => result.current.setToSignedIn());

    expect(result.current.isSignedIn).toBe(true);

    act(() => result.current.setToSignedOut());

    expect(result.current.isSignedIn).toBe(false);
  });
});
