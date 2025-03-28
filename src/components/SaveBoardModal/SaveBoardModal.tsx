import { InputTypes } from "@/types";
import Plus from "@/assets/plus.svg";
import CloseIcon from "@/assets/close.svg";
import styles from "@/styles/SaveBoardModal.module.scss";
import { useSaveBoard } from "@/hooks/";
import { SaveLoading } from "./SaveLoading";
import { SaveError } from "./SaveError";
import { useForm } from "react-hook-form";
import { Input } from "../Input";
import { Button } from "../Button";
import { useNavigate } from "react-router-dom";
import { ButtonStyle } from "@/constants";
import { useState } from "react";

interface SaveBoardModalProps {
  closeModal: () => void;
}

export const SaveBoardModal = ({ closeModal }: SaveBoardModalProps) => {
  const [error, setError] = useState(false);
  const mutation = useSaveBoard();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<InputTypes>();
  const navigate = useNavigate();

  if (mutation.isPending) {
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
      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            const result = await mutation.mutateAsync(data);
            navigate(`board/${result.id}`);
          } catch {
            setError(true);
          }
        })}
      >
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
          testId="boardname"
        />
        <Button type="submit" style={ButtonStyle.PRIMARY}>
          <Plus />
          Save Board
        </Button>
      </form>
    </div>
  );
};
