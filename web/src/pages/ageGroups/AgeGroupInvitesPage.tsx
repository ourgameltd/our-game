import { useEffect, useMemo, useState } from 'react';
import { Plus, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { useRequiredParams } from '@/utils/routeParams';
import { usePageTitle } from '@/hooks/usePageTitle';
import PageTitle from '@/components/common/PageTitle';
import { apiClient, InviteType, type CreateInviteRequest, type InviteDto } from '@/api/client';
import { Routes } from '@/utils/routes';

type InviteRole = {
  type: InviteType;
  label: string;
};

const inviteRoles: InviteRole[] = [
  { type: 0, label: 'Coach' },
  { type: 1, label: 'Player' },
  { type: 2, label: 'Player Parent' },
];

export default function AgeGroupInvitesPage() {
  usePageTitle(['Age Group Invites']);
  const params = useRequiredParams(['clubId', 'ageGroupId'], { returnNullOnError: true });
  const clubId = params.clubId;
  const ageGroupId = params.ageGroupId;

  const [isLoading, setIsLoading] = useState(true);
  const [ageGroupName, setAgeGroupName] = useState('Age Group');
  const [invites, setInvites] = useState<Record<InviteType, InviteDto | null>>({ 0: null, 1: null, 2: null });
  const [errors, setErrors] = useState<Record<InviteType, string>>({ 0: '', 1: '', 2: '' });
  const [creating, setCreating] = useState<Record<InviteType, boolean>>({ 0: false, 1: false, 2: false });
  const [regenerating, setRegenerating] = useState<Record<InviteType, boolean>>({ 0: false, 1: false, 2: false });
  const [copied, setCopied] = useState<Record<InviteType, boolean>>({ 0: false, 1: false, 2: false });

  useEffect(() => {
    if (!clubId || !ageGroupId) return;

    const load = async () => {
      setIsLoading(true);
      const [ageGroup, invitesResp] = await Promise.all([
        apiClient.ageGroups.getById(ageGroupId),
        apiClient.invites.getForClub(clubId),
      ]);

      if (ageGroup.success && ageGroup.data) {
        setAgeGroupName(ageGroup.data.name);
      }

      if (invitesResp.success && invitesResp.data) {
        const updated = { 0: null, 1: null, 2: null } as Record<InviteType, InviteDto | null>;
        for (const role of inviteRoles) {
          const existing = invitesResp.data.find(i =>
            i.type === role.type &&
            i.entityId === ageGroupId &&
            i.status === 0 &&
            i.isOpenInvite
          );
          if (existing) {
            updated[role.type] = existing as unknown as InviteDto;
          }
        }
        setInvites(updated);
      }
      setIsLoading(false);
    };

    load();
  }, [clubId, ageGroupId]);

  const inviteLinks = useMemo(() => {
    const base = window.location.origin;
    return {
      0: invites[0] ? `${base}${Routes.invite(invites[0].code)}` : '',
      1: invites[1] ? `${base}${Routes.invite(invites[1].code)}` : '',
      2: invites[2] ? `${base}${Routes.invite(invites[2].code)}` : '',
    } as Record<InviteType, string>;
  }, [invites]);

  const previewLinks = useMemo(() => {
    const base = window.location.origin;
    return {
      0: invites[0] ? `${base}/api/v1/invites/${invites[0].code}/preview` : '',
      1: invites[1] ? `${base}/api/v1/invites/${invites[1].code}/preview` : '',
      2: invites[2] ? `${base}/api/v1/invites/${invites[2].code}/preview` : '',
    } as Record<InviteType, string>;
  }, [invites]);

  if (!clubId || !ageGroupId) return null;

  const createInvite = async (type: InviteType) => {
    if (invites[type]) return;
    setCreating(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: '' }));

    const request: CreateInviteRequest = {
      clubId,
      type,
      entityId: ageGroupId,
      email: '',
      isOpenInvite: true,
    };

    const response = await apiClient.invites.create(request);
    if (response.success && response.data) {
      setInvites(prev => ({ ...prev, [type]: response.data! }));
    } else {
      setErrors(prev => ({ ...prev, [type]: response.error?.message || 'Unable to create invite' }));
    }
    setCreating(prev => ({ ...prev, [type]: false }));
  };

  const regenerateInvite = async (type: InviteType) => {
    const invite = invites[type];
    if (!invite) return;

    if (!window.confirm('This will invalidate the current link. Anyone with the old link will no longer be able to use it. Continue?')) {
      return;
    }

    setRegenerating(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: '' }));

    const response = await apiClient.invites.regenerate(invite.id);
    if (response.success && response.data) {
      setInvites(prev => ({ ...prev, [type]: response.data! }));
    } else {
      setErrors(prev => ({ ...prev, [type]: response.error?.message || 'Unable to regenerate invite' }));
    }
    setRegenerating(prev => ({ ...prev, [type]: false }));
  };

  const copyLink = async (type: InviteType) => {
    const link = previewLinks[type];
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(prev => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto px-4 py-4">
        <PageTitle
          title={`${ageGroupName} - Invites`}
          subtitle="Generate one reusable invite link per role and share it with your group."
        />

        {isLoading ? (
          <div className="card animate-pulse h-40" />
        ) : (
          <div className="space-y-3">
            {inviteRoles.map(role => (
              <div key={role.type} className="card">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {role.type === 2
                        ? 'Parents can link multiple players.'
                        : 'Users can link one account and switch if needed.'}
                    </p>
                  </div>
                  {!invites[role.type] && (
                    <button
                      type="button"
                      onClick={() => createInvite(role.type)}
                      disabled={creating[role.type]}
                      title="Create invite link"
                      aria-label="Create invite link"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 shrink-0"
                    >
                      {creating[role.type] ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                {invites[role.type] && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteLinks[role.type]}
                      onFocus={(e) => e.currentTarget.select()}
                      className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-mono truncate"
                    />
                    <button
                      type="button"
                      onClick={() => copyLink(role.type)}
                      title={copied[role.type] ? 'Copied' : 'Copy link'}
                      aria-label="Copy invite link"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-600 text-white hover:bg-green-700 shrink-0"
                    >
                      {copied[role.type] ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => regenerateInvite(role.type)}
                      disabled={regenerating[role.type]}
                      title="Regenerate link (invalidates the current one)"
                      aria-label="Regenerate invite link"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 shrink-0"
                    >
                      {regenerating[role.type] ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}
                {errors[role.type] && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors[role.type]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
