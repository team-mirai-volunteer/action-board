import { Card } from "@/components/ui/card";
import clsx from "clsx";

interface MetricCardProps {
  title: string;
  description: string;
  value: number | null;
  unit: string;
  todayValue?: number | null;
  todayUnit?: string;
}

export function MetricCard({
  title,
  description,
  value,
  unit,
  todayValue,
  todayUnit,
}: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden border-2 border-emerald-200 rounded-2xl shadow-lg transition-all duration-300 p-8 bg-gradient-to-br from-white to-emerald-50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 -mr-16 -mt-16" />
      <div className="relative flex justify-between items-center align-middle">
        <div>
          <div className="text-xl font-bold text-gray-700 mb-2">{title}</div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex flex-col items-end gap-1">
            <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              {value?.toLocaleString() || "0"}
            </span>
            <span className="text-2xl font-bold text-gray-700">{unit}</span>
          </div>
          <div
            className={clsx(
              "flex items-center gap-1 mt-2",
              !todayValue && "opacity-0",
            )}
          >
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
              1日で{" "}
              <span>
                {todayValue && todayValue > 0 ? "+" : ""}
                {todayValue?.toLocaleString() || "0"}
              </span>
              <span>{todayUnit}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
