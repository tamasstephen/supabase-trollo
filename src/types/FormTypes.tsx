interface FormElements extends HTMLFormControlsCollection {
  boardName: HTMLInputElement;
  boardCover: HTMLInputElement;
}
export interface BoardsFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}
