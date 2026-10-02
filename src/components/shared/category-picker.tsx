import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CategoryPickerProps = {
  value: string;
  onChange: (value: string) => void;
  existing: string[];
  starters: string[];
  id?: string;
  disabled?: boolean;
};

export function CategoryPicker({
  value,
  onChange,
  existing,
  starters,
  id,
  disabled,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const options = Array.from(new Set([...existing, ...starters])).sort((a, b) =>
    a.localeCompare(b),
  );

  const trimmed = search.trim();
  const isNew =
    trimmed.length > 0 &&
    !options.some((option) => option.toLowerCase() === trimmed.toLowerCase());

  function select(next: string) {
    onChange(next);
    setSearch("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || "Choose or type a category"}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type a new one"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isNew && (
              <CommandGroup>
                <CommandItem value={trimmed} onSelect={() => select(trimmed)}>
                  Create “{trimmed}”
                </CommandItem>
              </CommandGroup>
            )}

            {options.length === 0 && !isNew && (
              <CommandEmpty>Type to create a category.</CommandEmpty>
            )}

            {options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option} value={option} onSelect={() => select(option)}>
                    <Check
                      className={cn(
                        "size-4",
                        value === option ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}