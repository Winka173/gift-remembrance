import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getDayOfYear, getDaysInYear } from 'date-fns';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency, type BudgetStatus } from '@/utils/budgetUtils';

interface BudgetRingProps {
  spent: number;
  budget: number | null;
  size?: number;
  strokeWidth?: number;
}

function statusFor(spent: number, budget: number | null): BudgetStatus {
  if (budget === null || budget === 0) return 'no_budget';
  const ratio = spent / budget;
  const now = new Date();
  const yearProgress = getDayOfYear(now) / getDaysInYear(now);
  if (ratio > 1) return 'over';
  if (ratio > yearProgress + 0.15) return 'over';
  if (ratio < yearProgress - 0.15) return 'under';
  return 'on_track';
}

export function BudgetRing({
  spent,
  budget,
  size = 140,
  strokeWidth = 12,
}: BudgetRingProps) {
  const { colors } = useTheme();
  const currency = useAppSelector((s) => s.settings.currency);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio =
    budget && budget > 0 ? Math.min(1, Math.max(0, spent / budget)) : 0;
  const dashOffset = circumference * (1 - ratio);

  const status = statusFor(spent, budget);
  const progressColor =
    status === 'under'
      ? colors.budget.under
      : status === 'on_track'
      ? colors.budget.onTrack
      : status === 'over'
      ? colors.budget.over
      : colors.text.muted;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border.light}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {budget != null && budget > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={[
            typography.h2,
            {
              color: colors.text.primary,
              fontVariant: ['tabular-nums'],
            },
          ]}
        >
          {formatCurrency(spent, currency)}
        </Text>
        {budget != null && budget > 0 && (
          <Text
            style={[
              typography.caption,
              {
                color: colors.text.secondary,
                fontVariant: ['tabular-nums'],
                marginTop: 2,
              },
            ]}
          >
            of {formatCurrency(budget, currency)}
          </Text>
        )}
      </View>
    </View>
  );
}
