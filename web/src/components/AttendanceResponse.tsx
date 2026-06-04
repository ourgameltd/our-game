interface AttendanceResponseProps {
  status: string;
  onConfirm: () => void;
  onDecline: () => void;
  isSubmitting: boolean;
  label?: string;
  photo?: string;
  initials?: string;
}

const statusConfig = {
  confirmed: {
    badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    text: 'Confirmed',
  },
  declined: {
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    text: 'Declined',
  },
  pending: {
    badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    text: 'Pending',
  },
};

export default function AttendanceResponse({ status, onConfirm, onDecline, isSubmitting, label, photo, initials }: AttendanceResponseProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {(photo || initials) ? (
        photo ? (
          <img src={photo} alt={label} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        )
      ) : label ? (
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">{label}:</span>
      ) : null}
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
        {config.text}
      </span>
      {status !== 'confirmed' && (
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="btn-sm btn-primary disabled:opacity-50"
        >
          Confirm
        </button>
      )}
      {status !== 'declined' && (
        <button
          type="button"
          onClick={onDecline}
          disabled={isSubmitting}
          className="btn-sm btn-danger disabled:opacity-50"
        >
          Decline
        </button>
      )}
    </div>
  );
}
