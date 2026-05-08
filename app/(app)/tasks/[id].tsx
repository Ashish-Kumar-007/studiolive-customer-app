import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Radius, Spacing } from '../../../src/constants/theme';
import { apiClient } from '../../../src/api/client';

type TaskData = {
  id: string;
  type: string;
  status: string;
  details?: string;
  deadline?: string;
  lead?: {
    name?: string;
    business?: string;
  };
};

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await apiClient.get(`/tasks/${id}`);
        setTask(response.data);
      } catch (error: any) {
        Alert.alert('Error', error?.response?.data?.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.videographer} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Task not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Task Details</Text>
        <Text style={styles.label}>Client</Text>
        <Text style={styles.value}>{task.lead?.name || '-'}</Text>
        <Text style={styles.label}>Business</Text>
        <Text style={styles.value}>{task.lead?.business || '-'}</Text>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{task.type}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{task.status}</Text>
        <Text style={styles.label}>Deadline</Text>
        <Text style={styles.value}>
          {task.deadline ? new Date(task.deadline).toLocaleString() : 'No deadline'}
        </Text>
        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>{task.details || 'No details added.'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
  },
  heading: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.textDim,
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },
  value: {
    color: Colors.text,
    fontSize: 16,
    marginTop: 4,
  },
  emptyText: {
    color: Colors.textDim,
  },
});
