import { useEffect, useMemo, useState } from 'react';
import { useRequiredParams } from '@/utils/routeParams';
import { usePageTitle } from '@/hooks/usePageTitle';
import PageTitle from '@/components/common/PageTitle';
import { apiClient, InviteType, type CreateInviteRequest } from '@/api/client';
import { Routes } from '@/utils/routes';

const OPEN_INVITE_EMAIL = 'open-invite@ourgame.local';

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
  const [codes, setCodes] = useState<Record<InviteType, string>>({ 0: '', 1: '', 2: '' });
  const [errors, setErrors] = useState<Record<InviteType, string>>({ 0: '', 1: '', 2: '' });
  const [creating, setCreating] = useState<Record<InviteType, boolean>>({ 0: false, 1: false, 2: false });
  const [copied, setCopied] = useState<Record<InviteType, boolean>>({ 0: false, 1: false, 2: false });

  useEffect(() => {
    if (!clubId || !ageGroupId) return;

    const load = async () => {
      setIsLoading(true);
      const [ageGroup, invites] = await Promise.all([
        apiClient.ageGroups.getById(ageGroupId),
        apiClient.invites.getForClub(clubId),
      ]);

      if (ageGroup.success && ageGroup.data) {
        setAgeGroupName(ageGroup.data.name);
      }

      if (invites.success && invites.data) {
        const updated = { 0: '', 1: '', 2: '' } as Record<InviteType, string>;
        for (const role of inviteRoles) {
          const existing = invites.data.find(i =>
            i.type === role.type &&
            i.entityId === ageGroupId &&
            i.status === 0 &&
            i.isOpenInvite
          );
          if (existing) updated[role.type] = existing.code;
        }
        setCodes(updated);
      }
      setIsLoading(false);
    };

    load();
  }, [clubId, ageGroupId]);

  const inviteLinks = useMemo(() => {
    const base = window.location.origin;
    return {
      0: codes[0] ? `${base}${Routes.invite(codes[0])}` : '',
      1: codes[1] ? `${base}${Routes.invite(codes[1])}` : '',
      2: codes[2] ? `${base}${Routes.invite(codes[2])}` : '',
    } as Record<InviteType, string>;
  }, [codes]);

  if (!clubId || !ageGroupId) return null;

  const createInvite = async (type: InviteType) => {
    if (codes[type]) return;
    setCreating(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: '' }));

    const request: CreateInviteRequest = {
      clubId,
      type,
      entityId: ageGroupId,
      email: OPEN_INVITE_EMAIL,
      isOpenInvite: true,
    };

    const response = await apiClient.invites.create(request);
    if (response.success && response.data) {
      setCodes(prev => ({ ...prev, [type]: response.data!.code }));
    } else {
      setErrors(prev => ({ ...prev, [type]: response.error?.message || 'Unable to create invite' }));
    }
    setCreating(prev => ({ ...prev, [type]: false }));
  };

  const copyLink = async (type: InviteType) => {
    const link = inviteLinks[type];
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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {role.type === 2
                        ? 'Parents can link multiple players.'
                        : 'Users can link one account and switch if needed.'}
                    </p>
                  </div>
                  {!codes[role.type] ? (
                    <button
                      type="button"
                      onClick={() => createInvite(role.type)}
                      disabled={creating[role.type]}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {creating[role.type] ? 'Creating...' : 'Create Link'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => copyLink(role.type)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      {copied[role.type] ? 'Copied' : 'Copy Link'}
                    </button>
                  )}
                </div>

                {codes[role.type] && (
                  <div className="mt-3 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm break-all">
                    {inviteLinks[role.type]}
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
