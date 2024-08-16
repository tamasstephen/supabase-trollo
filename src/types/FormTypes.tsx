interface FormElements extends HTMLFormControlsCollection {
  boardName: HTMLInputElement;
  boardCover: HTMLInputElement;
}
export interface BoardsFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

interface AddBoardColumnFormElement extends HTMLFormControlsCollection {
  boardColumnTitle: HTMLInputElement;
}

export interface BoardColumnFormElement extends HTMLFormElement {
  readonly elements: AddBoardColumnFormElement;
}
