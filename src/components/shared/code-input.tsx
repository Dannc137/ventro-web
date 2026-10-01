import { useEffect, useRef } from "react";

const LENGTH = 6;

type CodeInputProps = {
  value: string[];
  onChange: (digits: string[]) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function CodeInput({
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
}: CodeInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  function handleChange(index: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) return;

    const next = [...value];

    if (clean.length > 1) {
      clean
        .split("")
        .slice(0, LENGTH - index)
        .forEach((char, offset) => {
          next[index + offset] = char;
        });

      onChange(next);

      if (next.every(Boolean)) onComplete(next.join(""));
      else inputs.current[Math.min(index + clean.length, LENGTH - 1)]?.focus();
      return;
    }

    next[index] = clean;
    onChange(next);

    if (index < LENGTH - 1) inputs.current[index + 1]?.focus();
    if (next.every(Boolean)) onComplete(next.join(""));
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...value];

      if (next[index]) {
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        next[index - 1] = "";
        onChange(next);
        inputs.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex justify-between gap-2">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          aria-label={`Digit ${index + 1}`}
          className="h-14 w-full rounded-lg border bg-card text-center text-xl font-semibold tabular-nums transition-colors focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-60"
        />
      ))}
    </div>
  );
}