import { useMemo } from 'react';
import { useCurrentUser, useMyChildren } from '@/api/hooks';

export interface AccessProfile {
  isAdmin: boolean;
  isCoach: boolean;
  isPlayer: boolean;
  isParent: boolean;
  isRestrictedLinkedAccount: boolean;
  linkedPlayerIds: string[];
}

export function useAccessProfile(isAdmin: boolean = false): {
  profile: AccessProfile;
  isLoading: boolean;
} {
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { data: myChildren, isLoading: myChildrenLoading } = useMyChildren();

  const profile = useMemo<AccessProfile>(() => {
    const linkedPlayerIds = new Set<string>();

    if (currentUser?.playerId) {
      linkedPlayerIds.add(currentUser.playerId);
    }

    for (const child of myChildren ?? []) {
      if (child.id) {
        linkedPlayerIds.add(child.id);
      }
    }

    const isCoach = !!currentUser?.coachId;
    const isPlayer = !!currentUser?.playerId;
    const isParent = (myChildren?.length ?? 0) > 0;

    return {
      isAdmin,
      isCoach,
      isPlayer,
      isParent,
      isRestrictedLinkedAccount: !isAdmin && !isCoach && (isPlayer || isParent),
      linkedPlayerIds: Array.from(linkedPlayerIds),
    };
  }, [currentUser?.coachId, currentUser?.playerId, isAdmin, myChildren]);

  return {
    profile,
    isLoading: currentUserLoading || myChildrenLoading,
  };
}