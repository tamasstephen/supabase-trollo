import { FieldErrors, Path, UseFormRegister } from "react-hook-form";
import styles from "@/styles/Input.module.scss";
import { InputTypes } from "@/types";

type InputProps = {
  identifier: Path<InputTypes>;
  register: UseFormRegister<InputTypes>;
  required: { required: string };
  errors: FieldErrors<InputTypes>;
  label: string;
  testId?: string;
};

export const Input = ({
  identifier,
  label,
  register,
  required,
  errors,
  testId,
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
        data-testid={testId ? testId : ""}
      />
      {errors[identifier] ? (
        <p className={styles.error}>{errors?.[identifier].message}</p>
      ) : (
        ""
      )}
    </fieldset>
  );
};
