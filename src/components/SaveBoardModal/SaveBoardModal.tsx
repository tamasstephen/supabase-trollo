import { SaveBoardInputs } from "@/types";

import CloseIcon from "@/assets/close.svg";
import styles from "@/styles/SaveBoardModal.module.scss";
import { useSaveBoard } from "@/hooks/";
import { SaveLoading } from "./SaveLoading";
import { SaveError } from "./SaveError";
import { useForm } from "react-hook-form";
import { Input } from "../Input";

interface SaveBoardModalProps {
  closeModal: () => void;
}

export const SaveBoardModal = ({ closeModal }: SaveBoardModalProps) => {
  const { loading, error, saveBoard } = useSaveBoard();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SaveBoardInputs>();

  if (loading) {
    return <SaveLoading />;
  }

  if (error) {
    return <SaveError />;
  }

  return (
    <div className={styles.saveBoardWrapper}>
      <button
        className={styles.close}
        onClick={() => closeModal()}
        aria-label="close modal"
        data-testid="close"
      >
        <CloseIcon />
      </button>
      <h3>Create a board</h3>
      <form onSubmit={handleSubmit((data) => saveBoard(data))}>
        <fieldset>
          <label htmlFor="boardCover">Board cover</label>
          <input
            type="file"
            id="boardCover"
            accept="image/png, image/jpeg"
            {...register("boardCover")}
          />
        </fieldset>
        <Input
          identifier="boardName"
          label="Board name"
          register={register}
          required={{ required: "This field is required" }}
          errors={errors}
        />
        <button className={styles.submit} type="submit">
          Save Board
        </button>
      </form>
    </div>
  );
};
