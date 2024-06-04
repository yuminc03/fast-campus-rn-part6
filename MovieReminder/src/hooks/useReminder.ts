import { useCallback, useEffect, useState } from 'react';
import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerNotification,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import moment from 'moment';

const useReminder = () => {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<TriggerNotification[]>([]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        // 중요도가 높은 알림
        const id = await notifee.createChannel({
          id: 'default',
          name: 'Detfault Channel',
          importance: AndroidImportance.HIGH,
        });

        setChannelId(id);
      } else {
        setChannelId('ios-fake-channel-id');
      }
    })();
  }, []);

  const loadReminders = useCallback(async () => {
    const notifications = await notifee.getTriggerNotifications();
    setReminders(notifications);
  }, []);

  const removeReminder = useCallback(
    async (id: string) => {
      await notifee.cancelTriggerNotification(id);
      await loadReminders();
    },
    [loadReminders],
  );

  const addReminder = useCallback(
    async (movieId: number, releaseDate: string, title: string) => {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
        throw new Error('Permission is denied');
      }

      if (Platform.OS === 'android') {
        if (settings.android.alarm !== AndroidNotificationSetting.ENABLED) {
          throw new Error(
            'Please allow setting alarms and reminder on settings',
          );
        }
      }

      if (channelId == null) {
        throw new Error('Channel is not created');
      }

      // Create a time-based trigger
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: moment(releaseDate).valueOf(), // fire at 11:10am (10 minutes before meeting)
      };

      // Create a trigger notification
      await notifee.createTriggerNotification(
        {
          id: `${movieId}`,
          title: '영화 개봉일 알림',
          body: title,
          android: {
            channelId: channelId,
          },
        },
        trigger,
      );
      await loadReminders();
    },
    [channelId, loadReminders],
  );

  const hasReminder = useCallback(
    (id: string) => {
      const reminder = reminders.find(r => r.notification.id === id);
      return reminder != null;
    },
    [reminders],
  );

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  return {
    addReminder,
    removeReminder,
    reminders,
    hasReminder,
  };
};

export default useReminder;
