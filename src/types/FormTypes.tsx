interface AddTaskFormElement extends HTMLFormControlsCollection {
  taskTitle: HTMLTextAreaElement;
}

export interface TaskFormElement extends HTMLFormElement {
  readonly elements: AddTaskFormElement;
}

export type InputTypes = {
  boardName: string;
  boardColumnTitle: string;
  boardCover: FileList;
};

export type BoardInputTypes = Required<Pick<InputTypes, "boardName">> &
  Omit<InputTypes, "boardName">;
