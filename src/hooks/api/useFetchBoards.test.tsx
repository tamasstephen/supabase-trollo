import * as hooks from "@/hooks/useAuthContext";
import { useFetchBoards } from "./useFetchBoards";
import { SupabaseClient } from "@supabase/supabase-js";
import { Board } from "@/types";
import { renderHook, waitFor } from "@testing-library/react";

const mockUseAuthContext = jest.spyOn(hooks, "useAuthContext");

const mockedData: Board[] = [
  { title: "First Board", id: 1, background: "/path/1" },
  { title: "Second Board", id: 2 },
];

const mockedDownload = jest.fn(() => ({
  mock: "object",
}));

const setupMockUseAuthContext = (error: boolean) => {
  const mockedSelect = jest.fn(() => {
    return { data: mockedData, error };
  });
  return mockUseAuthContext.mockImplementation(() => {
    return {
      isSignedIn: true,
      loading: false,
      setToSignedIn: () => {},
      setToSignedOut: () => {},
      supabaseClient: {
        from: () => {
          return { select: mockedSelect };
        },
        storage: {
          from: () => ({ download: mockedDownload }),
        },
      } as unknown as SupabaseClient,
    };
  });
};

describe("useFetchBoards", () => {
  test("useFetchBoards returns the boards", async () => {
    setupMockUseAuthContext(false);

    const { result } = renderHook(() => useFetchBoards());

    await waitFor(() => expect(result.current.data?.length).toBe(2));
  });

  test("useFetchBoard returns error", async () => {
    setupMockUseAuthContext(true);

    const { result } = renderHook(() => useFetchBoards());

    await waitFor(() => expect(result.current.data?.length).toBeFalsy());
    await waitFor(() => expect(result.current.error).toBeTruthy());
  });
  test("useFetchBoard loading", async () => {
    setupMockUseAuthContext(false);

    const { result } = renderHook(() => useFetchBoards());

    await waitFor(() => expect(result.current.loading).toBeTruthy());
  });
});
