import { BoardsFormElement } from "@/types";
import { useSaveBoard } from "./useSaveBoard";
import { renderHook, waitFor } from "@testing-library/react";
import { act, FormEvent, PropsWithChildren } from "react";
import nock from "nock";
import { AuthContextProvider } from "@/components";

const supaBaseMockEndpoint = "https://www.url.com";
const wrapper = ({ children }: PropsWithChildren) => (
  <AuthContextProvider>{children}</AuthContextProvider>
);

const mockEvent = {
  preventDefault: jest.fn(),
  currentTarget: {
    elements: {
      boardName: "boardName",
      boardCover: {
        files: [
          new File(["foo"], "foo.txt", {
            type: "text/plain",
          }),
        ],
      },
    },
  },
} as unknown as FormEvent<BoardsFormElement>;

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
      .post("/storage/v1/object/board_cover/board_cover/foo.txt")
      .reply(200, { data: "whatever" });

    act(() => {
      saveBoard(mockEvent);

      waitFor(() => expect(loading).toBe(true));
    });
  });

  test("has error state if board save request fails", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .persist()
      .post("/storage/v1/object/board_cover/board_cover/foo.txt")
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards")
      .replyWithError({
        message: "something awful happened",
        code: "AWFUL_ERROR",
      });

    await waitFor(async () => await result.current.saveBoard(mockEvent));

    await waitFor(() => expect(result.current.error).toBe(true));
  });

  test("has no error and loading state after saving the boards", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .persist()
      .post("/storage/v1/object/board_cover/board_cover/foo.txt")
      .reply(200, { data: "whatever" })
      .post("/rest/v1/boards")
      .reply(200, { data: "whatever" });

    await waitFor(async () => await result.current.saveBoard(mockEvent));

    await waitFor(() => expect(result.current.error).toBe(false));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test("returns with error if file can not be saved", async () => {
    const { result } = renderHook(() => useSaveBoard(), {
      wrapper,
    });

    nock(supaBaseMockEndpoint)
      .persist()
      .post("/storage/v1/object/board_cover/board_cover/foo.txt")
      .replyWithError("ERROR")
      .post("/rest/v1/boards")
      .reply(200, { data: "whatever" });

    await waitFor(async () => await result.current.saveBoard(mockEvent));

    await waitFor(() => expect(result.current.error).toBe(true));
  });
});
