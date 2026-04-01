import { useState, useCallback, useRef } from 'react';
import { apiClient, InviteType, CreateInviteRequest } from '@/api/client';

interface UseInviteOptions {
  email?: string;
  type: InviteType;
  entityId?: string;
  clubId?: string;
}

interface UseInviteReturn {
  sendInvite: () => Promise<void>;
  isSending: boolean;
  isSuccess: boolean;
  error: string | null;
  canInvite: boolean;
}

/**
 * Hook for sending an invite from any entity page (coach, player, guardian).
 * Handles loading state, success/error feedback, and debouncing.
 */
export function useInvite({ email, type, entityId, clubId }: UseInviteOptions): UseInviteReturn {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldownRef = useRef(false);

  const canInvite = Boolean(email && entityId && clubId);

  const sendInvite = useCallback(async () => {
    if (!canInvite || isSending || cooldownRef.current) return;

    setIsSending(true);
    setError(null);
    setIsSuccess(false);

    try {
      const request: CreateInviteRequest = { email: email!, type, entityId: entityId!, clubId: clubId! };
      const result = await apiClient.invites.create(request);

      if (result.success) {
        setIsSuccess(true);
        // Prevent re-clicks for 10 seconds after success
        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 10000);
      } else {
        setError(result.error?.message ?? 'Failed to send invite.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [email, type, entityId, clubId, canInvite, isSending]);

  return { sendInvite, isSending, isSuccess, error, canInvite };
}
