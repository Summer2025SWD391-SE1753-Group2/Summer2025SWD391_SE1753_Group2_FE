import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
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
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  badgeColor?: string;
}

export function MultiSelect<T extends SelectItem>({
  label,
  placeholder,
  items,
  selectedItems,
  onSelectionChange,
  className,
  maxItems = 10,
  badgeVariant = "secondary",
  badgeColor,
}: MultiSelectProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = searchTerm.trim()
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedItems.some((selected) => selected.id === item.id)
      )
    : items.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id)
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

  const handleInputClick = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">{label}</Label>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-md bg-muted/20">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant={badgeVariant}
              className={cn(
                "flex items-center gap-1 text-sm",
                badgeColor &&
                  `bg-${badgeColor}-100 text-${badgeColor}-800 border-${badgeColor}-200`
              )}
            >
              <span className="truncate max-w-[120px]">{item.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
                className="h-auto p-0 ml-1 hover:bg-red-50 text-muted-foreground hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onClick={handleInputClick}
            className="pl-10 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleInputClick}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          ></Button>
        </div>

        {isOpen && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg">
            <CardContent className="p-0">
              <div className="max-h-60 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="py-3 px-3 text-sm text-muted-foreground text-center">
                    {searchTerm.trim()
                      ? "Không tìm thấy kết quả"
                      : "Không có dữ liệu"}
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredItems.map((item) => (
                      <Button
                        key={item.id}
                        type="button"
                        variant="ghost"
                        onClick={() => handleAddItem(item)}
                        className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
                        disabled={selectedItems.length >= maxItems}
                      >
                        <div className="w-full">
                          <div className="font-medium text-sm truncate">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t px-3 py-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex justify-between items-center">
                  <span>
                    Đã chọn {selectedItems.length}/{maxItems}
                  </span>
                  {filteredItems.length > 0 && (
                    <span>{filteredItems.length} kết quả</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
