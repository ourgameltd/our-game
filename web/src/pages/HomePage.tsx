import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/api/hooks';

export default function HomePage() {
  // Get auth state
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Get user profile (only when authenticated)
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useCurrentUser();
  
  // Check if user is logged in
  const isLoggedIn = isAuthenticated;

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
          <div className="text-center mb-4">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-3 shadow-2xl">
                <Logo size={100}/>
              </div>
            </div>

            {/* Name/Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-white drop-shadow-2xl">
              It's <span className="text-primary-300">Our Game</span>!
            </h1>
            
            <p className="text-base md:text-lg mb-4 text-white/90 drop-shadow-lg max-w-xl mx-auto">
              Community Football for Everyone
            </p>

            {/* Buttons - Loading state */}
            {isAuthLoading && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <div className="animate-pulse h-12 w-32 bg-white/20 rounded-full" />
                <div className="animate-pulse h-12 w-32 bg-white/20 rounded-full" />
              </div>
            )}

            {/* Buttons - Only show if not logged in */}
            {!isAuthLoading && !isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link 
                  to="/register" 
                  className="group relative px-8 py-3 text-base font-semibold bg-white text-primary-700 rounded-full hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                >
                  <span className="relative z-10">Sign Up</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <a 
                  href="/dashboard" 
                  className="group relative px-8 py-3 text-base font-semibold bg-transparent text-white rounded-full transition-all duration-300 border-2 border-white/80 hover:border-white shadow-lg hover:shadow-xl backdrop-blur-sm hover:bg-white/10"
                >
                  <span className="relative z-10">Login</span>
                </a>
              </div>
            )}

            {/* Welcome message for logged in users */}
            {!isAuthLoading && isLoggedIn && (
              <div className="mb-4">
                {/* Loading state for profile */}
                {isProfileLoading && (
                  <div className="animate-pulse h-8 w-64 bg-white/20 rounded-full mx-auto mb-4" />
                )}
                
                {/* Error state for profile */}
                {!isProfileLoading && profileError && (
                  <div className="mb-4 max-w-md mx-auto">
                    <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium">Failed to load profile</p>
                      <p className="text-red-600 text-sm mt-1">{profileError.message}</p>
                    </div>
                  </div>
                )}
                
                {/* Welcome message when profile is loaded */}
                {!isProfileLoading && !profileError && (
                  <p className="text-xl text-white/90 drop-shadow-lg">
                    Welcome back, {userProfile?.firstName || 'there'}!
                  </p>
                )}
                
                <a 
                  href="/dashboard" 
                  className="inline-block mt-4 px-8 py-3 text-base font-semibold bg-white text-primary-700 rounded-full hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Continue to Dashboard
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
