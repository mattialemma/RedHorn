type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="min-w-[92px]">
      <p className="mb-3 text-right text-xs font-bold tracking-[0.28em] text-blue-400">
        STEP {currentStep} DI {totalSteps}
      </p>
      <div className="flex justify-end gap-1">
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={`h-1 w-10 rounded-full ${index + 1 <= currentStep ? "bg-blue-500" : "bg-slate-600"}`}
          />
        ))}
      </div>
    </div>
  );
}

