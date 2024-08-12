import { useAuth } from "./useAuth";
import { act, renderHook } from "@testing-library/react";

describe("useAuth", () => {
  test("initial states are available", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.supabaseClient).toBeTruthy();
  });

  test("user is able to sign in", () => {
    const { result } = renderHook(() => useAuth());

    act(() => result.current.setToSignedIn());

    expect(result.current.isSignedIn).toBe(true);
  });

  test("user is able to sign out", () => {
    const { result } = renderHook(() => useAuth());

    act(() => result.current.setToSignedIn());

    expect(result.current.isSignedIn).toBe(true);

    act(() => result.current.setToSignedOut());

    expect(result.current.isSignedIn).toBe(false);
  });
});
