import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, type InviteDetailsDto, type InviteLinkOptionsDto } from '@/api/client';

type PageState = 'LOADING' | 'READY' | 'SAVING' | 'ERROR';

const INVITE_TYPE_LABELS: Record<number, string> = {
  0: 'Coach',
  1: 'Player',
  2: 'Player Parent',
};

export default function InviteAcceptPage() {
  const { code } = useParams<{ code: string }>();
  const { isAuthenticated, isLoading: authLoading, displayName, user } = useAuth();
  const [pageState, setPageState] = useState<PageState>('LOADING');
  const [invite, setInvite] = useState<InviteDetailsDto | null>(null);
  const [linkOptions, setLinkOptions] = useState<InviteLinkOptionsDto | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

      setInvite(inviteResponse.data);

      if (isAuthenticated && inviteResponse.data.isOpenInvite) {
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

    if (!invite.isOpenInvite) {
      const names = (displayName ?? '').split(' ');
      const accept = await apiClient.invites.accept(code, {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' '),
      });
      if (accept.success) {
        setMessage('Invite accepted. Your account is now linked.');
        setPageState('READY');
      } else {
        setErrorMessage(accept.error?.message || 'Unable to accept invite.');
        setPageState('ERROR');
      }
      return;
    }

    const update = await apiClient.invites.updateLinks(code, { selectedEntityIds: selected });
    if (update.success) {
      setMessage('Links updated successfully.');
      const refreshed = await apiClient.invites.getLinkOptions(code);
      if (refreshed.success && refreshed.data) {
        setLinkOptions(refreshed.data);
      }
      setPageState('READY');
    } else {
      setErrorMessage(update.error?.message || 'Unable to save links.');
      setPageState('ERROR');
    }
  };

  if (authLoading || pageState === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">Loading invite...</div>
      </div>
    );
  }

  if (pageState === 'ERROR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invite Error</h1>
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite</h1>
        <p className="text-sm text-gray-600 mb-4">
          Join <strong>{invite?.clubName}</strong> as <strong>{roleLabel}</strong>.
        </p>

        {!isAuthenticated ? (
          <a
            href={signInUrl}
            className="inline-flex px-4 py-2 rounded-lg bg-primary-600 text-white"
          >
            Sign in / Sign up
          </a>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Signed in as <strong>{user?.userDetails || 'account user'}</strong>
            </p>

            {invite?.isOpenInvite && linkOptions ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  {linkOptions.canSelectMultiple
                    ? 'Select one or more players to link.'
                    : 'Select a single account to link.'}
                </p>

                <div className="space-y-2 max-h-72 overflow-auto">
                  {linkOptions.candidates.map(candidate => {
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
                        className={`w-full text-left p-3 rounded border ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 bg-white'
                        } disabled:opacity-50`}
                      >
                        <div className="font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-xs text-gray-500">
                          {candidate.isLinkedToCurrentUser
                            ? 'Linked to your account'
                            : candidate.isLinked
                              ? 'Linked to another account'
                              : 'Available'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">This invite links directly to one account.</p>
            )}

            <button
              type="button"
              onClick={saveLinks}
              disabled={pageState === 'SAVING'}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-50"
            >
              {pageState === 'SAVING' ? 'Saving...' : 'Save'}
            </button>
            {message && <p className="text-sm text-green-600">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
