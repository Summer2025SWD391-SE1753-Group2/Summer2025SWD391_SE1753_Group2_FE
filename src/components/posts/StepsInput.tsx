import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Step } from "@/types/post";

interface StepsInputProps {
  steps: Step[];
  onChange: (steps: Step[]) => void;
}

export function StepsInput({ steps, onChange }: StepsInputProps) {
  const addStep = () => {
    const newStep: Step = {
      order_number: steps.length + 1,
      content: "",
    };
    onChange([...steps, newStep]);
  };

  const updateStep = (index: number, content: string) => {
    const updatedSteps = steps.map((step, i) =>
      i === index ? { ...step, content } : step
    );
    onChange(updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, order_number: i + 1 }));
    onChange(updatedSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];

    // Update order numbers
    const reorderedSteps = newSteps.map((step, i) => ({
      ...step,
      order_number: i + 1,
    }));

    onChange(reorderedSteps);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Các bước thực hiện</CardTitle>
        <p className="text-sm text-muted-foreground">
          Thêm các bước chi tiết để thực hiện món ăn (tối đa 20 bước)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Bước {step.order_number}:
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveStep(index, "up")}
                  disabled={index === 0}
                >
                  Lên
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveStep(index, "down")}
                  disabled={index === steps.length - 1}
                >
                  Xuống
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeStep(index)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                >
                  Xóa
                </Button>
              </div>
            </div>
            <Textarea
              placeholder={`Mô tả chi tiết bước ${step.order_number}...`}
              value={step.content}
              onChange={(e) => updateStep(index, e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addStep}
          disabled={steps.length >= 20}
          className="w-full"
        >
          Thêm bước mới ({steps.length}/20)
        </Button>
      </CardContent>
    </Card>
  );
}
