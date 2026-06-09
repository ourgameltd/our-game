import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '@/components/common/PageTitle';
import { Bell, BellOff, Check, CheckCheck, Trophy, Users, Calendar, Megaphone, MessageSquare, Smartphone, AlertCircle, Loader2, Newspaper } from 'lucide-react';
import { getNotificationTypeColors } from '@/data/referenceData';
import { usePageTitle } from '@/hooks/usePageTitle';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { apiClient, type NotificationDto } from '@/api/client';

const NOTIFICATIONS_READ_EVENT = 'ourgame:notifications-read';
const dispatchNotificationsRead = (delta: number) =>
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_READ_EVENT, { detail: { delta } }));

const PAGE_SIZE = 20;

export default function FeedPage() {
  usePageTitle(['Feed']);
  const navigate = useNavigate();

  const [items, setItems] = useState<NotificationDto[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const push = usePushNotifications();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (pageNum: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setDataError(null);

    const response = await apiClient.notifications.getMyNotifications({ page: pageNum, pageSize: PAGE_SIZE });
    if (response.success && response.data) {
      const { items: newItems, hasNextPage: nextPage } = response.data;
      setItems(prev => append ? [...prev, ...newItems] : newItems);
      setHasNextPage(nextPage);
      setPage(pageNum);
      if (!append) {
        const unread = newItems.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } else {
      setDataError(response.error?.message ?? 'Failed to load feed.');
    }

    if (append) setLoadingMore(false);
    else setLoading(false);
  }, []);

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  // Infinite scroll sentinel
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          void loadPage(page + 1, true);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, page, loadPage]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match': return <Trophy className="w-5 h-5" />;
      case 'training': return <Calendar className="w-5 h-5" />;
      case 'team': return <Users className="w-5 h-5" />;
      case 'announcement': return <Megaphone className="w-5 h-5" />;
      case 'message': return <MessageSquare className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
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

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const markAsRead = async (id: string) => {
    const response = await apiClient.notifications.markAsRead(id);
    if (response.success || response.statusCode === 204) {
      setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      dispatchNotificationsRead(1);
    }
  };

  const markAllAsRead = async () => {
    const response = await apiClient.notifications.markAllAsRead();
    if (response.success || response.statusCode === 204) {
      const count = items.filter(n => !n.isRead).length;
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      dispatchNotificationsRead(count);
    }
  };

  const handleItemClick = (item: NotificationDto) => {
    if (!item.isRead) void markAsRead(item.id);
    if (item.url) navigate(item.url);
  };

  const renderFeedItem = (item: NotificationDto) => (
    <div
      key={item.id}
      onClick={() => handleItemClick(item)}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all hover:shadow-md ${item.url ? 'cursor-pointer' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-stretch gap-3">
          <div
            className={`w-1 self-stretch rounded-full flex-shrink-0 ${
              !item.isRead
                ? 'bg-primary-500 dark:bg-primary-400'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`p-3 rounded-xl flex-shrink-0 ${getNotificationColor(item.type)}`}>
              {getNotificationIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold mb-0.5 ${
                    !item.isRead
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                    {item.message}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTimestamp(new Date(item.createdAt))}
                  </span>
                </div>
                {!item.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); void markAsRead(item.id); }}
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
          title="Feed"
          subtitle={unreadCount > 0
            ? `${unreadCount} unread item${unreadCount !== 1 ? 's' : ''}`
            : 'All caught up'}
        />

        <div className="space-y-4">
          {/* Push Notification Opt-in Banner */}
          {push.isSupported && !push.isSubscribed && push.permission !== 'denied' && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
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
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Push notifications are blocked. To enable them, update your browser notification
                settings for this site and reload the page.
              </p>
            </div>
          )}

          {push.isIosInstallRequired && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Add to Home Screen to enable push notifications
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  On iPhone/iPad, tap the <strong>Share</strong> button in Safari then choose{' '}
                  <strong>Add to Home Screen</strong>. Open the app from your home screen and come
                  back here to enable notifications.
                </p>
              </div>
            </div>
          )}

          {push.isSupported && push.isSubscribed && (
            <div className="flex justify-end">
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{push.error}</p>
            </div>
          )}

          {/* Actions bar */}
          {!loading && !dataError && unreadCount > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {unreadCount} unread
              </span>
              <button
                onClick={() => void markAllAsRead()}
                className="btn-sm btn-secondary gap-1.5"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            </div>
          )}

          {/* Feed */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-1 self-stretch rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : dataError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{dataError}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Newspaper className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Nothing here yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your feed will show matches, training, and club updates.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(item => renderFeedItem(item))}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          )}

          {/* End of feed */}
          {!loading && !loadingMore && !hasNextPage && items.length > 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400 dark:text-gray-600">You're all caught up</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
