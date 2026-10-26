import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export default function ProgressBar({
  progress = 0, // 0 to 1
  color = THEME.colors.primary,
  bgColor = THEME.colors.border,
  height = 8,
  showLabel = false,
  label = '',
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentText = `${Math.round(clampedProgress * 100)}%`;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{label}</Text>
          <Text style={[styles.percentText, { color }]}>{percentText}</Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: bgColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelText: {
    fontSize: THEME.typography.xs,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  percentText: {
    fontSize: THEME.typography.xs,
    fontWeight: '700',
  },
  track: {
    width: '100%',
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: THEME.borderRadius.full,
  },
});
