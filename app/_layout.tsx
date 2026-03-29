import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AppTheme } from '@/constants/theme';
import { initDatabase } from '@/lib/database';
import { useTaskStore } from '@/store/taskStore';
import { useProfileStore } from '@/store/profileStore';
import { useQuestStore } from '@/store/questStore';
import { useDevLogStore } from '@/store/devLogStore';
import { requestNotificationPermissions, scheduleDailyQuestReminder } from '@/lib/notifications';
import DevLogOverlay from '@/components/DevLogOverlay';

export default function RootLayout() {
  const loadTasks = useTaskStore(s => s.loadTasks);
  const loadProfile = useProfileStore(s => s.loadProfile);
  const loadQuests = useQuestStore(s => s.loadQuests);
  const loadEntries = useDevLogStore(s => s.loadEntries);

  useEffect(() => {
    async function init() {
      await initDatabase();
      await Promise.all([loadTasks(), loadProfile(), loadQuests(), loadEntries()]);
      const granted = await requestNotificationPermissions();
      if (granted) await scheduleDailyQuestReminder();
    }
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={AppTheme}>
        <StatusBar style="light" backgroundColor="#111214" />
        <Stack screenOptions={{ headerShown: false }} />
        <DevLogOverlay />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
