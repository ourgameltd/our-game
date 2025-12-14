import { sampleFormations } from '@data/formations';

export default function FormationsLibraryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Formations ({sampleFormations.length})</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and assign formations to your teams</p>
          </div>
          <button className="btn-success btn-md">
            + Create Formation
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sampleFormations.map((formation) => (
            <div key={formation.id} className="card-hover">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formation.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formation.system}</p>
                </div>
                <span className="badge-primary">{formation.positions.length} Positions</span>
              </div>

              {/* Formation Visualization Placeholder */}
              <div className="bg-pitch rounded-lg p-4 mb-4 relative" style={{ height: '200px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold opacity-50">{formation.system}</span>
                </div>
              </div>

              {formation.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">{formation.description}</p>
              )}

              {formation.tactics && formation.tactics.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Tactics:</h4>
                  <ul className="space-y-1">
                    {formation.tactics.map((tactic, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-primary-600">•</span>
                        <span>{tactic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <button className="btn-secondary btn-sm flex-1">View Details</button>
                <button className="btn-primary btn-sm flex-1">Assign to Team</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
