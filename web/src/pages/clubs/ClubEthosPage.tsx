import { useParams } from 'react-router-dom';
import { useClubById } from '@/api';

/**
 * Skeleton loading component for a card section
 */
function CardSkeleton({ lines = 3, hasGrid = false }: { lines?: number; hasGrid?: boolean }) {
  return (
    <div className="card mb-4 animate-pulse">
      <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" style={{ width: `${100 - i * 10}%` }} />
      ))}
      {hasGrid && (
        <div className="mt-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loading component for principles section
 */
function PrinciplesSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" style={{ width: '90%' }} />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loading component for community statement
 */
function CommunityStatementSkeleton() {
  return (
    <div className="mt-4 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" style={{ width: '100%' }} />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" style={{ width: '95%' }} />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" style={{ width: '85%' }} />
      <div className="mt-4 flex flex-wrap gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function ClubEthosPage() {
  const { clubId } = useParams();
  
  // Fetch club from API
  const { data: club, isLoading, error } = useClubById(clubId);

  // Show not found if club doesn't exist after loading
  if (!isLoading && !club && error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="mx-auto px-4 py-4">
          <div className="card">Club not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Club History */}
          {isLoading ? (
            <CardSkeleton lines={4} hasGrid={true} />
          ) : (
            <div className="card mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our History</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {club?.history}
              </p>
              <div className="mt-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Founded</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{club?.founded}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{club?.location.city}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Club Ethos */}
          {isLoading ? (
            <CardSkeleton lines={2} />
          ) : (
            <div className="card mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Ethos</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {club?.ethos}
              </p>
            </div>
          )}

          {/* Core Principles */}
          {isLoading ? (
            <PrinciplesSkeleton />
          ) : (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Core Principles</h2>
              <div className="space-y-2">
                {club?.principles?.map((principle, index) => {
                  const [title, description] = principle.split(' - ');
                  return (
                    <div key={index} className="flex gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: club?.colors.primary }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Community Statement */}
          {isLoading ? (
            <CommunityStatementSkeleton />
          ) : (
            <div className="mt-4 p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">A Community for Everyone</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                At {club?.name}, we welcome players, coaches, volunteers, and supporters of all ages and abilities. 
                Whether you're just starting your football journey or have years of experience, there's a place for you here. 
                We believe that football is for everyone, and we're committed to creating an inclusive, supportive environment 
                where everyone can grow, learn, and enjoy the beautiful game.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge-primary">All Ages</span>
                <span className="badge-primary">All Abilities</span>
                <span className="badge-primary">All Welcome</span>
                <span className="badge-primary">Community First</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
