import { useEffect } from "react";
import { useToast } from "../context/ToastContext";

export default function ToastStack() {
  const { toasts, remove } = useToast();

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), 3200));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md px-4 py-3 shadow-lg text-sm text-white ${
            toast.tone === "success"
              ? "bg-emerald-600"
              : toast.tone === "error"
              ? "bg-rose-600"
              : "bg-slate-800"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
