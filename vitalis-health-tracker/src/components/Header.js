import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function Header({ title, subtitle, onRefresh, rightIcon, onRightPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="refresh" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={[styles.iconButton, styles.accentButton]} activeOpacity={0.7}>
            <Ionicons name={rightIcon} size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.bgDark,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: THEME.typography.xl,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: THEME.typography.xs,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  accentButton: {
    backgroundColor: THEME.colors.primaryMuted,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  }
});
