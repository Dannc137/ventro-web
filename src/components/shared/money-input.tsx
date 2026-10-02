import { useRef } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";

function stripToDigits(value: string): string {
  let cleaned = value.replace(/[^\d.]/g, "");

  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  }

  // "0150" -> "150", but leave a lone "0" or a leading "0.5" alone.
  cleaned = cleaned.replace(/^0+(?=\d)/, "");

  return cleaned;
}

function withThousands(raw: string): string {
  if (!raw) return "";

  const [whole, decimal] = raw.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimal === undefined ? grouped : `${grouped}.${decimal}`;
}

function digitsBefore(value: string, caret: number): number {
  let count = 0;
  for (let i = 0; i < caret && i < value.length; i++) {
    if (/\d/.test(value[i])) count++;
  }
  return count;
}

function caretAfterDigits(display: string, digitCount: number): number {
  if (digitCount <= 0) return 0;

  let seen = 0;
  for (let i = 0; i < display.length; i++) {
    if (/\d/.test(display[i])) {
      seen++;
      if (seen === digitCount) return i + 1;
    }
  }
  return display.length;
}

type MoneyInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

/**
 * A money amount field that shows thousands separators while typing
 * ("1,250,000") but keeps the underlying form value a plain numeric string —
 * it drops straight into the existing `z.string().refine(...)` amount
 * schemas with no schema changes needed.
 */
export function MoneyInput<TFieldValues extends FieldValues>({
  control,
  name,
  id,
  disabled,
  ...rest
}: MoneyInputProps<TFieldValues>) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const display = withThousands(typeof field.value === "string" ? field.value : "");

        function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
          const el = event.target;
          const digitCount = digitsBefore(el.value, el.selectionStart ?? el.value.length);

          const raw = stripToDigits(el.value);
          const nextDisplay = withThousands(raw);

          field.onChange(raw);

          requestAnimationFrame(() => {
            const node = inputRef.current;
            if (!node) return;
            const pos = caretAfterDigits(nextDisplay, digitCount);
            node.setSelectionRange(pos, pos);
          });
        }

        return (
          <Input
            {...rest}
            id={id}
            ref={inputRef}
            inputMode="decimal"
            disabled={disabled}
            value={display}
            onChange={handleChange}
            onBlur={field.onBlur}
          />
        );
      }}
    />
  );
}
