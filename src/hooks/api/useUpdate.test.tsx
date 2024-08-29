import { SupabaseClient } from "@supabase/supabase-js";
import * as hooks from "@/hooks/useAuthContext";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useUpdate } from "./useUpdate";
import { TableNames } from "@/constants";

const mockUseAuthContext = jest.spyOn(hooks, "useAuthContext");
const mockBoardData = { id: 1, title: "title" };

const setupMockUseAuthContext = (
  boardError: boolean = false,
  sbClient: boolean = true
) => {
  const mockedBoard = jest.fn(() => {
    return {
      eq: jest.fn(() => ({ data: mockBoardData, error: boardError })),
    };
  });

  return mockUseAuthContext.mockImplementation(() => {
    return {
      isSignedIn: true,
      loading: false,
      setToSignedIn: () => {},
      setToSignedOut: () => {},
      supabaseClient: sbClient
        ? ({
            from: () => {
              return { update: mockedBoard };
            },
          } as unknown as SupabaseClient)
        : null,
    };
  });
};

describe("useUpdate", () => {
  test("it updates the selected item", async () => {
    setupMockUseAuthContext();
    const { result } = renderHook(() => useUpdate());

    waitFor(() => {
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(false);
      expect(result.current.loading).toBe(false);
    });
    await act(() => result.current.updateItem(mockBoardData, TableNames.BOARD));
  });

  test("it sets error to true if client is not available", async () => {
    setupMockUseAuthContext(false, false);
    const { result } = renderHook(() => useUpdate());

    waitFor(() => {
      expect(result.current.error).toBe(true);
    });

    await act(() => result.current.updateItem(mockBoardData, TableNames.BOARD));
  });

  test("it sets error to true if the update returns with an error", async () => {
    setupMockUseAuthContext(true, true);
    const { result } = renderHook(() => useUpdate());

    waitFor(() => {
      expect(result.current.error).toBe(true);
    });

    await act(() => result.current.updateItem(mockBoardData, TableNames.BOARD));
  });
});
