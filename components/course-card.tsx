import { Text, View, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import type { CourseEvent } from '@/lib/ics-parser';
import { getSubjectColor, lightenColor, darkenColor } from '@/lib/color-service';
import { isEventModified, getModificationTimeRemaining, formatTimeRemaining } from '@/lib/notification-service';
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

export function CourseCard({ event, onPress }: CourseCardProps) {
  const colors = useColors();
  const [subjectColor, setSubjectColor] = useState<string>('#0a7ea4');
  const [isModified, setIsModified] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    // Charger la couleur de la matière
    const loadColor = async () => {
      const color = await getSubjectColor(event.title);
      setSubjectColor(color);
    };
    loadColor();
  }, [event.title]);

  useEffect(() => {
    // Vérifier si l'événement est modifié
    const checkModified = async () => {
      const modified = await isEventModified(event.id);
      setIsModified(modified);
      
      if (modified) {
        const remaining = await getModificationTimeRemaining(event.id);
        setTimeRemaining(remaining);
      }
    };
    
    checkModified();
    
    // Mettre à jour le statut modifié toutes les secondes
    const interval = setInterval(checkModified, 1000);
    
    return () => clearInterval(interval);
  }, [event.id]);
  
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const backgroundColor = lightenColor(subjectColor, 85);
  const textColor = darkenColor(subjectColor, 20);
  
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
        className="rounded-xl p-4 mb-3 border-l-4 shadow-sm"
        style={{
          backgroundColor,
          borderLeftColor: subjectColor,
        }}
      >
        <View className="flex-row items-start gap-3">
          {/* Heure */}
          <View className="items-center pt-1">
            <Text
              className="text-2xl font-bold"
              style={{ color: textColor }}
            >
              {formatTime(event.startTime)}
            </Text>
            <Text
              className="text-xs"
              style={{ color: textColor, opacity: 0.7 }}
            >
              {formatTime(event.endTime)}
            </Text>
          </View>
          
          {/* Contenu */}
          <View className="flex-1">
            {/* Titre */}
            <Text
              className="text-base font-semibold mb-1"
              style={{ color: textColor }}
              numberOfLines={2}
            >
              {event.title}
            </Text>
            
            {/* Salle */}
            {event.location && (
              <View className="flex-row items-center gap-1 mb-1">
                <Text
                  className="text-sm"
                  style={{ color: textColor, opacity: 0.8 }}
                  numberOfLines={1}
                >
                  📍 {event.location}
                </Text>
              </View>
            )}
            
            {/* Enseignant */}
            {event.teacher && (
              <Text
                className="text-xs"
                style={{ color: textColor, opacity: 0.7 }}
                numberOfLines={1}
              >
                {event.teacher}
              </Text>
            )}
            
            {/* Badge type et statut */}
            <View className="flex-row items-center gap-2 mt-2 flex-wrap">
              <View className={cn('px-2 py-1 rounded-full', getTypeBadgeColor(event.type))}>
                <Text className="text-xs font-semibold text-white">
                  {event.type}
                </Text>
              </View>
              
              {event.group && (
                <View
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: subjectColor, opacity: 0.2 }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{ color: textColor }}
                  >
                    {event.group}
                  </Text>
                </View>
              )}
              
              {/* Badge modification */}
              {isModified && timeRemaining > 0 && (
                <View
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: subjectColor }}
                >
                  <Text className="text-white text-xs font-bold">
                    📝 {formatTimeRemaining(timeRemaining)}
                  </Text>
                </View>
              )}
              
              {event.status === 'cancelled' && (
                <View className="px-2 py-1 rounded-full bg-red-500">
                  <Text className="text-white text-xs font-bold">
                    ❌ Annulé
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
