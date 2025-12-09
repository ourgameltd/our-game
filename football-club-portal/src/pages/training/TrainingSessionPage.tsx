import { useParams } from 'react-router-dom';
import { sampleTrainingSessions, getDrillById } from '@/data/training';
import { samplePlayers } from '@/data/players';
import { sampleTeams } from '@/data/teams';
import { sampleClubs } from '@/data/clubs';
import { getAgeGroupById } from '@/data/ageGroups';

export default function TrainingSessionPage() {
  const { sessionId, clubId, teamId } = useParams();
  
  const session = sampleTrainingSessions.find(s => s.id === sessionId);
  const team = sampleTeams.find(t => t.id === teamId);
  const club = sampleClubs.find(c => c.id === clubId);
  const ageGroup = team ? getAgeGroupById(team.ageGroupId) : undefined;
  
  if (!session || !team || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Training session not found</h2>
          </div>
        </main>
      </div>
    );
  }
  
  const getPlayerName = (playerId: string) => {
    const player = samplePlayers.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown';
  };
  
  const isUpcoming = session.date > new Date();
  const drills = session.drillIds.map(id => getDrillById(id)).filter(Boolean);
  
  const attendanceStats = session.attendance ? {
    present: session.attendance.filter(a => a.present).length,
    absent: session.attendance.filter(a => !a.present).length,
    total: session.attendance.length
  } : null;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Session Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {isUpcoming ? 'Upcoming Training Session' : 'Training Session Report'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {ageGroup?.name || 'N/A'} - {team.name}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                {session.duration} minutes
              </span>
            </div>
          </div>
          
          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {session.date.toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {session.date.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
              <p className="font-medium text-gray-900 dark:text-white">{session.location}</p>
            </div>
            {attendanceStats && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {attendanceStats.present}/{attendanceStats.total} players
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((attendanceStats.present / attendanceStats.total) * 100)}% attendance
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Focus Areas */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Focus Areas</h2>
          <div className="flex flex-wrap gap-2">
            {session.focusAreas.map((area, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
        
        {/* Drills */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Training Drills</h2>
          <div className="space-y-4">
            {drills.map((drill, index) => (
              <div key={drill!.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {drill!.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm">
                          {drill!.category}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {drill!.duration} min
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {drill!.description}
                    </p>
                    
                    {/* Skills Focused */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills Focused:</p>
                      <div className="flex flex-wrap gap-2">
                        {drill!.skillsFocused.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Equipment */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipment:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {drill!.equipment.join(', ')}
                      </p>
                    </div>
                    
                    {/* Instructions */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {drill!.instructions.map((instruction, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                            {instruction}
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    {/* Variations */}
                    {drill!.variations && drill!.variations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variations:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {drill!.variations.map((variation, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                              {variation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Attendance (for past sessions) */}
        {!isUpcoming && session.attendance && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Attendance</h2>
            <div className="space-y-2">
              {session.attendance.map((record, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    record.present 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {record.present ? '✅' : '❌'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getPlayerName(record.playerId)}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    record.present 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {record.present ? 'Present' : 'Absent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Session Notes */}
        {session.notes && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {isUpcoming ? 'Session Plan' : 'Coach Notes'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {session.notes}
            </p>
          </div>
        )}
        
        {/* Upcoming Session Info */}
        {isUpcoming && !session.notes && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Session Details</h2>
            <p className="text-gray-600 dark:text-gray-400">
              This training session is scheduled for {session.date.toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at {session.date.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Full session report will be available after the training.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
