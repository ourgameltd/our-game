import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import Logo from '../components/common/Logo';
import MatchesCard from '../components/matches/MatchesCard';
import { currentUser } from '../data/currentUser';
import { sampleMatches } from '../data/matches';
import { sampleTeams } from '../data/teams';
import { samplePlayers } from '../data/players';
import { sampleAgeGroups } from '../data/ageGroups';

export default function HomePage() {
  // Check if user is logged in
  const isLoggedIn = currentUser && currentUser.role;

  // Get upcoming matches relevant to the user
  const userUpcomingMatches = useMemo(() => {
    if (!isLoggedIn) return [];

    const now = new Date();
    const upcomingMatches = sampleMatches.filter(match => 
      new Date(match.date) > now && 
      match.status === 'scheduled'
    );

    // Filter matches based on user role
    if (currentUser.role === 'coach' && currentUser.staffId) {
      // Show matches for teams the coach is assigned to
      return upcomingMatches.filter(match => 
        match.coachIds && match.coachIds.includes(currentUser.staffId!)
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
    }

    if (currentUser.role === 'parent' && currentUser.childrenIds) {
      // Show matches for teams their children play in
      const childTeamIds = new Set<string>();
      currentUser.childrenIds.forEach(childId => {
        const child = samplePlayers.find(p => p.id === childId);
        if (child?.teamIds) {
          child.teamIds.forEach(teamId => childTeamIds.add(teamId));
        }
      });
      return upcomingMatches.filter(match => 
        childTeamIds.has(match.teamId)
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
    }

    if (currentUser.role === 'player' && currentUser.playerId) {
      // Show matches for teams the player is in
      const player = samplePlayers.find(p => p.id === currentUser.playerId);
      if (player?.teamIds) {
        return upcomingMatches.filter(match => 
          player.teamIds.includes(match.teamId)
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
      }
    }

    return [];
  }, [isLoggedIn]);

  // Helper function to get team info for a match
  const getTeamInfo = (match: any) => {
    const team = sampleTeams.find(t => t.id === match.teamId);
    if (!team) return null;
    
    const ageGroup = sampleAgeGroups.find(ag => ag.id === team.ageGroupId);
    return {
      teamName: team.name,
      ageGroupName: ageGroup?.name || 'Unknown'
    };
  };

  // Helper function to get match link
  const getMatchLink = (matchId: string, match: any) => {
    const team = sampleTeams.find(t => t.id === match.teamId);
    if (!team) return '#';
    
    const ageGroup = sampleAgeGroups.find(ag => ag.id === team.ageGroupId);
    if (!ageGroup) return '#';
    
    return `/dashboard/${team.clubId}/${ageGroup.id}/${team.id}/matches/${matchId}`;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2070&auto=format&fit=crop)',
          filter: 'blur(4px)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-3 shadow-2xl">
                <Logo size={100}/>
              </div>
            </div>

            {/* Name/Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-white drop-shadow-2xl">
              It's <span className="text-primary-300">Our Game</span>!
            </h1>
            
            <p className="text-base md:text-lg mb-8 text-white/90 drop-shadow-lg max-w-xl mx-auto">
              Community Football for Everyone
            </p>

            {/* Buttons - Only show if not logged in */}
            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link 
                  to="/register" 
                  className="group relative px-8 py-3 text-base font-semibold bg-white text-primary-700 rounded-full hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  <span className="relative z-10">Sign Up</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  to="/login" 
                  className="group relative px-8 py-3 text-base font-semibold bg-transparent text-white rounded-full transition-all duration-300 border-2 border-white/80 hover:border-white shadow-lg hover:shadow-xl backdrop-blur-sm hover:bg-white/10"
                >
                  <span className="relative z-10">Login</span>
                </Link>
              </div>
            )}

            {/* Welcome message for logged in users */}
            {isLoggedIn && (
              <div className="mb-6">
                <p className="text-xl text-white/90 drop-shadow-lg">
                  Welcome back, {currentUser.firstName}!
                </p>
                <Link 
                  to="/login" 
                  className="inline-block mt-4 px-8 py-3 text-base font-semibold bg-white text-primary-700 rounded-full hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
