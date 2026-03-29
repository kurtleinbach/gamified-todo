import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTaskStore } from '@/store/taskStore';
import { useProfileStore } from '@/store/profileStore';
import { useQuestStore } from '@/store/questStore';
import TaskCard from '@/components/TaskCard';
import XPBar from '@/components/XPBar';
import CompletionBurst from '@/components/CompletionBurst';
import AchievementToast from '@/components/AchievementToast';
import TaskFormModal from '@/components/TaskFormModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import type { Task } from '@/types';
import type { CreateTaskInput } from '@/store/taskStore';

export default function TodayScreen() {
  const tasks = useTaskStore(s => s.tasks);
  const addTask = useTaskStore(s => s.addTask);
  const completeTask = useTaskStore(s => s.completeTask);
  const profile = useProfileStore(s => s.profile);
  const awardXP = useProfileStore(s => s.awardXP);
  const checkAndUpdateStreak = useProfileStore(s => s.checkAndUpdateStreak);
  const incrementQuestProgress = useQuestStore(s => s.incrementQuestProgress);

  const [burst, setBurst] = useState<{ xp: number; coins: number; leveledUp: boolean } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => !t.isCompleted && (
    !t.dueDate || t.dueDate === today || t.dueDate < today
  ));
  const overdueTasks = todayTasks.filter(t => t.dueDate && t.dueDate < today);
  const dueTodayTasks = todayTasks.filter(t => !t.dueDate || t.dueDate === today);

  async function handleComplete(task: Task) {
    await completeTask(task.id);
    await checkAndUpdateStreak();
    const result = await awardXP(task.priority, task.subtasks.length > 0);
    setBurst(result);
    await incrementQuestProgress('complete_tasks');
    if (task.priority === 'high' || task.priority === 'epic') {
      await incrementQuestProgress('complete_priority');
    }
  }

  async function handleAddTask(input: CreateTaskInput) {
    await addTask(input);
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <View style={styles.container}>
      <AchievementToast />
      {burst && (
        <CompletionBurst
          xp={burst.xp}
          coins={burst.coins}
          leveledUp={burst.leveledUp}
          onDone={() => setBurst(null)}
        />
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.hero}>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <View style={styles.xpCard}>
            <View style={styles.xpRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.level}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: Colors.warning }]}>🔥 {profile.streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: Colors.coins }]}>🪙 {profile.coins}</Text>
                <Text style={styles.statLabel}>Coins</Text>
              </View>
            </View>
            <XPBar xp={profile.xp} level={profile.level} />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{dueTodayTasks.length}</Text>
            <Text style={styles.summaryLabel}>Due today</Text>
          </View>
          <View style={[styles.summaryCard, overdueTasks.length > 0 && styles.summaryCardAlert]}>
            <Text style={[styles.summaryNum, overdueTasks.length > 0 && { color: Colors.error }]}>
              {overdueTasks.length}
            </Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNum, { color: Colors.success }]}>{profile.tasksCompleted}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>

        {/* Overdue */}
        {overdueTasks.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: Colors.error }]}>
              <MaterialCommunityIcons name="alert-circle" size={14} color={Colors.error} /> Overdue
            </Text>
            {overdueTasks.map(t => (
              <TaskCard key={t.id} task={t} onComplete={handleComplete} onPress={setSelectedTask} />
            ))}
          </>
        )}

        {/* Today */}
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        {dueTodayTasks.length === 0 && overdueTasks.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="party-popper" size={48} color={Colors.purple600} />
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySubtext}>Add a task to get started</Text>
          </View>
        ) : (
          dueTodayTasks.map(t => (
            <TaskCard key={t.id} task={t} onComplete={handleComplete} onPress={setSelectedTask} />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowForm(true)}
        color={Colors.textPrimary}
      />

      <TaskFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleAddTask}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={handleComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },
  hero: { gap: 4, marginBottom: 16 },
  greeting: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  date: { color: Colors.textMuted, fontSize: 13, marginBottom: 12 },
  xpCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', gap: 2 },
  statValue: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 11 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  summaryCardAlert: { borderColor: Colors.error + '66' },
  summaryNum: { color: Colors.purple400, fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: Colors.textMuted, fontSize: 11 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: Colors.textMuted, fontSize: 13 },
  fab: { position: 'absolute', bottom: 24, right: 20, backgroundColor: Colors.purple500 },
});
