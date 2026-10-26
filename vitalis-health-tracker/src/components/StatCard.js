import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function StatCard({
  icon,
  iconColor = THEME.colors.primary,
  iconBgColor = THEME.colors.primaryMuted,
  title,
  value,
  unit,
  subtitle,
  badgeText,
  badgeColor = THEME.colors.primary,
  onPress,
  children,
  style,
}) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          {icon && (
            <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
              <Ionicons name={icon} size={18} color={iconColor} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        {badgeText && (
          <View style={[styles.badge, { backgroundColor: `${badgeColor}20` }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: THEME.typography.sm,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  badgeText: {
    fontSize: THEME.typography.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: THEME.typography.xl,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: THEME.typography.sm,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: THEME.typography.xs,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
});
