import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Material, PostMaterial } from "@/types/post";

interface SimpleMaterialInputProps {
  materials: Material[];
  selectedMaterials: PostMaterial[];
  onSelectionChange: (materials: PostMaterial[]) => void;
  className?: string;
  maxItems?: number;
}

export function SimpleMaterialInput({
  materials,
  selectedMaterials,
  onSelectionChange,
  className,
  maxItems = 20,
}: SimpleMaterialInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredMaterials = searchTerm.trim()
    ? materials.filter(
      (material) =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedMaterials.some(
          (selected) => selected.material_id === material.material_id
        )
    )
    : materials.filter(
      (material) =>
        !selectedMaterials.some(
          (selected) => selected.material_id === material.material_id
        )
    );

  const handleAddMaterial = (material: Material) => {
    if (selectedMaterials.length < maxItems) {
      const postMaterial: PostMaterial = {
        material_id: material.material_id,
        material,
        quantity: 1,
      };
      onSelectionChange([...selectedMaterials, postMaterial]);
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  const handleRemoveMaterial = (materialId: string) => {
    onSelectionChange(
      selectedMaterials.filter((item) => item.material_id !== materialId)
    );
  };

  const handleUpdateQuantity = (materialId: string, quantity: number) => {
    if (quantity <= 0) return;

    onSelectionChange(
      selectedMaterials.map((item) =>
        item.material_id === materialId ? { ...item, quantity } : item
      )
    );
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* <Label className="text-sm font-medium">Nguyên liệu</Label> */}

      {/* Add Material Section */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm nguyên liệu..."
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

        {/* Search Results Dropdown */}
        {isOpen && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg">
            <CardContent className="p-0">
              <div className="max-h-60 overflow-y-auto">
                {filteredMaterials.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {filteredMaterials.map((material) => (
                      <Button
                        key={material.material_id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddMaterial(material)}
                        className="w-full justify-start h-auto p-3 hover:bg-muted/50"
                        disabled={selectedMaterials.length >= maxItems}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm truncate">
                              {material.name}
                            </div>
                            {material.description && (
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {material.description}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Badge variant="outline" className="text-xs">
                              {material.unit_name || "N/A"}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 px-3 text-sm text-muted-foreground text-center">
                    {searchTerm.trim()
                      ? "Không tìm thấy nguyên liệu nào"
                      : "Không có nguyên liệu"}
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="border-t px-3 py-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex justify-between items-center">
                  <span>
                    Đã chọn {selectedMaterials.length}/{maxItems}
                  </span>
                  {filteredMaterials.length > 0 && (
                    <span>{filteredMaterials.length} kết quả</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Materials */}
      {selectedMaterials.length > 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Nguyên liệu đã chọn</Label>
              <Badge variant="secondary" className="text-xs">
                {selectedMaterials.length}/{maxItems}
              </Badge>
            </div>

            {/* Scrollable list with fixed height */}
            <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {selectedMaterials.map((postMaterial, index) => (
                <div
                  key={postMaterial.material_id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="font-medium text-sm truncate">
                        {postMaterial.material?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={postMaterial.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(
                            postMaterial.material_id,
                            parseFloat(e.target.value) || 1
                          )
                        }
                        className="h-7 w-16 text-center text-xs"
                      />
                      <Badge
                        variant="outline"
                        className="text-xs flex-shrink-0"
                      >
                        {postMaterial.material?.unit_name || "N/A"}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemoveMaterial(postMaterial.material_id)
                    }
                    className="flex-shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-destructive ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Show hint when list is long */}
            {selectedMaterials.length > 6 && (
              <div className="mt-3 text-xs text-muted-foreground text-center">
                Cuộn để xem thêm nguyên liệu
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
