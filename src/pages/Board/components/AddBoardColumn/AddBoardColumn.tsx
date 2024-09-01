import { InputTypes } from "@/types";
import { Input, Button } from "@/components";
import styles from "@/styles/AddBoardColumn.module.scss";
import { useForm } from "react-hook-form";
import { ButtonStyle } from "@/constants";

interface AddBoardColumnProps {
  callback: (e: Pick<InputTypes, "boardColumnTitle">) => void;
}

export const AddBoardColumn = ({ callback }: AddBoardColumnProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputTypes>();

  return (
    <div className={styles.wrapper}>
      <h2>Create a new list</h2>
      <form onSubmit={handleSubmit((data) => callback(data))}>
        <Input
          label="Title"
          register={register}
          identifier="boardColumnTitle"
          errors={errors}
          required={{ required: "This field is required" }}
          testId="columntitle"
        />
        <Button type="submit" style={ButtonStyle.PRIMARY}>
          Add new list
        </Button>
      </form>
    </div>
  );
};
