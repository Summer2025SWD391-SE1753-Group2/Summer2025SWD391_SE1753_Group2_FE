import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Unit } from "@/types/unit";

interface UnitComboboxProps {
  units: Unit[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UnitCombobox({
  units,
  value,
  onValueChange,
  placeholder = "Chọn đơn vị...",
  disabled = false,
}: UnitComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedUnit = units.find((unit) => unit.unit_id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12"
          disabled={disabled}
        >
          {selectedUnit ? selectedUnit.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm kiếm đơn vị..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy đơn vị.</CommandEmpty>
            <CommandGroup>
              {units.map((unit) => (
                <CommandItem
                  key={unit.unit_id}
                  value={unit.name}
                  onSelect={() => {
                    onValueChange(unit.unit_id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === unit.unit_id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {unit.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
