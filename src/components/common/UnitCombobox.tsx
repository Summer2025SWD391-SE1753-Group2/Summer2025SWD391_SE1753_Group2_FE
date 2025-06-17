import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Unit } from "@/types/unit";

interface UnitComboboxProps {
  units: Unit[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const UnitCombobox = ({ units, value, onChange, placeholder = "Chọn đơn vị" }: UnitComboboxProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full h-40 p-0 overflow-y-auto">
        <Command>
          <CommandInput placeholder="Tìm đơn vị..." />
          <CommandList >
            {units.map((unit) => (
              <CommandItem
                key={unit.unit_id}
                value={unit.name}
                onSelect={() => onChange(unit.name)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === unit.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {unit.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
