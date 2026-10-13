import styles from "./Choices.module.css";
import controls from "./controls.module.css";

type Props<T extends string> = {
  legend: string;
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** A short row of radio choices under a mono legend, such as Draft or Live. */
export function Choices<T extends string>({ legend, name, options, value, onChange }: Props<T>) {
  return (
    <fieldset className={styles.group}>
      <legend className={controls.legend}>{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.choice}>
          <input type="radio" name={name} checked={value === option.value} onChange={() => onChange(option.value)} />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
