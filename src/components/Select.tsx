import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';
import { ChevronDown, Check } from 'lucide-react-native';

interface Option {
  label: string;
  value: string | number;
  color?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string | number;
  options: Option[];
  onSelect: (value: string | number) => void;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onSelect,
  error,
}) => {
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (val: string | number) => {
    onSelect(val);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          {selectedOption?.color && (
            <View style={[styles.optionDot, { backgroundColor: selectedOption.color, marginRight: 10 }]} />
          )}
          <Text style={[styles.valueText, !selectedOption && styles.placeholderText]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <ChevronDown size={20} color={Colors.textDim} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <View style={styles.optionLabelRow}>
                    {item.color && (
                      <View style={[styles.optionDot, { backgroundColor: item.color }]} />
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {item.value === value && (
                    <Check size={20} color={Colors.admin} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: Colors.textDim,
    marginBottom: Spacing.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  trigger: {
    height: 54,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  triggerError: {
    borderColor: Colors.error,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  valueText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  placeholderText: {
    color: Colors.textDark,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    width: '100%',
    maxHeight: '60%',
    borderRadius: Radius.xxxl,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  option: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionSelected: {
    backgroundColor: Colors.admin + '08',
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: Colors.admin,
  },
});
