import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered } from "lucide-react";
import type { Step } from "@/types/post";

interface StepsDisplayProps {
  steps: Step[];
  className?: string;
}

export function StepsDisplay({ steps, className }: StepsDisplayProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  const sortedSteps = [...steps].sort(
    (a, b) => a.order_number - b.order_number
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <ListOrdered className="h-5 w-5" />
          Các bước thực hiện
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSteps.map((step) => (
            <div
              key={step.step_id || step.order_number}
              className="flex gap-3 items-start"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {step.order_number}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-gray-700 leading-relaxed">{step.content}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
