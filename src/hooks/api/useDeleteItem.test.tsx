import { SupabaseClient } from "@supabase/supabase-js";
import * as hooks from "@/hooks/useAuthContext";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useDeleteItem } from "./useDeleteItem";
import { TableNames } from "@/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "@/components";
import { PropsWithChildren } from "react";

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
    const { result } = renderHook(() => useDeleteItem(), { wrapper });

    expect(result.current.error).toBe(null);
    expect(result.current.isPending).toBe(false);
  });

  test("hook sets loading to true if loading", async () => {
    setupMockUseAuthContext(false);
    const { result } = renderHook(() => useDeleteItem(), { wrapper });

    act(() =>
      result.current.mutate({ itemId: 1, tableName: TableNames.BOARD })
    );
    await waitFor(() => expect(result.current.status).toBe("success"));
    await waitFor(() => expect(result.current.error).toBe(null));
  });

  test("hook sets error to true if an error occurs", async () => {
    setupMockUseAuthContext(true);
    const { result } = renderHook(() => useDeleteItem(), { wrapper });

    act(() =>
      result.current.mutate({ itemId: 1, tableName: TableNames.BOARD })
    );
    await waitFor(() => expect(result.current.error).toBeTruthy());
  });

  test("hook returns with error if SupabaseClient is not available", async () => {
    setupMockUseAuthContext(false, false);
    const { result } = renderHook(() => useDeleteItem(), { wrapper });
    act(() =>
      result.current.mutate({ itemId: 1, tableName: TableNames.BOARD })
    );

    await waitFor(() => expect(result.current.error).toBeTruthy());
  });
});
