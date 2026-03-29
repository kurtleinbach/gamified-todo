import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, FAB, Searchbar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, PriorityMeta } from '@/constants/theme';
import { useTaskStore } from '@/store/taskStore';
import { useProfileStore } from '@/store/profileStore';
import { useQuestStore } from '@/store/questStore';
import TaskCard from '@/components/TaskCard';
import TaskFormModal from '@/components/TaskFormModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import CompletionBurst from '@/components/CompletionBurst';
import AchievementToast from '@/components/AchievementToast';
import type { Task, Priority } from '@/types';
import type { CreateTaskInput } from '@/store/taskStore';

type FilterPriority = Priority | 'all';
type SortKey = 'created' | 'due' | 'priority';

const PRIORITY_ORDER: Record<Priority, number> = { epic: 0, high: 1, medium: 2, low: 3 };

export default function TasksScreen() {
  const tasks = useTaskStore(s => s.tasks);
  const addTask = useTaskStore(s => s.addTask);
  const completeTask = useTaskStore(s => s.completeTask);
  const awardXP = useProfileStore(s => s.awardXP);
  const checkAndUpdateStreak = useProfileStore(s => s.checkAndUpdateStreak);
  const incrementQuestProgress = useQuestStore(s => s.incrementQuestProgress);

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [sortBy, setSortBy] = useState<SortKey>('created');
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [burst, setBurst] = useState<{ xp: number; coins: number; leveledUp: boolean } | null>(null);

  const filtered = tasks
    .filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sortBy === 'due') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

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

      <View style={styles.topBar}>
        <Searchbar
          placeholder="Search tasks..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          inputStyle={{ color: Colors.textPrimary }}
          iconColor={Colors.textMuted}
          placeholderTextColor={Colors.textMuted}
          theme={{ colors: { elevation: { level3: Colors.card } } }}
        />
        <TouchableOpacity
          style={styles.archiveBtn}
          onPress={() => router.push('/archive')}
        >
          <MaterialCommunityIcons name="archive-outline" size={22} color={Colors.purple300} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {(['all', 'low', 'medium', 'high', 'epic'] as FilterPriority[]).map(p => (
          <Chip
            key={p}
            selected={filterPriority === p}
            onPress={() => setFilterPriority(p)}
            style={[
              styles.chip,
              filterPriority === p && p !== 'all' && {
                backgroundColor: PriorityMeta[p as Priority].color + '33',
                borderColor: PriorityMeta[p as Priority].color,
              },
              filterPriority === p && p === 'all' && styles.chipActiveAll,
            ]}
            textStyle={{
              color: filterPriority === p && p !== 'all'
                ? PriorityMeta[p as Priority].color
                : filterPriority === p ? Colors.purple400 : Colors.textMuted,
              fontSize: 12,
            }}
          >
            {p === 'all' ? 'All' : PriorityMeta[p as Priority].label}
          </Chip>
        ))}
        <View style={styles.divider} />
        {([['created', 'Newest'], ['due', 'Due Date'], ['priority', 'Priority']] as [SortKey, string][]).map(([key, label]) => (
          <Chip
            key={key}
            selected={sortBy === key}
            onPress={() => setSortBy(key)}
            style={[styles.chip, sortBy === key && styles.chipActiveSort]}
            textStyle={{ color: sortBy === key ? Colors.blue400 : Colors.textMuted, fontSize: 12 }}
          >
            {label}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
          </View>
        ) : (
          filtered.map(t => (
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
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  searchbar: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, height: 44 },
  archiveBtn: {
    backgroundColor: Colors.card, padding: 10, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterScroll: { maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip: {
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActiveAll: { backgroundColor: Colors.purple800, borderColor: Colors.purple500 },
  chipActiveSort: { backgroundColor: Colors.blue900, borderColor: Colors.blue600 },
  divider: { width: 1, height: 20, backgroundColor: Colors.border },
  scroll: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: 13 },
  fab: { position: 'absolute', bottom: 24, right: 20, backgroundColor: Colors.purple500 },
});
