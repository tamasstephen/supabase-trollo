import { SupabaseClient } from "@supabase/supabase-js";
import * as hooks from "@/hooks/useAuthContext";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useUpdate } from "./useUpdate";
import { TableNames } from "@/constants";
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "@/components";

interface WrapperProps extends PropsWithChildren {}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off
      retry: false,
    },
  },
});
const wrapper = ({ children }: WrapperProps) => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <div id="portal"></div>
      {children}
    </AuthContextProvider>
  </QueryClientProvider>
);

const mockUseAuthContext = jest.spyOn(hooks, "useAuthContext");
const mockBoardData = { id: 1, title: "title", board_id: 1, index: 0 };

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
  test("it updates the selected item", () => {
    setupMockUseAuthContext();
    const { result } = renderHook(() => useUpdate(), { wrapper });

    act(() =>
      result.current.mutate({
        payload: mockBoardData,
        tableName: TableNames.BOARD,
      })
    );
    waitFor(() => {
      expect(result.current.isPending).toBe(true);
      expect(result.current.error).toBe(false);
      expect(result.current.isPending).toBe(false);
    });
  });

  test("it sets error to true if client is not available", () => {
    setupMockUseAuthContext(false, false);
    const { result } = renderHook(() => useUpdate(), { wrapper });

    waitFor(() => {
      expect(result.current.error).toBe(true);
    });

    act(() =>
      result.current.mutate({
        payload: mockBoardData,
        tableName: TableNames.BOARD,
      })
    );
  });

  test("it sets error to true if the update returns with an error", () => {
    setupMockUseAuthContext(true, true);
    const { result } = renderHook(() => useUpdate(), { wrapper });

    waitFor(() => {
      expect(result.current.error).toBe(true);
    });

    act(() =>
      result.current.mutate({
        payload: mockBoardData,
        tableName: TableNames.BOARD,
      })
    );
  });
});
