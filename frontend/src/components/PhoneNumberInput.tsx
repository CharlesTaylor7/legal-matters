import React, { useState, type ComponentProps } from "react";
import InputMask from "react-input-mask";
import {
  parsePhoneNumberFromString,
  getExampleNumber,
  type CountryCode,
} from "libphonenumber-js";

interface Props extends ComponentProps<typeof InputMask> {
  country: CountryCode;
  // hide some inherited props; these are controlled by the wrapper
  mask: never;
  placeholder: never;
}

export default function PhoneNumberInput(props: Props) {
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Try to parse and validate using libphonenumber-js
    const parsed = parsePhoneNumberFromString(raw, props.country);
    const newIsValid = parsed?.isValid() ?? false;
    setIsValid(newIsValid);

    // Call parent onChange if provided
    if (props.onChange) {
      props.onChange(e);
    }
  };

  // Get example phone number for the specified country
  const exampleNumber = getExampleNumber(props.country);
  const placeholder = exampleNumber?.formatNational() || "";
  const mask = exampleNumber?.formatNational().replace(/\d/g, "9") || "";

  return (
    <div>
      <InputMask
        maskChar="_"
        {...props}
        onChange={handleChange}
        mask={mask}
        placeholder={placeholder}
      >
        {(inputProps: ComponentProps<"input">) => (
          <input
            {...inputProps}
            type="tel"
            className={`input input-bordered ${isValid ? "input-success" : "input-warning"} ${props.className}`}
          />
        )}
      </InputMask>
    </div>
  );
}
