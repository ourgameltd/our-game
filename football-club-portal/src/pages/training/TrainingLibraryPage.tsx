import { sampleTrainingSessions, sampleDrills } from '@data/training';

export default function TrainingLibraryPage() {
  const upcomingSessions = sampleTrainingSessions.filter(s => new Date(s.date) > new Date());
  const pastSessions = sampleTrainingSessions.filter(s => new Date(s.date) <= new Date());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Upcoming Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upcoming Sessions ({upcomingSessions.length})
            </h2>
            <button className="btn-success btn-md">
              + Create Session
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {new Date(session.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(session.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} • {session.duration} mins
                    </p>
                  </div>
                  <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Upcoming</span>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</div>
                  <div className="font-medium text-gray-900 dark:text-white">📍 {session.location}</div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Focus Areas</div>
                  <div className="flex flex-wrap gap-2">
                    {session.focusAreas.map((area, idx) => (
                      <span key={idx} className="badge-primary">{area}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <button className="btn-secondary btn-sm flex-1">View Details</button>
                  <button className="btn-primary btn-sm flex-1">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Sessions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Past Sessions ({pastSessions.length})
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {pastSessions.slice(0, 4).map((session) => (
              <div key={session.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {new Date(session.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-sm text-gray-600">{session.duration} mins</p>
                  </div>
                  <span className="badge-success">Completed</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {session.focusAreas.map((area, idx) => (
                    <span key={idx} className="badge bg-gray-100 text-gray-700">{area}</span>
                  ))}
                </div>

                {session.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">{session.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Drill Library */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Drill Library ({sampleDrills.length})
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {sampleDrills.map((drill) => (
              <div key={drill.id} className="card-hover">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{drill.name}</h3>
                  <span className={`badge ${
                    drill.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                    drill.category === 'tactical' ? 'bg-purple-100 text-purple-800' :
                    drill.category === 'physical' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {drill.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{drill.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>⏱️ {drill.duration} mins</span>
                  <span>🎯 {drill.skillsFocused.length} skills</span>
                </div>

                <button className="btn-secondary btn-sm w-full">View Drill</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
