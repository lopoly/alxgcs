import { useState } from 'react';
import { useNotificationStore, type Notification, type NotificationType } from '@/stores/useNotificationStore';
import type { Theme } from '@/types';

interface NotificationToastProps {
  theme: Theme;
}

const typeConfig: Record<NotificationType, { icon: string; bgClass: string }> = {
  info: { icon: 'ℹ️', bgClass: 'info' },
  success: { icon: '✓', bgClass: 'success' },
  warning: { icon: '⚠️', bgClass: 'warning' },
  error: { icon: '✕', bgClass: 'error' },
};

function NotificationItem({
  notification,
  theme,
  onDismiss,
}: {
  notification: Notification;
  theme: Theme;
  onDismiss: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);
  const config = typeConfig[notification.type];

  const colors =
    theme === 'dark'
      ? {
          bg: '#0a0f14',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          info: '#00d4ff',
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4466',
        }
      : {
          bg: '#ffffff',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          info: '#0066cc',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
        };

  const accentColor = colors[notification.type];

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  };

  // Calculate time ago
  const getTimeAgo = () => {
    const seconds = Math.floor((Date.now() - notification.timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      }`}
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${accentColor}`,
        maxWidth: '380px',
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
        style={{ backgroundColor: accentColor + '20', color: accentColor }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-sm" style={{ color: colors.textPrimary }}>
            {notification.title}
          </div>
          {notification.dismissible && (
            <button
              onClick={handleDismiss}
              className="p-1 rounded hover:bg-white/10 -mt-1 -mr-1"
              style={{ color: colors.text }}
            >
              ✕
            </button>
          )}
        </div>
        {notification.message && (
          <div className="text-xs mt-1" style={{ color: colors.text }}>
            {notification.message}
          </div>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs" style={{ color: colors.text }}>
            {getTimeAgo()}
          </span>
          {notification.action && (
            <button
              onClick={() => {
                notification.action?.onClick();
                handleDismiss();
              }}
              className="text-xs font-medium"
              style={{ color: accentColor }}
            >
              {notification.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationToast({ theme }: NotificationToastProps) {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {notifications.slice(-5).map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          theme={theme}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Notification center for viewing all notifications
export function NotificationCenter({
  theme,
  isOpen,
  onClose,
}: {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notifications, removeNotification, clearAll } = useNotificationStore();

  if (!isOpen) return null;

  const colors =
    theme === 'dark'
      ? {
          bg: 'rgba(10, 15, 20, 0.98)',
          bgSecondary: '#0d1117',
          border: '#1a2332',
          text: '#8899aa',
          textPrimary: '#ffffff',
          accent: '#00d4ff',
          info: '#00d4ff',
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4466',
        }
      : {
          bg: 'rgba(255, 255, 255, 0.98)',
          bgSecondary: '#f8fafc',
          border: '#e2e8f0',
          text: '#64748b',
          textPrimary: '#1e293b',
          accent: '#0066cc',
          info: '#0066cc',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
        };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="fixed inset-0 flex items-start justify-end z-[9999] pt-16 pr-4"
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <span className="font-semibold" style={{ color: colors.textPrimary }}>
              Notifications
            </span>
            {notifications.length > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ backgroundColor: colors.accent, color: '#000' }}
              >
                {notifications.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs"
                style={{ color: colors.text }}
              >
                Clear all
              </button>
            )}
            <button onClick={onClose} style={{ color: colors.text }}>
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center" style={{ color: colors.text }}>
              <div className="text-3xl mb-2">🔕</div>
              <div className="text-sm">No notifications</div>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: colors.border }}>
              {[...notifications].reverse().map((notification) => {
                const config = typeConfig[notification.type];
                const accentColor = colors[notification.type];
                return (
                  <div
                    key={notification.id}
                    className="p-4 flex items-start gap-3 hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ backgroundColor: accentColor + '20', color: accentColor }}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm" style={{ color: colors.textPrimary }}>
                        {notification.title}
                      </div>
                      {notification.message && (
                        <div className="text-xs mt-0.5" style={{ color: colors.text }}>
                          {notification.message}
                        </div>
                      )}
                      <div className="text-xs mt-1" style={{ color: colors.text }}>
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="p-1 rounded hover:bg-white/10"
                      style={{ color: colors.text }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
