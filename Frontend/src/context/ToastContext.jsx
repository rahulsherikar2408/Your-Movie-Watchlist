import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (msg, duration) => showToast(msg, "success", duration),
    error: (msg, duration) => showToast(msg, "error", duration),
    info: (msg, duration) => showToast(msg, "info", duration),
    warning: (msg, duration) => showToast(msg, "warning", duration),
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return "fa-solid fa-circle-check text-emerald-500";
      case "error":
        return "fa-solid fa-circle-xmark text-rose-500";
      case "warning":
        return "fa-solid fa-triangle-exclamation text-amber-500";
      default:
        return "fa-solid fa-circle-info text-blue-500";
    }
  };

  const getToastBorder = (type) => {
    switch (type) {
      case "success":
        return "border-emerald-200 bg-white shadow-emerald-500/10";
      case "error":
        return "border-rose-200 bg-white shadow-rose-500/10";
      case "warning":
        return "border-amber-200 bg-white shadow-amber-500/10";
      default:
        return "border-blue-200 bg-white shadow-blue-500/10";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}

      {/* Toast Notifications Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${getToastBorder(
              item.type
            )}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <i className={`${getToastIcon(item.type)} text-xl shrink-0`} />
              <p className="text-sm font-bold text-gray-800 leading-snug break-words">
                {item.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-600 transition"
              aria-label="Dismiss notification"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
