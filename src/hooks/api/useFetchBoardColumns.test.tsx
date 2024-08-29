import { TableNames } from "@/constants";
import * as hooks from "@/hooks/useAuthContext";
import { Task } from "@/types";
import { DbObject, DraggableBoardContainer } from "@/types/Board";
import { SupabaseClient } from "@supabase/supabase-js";
import { useFetchBoardColumns } from "./useFetchBoardColumns";
import { render, waitFor, screen } from "@testing-library/react";
import { useState } from "react";

let columnsMock: DraggableBoardContainer[];

const Wrapper = () => {
  const [columns, setColumns] = useState<DraggableBoardContainer[]>([]);
  const { loading, error } = useFetchBoardColumns(1, setColumns);
  columnsMock = columns;

  return (
    <div>
      <p data-testid="loading">loading:{loading.toString()}</p>
      <p data-testid="error">error:{error.toString()}</p>
    </div>
  );
};

const mockUseAuthContext = jest.spyOn(hooks, "useAuthContext");

const mockedColumnData: DbObject[] = [
  { title: "First Board", id: 1 },
  { title: "Second Board", id: 2 },
];

const mockedTaskData: Task[] = [
  { id: 1, title: "Title", board_id: 1, index: 1 },
];

const setupMockUseAuthContext = (
  boardError: boolean = false,
  taskError: boolean = false,
  sbClient: boolean = true,
  noTask: boolean = false
) => {
  const mockedBoardColumnSelect = jest.fn(() => {
    return {
      eq: jest.fn(() => ({ data: mockedColumnData, error: boardError })),
    };
  });
  const mockedBoardTaskSelect = jest.fn(() => {
    return {
      eq: jest.fn(() => ({
        data: !noTask ? mockedTaskData : null,
        error: taskError,
      })),
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
            from: (tableName: TableNames) => {
              if (tableName === TableNames.COLUMN) {
                return { select: mockedBoardColumnSelect };
              }
              return { select: mockedBoardTaskSelect };
            },
          } as unknown as SupabaseClient)
        : null,
    };
  });
};

describe("useFetchBoardColumns", () => {
  test("it returns the column data", async () => {
    setupMockUseAuthContext(false);
    render(<Wrapper />);

    await waitFor(() => expect(columnsMock.length).toBe(2));
  });

  test("it shows error if an error occurs during board fetching", async () => {
    setupMockUseAuthContext(true);
    render(<Wrapper />);

    const error = screen.getByTestId<HTMLParagraphElement>("error");

    await waitFor(() => expect(error.textContent).toBe("error:true"));
  });

  test("it shows loading while loading", async () => {
    setupMockUseAuthContext(false);
    render(<Wrapper />);

    const loading = screen.getByTestId<HTMLParagraphElement>("loading");

    await waitFor(() => expect(loading.textContent).toBe("loading:true"));
  });

  test("it shows error if client is not available", async () => {
    setupMockUseAuthContext(false, false, false);
    render(<Wrapper />);

    const error = screen.getByTestId<HTMLParagraphElement>("error");

    await waitFor(() => expect(error.textContent).toBe("error:true"));
  });

  test("it shows error if an error occurs during task fetching", async () => {
    setupMockUseAuthContext(false, true);
    render(<Wrapper />);

    const error = screen.getByTestId<HTMLParagraphElement>("error");

    await waitFor(() => expect(error.textContent).toBe("error:true"));
  });

  test("columns have no tasks if no tasks are provided", async () => {
    setupMockUseAuthContext(false, false, true, true);

    render(<Wrapper />);

    await waitFor(() => expect(columnsMock[0].items.length).toBe(0));
  });
});
