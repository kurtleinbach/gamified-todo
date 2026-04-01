import { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useShoppingStore } from '@/store/shoppingStore';
import type { ShoppingSection } from '@/types';

export default function ShoppingScreen() {
  const { sections, items, addSection, deleteSection, addItem, toggleItem, deleteItem, clearChecked } = useShoppingStore();
  const [newSectionName, setNewSectionName] = useState('');
  const [addingToSection, setAddingToSection] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const checkedCount = items.filter(i => i.isChecked).length;

  function handleAddSection() {
    if (!newSectionName.trim()) return;
    addSection(newSectionName.trim());
    setNewSectionName('');
  }

  function handleAddItem(sectionId: string) {
    if (!newItemName.trim()) return;
    addItem(sectionId, newItemName.trim());
    setNewItemName('');
    setAddingToSection(null);
  }

  function handleDeleteSection(section: ShoppingSection) {
    const sectionItems = items.filter(i => i.sectionId === section.id);
    const msg = sectionItems.length > 0
      ? `Delete "${section.name}" and its ${sectionItems.length} item(s)?`
      : `Delete "${section.name}"?`;
    Alert.alert('Delete Section', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSection(section.id) },
    ]);
  }

  function handleClearChecked() {
    Alert.alert('Clear Checked', `Remove ${checkedCount} checked item(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearChecked() },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header actions */}
          {checkedCount > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearChecked}>
              <MaterialCommunityIcons name="check-all" size={16} color={Colors.success} />
              <Text style={styles.clearBtnText}>Clear {checkedCount} checked</Text>
            </TouchableOpacity>
          )}

          {/* Sections */}
          {sections.length === 0 && (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="cart-outline" size={56} color={Colors.border} />
              <Text style={styles.emptyTitle}>No sections yet</Text>
              <Text style={styles.emptySubtext}>Add a store below to get started{'\n'}(e.g. Costco, King Soopers)</Text>
            </View>
          )}

          {sections.map(section => {
            const sectionItems = items.filter(i => i.sectionId === section.id);
            const isAddingHere = addingToSection === section.id;

            return (
              <View key={section.id} style={styles.section}>
                {/* Section header */}
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="store-outline" size={16} color={Colors.purple400} />
                  <Text style={styles.sectionTitle}>{section.name}</Text>
                  <Text style={styles.sectionCount}>
                    {sectionItems.filter(i => i.isChecked).length}/{sectionItems.length}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setAddingToSection(isAddingHere ? null : section.id);
                      setNewItemName('');
                    }}
                    style={styles.iconBtn}
                  >
                    <MaterialCommunityIcons
                      name={isAddingHere ? 'close' : 'plus'}
                      size={20}
                      color={Colors.purple400}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteSection(section)} style={styles.iconBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>

                {/* Add item input */}
                {isAddingHere && (
                  <View style={styles.addItemRow}>
                    <TextInput
                      style={styles.itemInput}
                      value={newItemName}
                      onChangeText={setNewItemName}
                      placeholder="Item name..."
                      placeholderTextColor={Colors.textMuted}
                      autoFocus
                      onSubmitEditing={() => handleAddItem(section.id)}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={[styles.addItemBtn, !newItemName.trim() && styles.addItemBtnDisabled]}
                      onPress={() => handleAddItem(section.id)}
                      disabled={!newItemName.trim()}
                    >
                      <Text style={styles.addItemBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Items */}
                {sectionItems.length === 0 && !isAddingHere && (
                  <Text style={styles.emptySection}>No items — tap + to add</Text>
                )}
                {sectionItems.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemRow}
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={item.isChecked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={22}
                      color={item.isChecked ? Colors.success : Colors.border}
                    />
                    <Text style={[styles.itemName, item.isChecked && styles.itemChecked]}>
                      {item.name}
                    </Text>
                    <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <MaterialCommunityIcons name="close" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          {/* Add section */}
          <View style={styles.addSectionCard}>
            <Text style={styles.addSectionLabel}>Add a store or section</Text>
            <View style={styles.addSectionRow}>
              <TextInput
                style={styles.sectionInput}
                value={newSectionName}
                onChangeText={setNewSectionName}
                placeholder="e.g. Costco, King Soopers..."
                placeholderTextColor={Colors.textMuted}
                onSubmitEditing={handleAddSection}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addSectionBtn, !newSectionName.trim() && styles.addSectionBtnDisabled]}
                onPress={handleAddSection}
                disabled={!newSectionName.trim()}
              >
                <MaterialCommunityIcons name="plus" size={20} color={Colors.bg} />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 60, gap: 12 },

  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end',
    backgroundColor: Colors.success + '1A',
    borderWidth: 1, borderColor: Colors.success + '44',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  clearBtnText: { color: Colors.success, fontSize: 12, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  section: {
    backgroundColor: Colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderBottomWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.cardAlt,
  },
  sectionTitle: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  sectionCount: { color: Colors.textMuted, fontSize: 12 },
  iconBtn: { padding: 2 },

  addItemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderBottomWidth: 1, borderColor: Colors.border,
  },
  itemInput: {
    flex: 1, color: Colors.textPrimary, fontSize: 14,
    backgroundColor: Colors.surface, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  addItemBtn: {
    backgroundColor: Colors.purple500, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addItemBtnDisabled: { opacity: 0.4 },
  addItemBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  emptySection: {
    color: Colors.textMuted, fontSize: 12,
    padding: 12, paddingLeft: 14,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderColor: Colors.border + '88',
  },
  itemName: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  itemChecked: { color: Colors.textMuted, textDecorationLine: 'line-through' },

  addSectionCard: {
    backgroundColor: Colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, gap: 10, marginTop: 4,
  },
  addSectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  addSectionRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  sectionInput: {
    flex: 1, color: Colors.textPrimary, fontSize: 14,
    backgroundColor: Colors.surface, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  addSectionBtn: {
    backgroundColor: Colors.purple500, borderRadius: 8,
    padding: 10,
  },
  addSectionBtnDisabled: { opacity: 0.4 },
});
