interface AccessDeniedPageProps {
  title?: string;
  description?: string;
}

export default function AccessDeniedPage({
  title = 'Access Denied',
  description = 'You do not have permission to view this page.',
}: AccessDeniedPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="card max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </main>
    </div>
  );
}