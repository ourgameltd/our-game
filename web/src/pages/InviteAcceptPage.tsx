import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, InviteDetailsDto } from '@/api/client';

type PageState =
  | 'LOADING'
  | 'INVITE_LOADED'
  | 'ACCEPTING'
  | 'ACCEPTED'
  | 'ERROR';

const INVITE_TYPE_LABELS: Record<number, string> = {
  0: 'Coach',
  1: 'Player',
  2: 'Parent',
};

const INVITE_STATUS_LABELS: Record<number, string> = {
  0: 'Pending',
  1: 'Accepted',
  2: 'Expired',
  3: 'Revoked',
};

export default function InviteAcceptPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user, displayName } = useAuth();

  const [pageState, setPageState] = useState<PageState>('LOADING');
  const [invite, setInvite] = useState<InviteDetailsDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load invite details
  useEffect(() => {
    if (!code) {
      setErrorMessage('Invalid invite link.');
      setPageState('ERROR');
      return;
    }

    const loadInvite = async () => {
      try {
        const result = await apiClient.invites.getByCode(code);
        if (result.success && result.data) {
          setInvite(result.data);
          setPageState('INVITE_LOADED');
        } else {
          setErrorMessage(result.error?.message ?? 'Invite not found or has expired.');
          setPageState('ERROR');
        }
      } catch {
        setErrorMessage('Unable to load invite details. Please try again.');
        setPageState('ERROR');
      }
    };

    loadInvite();
  }, [code]);

  const handleAccept = async () => {
    if (!code) return;

    setPageState('ACCEPTING');

    try {
      const nameParts = (displayName ?? '').split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') ?? '';

      const result = await apiClient.invites.accept(code, { firstName, lastName });

      if (result.success) {
        setPageState('ACCEPTED');
        setTimeout(() => navigate('/clubs'), 3000);
      } else {
        setErrorMessage(result.error?.message ?? 'Failed to accept invite. Please try again.');
        setPageState('ERROR');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setPageState('ERROR');
    }
  };

  const handleSignIn = () => {
    window.location.href = `/.auth/login/b2c?post_login_redirect_uri=/invite/${code}`;
  };

  if (authLoading || pageState === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'ACCEPTED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite Accepted!</h1>
          <p className="text-gray-600 mb-4">
            Your account has been linked successfully. Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (pageState === 'ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Invite</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // INVITE_LOADED or ACCEPTING state
  const statusLabel = invite ? INVITE_STATUS_LABELS[invite.status] : '';
  const roleLabel = invite ? INVITE_TYPE_LABELS[invite.type] : '';
  const isExpiredOrRevoked = invite && (invite.status === 2 || invite.status === 3);
  const isAlreadyAccepted = invite && invite.status === 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">You've been invited!</h1>
        </div>

        {invite && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Club</span>
              <span className="font-medium text-gray-900">{invite.clubName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Role</span>
              <span className="font-medium text-gray-900">{roleLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invited Email</span>
              <span className="font-medium text-gray-900">{invite.maskedEmail}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium ${invite.status === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {statusLabel}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expires</span>
              <span className="font-medium text-gray-900">
                {new Date(invite.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {isExpiredOrRevoked && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-sm text-red-700">
            This invite is no longer valid ({statusLabel.toLowerCase()}).
            Please contact your club administrator for a new invite.
          </div>
        )}

        {isAlreadyAccepted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-sm text-yellow-700">
            This invite has already been accepted.
          </div>
        )}

        {!isExpiredOrRevoked && !isAlreadyAccepted && (
          <>
            {!isAuthenticated ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600 text-sm">
                  Please sign in or create an account to accept this invite and join{' '}
                  <strong>{invite?.clubName}</strong>.
                </p>
                <button
                  onClick={handleSignIn}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Sign In / Register to Accept
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-600 text-sm">
                  You're signed in{user?.userDetails ? ` as <strong>${user.userDetails}</strong>` : ''}.
                  Click below to accept this invite and join{' '}
                  <strong>{invite?.clubName}</strong> as a {roleLabel}.
                </p>
                <button
                  onClick={handleAccept}
                  disabled={pageState === 'ACCEPTING'}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {pageState === 'ACCEPTING' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Accepting...
                    </span>
                  ) : (
                    'Accept Invite'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
