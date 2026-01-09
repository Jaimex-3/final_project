import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: number; message: string; tone?: "success" | "error" | "info" };
type ToastContextValue = {
  toasts: Toast[];
  push: (message: string, tone?: Toast["tone"]) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, tone }]);
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      push,
      success: (message: string) => push(message, "success"),
      error: (message: string) => push(message, "error"),
      remove,
    }),
    [toasts, push, remove]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
