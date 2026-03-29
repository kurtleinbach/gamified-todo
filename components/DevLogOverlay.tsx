import { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Share, Alert,
} from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useDevLogStore } from '@/store/devLogStore';
import type { DevLogEntry, DevLogType } from '@/types';

const TYPES: Array<{ value: DevLogType; label: string; icon: string; color: string }> = [
  { value: 'feature',     label: 'Feature',     icon: 'lightbulb-outline',  color: Colors.purple400 },
  { value: 'bug',         label: 'Bug',         icon: 'bug-outline',        color: Colors.error },
  { value: 'improvement', label: 'Improve',     icon: 'trending-up',        color: Colors.blue400 },
  { value: 'note',        label: 'Note',        icon: 'note-text-outline',  color: Colors.textMuted },
];

export default function DevLogOverlay() {
  const { isOpen, closeLog, entries, addEntry, updateEntry, deleteEntry, formatEntryForClaude, formatAllForClaude } = useDevLogStore();
  const [view, setView] = useState<'list' | 'new'>('list');
  const [editingEntry, setEditingEntry] = useState<DevLogEntry | null>(null);
  const [selectedType, setSelectedType] = useState<DevLogType>('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function resetForm() {
    setTitle('');
    setDescription('');
    setSelectedType('feature');
    setEditingEntry(null);
    setView('list');
  }

  function handleEditPress(entry: DevLogEntry) {
    setEditingEntry(entry);
    setSelectedType(entry.type);
    setTitle(entry.title);
    setDescription(entry.description);
    setView('new');
  }

  async function handleSave() {
    if (!title.trim()) return;
    if (editingEntry) {
      await updateEntry(editingEntry.id, selectedType, title.trim(), description.trim());
    } else {
      await addEntry(selectedType, title.trim(), description.trim());
    }
    resetForm();
  }

  async function handleCopyEntry(entry: DevLogEntry) {
    await Share.share({ message: formatEntryForClaude(entry) });
  }

  async function handleCopyAll() {
    const text = formatAllForClaude();
    if (!text) return;
    await Share.share({ message: text });
  }

  function handleDelete(id: string) {
    Alert.alert('Delete Entry', 'Remove this log entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id) },
    ]);
  }

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeLog}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="wrench" size={20} color={Colors.purple400} />
            <Text style={styles.headerTitle}>Dev Log</Text>
            <View style={styles.headerActions}>
              {view === 'list' && (
                <>
                  {entries.length > 0 && (
                    <TouchableOpacity onPress={handleCopyAll} style={styles.iconBtn}>
                      <MaterialCommunityIcons name="content-copy" size={20} color={Colors.blue400} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setView('new')} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="plus" size={22} color={Colors.purple400} />
                  </TouchableOpacity>
                </>
              )}
              {view === 'new' && (
                <TouchableOpacity onPress={resetForm} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={closeLog} style={styles.iconBtn}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {view === 'list' ? (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
              {entries.length === 0 && (
                <View style={styles.empty}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={Colors.border} />
                  <Text style={styles.emptyText}>No entries yet</Text>
                  <Text style={styles.emptySubtext}>Tap + to log a feature request, bug, or note</Text>
                </View>
              )}
              {entries.map(entry => {
                const typeMeta = TYPES.find(t => t.value === entry.type)!;
                return (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryHeader}>
                      <View style={[styles.typeBadge, { backgroundColor: typeMeta.color + '22' }]}>
                        <MaterialCommunityIcons name={typeMeta.icon as any} size={12} color={typeMeta.color} />
                        <Text style={[styles.typeLabel, { color: typeMeta.color }]}>{typeMeta.label}</Text>
                      </View>
                      <Text style={styles.entryDate}>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    {entry.description ? (
                      <Text style={styles.entryDesc}>{entry.description}</Text>
                    ) : null}
                    <View style={styles.entryActions}>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => handleCopyEntry(entry)}
                      >
                        <MaterialCommunityIcons name="content-copy" size={14} color={Colors.blue400} />
                        <Text style={styles.copyLabel}>Copy for Claude</Text>
                      </TouchableOpacity>
                      <View style={styles.entryIcons}>
                        <TouchableOpacity onPress={() => handleEditPress(entry)} style={styles.iconBtn}>
                          <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.purple400} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.iconBtn}>
                          <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.typeRow}>
                {TYPES.map(t => (
                  <Chip
                    key={t.value}
                    selected={selectedType === t.value}
                    onPress={() => setSelectedType(t.value)}
                    style={[
                      styles.typeChip,
                      selectedType === t.value && { backgroundColor: t.color + '33', borderColor: t.color },
                    ]}
                    textStyle={{ color: selectedType === t.value ? t.color : Colors.textMuted, fontSize: 12 }}
                  >
                    {t.label}
                  </Chip>
                ))}
              </View>

              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Short summary..."
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                mode="outlined"
                outlineColor={Colors.border}
                activeOutlineColor={Colors.purple500}
                textColor={Colors.textPrimary}
                theme={{ colors: { background: Colors.card } }}
              />

              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="More details..."
                placeholderTextColor={Colors.textMuted}
                style={[styles.input, styles.multiline]}
                mode="outlined"
                multiline
                numberOfLines={4}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.purple500}
                textColor={Colors.textPrimary}
                theme={{ colors: { background: Colors.card } }}
              />

              <Button
                mode="contained"
                onPress={handleSave}
                disabled={!title.trim()}
                buttonColor={Colors.purple500}
                style={styles.submitBtn}
              >
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </Button>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: 17, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  scroll: { maxHeight: 500 },
  listContent: { padding: 16, gap: 10, paddingBottom: 32 },
  formContent: { padding: 16, gap: 8, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  entryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeLabel: { fontSize: 11, fontWeight: '700' },
  entryDate: { color: Colors.textMuted, fontSize: 11 },
  entryTitle: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },
  entryDesc: { color: Colors.textMuted, fontSize: 12 },
  entryActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  entryIcons: { flexDirection: 'row', alignItems: 'center' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  copyLabel: { color: Colors.blue400, fontSize: 12, fontWeight: '600' },
  formLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 4 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  input: { backgroundColor: Colors.card, fontSize: 14 },
  multiline: { minHeight: 100 },
  submitBtn: { marginTop: 12, borderRadius: 10 },
});
