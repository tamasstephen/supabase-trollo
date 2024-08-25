import { useSaveBoard } from "./useSaveBoard";
import { renderHook, waitFor } from "@testing-library/react";
import { act, PropsWithChildren } from "react";
import nock from "nock";
import { AuthContextProvider } from "@/components";

const supaBaseMockEndpoint = "https://www.url.com";
const wrapper = ({ children }: PropsWithChildren) => (
  <AuthContextProvider>{children}</AuthContextProvider>
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

  test("has loading state if the request is pending", async () => {
    const {
      result: {
        current: { loading, saveBoard },
      },
    } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .persist()
      .post("/rest/v1/boards")
      .reply(200, { data: "whatever" })
      .post(`/storage/v1/object/board_cover/board_cover/${fileNames[0]}`)
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards?select=*")
      .reply(200, { data: "test" });

    act(() => {
      saveBoard(mockData);

      waitFor(() => expect(loading).toBe(true));
    });
  });

  test("has error state if board save request fails", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .persist()
      .post(`/storage/v1/object/board_cover/board_cover/${fileNames[0]}`)
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards")
      .replyWithError({
        message: "something awful happened",
        code: "AWFUL_ERROR",
      });

    await waitFor(async () => await result.current.saveBoard(mockData));

    await waitFor(() => expect(result.current.error).toBe(true));
  });

  test("has no error and loading state after saving the boards", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .persist()
      .post(`/storage/v1/object/board_cover/board_cover/${fileNames[0]}`)
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards")
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards?select=*")
      .reply(200, { data: "test" });

    await waitFor(async () => await result.current.saveBoard(mockData));

    await waitFor(() => expect(result.current.error).toBe(false));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test("returns with error if file can not be saved", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .persist()
      .post(`/storage/v1/object/board_cover/board_cover/${fileNames[0]}`)
      .replyWithError("ERROR")
      .post("/rest/v1/boards")
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards?select=*")
      .reply(200, { data: "test" });

    await waitFor(async () => await result.current.saveBoard(mockData));

    await waitFor(() => expect(result.current.error).toBe(true));
  });
});
