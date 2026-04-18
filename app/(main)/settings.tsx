import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useTheme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { X, ChevronRight } from '@/constants/icons';
import { CURRENCIES } from '@/constants/currencies';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { useAppDispatch } from '@/store/hooks';
import { useSettings } from '@/hooks/useSettings';
import { useNotifications } from '@/hooks/useNotifications';
import { useBackup } from '@/hooks/useBackup';
import { deleteAllDataThunk } from '@/store/thunks/deleteAllDataThunk';
import { rescheduleAllOccasionsThunk } from '@/store/thunks/rescheduleAllOccasionsThunk';
import { pickBackupFolder } from '@/utils/safUtils';
import { resetAdsConsent } from '@/utils/adsInit';
import { formatDate } from '@/utils/dateUtils';
import type { ReminderDays } from '@/types/occasion';

const REMINDER_CHOICES: ReminderDays[] = [1, 3, 7, 14];
const THEME_CHOICES: Array<{
  key: 'light' | 'dark' | 'system';
  label: string;
}> = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

function formatTimestamp(ts: number | null): string {
  if (ts == null) return 'Never';
  const iso = new Date(ts).toISOString().slice(0, 10);
  return formatDate(iso);
}

function destinationLabel(dest: 'none' | 'icloud' | 'saf'): string {
  if (dest === 'icloud') return 'iCloud';
  if (dest === 'saf') return 'Folder';
  return 'None';
}

