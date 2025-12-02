import { NotificationCard } from '@/components/NotificationCard';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCategory, NotificationDocument } from '@/lib/appwrite';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES: { label: string; value: NotificationCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Messages', value: 'messages' },
  { label: 'Bookings', value: 'bookings' },
  { label: 'Payments', value: 'payments' },
  { label: 'Reviews', value: 'reviews' },
];

export default function NotificationsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAllRead,
    refresh,
  } = useNotifications({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    onlyUnread: showOnlyUnread,
    autoRefresh: true,
  });

  const handleNotificationPress = async (notification: NotificationDocument) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.$id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            try {
              await markAllAsRead();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark all as read');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete Read Notifications',
      'Are you sure you want to delete all read notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllRead();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notifications');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (notificationId: string) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOne(notificationId);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete notification');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-rubik-bold text-black-300">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-sm font-rubik text-gray-500 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/notification-preferences' as any)}
            className="p-2"
          >
            <Text className="text-primary-300 font-rubik-medium">Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.value)}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedCategory === item.value ? 'bg-primary-300' : 'bg-gray-100'
              }`}
            >
              <Text
                className={`font-rubik-medium ${
                  selectedCategory === item.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Filter & Actions */}
        <View className="flex-row items-center justify-between mt-3">
          <TouchableOpacity
            onPress={() => setShowOnlyUnread(!showOnlyUnread)}
            className="flex-row items-center"
          >
            <View
              className={`w-5 h-5 rounded border-2 ${
                showOnlyUnread ? 'bg-primary-300 border-primary-300' : 'border-gray-300'
              } items-center justify-center mr-2`}
            >
              {showOnlyUnread && <Text className="text-white text-xs">✓</Text>}
            </View>
            <Text className="text-sm font-rubik text-gray-600">Unread only</Text>
          </TouchableOpacity>

          <View className="flex-row gap-3">
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead}>
                <Text className="text-sm font-rubik-medium text-primary-300">Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleDeleteAll}>
              <Text className="text-sm font-rubik-medium text-red-600">Clear read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0061FF" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-xl font-rubik-bold text-gray-400 mb-2">No Notifications</Text>
          <Text className="text-center text-gray-500 font-rubik">
            {showOnlyUnread
              ? "You don't have any unread notifications"
              : "You're all caught up! No notifications yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={handleNotificationPress}
              onDelete={handleDelete}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#0061FF']} />
          }
        />
      )}
    </SafeAreaView>
  );
}
