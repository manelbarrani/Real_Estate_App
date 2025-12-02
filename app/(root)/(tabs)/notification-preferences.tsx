import { useNotificationsContext } from '@/lib/notifications-provider';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PreferenceItem {
  key: string;
  title: string;
  description: string;
  category?: string;
}

const PREFERENCE_ITEMS: PreferenceItem[] = [
  {
    key: 'pushEnabled',
    title: 'Push Notifications',
    description: 'Receive push notifications on your device',
    category: 'General',
  },
  {
    key: 'emailEnabled',
    title: 'Email Notifications',
    description: 'Receive notifications via email',
    category: 'General',
  },
  {
    key: 'messagesEnabled',
    title: 'Messages',
    description: 'Get notified when you receive new messages',
    category: 'Categories',
  },
  {
    key: 'bookingsEnabled',
    title: 'Bookings',
    description: 'Receive notifications about booking requests and updates',
    category: 'Categories',
  },
  {
    key: 'paymentsEnabled',
    title: 'Payments',
    description: 'Get notified about payment activities',
    category: 'Categories',
  },
  {
    key: 'reviewsEnabled',
    title: 'Reviews',
    description: 'Receive notifications when you get new reviews',
    category: 'Categories',
  },
  {
    key: 'marketingEnabled',
    title: 'Marketing & Promotions',
    description: 'Receive updates about special offers and features',
    category: 'Optional',
  },
  {
    key: 'soundEnabled',
    title: 'Notification Sound',
    description: 'Play sound for notifications',
    category: 'Settings',
  },
  {
    key: 'vibrationEnabled',
    title: 'Vibration',
    description: 'Vibrate when receiving notifications',
    category: 'Settings',
  },
];

export default function NotificationPreferencesScreen() {
  const { preferences, refreshPreferences, updatePreferences } = useNotificationsContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      await refreshPreferences();
    } catch (error) {
      Alert.alert('Error', 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    if (!preferences) return;

    try {
      setSaving(true);
      await updatePreferences({ [key]: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update preference');
    } finally {
      setSaving(false);
    }
  };

  const groupedPreferences = PREFERENCE_ITEMS.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PreferenceItem[]>);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0061FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-primary-300 font-rubik-medium text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-rubik-bold text-black-300 flex-1">
          Notification Settings
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-5 py-4">
          <Text className="text-sm text-gray-500 font-rubik mb-4">
            Manage your notification preferences to control what updates you receive.
          </Text>

          {Object.entries(groupedPreferences).map(([category, items]) => (
            <View key={category} className="mb-6">
              <Text className="text-base font-rubik-bold text-black-300 mb-3">{category}</Text>

              {items.map((item) => {
                const value = preferences?.[item.key as keyof typeof preferences] as boolean;
                
                return (
                  <View
                    key={item.key}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-1 mr-4">
                      <Text className="text-base font-rubik-medium text-black-300 mb-1">
                        {item.title}
                      </Text>
                      <Text className="text-sm text-gray-500 font-rubik">
                        {item.description}
                      </Text>
                    </View>

                    <Switch
                      value={value}
                      onValueChange={(newValue) => handleToggle(item.key, newValue)}
                      trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                      thumbColor={value ? '#0061FF' : '#F3F4F6'}
                      disabled={saving}
                    />
                  </View>
                );
              })}
            </View>
          ))}

          {/* Info Card */}
          <View className="bg-blue-50 rounded-xl p-4 mt-4">
            <Text className="text-sm font-rubik-bold text-primary-300 mb-2">
              ℹ️ About Notifications
            </Text>
            <Text className="text-sm text-gray-600 font-rubik leading-5">
              You can customize which types of notifications you want to receive. System and
              critical notifications will always be delivered regardless of these settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
