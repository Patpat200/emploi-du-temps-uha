import { Text, View, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import type { CourseEvent } from '@/lib/ics-parser';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface CourseCardProps {
  event: CourseEvent;
  onPress: () => void;
}

/**
 * Formate l'heure au format HH:MM
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Obtient la couleur du badge selon le type de cours
 */
function getTypeBadgeColor(type: CourseEvent['type']): string {
  switch (type) {
    case 'CM':
      return 'bg-blue-500';
    case 'TD':
      return 'bg-green-500';
    case 'TP':
      return 'bg-purple-500';
    case 'SAE':
      return 'bg-orange-500';
    case 'EXAM':
      return 'bg-red-500';
    case 'VACANCES':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Obtient la couleur de bordure selon le statut
 */
function getStatusBorderColor(status: CourseEvent['status']): string {
  switch (status) {
    case 'modified':
      return 'border-l-warning';
    case 'cancelled':
      return 'border-l-error';
    default:
      return 'border-l-primary';
  }
}

export function CourseCard({ event, onPress }: CourseCardProps) {
  const colors = useColors();
  
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };
  
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View
        className={cn(
          'bg-surface rounded-xl p-4 mb-3 border-l-4',
          getStatusBorderColor(event.status),
          'shadow-sm'
        )}
      >
        <View className="flex-row items-start gap-3">
          {/* Heure */}
          <View className="items-center pt-1">
            <Text className="text-2xl font-bold text-foreground">
              {formatTime(event.startTime)}
            </Text>
            <Text className="text-xs text-muted">
              {formatTime(event.endTime)}
            </Text>
          </View>
          
          {/* Contenu */}
          <View className="flex-1">
            {/* Titre */}
            <Text
              className="text-base font-semibold text-foreground mb-1"
              numberOfLines={2}
            >
              {event.title}
            </Text>
            
            {/* Salle */}
            {event.location && (
              <View className="flex-row items-center gap-1 mb-1">
                <IconSymbol
                  name="house.fill"
                  size={14}
                  color={colors.muted}
                />
                <Text className="text-sm text-muted" numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            )}
            
            {/* Enseignant */}
            {event.teacher && (
              <Text className="text-xs text-muted" numberOfLines={1}>
                {event.teacher}
              </Text>
            )}
            
            {/* Badge type */}
            <View className="flex-row items-center gap-2 mt-2">
              <View className={cn('px-2 py-1 rounded-full', getTypeBadgeColor(event.type))}>
                <Text className="text-xs font-semibold text-white">
                  {event.type}
                </Text>
              </View>
              
              {event.group && (
                <View className="px-2 py-1 rounded-full bg-border">
                  <Text className="text-xs font-medium text-muted">
                    {event.group}
                  </Text>
                </View>
              )}
              
              {event.status === 'modified' && (
                <Text className="text-xs text-warning font-medium">
                  • Modifié
                </Text>
              )}
              
              {event.status === 'cancelled' && (
                <Text className="text-xs text-error font-medium">
                  • Annulé
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
