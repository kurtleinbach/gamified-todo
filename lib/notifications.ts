import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDueDateReminder(
  taskId: string,
  title: string,
  dueDate: Date
): Promise<string | null> {
  const reminderTime = new Date(dueDate);
  reminderTime.setHours(reminderTime.getHours() - 1);
  if (reminderTime <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Task due soon',
      body: title,
      data: { taskId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderTime },
  });
  return id;
}

export async function scheduleDailyQuestReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📜 Daily Quests Available',
      body: 'New quests are waiting for you!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}
