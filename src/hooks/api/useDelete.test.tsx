import { SupabaseClient } from "@supabase/supabase-js";
import * as hooks from "@/hooks/useAuthContext";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useDelete } from "./useDelete";
import { TableNames } from "@/constants";

const mockUseAuthContext = jest.spyOn(hooks, "useAuthContext");

const setupMockUseAuthContext = (error: boolean, client: boolean = true) => {
  const mockedDelete = jest.fn(() => ({
    eq: jest.fn(() => (error ? { error } : {})),
  }));
  if (client) {
    return mockUseAuthContext.mockImplementation(() => {
      return {
        isSignedIn: true,
        loading: false,
        setToSignedIn: () => {},
        setToSignedOut: () => {},
        supabaseClient: {
          from: () => {
            return { delete: mockedDelete };
          },
        } as unknown as SupabaseClient,
      };
    });
  } else {
    return null;
  }
};

describe("useDelete", () => {
  test("hook renders with initial states", () => {
    setupMockUseAuthContext(false);
    const { result } = renderHook(() => useDelete());

    expect(result.current.error).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  test("hook sets loading to true if loading", async () => {
    setupMockUseAuthContext(false);
    const { result } = renderHook(() => useDelete());

    waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => await result.current.deleteItem(1, TableNames.BOARD));
    expect(result.current.error).toBe(false);
  });

  test("hook sets error to true if an error occurs", async () => {
    setupMockUseAuthContext(true);
    const { result } = renderHook(() => useDelete());

    await act(async () => await result.current.deleteItem(1, TableNames.BOARD));

    expect(result.current.error).toBe(true);
  });

  test("hook returns with error if SupabaseClient is not available", async () => {
    setupMockUseAuthContext(false, false);
    const { result } = renderHook(() => useDelete());
    await act(async () => await result.current.deleteItem(1, TableNames.BOARD));

    expect(result.current.error).toBe(true);
  });
});
