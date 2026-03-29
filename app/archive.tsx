import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, PriorityMeta } from '@/constants/theme';
import { useArchiveStore } from '@/store/archiveStore';
import TaskCard from '@/components/TaskCard';
import TaskDetailModal from '@/components/TaskDetailModal';
import type { Task, Priority } from '@/types';

type FilterPriority = Priority | 'all';

export default function ArchiveScreen() {
  const loadArchive = useArchiveStore(s => s.loadArchive);
  const filteredTasks = useArchiveStore(s => s.filteredTasks);
  const filters = useArchiveStore(s => s.filters);
  const setFilters = useArchiveStore(s => s.setFilters);
  const loading = useArchiveStore(s => s.loading);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => { loadArchive(); }, []);

  const tasks = filteredTasks();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Archive</Text>
        <Text style={styles.headerCount}>{tasks.length} tasks</Text>
      </View>

      <Searchbar
        placeholder="Search archive..."
        value={filters.search}
        onChangeText={s => setFilters({ search: s })}
        style={styles.searchbar}
        inputStyle={{ color: Colors.textPrimary }}
        iconColor={Colors.textMuted}
        placeholderTextColor={Colors.textMuted}
        theme={{ colors: { elevation: { level3: Colors.card } } }}
      />

      {/* Priority filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {(['all', 'low', 'medium', 'high', 'epic'] as FilterPriority[]).map(p => (
          <Chip
            key={p}
            selected={filters.priority === p}
            onPress={() => setFilters({ priority: p })}
            style={[
              styles.chip,
              filters.priority === p && p !== 'all' && {
                backgroundColor: PriorityMeta[p as Priority].color + '33',
                borderColor: PriorityMeta[p as Priority].color,
              },
              filters.priority === p && p === 'all' && styles.chipActiveAll,
            ]}
            textStyle={{
              color: filters.priority === p && p !== 'all'
                ? PriorityMeta[p as Priority].color
                : filters.priority === p ? Colors.purple400 : Colors.textMuted,
              fontSize: 12,
            }}
          >
            {p === 'all' ? 'All' : PriorityMeta[p as Priority].label}
          </Chip>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {tasks.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="archive-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyText}>No archived tasks</Text>
              <Text style={styles.emptySubtext}>Completed tasks will appear here</Text>
            </View>
          ) : (
            tasks.map(t => (
              <TaskCard key={t.id} task={t} onPress={setSelectedTask} readonly />
            ))
          )}
        </ScrollView>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  headerCount: { color: Colors.textMuted, fontSize: 13 },
  searchbar: { marginHorizontal: 16, marginBottom: 4, backgroundColor: Colors.card, borderRadius: 12 },
  filterScroll: { maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipActiveAll: { backgroundColor: Colors.purple800, borderColor: Colors.purple500 },
  scroll: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: 13 },
});
