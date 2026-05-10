import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, X } from 'lucide-react';
import type { Toast } from '@/contexts/ToastContext';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-start gap-3 min-w-72 max-w-sm px-4 py-3 rounded-lg shadow-lg
            ${toast.removing ? 'animate-toast-out' : 'animate-toast-in'}
            ${toast.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/80 border border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/80 border border-red-200 dark:border-red-700'
            }
          `}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          )}
          <p className={`flex-1 text-sm font-medium ${
            toast.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {toast.message}
          </p>
          <button
            onClick={() => onRemove(toast.id)}
            className={`shrink-0 rounded p-0.5 transition-colors ${
              toast.type === 'success'
                ? 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200'
                : 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
