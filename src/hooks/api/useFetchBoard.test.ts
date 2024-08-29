import { SupabaseClient } from "@supabase/supabase-js";
import * as hooks from "@/hooks/useAuthContext";
import { useFetchBoard } from "./useFetchBoard";
import { renderHook, waitFor } from "@testing-library/react";

const mockUseAuthContext = jest.spyOn(hooks, "useAuthContext");
const mockBoardData = [{ id: 1, title: "title" }];

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
              return { select: mockedBoard };
            },
          } as unknown as SupabaseClient)
        : null,
    };
  });
};

describe("useFetchBoard", () => {
  test("it loads the board data", async () => {
    setupMockUseAuthContext();
    const { result } = renderHook(() => useFetchBoard("1"));

    await waitFor(() =>
      expect(result.current.data?.id).toBe(mockBoardData[0].id)
    );
  });

  test("it sets error to true if an error occurs", async () => {
    setupMockUseAuthContext(true);
    const { result } = renderHook(() => useFetchBoard("1"));

    await waitFor(() => expect(result.current.error).toBe(true));
  });
});
