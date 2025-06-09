import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectItem {
  id: string;
  name: string;
  description?: string;
}

interface MultiSelectProps<T extends SelectItem> {
  label: string;
  placeholder: string;
  items: T[];
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  className?: string;
  maxItems?: number;
  canCreate?: boolean;
  onCreateNew?: (name: string) => void;
}

export function MultiSelect<T extends SelectItem>({
  label,
  placeholder,
  items,
  selectedItems,
  onSelectionChange,
  className,
  maxItems = 10,
  canCreate = false,
  onCreateNew,
}: MultiSelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedItems.some((selected) => selected.id === item.id)
  );

  const handleAddItem = (item: T) => {
    if (selectedItems.length < maxItems) {
      onSelectionChange([...selectedItems, item]);
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    onSelectionChange(selectedItems.filter((item) => item.id !== itemId));
  };

  const handleCreateNew = () => {
    if (canCreate && onCreateNew && searchTerm.trim()) {
      onCreateNew(searchTerm.trim());
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  const showCreateOption =
    canCreate &&
    searchTerm.trim() &&
    !filteredItems.some(
      (item) => item.name.toLowerCase() === searchTerm.toLowerCase()
    );

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">{label}</Label>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="flex items-center gap-1 text-sm"
            >
              {item.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
                className="h-auto p-0 ml-1 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-10"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (searchTerm || filteredItems.length > 0) && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto border shadow-lg">
            <CardContent className="p-2">
              {filteredItems.length === 0 && !showCreateOption && (
                <div className="py-2 px-3 text-sm text-muted-foreground">
                  Không tìm thấy kết quả
                </div>
              )}

              {/* Existing Items */}
              {filteredItems.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  onClick={() => handleAddItem(item)}
                  className="w-full justify-start text-left h-auto p-2"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}

              {/* Create New Option */}
              {showCreateOption && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCreateNew}
                  className="w-full justify-start text-left h-auto p-2 border-t"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo mới "{searchTerm}"
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Count */}
      <div className="text-xs text-muted-foreground">
        Đã chọn {selectedItems.length}/{maxItems}
      </div>
    </div>
  );
}
