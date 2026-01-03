import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import type { CourseEvent } from '@/lib/ics-parser';

interface CourseDetailModalProps {
  visible: boolean;
  event: CourseEvent | null;
  onClose: () => void;
}

/**
 * Formate la date complète
 */
function formatFullDate(date: Date): string {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName} ${day} ${month} ${year}`;
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
 * Calcule la durée en heures et minutes
 */
function getDuration(start: Date, end: Date): string {
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
}

export function CourseDetailModal({ visible, event, onClose }: CourseDetailModalProps) {
  const colors = useColors();
  
  if (!event) return null;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="bg-background rounded-t-3xl max-h-[80%]">
          {/* En-tête */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <Text className="text-lg font-bold text-foreground">
              Détails du cours
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View className="w-8 h-8 items-center justify-center">
                <Text className="text-2xl text-muted">×</Text>
              </View>
            </Pressable>
          </View>
          
          {/* Contenu */}
          <ScrollView className="p-4">
            {/* Titre */}
            <Text className="text-xl font-bold text-foreground mb-4">
              {event.title}
            </Text>
            
            {/* Date et heure */}
            <View className="bg-surface rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <IconSymbol name="house.fill" size={18} color={colors.primary} />
                <Text className="text-sm font-semibold text-foreground">
                  Date et horaires
                </Text>
              </View>
              
              <Text className="text-base text-foreground mb-1">
                {formatFullDate(event.startTime)}
              </Text>
              
              <View className="flex-row items-center gap-2">
                <Text className="text-base text-foreground">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
                <Text className="text-sm text-muted">
                  ({getDuration(event.startTime, event.endTime)})
                </Text>
              </View>
            </View>
            
            {/* Lieu */}
            {event.location && (
              <View className="bg-surface rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <IconSymbol name="house.fill" size={18} color={colors.primary} />
                  <Text className="text-sm font-semibold text-foreground">
                    Salle
                  </Text>
                </View>
                <Text className="text-base text-foreground">
                  {event.location}
                </Text>
              </View>
            )}
            
            {/* Enseignant */}
            {event.teacher && (
              <View className="bg-surface rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <IconSymbol name="house.fill" size={18} color={colors.primary} />
                  <Text className="text-sm font-semibold text-foreground">
                    Enseignant
                  </Text>
                </View>
                <Text className="text-base text-foreground">
                  {event.teacher}
                </Text>
              </View>
            )}
            
            {/* Groupe */}
            {event.group && (
              <View className="bg-surface rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <IconSymbol name="house.fill" size={18} color={colors.primary} />
                  <Text className="text-sm font-semibold text-foreground">
                    Groupe
                  </Text>
                </View>
                <Text className="text-base text-foreground">
                  {event.group}
                </Text>
              </View>
            )}
            
            {/* Type et statut */}
            <View className="bg-surface rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <IconSymbol name="house.fill" size={18} color={colors.primary} />
                <Text className="text-sm font-semibold text-foreground">
                  Informations
                </Text>
              </View>
              
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-sm text-muted">Type:</Text>
                <Text className="text-base text-foreground font-medium">
                  {event.type}
                </Text>
              </View>
              
              {event.status !== 'normal' && (
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-muted">Statut:</Text>
                  <Text
                    className={cn(
                      'text-base font-medium',
                      event.status === 'modified' && 'text-warning',
                      event.status === 'cancelled' && 'text-error'
                    )}
                  >
                    {event.status === 'modified' ? 'Modifié' : 'Annulé'}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Description */}
            {event.description && (
              <View className="bg-surface rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <IconSymbol name="house.fill" size={18} color={colors.primary} />
                  <Text className="text-sm font-semibold text-foreground">
                    Description
                  </Text>
                </View>
                <Text className="text-sm text-muted">
                  {event.description}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
