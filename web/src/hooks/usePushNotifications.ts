import { useState, useEffect, useCallback } from 'react';

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface PushSubscriptionState {
  isSupported: boolean;
  permission: PushPermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

/**
 * Converts a base64 URL-encoded VAPID public key to a Uint8Array
 * as required by the PushManager.subscribe API.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0))) as Uint8Array<ArrayBuffer>;
}

/**
 * Fetches the VAPID public key from the backend.
 */
async function fetchVapidPublicKey(): Promise<string> {
  const response = await fetch('/api/v1/push-subscriptions/vapid-public-key');
  if (!response.ok) {
    throw new Error('Failed to fetch VAPID public key');
  }
  const data = await response.json();
  return data.publicKey as string;
}

/**
 * Sends the push subscription to the backend for storage.
 */
async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const response = await fetch('/api/v1/push-subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) {
    throw new Error('Failed to save push subscription');
  }
}

/**
 * Removes the push subscription from the backend.
 */
async function deletePushSubscription(endpoint: string): Promise<void> {
  const response = await fetch('/api/v1/push-subscriptions', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
  if (!response.ok) {
    throw new Error('Failed to delete push subscription');
  }
}

/**
 * Hook to manage browser push notification subscriptions.
 * Handles VAPID-based Web Push API interactions.
 */
export function usePushNotifications(): PushSubscriptionState {
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  const [permission, setPermission] = useState<PushPermissionState>(
    isSupported ? (Notification.permission as PushPermissionState) : 'unsupported'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check current subscription status on mount
  useEffect(() => {
    if (!isSupported) return;

    async function checkSubscription() {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        setIsSubscribed(existing !== null);
      } catch {
        // Silently ignore – push may not be available in all contexts
      }
    }

    checkSubscription();
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported on this device.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);

      if (result !== 'granted') {
        setError('Notification permission was not granted.');
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Fetch VAPID public key from backend
      const vapidPublicKey = await fetchVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Save subscription to backend
      await savePushSubscription(subscription);
      setIsSubscribed(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable push notifications.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable push notifications.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}
