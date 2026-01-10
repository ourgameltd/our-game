import { useParams } from 'react-router-dom';
import { getClubById } from '@data/clubs';

export default function ClubEthosPage() {
  const { clubId } = useParams();
  const club = getClubById(clubId!);

  if (!club) {
    return <div>Club not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Club History */}
          <div className="card mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our History</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {club.history}
            </p>
            <div className="mt-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Founded</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{club.founded}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{club.location.city}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Club Ethos */}
          <div className="card mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Ethos</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {club.ethos}
            </p>
          </div>

          {/* Core Principles */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Core Principles</h2>
            <div className="space-y-2">
              {club.principles?.map((principle, index) => {
                const [title, description] = principle.split(' - ');
                return (
                  <div key={index} className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: club.colors.primary }}
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

          {/* Community Statement */}
          <div className="mt-4 p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">A Community for Everyone</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              At {club.name}, we welcome players, coaches, volunteers, and supporters of all ages and abilities. 
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
        </div>
      </main>
    </div>
  );
}