export default function SettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { settings, updateSettings } = useSettings();
  const notifications = useNotifications();
  const backupHook = useBackup();

  const [reminderTimeDraft, setReminderTimeDraft] = useState<string>(
    settings.reminderTimeOfDay,
  );
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmTypeDeleteOpen, setConfirmTypeDeleteOpen] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await notifications.enable();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Notifications are disabled in your OS settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
    } else {
      notifications.disable();
    }
  };

  const handleSendTest = async () => {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission required',
        'Enable notifications first to send a test.',
      );
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Reminder',
        body: 'Notifications are working!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });
  };

  const handleSaveReminderTime = () => {
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(reminderTimeDraft.trim());
    if (!match) {
      setReminderTimeDraft(settings.reminderTimeOfDay);
      return;
    }
    const normalized = `${match[1].padStart(2, '0')}:${match[2]}`;
    updateSettings({ reminderTimeOfDay: normalized });
    setReminderTimeDraft(normalized);
    dispatch(rescheduleAllOccasionsThunk());
  };

  const handleToggleICloud = (value: boolean) => {
    updateSettings({ backupDestination: value ? 'icloud' : 'none' });
  };

  const handlePickFolder = async () => {
    const uri = await pickBackupFolder();
    if (uri) {
      updateSettings({ safFolderUri: uri, backupDestination: 'saf' });
    }
  };

  const handleDisableFolder = () => {
    updateSettings({ safFolderUri: null, backupDestination: 'none' });
  };

  const handleExport = () => {
    Alert.alert('Export', 'Export is coming soon');
  };

  const handleImport = () => {
    Alert.alert('Import', 'Import is coming soon');
  };

  const handleResetAds = () => {
    resetAdsConsent();
  };

  const handleLanguageTap = () => {
    Alert.alert('Language', 'Language selection is coming soon');
  };

  const handleLicensesTap = () => {
    Alert.alert('Open Source Licenses', 'Licenses screen coming soon');
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    setConfirmTypeDeleteOpen(true);
  };

  const handleTypeDeleteConfirm = async () => {
    setConfirmTypeDeleteOpen(false);
    await dispatch(deleteAllDataThunk()).unwrap();
    router.replace('/');
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === settings.currency);
  const currencyDisplay = currentCurrency
    ? `${currentCurrency.code} ${currentCurrency.symbol}`
    : settings.currency;

  const sectionTitleStyle = [
    typography.captionMedium,
    {
      color: colors.text.muted,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      marginTop: spacing.xl,
    },
  ];

  const cardStyle = {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    overflow: 'hidden' as const,
  };

  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
    gap: spacing.md,
  };

  const dividerStyle = {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.lg,
  };

  const renderRow = (
    key: string,
    label: string,
    control: React.ReactNode,
    opts?: { onPress?: () => void; sublabel?: string; disabled?: boolean },
  ) => {
    const inner = (
      <View style={rowStyle}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.body,
              {
                color: opts?.disabled ? colors.text.muted : colors.text.primary,
              },
            ]}
          >
            {label}
          </Text>
          {opts?.sublabel != null && (
            <Text
              style={[
                typography.caption,
                { color: colors.text.muted, marginTop: 2 },
              ]}
            >
              {opts.sublabel}
            </Text>
          )}
        </View>
        {control}
      </View>
    );
    if (opts?.onPress && !opts.disabled) {
      return (
        <Pressable
          key={key}
          onPress={opts.onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          {inner}
        </Pressable>
      );
    }
    return <View key={key}>{inner}</View>;
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg.screen }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close settings"
          hitSlop={8}
          style={{ width: 32 }}
        >
          <X size={22} color={colors.text.primary} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[typography.h2, { color: colors.text.primary }]}>
            Settings
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['3xl'] * 2 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications */}
        <Text style={sectionTitleStyle}>Notifications</Text>
        <View style={cardStyle}>
          {renderRow(
            'notif-master',
            'Enable Notifications',
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{
                false: colors.border.medium,
                true: colors.primary[500],
              }}
              thumbColor={colors.bg.card}
              accessibilityLabel="Enable notifications"
            />,
          )}
          <View style={dividerStyle} />
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              opacity: settings.notificationsEnabled ? 1 : 0.5,
            }}
          >
            <Text
              style={[
                typography.body,
                { color: colors.text.primary, marginBottom: spacing.sm },
              ]}
            >
              Reminder days before
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.xs,
              }}
            >
              {REMINDER_CHOICES.map((days) => (
                <Chip
                  key={days}
                  label={`${days} day${days === 1 ? '' : 's'}`}
                  selected={settings.reminderDaysBefore === days}
                  onPress={() => {
                    if (!settings.notificationsEnabled) return;
                    updateSettings({ reminderDaysBefore: days });
                    dispatch(rescheduleAllOccasionsThunk());
                  }}
                />
              ))}
            </View>
          </View>
          <View style={dividerStyle} />
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              opacity: settings.notificationsEnabled ? 1 : 0.5,
            }}
          >
            <Text
              style={[
                typography.body,
                { color: colors.text.primary, marginBottom: spacing.sm },
              ]}
            >
              Reminder time of day
            </Text>
            <TextInput
              value={reminderTimeDraft}
              onChangeText={setReminderTimeDraft}
              onBlur={handleSaveReminderTime}
              editable={settings.notificationsEnabled}
              placeholder="09:00"
              placeholderTextColor={colors.text.placeholder}
              keyboardType="numbers-and-punctuation"
              style={[
                typography.body,
                {
                  backgroundColor: colors.bg.input,
                  borderRadius: radius.md,
                  padding: 12,
                  color: colors.text.primary,
                },
              ]}
            />
          </View>
          <View style={dividerStyle} />
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          >
            <Button
              label="Send test notification"
              onPress={handleSendTest}
              variant="secondary"
              disabled={!settings.notificationsEnabled}
              accessibilityLabel="Send test notification"
            />
          </View>
        </View>

        {/* Backup & Data */}
        <Text style={sectionTitleStyle}>Backup & Data</Text>
        <View style={cardStyle}>
          {renderRow(
            'last-auto',
            'Last auto-backup',
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {formatTimestamp(settings.lastAutoBackupAt)}
            </Text>,
          )}
          <View style={dividerStyle} />
          {renderRow(
            'last-cloud',
            'Last cloud backup',
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {formatTimestamp(settings.lastCloudBackupAt)}
            </Text>,
          )}
          <View style={dividerStyle} />
          {renderRow(
            'dest',
            'Cloud backup destination',
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {destinationLabel(settings.backupDestination)}
            </Text>,
          )}
          <View style={dividerStyle} />
          {Platform.OS === 'ios' ? (
            renderRow(
              'icloud',
              'Save to iCloud Documents',
              <Switch
                value={settings.backupDestination === 'icloud'}
                onValueChange={handleToggleICloud}
                trackColor={{
                  false: colors.border.medium,
                  true: colors.primary[500],
                }}
                thumbColor={colors.bg.card}
                accessibilityLabel="Save to iCloud Documents"
              />,
            )
          ) : (
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                gap: spacing.sm,
              }}
            >
              {settings.safFolderUri ? (
                <>
                  <Text
                    style={[typography.body, { color: colors.text.primary }]}
                  >
                    Backup folder
                  </Text>
                  <Text
                    style={[typography.caption, { color: colors.text.muted }]}
                    numberOfLines={2}
                  >
                    {decodeURIComponent(settings.safFolderUri)}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Button
                      label="Change"
                      onPress={handlePickFolder}
                      variant="secondary"
                      accessibilityLabel="Change backup folder"
                      style={{ flex: 1 }}
                    />
                    <Button
                      label="Disable"
                      onPress={handleDisableFolder}
                      variant="secondary"
                      accessibilityLabel="Disable backup folder"
                      style={{ flex: 1 }}
                    />
                  </View>
                </>
              ) : (
                <Button
                  label="Set up backup folder"
                  onPress={handlePickFolder}
                  variant="secondary"
                  accessibilityLabel="Set up backup folder"
                />
              )}
            </View>
          )}
          <View style={dividerStyle} />
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              gap: spacing.sm,
            }}
          >
            <Button
              label={backupHook.loading ? 'Working…' : 'Backup Now'}
              onPress={backupHook.backup}
              disabled={backupHook.loading}
              accessibilityLabel="Backup now"
            />
            <Button
              label="Restore from Backup"
              onPress={backupHook.restore}
              variant="secondary"
              disabled={backupHook.loading}
              accessibilityLabel="Restore from backup"
            />
            <Button
              label="Export Data"
              onPress={handleExport}
              variant="secondary"
              accessibilityLabel="Export data"
            />
            <Button
              label="Import Data"
              onPress={handleImport}
              variant="secondary"
              accessibilityLabel="Import data"
            />
          </View>
        </View>

        {/* Preferences */}
        <Text style={sectionTitleStyle}>Preferences</Text>
        <View style={cardStyle}>
          {settings.currencyLocked
            ? renderRow(
                'currency',
                'Currency',
                <Text
                  style={[typography.caption, { color: colors.text.muted }]}
                >
                  {currencyDisplay}
                </Text>,
                {
                  disabled: true,
                  sublabel:
                    'Currency is locked because you have gifts logged.',
                },
              )
            : renderRow(
                'currency',
                'Currency',
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                  }}
                >
                  <Text
                    style={[typography.caption, { color: colors.text.muted }]}
                  >
                    {currencyDisplay}
                  </Text>
                  <ChevronRight size={16} color={colors.text.muted} />
                </View>,
                { onPress: () => setCurrencyPickerOpen(true) },
              )}
          <View style={dividerStyle} />
          {renderRow(
            'language',
            'Language',
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <Text style={[typography.caption, { color: colors.text.muted }]}>
                {settings.language.toUpperCase()}
              </Text>
              <ChevronRight size={16} color={colors.text.muted} />
            </View>,
            { onPress: handleLanguageTap },
          )}
          <View style={dividerStyle} />
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          >
            <Text
              style={[
                typography.body,
                { color: colors.text.primary, marginBottom: spacing.sm },
              ]}
            >
              Theme
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.xs,
              }}
            >
              {THEME_CHOICES.map((choice) => (
                <Chip
                  key={choice.key}
                  label={choice.label}
                  selected={settings.theme === choice.key}
                  onPress={() => updateSettings({ theme: choice.key })}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Ads */}
        <Text style={sectionTitleStyle}>Ads</Text>
        <View style={cardStyle}>
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              gap: spacing.sm,
            }}
          >
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              Ads support the app being free.
            </Text>
            <Button
              label="Reset ad preferences"
              onPress={handleResetAds}
              variant="secondary"
              accessibilityLabel="Reset ad preferences"
            />
          </View>
        </View>

        {/* Data */}
        <Text style={sectionTitleStyle}>Data</Text>
        <View style={cardStyle}>
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              gap: spacing.sm,
            }}
          >
            <Button
              label="Export My Data"
              onPress={handleExport}
              variant="secondary"
              accessibilityLabel="Export my data"
            />
            <Button
              label="Delete All Data"
              onPress={() => setConfirmDeleteOpen(true)}
              variant="destructive"
              accessibilityLabel="Delete all data"
            />
          </View>
        </View>

        {/* About */}
        <Text style={sectionTitleStyle}>About</Text>
        <View style={cardStyle}>
          {renderRow(
            'version',
            'App version',
            <Text style={[typography.caption, { color: colors.text.muted }]}>
              {appVersion}
            </Text>,
          )}
          <View style={dividerStyle} />
          {renderRow(
            'privacy',
            'Privacy Policy',
            <ChevronRight size={16} color={colors.text.muted} />,
            { onPress: () => Linking.openURL('https://example.com/privacy') },
          )}
          <View style={dividerStyle} />
          {renderRow(
            'licenses',
            'Open source licenses',
            <ChevronRight size={16} color={colors.text.muted} />,
            { onPress: handleLicensesTap },
          )}
          <View style={dividerStyle} />
          {renderRow(
            'support',
            'Contact support',
            <ChevronRight size={16} color={colors.text.muted} />,
            {
              onPress: () => Linking.openURL('mailto:support@example.com'),
            },
          )}
        </View>
      </ScrollView>

      {/* Currency picker modal */}
      <Modal
        visible={currencyPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyPickerOpen(false)}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.bg.overlay },
          ]}
          onPress={() => setCurrencyPickerOpen(false)}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: '70%',
            backgroundColor: colors.bg.modal,
            borderTopLeftRadius: radius['2xl'],
            borderTopRightRadius: radius['2xl'],
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing['3xl'],
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: radius.full,
              backgroundColor: colors.border.medium,
              marginBottom: spacing.lg,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.md,
            }}
          >
            <Text style={[typography.h2, { color: colors.text.primary }]}>
              Choose currency
            </Text>
            <Pressable
              onPress={() => setCurrencyPickerOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
            >
              <X size={22} color={colors.text.primary} />
            </Pressable>
          </View>
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: colors.border.light,
                }}
              />
            )}
            renderItem={({ item }) => {
              const selected = item.code === settings.currency;
              return (
                <Pressable
                  onPress={() => {
                    updateSettings({ currency: item.code });
                    setCurrencyPickerOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.name}`}
                  accessibilityState={{ selected }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.md,
                    gap: spacing.md,
                  }}
                >
                  <Text style={typography.body}>{item.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        typography.bodySemi,
                        { color: colors.text.primary },
                      ]}
                    >
                      {item.code}{' '}
                      <Text
                        style={[
                          typography.body,
                          { color: colors.text.secondary },
                        ]}
                      >
                        {item.symbol}
                      </Text>
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.text.muted },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                  {selected && (
                    <Text
                      style={[
                        typography.captionMedium,
                        { color: colors.primary[500] },
                      ]}
                    >
                      Selected
                    </Text>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>

      <ConfirmSheet
        visible={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete all data?"
        message="This will delete all people, gifts, occasions, and photos on this device. Your cloud backups are not affected. This cannot be undone."
        confirmLabel="Continue"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
      />

      <ConfirmSheet
        visible={confirmTypeDeleteOpen}
        onClose={() => setConfirmTypeDeleteOpen(false)}
        title="Type DELETE to confirm"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Everything"
        cancelLabel="Cancel"
        destructive
        typeToConfirm="DELETE"
        onConfirm={handleTypeDeleteConfirm}
      />
    </SafeAreaView>
  );
}
