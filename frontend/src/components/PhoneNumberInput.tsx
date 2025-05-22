import React, { type InputHTMLAttributes } from "react";
import { useIMask } from "react-imask";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  className?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function PhoneNumberInput(props: Props) {
  const onAccept = function (...args) {
    console.log(args);
    props.onChange(args);
  };
  const mask = useIMask({
    mask: "(000) 000-0000",
    onAccept,
    placeholderChar: "_",
  });
  return (
    <input
      type="tel"
      // @ts-expect-error imask
      ref={mask.ref}
      className={`input input-bordered w-full ${props.className ?? ""}`}
      value={mask.value}
      onInput={(e) => mask.setValue(e.target.value)}
    />
  );
}
