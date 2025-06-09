import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Material,
  PostMaterial,
  CookingUnit,
  MaterialCategory,
} from "@/types/post";

interface MaterialInputProps {
  materials: Material[];
  selectedMaterials: PostMaterial[];
  onSelectionChange: (materials: PostMaterial[]) => void;
  className?: string;
  maxItems?: number;
  onCreateNew?: (
    name: string,
    category: MaterialCategory,
    unit: CookingUnit
  ) => void;
}

export function MaterialInput({
  materials,
  selectedMaterials,
  onSelectionChange,
  className,
  maxItems = 20,
  onCreateNew: _,
}: MaterialInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);

  // Import constants (in real app, these would be imported from types)
  const COOKING_UNITS_LOCAL = {
    gram: { label: "Gram", abbr: "g", category: "Khối lượng" },
    kg: { label: "Kilogram", abbr: "kg", category: "Khối lượng" },
    mg: { label: "Milligram", abbr: "mg", category: "Khối lượng" },
    lit: { label: "Lít", abbr: "l", category: "Thể tích" },
    ml: { label: "Millilít", abbr: "ml", category: "Thể tích" },
    muong_cafe: { label: "Muỗng cà phê", abbr: "mcf", category: "Thể tích" },
    muong_canh: { label: "Muỗng canh", abbr: "mc", category: "Thể tích" },
    coc: { label: "Cốc", abbr: "cốc", category: "Thể tích" },
    chen: { label: "Chén", abbr: "chén", category: "Thể tích" },
    thia: { label: "Thìa", abbr: "thìa", category: "Thể tích" },
    qua: { label: "Quả", abbr: "quả", category: "Đơn vị đếm" },
    cu: { label: "Củ", abbr: "củ", category: "Đơn vị đếm" },
    la: { label: "Lá", abbr: "lá", category: "Đơn vị đếm" },
    bo: { label: "Bó", abbr: "bó", category: "Đơn vị đếm" },
    canh: { label: "Cành", abbr: "cành", category: "Đơn vị đếm" },
    thai: { label: "Thái", abbr: "thái", category: "Đơn vị đếm" },
    mieng: { label: "Miếng", abbr: "miếng", category: "Đơn vị đếm" },
    lon: { label: "Lon", abbr: "lon", category: "Đóng gói" },
    chai: { label: "Chai", abbr: "chai", category: "Đóng gói" },
    goi: { label: "Gói", abbr: "gói", category: "Đóng gói" },
    tui: { label: "Túi", abbr: "túi", category: "Đóng gói" },
    hop: { label: "Hộp", abbr: "hộp", category: "Đóng gói" },
  };

  const filteredMaterials = materials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
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
        unit: material.default_unit,
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

  const handleUpdateMaterial = (
    materialId: string,
    updates: Partial<PostMaterial>
  ) => {
    onSelectionChange(
      selectedMaterials.map((item) =>
        item.material_id === materialId ? { ...item, ...updates } : item
      )
    );
    setEditingMaterial(null);
  };

  const getCategoryBadgeColor = (category: MaterialCategory) => {
    const colors = {
      thit: "bg-red-100 text-red-800",
      ca: "bg-blue-100 text-blue-800",
      rau_cu: "bg-green-100 text-green-800",
      gia_vi: "bg-yellow-100 text-yellow-800",
      hat_lua: "bg-amber-100 text-amber-800",
      sua_trung: "bg-orange-100 text-orange-800",
      dau_mo: "bg-purple-100 text-purple-800",
      nuoc_tuong: "bg-pink-100 text-pink-800",
      do_kho: "bg-gray-100 text-gray-800",
      trai_cay: "bg-lime-100 text-lime-800",
      khac: "bg-slate-100 text-slate-800",
    };
    return colors[category] || colors.khac;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-sm font-medium">Nguyên liệu</Label>

      {/* Selected Materials */}
      {selectedMaterials.length > 0 && (
        <div className="space-y-3">
          {selectedMaterials.map((postMaterial) => (
            <Card key={postMaterial.material_id} className="p-3">
              {editingMaterial === postMaterial.material_id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {postMaterial.material.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={getCategoryBadgeColor(
                        postMaterial.material.category
                      )}
                    >
                      {postMaterial.material.category}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Số lượng</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={postMaterial.quantity || ""}
                        onChange={(e) =>
                          handleUpdateMaterial(postMaterial.material_id, {
                            quantity: parseFloat(e.target.value) || undefined,
                          })
                        }
                        placeholder="Số lượng"
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Đơn vị</Label>
                      <Select
                        value={postMaterial.unit}
                        onValueChange={(value) =>
                          handleUpdateMaterial(postMaterial.material_id, {
                            unit: value as CookingUnit,
                          })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COOKING_UNITS_LOCAL).map(
                            ([key, unit]) => (
                              <SelectItem key={key} value={key}>
                                {unit.label} ({unit.abbr})
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Ghi chú (tùy chọn)</Label>
                    <Input
                      value={postMaterial.notes || ""}
                      onChange={(e) =>
                        handleUpdateMaterial(postMaterial.material_id, {
                          notes: e.target.value,
                        })
                      }
                      placeholder="VD: thái lát, rửa sạch..."
                      className="h-8"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditingMaterial(null)}>
                      Xong
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingMaterial(null)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {postMaterial.material.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          getCategoryBadgeColor(postMaterial.material.category)
                        )}
                      >
                        {postMaterial.material.category}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {postMaterial.quantity && (
                        <>
                          {postMaterial.quantity}{" "}
                          {COOKING_UNITS_LOCAL[postMaterial.unit]?.abbr ||
                            postMaterial.unit}
                          {postMaterial.notes && ` • ${postMaterial.notes}`}
                        </>
                      )}
                      {!postMaterial.quantity && (
                        <span className="text-amber-600">
                          Chưa nhập số lượng
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingMaterial(postMaterial.material_id)
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveMaterial(postMaterial.material_id)
                      }
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm nguyên liệu..."
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
        {isOpen && (searchTerm || filteredMaterials.length > 0) && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto border shadow-lg">
            <CardContent className="p-2">
              {filteredMaterials.length === 0 && (
                <div className="py-2 px-3 text-sm text-muted-foreground">
                  Không tìm thấy nguyên liệu
                </div>
              )}

              {filteredMaterials.map((material) => (
                <Button
                  key={material.material_id}
                  type="button"
                  variant="ghost"
                  onClick={() => handleAddMaterial(material)}
                  className="w-full justify-start text-left h-auto p-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{material.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          getCategoryBadgeColor(material.category)
                        )}
                      >
                        {material.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {COOKING_UNITS_LOCAL[material.default_unit]?.label ||
                          material.default_unit}
                      </Badge>
                    </div>
                    {material.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {material.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-muted-foreground">
        Đã chọn {selectedMaterials.length}/{maxItems} nguyên liệu
      </div>
    </div>
  );
}
