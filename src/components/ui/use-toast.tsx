"use client";

import * as React from "react";
import {
  Provider as RadixToastProvider,
  Root as ToastRoot,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "@radix-ui/react-toast";

const TOAST_REMOVE_DELAY = 4000;

type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

type ToastContextType = {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  add: () => {},
  remove: () => {},
});

export function ToastProvider({
  children,
}: React.PropsWithChildren<{ duration?: number }>) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  function add(toast: Omit<Toast, "id">) {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [{ ...toast, id }, ...prev]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_REMOVE_DELAY);
  }

  function remove(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <RadixToastProvider>
      <ToastContext.Provider value={{ toasts, add, remove }}>
        {children}
        <ToastViewport>
          {toasts.map((t) => (
            <ToastRoot key={t.id}>
              <ToastTitle>{t.title}</ToastTitle>
              <ToastDescription>{t.description}</ToastDescription>
            </ToastRoot>
          ))}
        </ToastViewport>
      </ToastContext.Provider>
    </RadixToastProvider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  return {
    toast: (props: Omit<Toast, "id">) => context.add(props),
  };
}

export type { Toast };
