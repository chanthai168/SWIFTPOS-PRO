import { useEffect, useRef, useState } from "react";

type NotificationType = "success" | "error";

interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
  hiding: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

let idCounter = 0;

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notify = (type: NotificationType, message: string) => {
    const id = ++idCounter;

    setNotifications((prev) => [...prev, { id, type, message, hiding: false }]);

    // Start hide animation just before removal
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, hiding: true } : n))
      );
    }, 1200);

    // Remove from DOM after slide-out animation completes
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1500);
  };

  return { notifications, notify };
}

// ─── Single notification ──────────────────────────────────────────────────────

function NotificationItem({ item }: { item: NotificationItem }) {
  const isSuccess = item.type === "success";

  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg",
        "min-w-[240px] max-w-xs relative overflow-hidden",
        "font-sans text-sm font-medium",
        isSuccess
          ? "bg-green-900 text-green-100 border border-green-700"
          : "bg-red-900 text-red-100 border border-red-700",
        item.hiding ? "animate-slide-out" : "animate-slide-in",
      ].join(" ")}
    >
      {/* Icon */}
      {isSuccess ? (
        <svg
          className="w-5 h-5 mt-0.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-5" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 mt-0.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
        </svg>
      )}

      {/* Text */}
      <div className="flex flex-col gap-0.5">
        <span
          className={[
            "text-[11px] font-semibold uppercase tracking-widest opacity-70",
          ].join(" ")}
        >
          {isSuccess ? "Success" : "Error"}
        </span>
        <span className="leading-snug">{item.message}</span>
      </div>

      {/* Progress bar */}
      <span
        className={[
          "absolute bottom-0 left-0 h-[3px] rounded-b-xl animate-progress",
          isSuccess ? "bg-green-400/40" : "bg-red-400/40",
        ].join(" ")}
      />
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────

export function NotificationContainer({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  return (
    <div
      aria-live="polite"
      className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none"
    >
      {notifications.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <NotificationItem item={item} />
        </div>
      ))}
    </div>
  );
}

// ─── Demo (usage example) ─────────────────────────────────────────────────────

export default function App() {
  const { notifications, notify } = useNotification();

  return (
    <div className="min-h-screen flex items-center justify-center gap-4 bg-gray-50">
      <button
        onClick={() => notify("success", "File uploaded successfully.")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 active:scale-95 transition"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Trigger success
      </button>

      <button
        onClick={() => notify("error", "Something went wrong. Please try again.")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 active:scale-95 transition"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
        </svg>
        Trigger error
      </button>

      <NotificationContainer notifications={notifications} />
    </div>
  );
}
