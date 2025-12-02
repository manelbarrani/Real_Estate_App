import icons from '@/constants/icons';
import { NotificationDocument } from '@/lib/appwrite';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface NotificationCardProps {
  notification: NotificationDocument;
  onPress?: (notification: NotificationDocument) => void;
  onDelete?: (notificationId: string) => void;
}

export function NotificationCard({ notification, onPress, onDelete }: NotificationCardProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'message':
        return icons.chat;
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_rejected':
      case 'booking_cancelled':
        return icons.calendar;
      case 'payment_received':
      case 'payment_refunded':
        return icons.wallet;
      case 'payout_completed':
        return icons.wallet;
      case 'review_received':
        return icons.star;
      case 'property_favorite':
        return icons.heart;
      case 'system':
        return icons.info;
      default:
        return icons.bell;
    }
  };

  const getNotificationColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(notification);
    } else if (notification.actionUrl) {
      // Navigate to the action URL
      router.push(notification.actionUrl as any);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true });

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row p-4 border-b border-gray-200 ${
        !notification.isRead ? 'bg-blue-50' : 'bg-white'
      }`}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View className={`w-12 h-12 rounded-full ${getNotificationColor()} items-center justify-center mr-3`}>
        <Image
          source={getNotificationIcon()}
          className="w-6 h-6"
          tintColor="white"
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between mb-1">
          <Text className={`flex-1 text-base ${!notification.isRead ? 'font-rubik-bold' : 'font-rubik-medium'}`}>
            {notification.title}
          </Text>
          {!notification.isRead && (
            <View className="w-2 h-2 rounded-full bg-blue-600 ml-2 mt-1" />
          )}
        </View>

        <Text className="text-sm text-gray-600 font-rubik mb-1" numberOfLines={2}>
          {notification.message}
        </Text>

        <Text className="text-xs text-gray-400 font-rubik">
          {timeAgo}
        </Text>
      </View>

      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(notification.$id)}
          className="ml-2 p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={icons.backArrow}
            className="w-4 h-4"
            tintColor="#9CA3AF"
            resizeMode="contain"
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
