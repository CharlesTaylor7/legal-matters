import { type InputHTMLAttributes } from "react";
import { IMaskMixin } from "react-imask";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export default function PhoneNumberInput(props: Props) {
  const { onChange, ...inputProps } = props;
  return (
    <MaskedStyledInput
      mask="(000) 000-0000"
      lazy={false}
      unmask={true}
      onAccept={onChange}
      {...inputProps}
    />
  );
}

const MaskedStyledInput = IMaskMixin(({ inputRef, ...props }) => (
  <input
    type="tel"
    className="input w-full"
    {...props}
    // @ts-expect-error imask's ref type doesn't match, but this is how the library is used
    ref={inputRef}
    pattern="\(\d{3}\) \d{3}-\d{4}"
    title="10 digit US Phone number expected"
  />
));
