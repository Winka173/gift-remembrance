import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/budgetUtils';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BudgetRingProps {
  spent: number;
  budget: number | null;
  size?: number;
  strokeWidth?: number;
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

  const progress = useSharedValue(0);
  useEffect(() => {
    const target =
      budget && budget > 0 ? Math.min(spent / budget, 1.2) : 0;
    progress.value = withTiming(target, {
      duration: 480,
      easing: Easing.out(Easing.cubic),
    });
  }, [spent, budget, progress]);

  const animatedProps = useAnimatedProps(() => {
    const clamped = Math.min(Math.max(progress.value, 0), 1);
    const offset = circumference * (1 - clamped);
    const color = interpolateColor(
      progress.value,
      [0, 0.7, 1, 1.2],
      [
        colors.budget.under,
        colors.budget.onTrack,
        colors.budget.over,
        colors.budget.over,
      ],
    );
    return {
      strokeDashoffset: offset,
      stroke: color,
    };
  });

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
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            animatedProps={animatedProps}
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
