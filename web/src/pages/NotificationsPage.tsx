import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '@/components/common/PageTitle';
import EmptyState from '@/components/common/EmptyState';
import { Bell, BellOff, Check, CheckCheck, ChevronDown, ChevronUp, Trophy, Users, Calendar, Megaphone, MessageSquare, Smartphone, AlertCircle, Loader2 } from 'lucide-react';
import { getNotificationTypeColors } from '@/data/referenceData';
import { usePageTitle } from '@/hooks/usePageTitle';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { apiClient, type NotificationDto } from '@/api/client';

const NOTIFICATIONS_READ_EVENT = 'ourgame:notifications-read';
const dispatchNotificationsRead = (delta: number) =>
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_READ_EVENT, { detail: { delta } }));

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  usePageTitle(['Notifications']);
  const navigate = useNavigate();

  const [unreadNotifications, setUnreadNotifications] = useState<NotificationDto[]>([]);
  const [readNotifications, setReadNotifications] = useState<NotificationDto[]>([]);
  const [showReadSection, setShowReadSection] = useState(false);
  const [readPage, setReadPage] = useState(1);
  const [readHasNextPage, setReadHasNextPage] = useState(false);
  const [readTotalCount, setReadTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingRead, setLoadingRead] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const push = usePushNotifications();

  const loadUnread = useCallback(async () => {
    setLoading(true);
    setDataError(null);
    const response = await apiClient.notifications.getMyNotifications({ unreadOnly: true, pageSize: 50 });
    if (response.success && response.data) {
      setUnreadNotifications(response.data.items);
      setReadTotalCount(0);
    } else {
      setUnreadNotifications([]);
      setDataError(response.error?.message ?? 'Failed to load notifications.');
    }
    setLoading(false);
  }, []);

  const loadReadPage = useCallback(async (page: number, append: boolean) => {
    setLoadingRead(true);
    const response = await apiClient.notifications.getMyNotifications({ readOnly: true, page, pageSize: PAGE_SIZE });
    if (response.success && response.data) {
      const { items, hasNextPage, totalCount } = response.data;
      setReadNotifications(prev => append ? [...prev, ...items] : items);
      setReadHasNextPage(hasNextPage);
      setReadTotalCount(totalCount);
      setReadPage(page);
    }
    setLoadingRead(false);
  }, []);

  useEffect(() => {
    void loadUnread();
  }, [loadUnread]);

  const handleToggleReadSection = async () => {
    if (!showReadSection && readNotifications.length === 0) {
      await loadReadPage(1, false);
    }
    setShowReadSection(prev => !prev);
  };

  const handleLoadMore = async () => {
    await loadReadPage(readPage + 1, true);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Trophy className="w-5 h-5" />;
      case 'training':
        return <Calendar className="w-5 h-5" />;
      case 'team':
        return <Users className="w-5 h-5" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    const colors = getNotificationTypeColors(type);
    return `${colors.bgColor} ${colors.textColor}`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }
  };

  const markAsRead = async (id: string) => {
    const notification = unreadNotifications.find(n => n.id === id);
    const response = await apiClient.notifications.markAsRead(id);
    if (response.success || response.statusCode === 204) {
      setUnreadNotifications(prev => prev.filter(n => n.id !== id));
      setReadTotalCount(prev => prev + 1);
      if (showReadSection && notification) {
        setReadNotifications(prev => [{ ...notification, isRead: true }, ...prev]);
      }
      dispatchNotificationsRead(1);
    }
  };

  const markAllAsRead = async () => {
    const response = await apiClient.notifications.markAllAsRead();
    if (response.success || response.statusCode === 204) {
      const count = unreadNotifications.length;
      setUnreadNotifications([]);
      setReadTotalCount(prev => prev + count);
      if (showReadSection) {
        await loadReadPage(1, false);
      }
      dispatchNotificationsRead(count);
    }
  };

  const renderNotificationCard = (notification: NotificationDto) => (
    <div
      key={notification.id}
      onClick={notification.url ? () => { navigate(notification.url!); } : undefined}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all hover:shadow-md ${notification.url ? 'cursor-pointer' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-stretch gap-3">
          <div
            className={`w-1 self-stretch rounded-full flex-shrink-0 ${
              !notification.isRead
                ? 'bg-primary-500 dark:bg-primary-400'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`p-3 rounded-lg flex-shrink-0 ${getNotificationColor(notification.type)}`}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold mb-1 ${
                    !notification.isRead
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formatTimestamp(new Date(notification.createdAt))}
                  </span>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); void markAsRead(notification.id); }}
                    className="btn-sm btn-secondary btn-icon flex-shrink-0"
                    aria-label="Mark as read"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto px-4 py-4">
        <PageTitle
          title="Notifications"
          subtitle={`You have ${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? 's' : ''}`}
        />

        <div>
          {/* Push Notification Opt-in Banner */}
          {push.isSupported && !push.isSubscribed && push.permission !== 'denied' && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-900 dark:text-primary-100">
                    Get push notifications
                  </p>
                  <p className="text-xs text-primary-700 dark:text-primary-300">
                    {push.permission === 'granted'
                      ? 'Permission already allowed — click to finish registering this device.'
                      : 'Receive instant alerts on this device for matches, training, and club updates.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => void push.subscribe()}
                disabled={push.isLoading}
                className="btn btn-md btn-primary gap-2 disabled:opacity-60 flex-shrink-0"
              >
                {push.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Enable notifications
              </button>
            </div>
          )}

          {push.isSupported && push.permission === 'denied' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Push notifications are blocked. To enable them, update your browser notification
                settings for this site and reload the page.
              </p>
            </div>
          )}

          {push.isSupported && push.isSubscribed && (
            <div className="flex justify-end mb-4">
              <button
                onClick={push.unsubscribe}
                disabled={push.isLoading}
                title="Push notifications enabled — click to disable"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-colors disabled:opacity-60 group"
              >
                {push.isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 group-hover:hidden" />
                    <BellOff className="w-3.5 h-3.5 hidden group-hover:block" />
                  </>
                )}
                <span className="group-hover:hidden">Notifications on</span>
                <span className="hidden group-hover:inline">Disable</span>
              </button>
            </div>
          )}

          {push.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{push.error}</p>
            </div>
          )}

          {/* Actions Bar */}
          {!loading && !dataError && unreadNotifications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 flex justify-end">
              <button
                onClick={() => void markAllAsRead()}
                className="btn-sm btn-primary btn-icon"
                aria-label="Mark all as read"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Unread Notifications */}
          <div className="space-y-2">
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <Loader2 className="w-8 h-8 mx-auto text-primary-500 animate-spin mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
              </div>
            ) : dataError ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{dataError}</p>
              </div>
            ) : unreadNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="All caught up"
                description="You have no unread notifications."
              />
            ) : (
              unreadNotifications.map(n => renderNotificationCard(n))
            )}
          </div>

          {/* Read Notifications — Collapsible */}
          {!loading && !dataError && (
            <div className="mt-4">
              <button
                onClick={() => void handleToggleReadSection()}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {readTotalCount > 0
                    ? `${readTotalCount} read notification${readTotalCount !== 1 ? 's' : ''}`
                    : 'Read notifications'}
                </span>
                {showReadSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showReadSection && (
                <div className="mt-2 space-y-2">
                  {loadingRead && readNotifications.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                      <Loader2 className="w-6 h-6 mx-auto text-primary-500 animate-spin mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                  ) : readNotifications.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No read notifications.</p>
                    </div>
                  ) : (
                    readNotifications.map(n => renderNotificationCard(n))
                  )}

                  {readHasNextPage && (
                    <button
                      onClick={() => void handleLoadMore()}
                      disabled={loadingRead}
                      className="w-full py-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loadingRead ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load more'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
