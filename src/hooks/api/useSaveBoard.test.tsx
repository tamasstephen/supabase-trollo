import { useSaveBoard } from "./useSaveBoard";
import { renderHook, waitFor } from "@testing-library/react";
import { act, PropsWithChildren } from "react";
import nock from "nock";
import { AuthContextProvider } from "@/components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const supaBaseMockEndpoint = "https://www.url.com";

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

const fileNames = ["foo.txt", "bar.txt"];

const file1 = new File(["file1 content"], fileNames[0], { type: "text/plain" });
const file2 = new File(["file2 content"], fileNames[1], { type: "text/plain" });

const mockFileList = {
  0: file1,
  1: file2,
  length: 2,
  item: (index: number) => {
    return [file1, file2][index];
  },
} as unknown as FileList;

const mockData = {
  boardName: "name",
  boardColumnTitle: "title",
  boardCover: mockFileList,
};

describe("useSaveBoard", () => {
  afterEach(function () {
    nock.cleanAll();
    nock.restore();
    nock.activate();
  });

  test("has loading state if the request is pending", () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .post("/rest/v1/boards")
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards?select=*")
      .reply(200, { data: "test" });
    act(() => {
      result.current.mutate(mockData);

      waitFor(() => expect(result.current.isPending).toBe(true));
    });
  });

  test("has error state if board save request fails", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .post(`/storage/v1/object/board_cover/board_cover/${fileNames[0]}`)
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards")
      .reply(404, new Error("error"));

    await waitFor(() => result.current.mutate(mockData));

    await waitFor(() => expect(result.current.error).toBeTruthy());
  });

  test("has no error and loading state after saving the boards", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .post(`/storage/v1/object/board_cover/board_cover/${fileNames[0]}`)
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards?select=*")
      .reply(200, { data: "test" });

    await waitFor(() => result.current.mutate(mockData));

    await waitFor(() => expect(result.current.error).toBe(null));
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  test("returns with error if file can not be saved", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .post(`/storage/v1/object/board_cover/board_cover/${fileNames[0]}`)
      .reply(404, new Error("erro"));

    await waitFor(() => result.current.mutate(mockData));

    await waitFor(() => expect(result.current.error).toBeTruthy());
  });
});
