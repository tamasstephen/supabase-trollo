import { SaveBoardInputs } from "@/types";
import { FieldErrors, Path, UseFormRegister } from "react-hook-form";
import styles from "@/styles/Input.module.scss";

type InputProps = {
  identifier: Path<SaveBoardInputs>;
  register: UseFormRegister<SaveBoardInputs>;
  required: { required: string };
  errors: FieldErrors<SaveBoardInputs>;
  label: string;
};

export const Input = ({
  identifier,
  label,
  register,
  required,
  errors,
}: InputProps) => {
  return (
    <fieldset>
      <label htmlFor={identifier}>
        {label} <span className={styles.mandatory}>*</span>
      </label>
      <input
        className={styles.input}
        type="text"
        {...register(identifier, required)}
      />
      {errors[identifier] ? (
        <p className={styles.error}>{errors?.[identifier].message}</p>
      ) : (
        ""
      )}
    </fieldset>
  );
};
