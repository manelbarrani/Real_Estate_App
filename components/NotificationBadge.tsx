import { Text, View } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  max?: number;
}

export function NotificationBadge({ count, size = 'medium', max = 99 }: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const sizeClasses = {
    small: 'w-4 h-4 text-[8px]',
    medium: 'w-5 h-5 text-[10px]',
    large: 'w-6 h-6 text-xs',
  };

  return (
    <View
      className={`${sizeClasses[size]} rounded-full bg-red-600 items-center justify-center absolute -top-1 -right-1 border-2 border-white`}
    >
      <Text className="text-white font-rubik-bold text-center">
        {displayCount}
      </Text>
    </View>
  );
}
