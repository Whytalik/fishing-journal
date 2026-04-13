"use client";

export default function HypothesesStub() {
  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🧪</span>
          <h1 className="text-2xl font-bold text-n-text">Гіпотези</h1>
        </div>
        <p className="text-sm text-n-muted">Перевіряйте та відстежуйте свої рибальські теорії</p>
      </div>

      <div className="border-t border-n-border" />

      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <span className="text-5xl">🚧</span>
        <p className="text-lg font-semibold text-n-text">Незабаром</p>
        <p className="text-sm text-n-muted max-w-xs">
          Цей розділ дозволить вам створювати та підтверджувати гіпотези на основі ваших даних про сесії.
        </p>
      </div>
    </div>
  );
}
