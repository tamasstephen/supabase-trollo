import * as hooks from "@/hooks/api/useDelete";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useDeleteBoardColumn } from "./useDeleteBoardColumn";
import { TableNames } from "@/constants";

const boardId = 1;
const tasks = [2];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockDelete = jest.fn((itemId: number, tableName: TableNames) =>
  Promise.resolve()
);

const useDeleteMock = jest.spyOn(hooks, "useDelete");

describe("useDelteBoardColumn", () => {
  useDeleteMock.mockReturnValue({
    deleteItem: mockDelete,
    loading: false,
    error: false,
  });

  test("hook renders with initial values", () => {
    const { result } = renderHook(() => useDeleteBoardColumn());

    expect(result.current.error).toBeFalsy();
    expect(result.current.loading).toBeFalsy();
  });

  test("delete is called with proper params", async () => {
    const { result } = renderHook(() => useDeleteBoardColumn());

    await act(
      async () => await result.current.deleteBoardColumn(boardId, tasks)
    );

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(tasks[0], TableNames.TASK);
      expect(mockDelete).toHaveBeenCalledWith(boardId, TableNames.COLUMN);
    });
  });
});
