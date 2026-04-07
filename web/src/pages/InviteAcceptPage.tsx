import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, type InviteDetailsDto, type InviteLinkOptionsDto } from '@/api/client';
import { Routes } from '@/utils/routes';

type PageState = 'LOADING' | 'READY' | 'SAVING' | 'SAVED' | 'ERROR';

const INVITE_TYPE_LABELS: Record<number, string> = {
  0: 'Coach',
  1: 'Player',
  2: 'Player Parent',
};

// InviteStatus enum values from the backend
const INVITE_STATUS_EXPIRED = 3;
const INVITE_STATUS_REVOKED = 2;

export default function InviteAcceptPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, displayName, user } = useAuth();
  const [pageState, setPageState] = useState<PageState>('LOADING');
  const [invite, setInvite] = useState<InviteDetailsDto | null>(null);
  const [linkOptions, setLinkOptions] = useState<InviteLinkOptionsDto | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [filterText, setFilterText] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!code) {
      setPageState('ERROR');
      setErrorMessage('Invalid invite link.');
      return;
    }

    const load = async () => {
      setPageState('LOADING');
      const inviteResponse = await apiClient.invites.getByCode(code);
      if (!inviteResponse.success || !inviteResponse.data) {
        setPageState('ERROR');
        setErrorMessage(inviteResponse.error?.message || 'Unable to load invite.');
        return;
      }

      const inv = inviteResponse.data;
      setInvite(inv);

      if (inv.status === INVITE_STATUS_EXPIRED || inv.status === INVITE_STATUS_REVOKED) {
        setPageState('ERROR');
        setErrorMessage(
          inv.status === INVITE_STATUS_EXPIRED
            ? 'This invite has expired. Please request a new link from your club.'
            : 'This invite has been revoked. Please request a new link from your club.'
        );
        return;
      }

      if (isAuthenticated && inv.isOpenInvite) {
        const optionsResponse = await apiClient.invites.getLinkOptions(code);
        if (optionsResponse.success && optionsResponse.data) {
          setLinkOptions(optionsResponse.data);
          setSelected(
            optionsResponse.data.candidates.filter(c => c.isLinkedToCurrentUser).map(c => c.id)
          );
        } else {
          setErrorMessage(optionsResponse.error?.message || 'Unable to load link options.');
          setPageState('ERROR');
          return;
        }
      }

      setPageState('READY');
    };

    load();
  }, [code, isAuthenticated]);

  const roleLabel = useMemo(
    () => (invite ? INVITE_TYPE_LABELS[invite.type] || 'Member' : 'Member'),
    [invite]
  );

  const filteredCandidates = useMemo(() => {
    if (!linkOptions) return [];
    if (!filterText.trim()) return linkOptions.candidates;
    const q = filterText.toLowerCase();
    return linkOptions.candidates.filter(c => c.name.toLowerCase().includes(q));
  }, [linkOptions, filterText]);

  const signInUrl = `/.auth/login/btoc?post_login_redirect_uri=/invite/${code ?? ''}`;

  const toggleSelection = (entityId: string) => {
    if (!linkOptions) return;
    if (linkOptions.canSelectMultiple) {
      setSelected(prev =>
        prev.includes(entityId) ? prev.filter(id => id !== entityId) : [...prev, entityId]
      );
      return;
    }

    const currentlySelected = selected.includes(entityId);
    setSelected(currentlySelected ? [] : [entityId]);
  };

  const saveLinks = async () => {
    if (!code || !invite) return;
    setPageState('SAVING');
    setMessage('');
    setErrorMessage('');

    if (!invite.isOpenInvite) {
      const names = (displayName ?? '').split(' ');
      const accept = await apiClient.invites.accept(code, {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' '),
      });
      if (accept.success) {
        setMessage('Invite accepted! Redirecting to your dashboard...');
        setPageState('SAVED');
        redirectTimer.current = setTimeout(() => navigate(Routes.dashboard()), 2000);
      } else {
        setErrorMessage(accept.error?.message || 'Unable to accept invite.');
        setPageState('ERROR');
      }
      return;
    }

    const update = await apiClient.invites.updateLinks(code, { selectedEntityIds: selected });
    if (update.success) {
      setMessage('Links saved! Redirecting to your dashboard...');
      setFilterText('');
      setPageState('SAVED');
      redirectTimer.current = setTimeout(() => navigate(Routes.dashboard()), 2000);
    } else {
      setErrorMessage(update.error?.message || 'Unable to save links.');
      setPageState('ERROR');
    }
  };

  if (authLoading || pageState === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading invite...</div>
      </div>
    );
  }

  if (pageState === 'ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="card max-w-md w-full mx-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Invite Error</h1>
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="card max-w-xl w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invite</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Join <strong className="text-gray-900 dark:text-white">{invite?.clubName}</strong> as{' '}
          <strong className="text-gray-900 dark:text-white">{roleLabel}</strong>.
        </p>

        {!isAuthenticated ? (
          <a href={signInUrl} className="btn-primary btn-md">
            Sign in / Sign up
          </a>
        ) : pageState === 'SAVED' ? (
          <div className="text-center py-4">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{message}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Signed in as{' '}
              <strong className="text-gray-900 dark:text-white">
                {user?.userDetails || 'account user'}
              </strong>
            </p>

            {invite?.isOpenInvite && linkOptions ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {linkOptions.canSelectMultiple
                    ? 'Select one or more players to link.'
                    : 'Select a single account to link.'}
                </p>

                {linkOptions.hasSingleLinkAssigned && !linkOptions.canSelectMultiple && (
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    You can change your selection and save again.
                  </p>
                )}

                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  className="input"
                />

                <div className="space-y-2 max-h-72 overflow-auto">
                  {filteredCandidates.map(candidate => {
                    const isSelected = selected.includes(candidate.id);
                    const disabled =
                      !candidate.isLinkedToCurrentUser &&
                      candidate.isLinked &&
                      !isSelected;
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleSelection(candidate.id)}
                        className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {candidate.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {candidate.isLinkedToCurrentUser
                            ? 'Your current selection'
                            : candidate.isLinked
                              ? 'Linked to another account'
                              : 'Available'}
                        </div>
                      </button>
                    );
                  })}
                  {filteredCandidates.length === 0 && filterText && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      No matches found.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This invite links directly to one account.
              </p>
            )}

            <button
              type="button"
              onClick={saveLinks}
              disabled={pageState === 'SAVING'}
              className="btn-primary btn-md"
            >
              {pageState === 'SAVING' ? 'Saving...' : 'Save'}
            </button>
            {message && (
              <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
            )}
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
