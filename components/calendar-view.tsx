import { View, Text, Pressable, FlatList } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import type { CourseEvent } from '@/lib/ics-parser';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface CalendarViewProps {
  events: CourseEvent[];
  selectedDate: Date;
  onDateSelected: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

/**
 * Obtient le lundi de la semaine donnée
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Obtient les 7 jours de la semaine à partir d'une date
 */
function getWeekDays(date: Date): Date[] {
  const weekStart = getWeekStart(date);
  const days: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  
  return days;
}

/**
 * Compte le nombre de cours pour un jour donné
 */
function getEventCountForDay(events: CourseEvent[], date: Date): number {
  const dateStr = date.toISOString().split('T')[0];
  return events.filter(event => event.startTime.toISOString().split('T')[0] === dateStr).length;
}

/**
 * Vérifie si deux dates sont le même jour
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Composant pour afficher un jour dans le calendrier
 */
function DayCell({
  date,
  eventCount,
  isSelected,
  isToday,
  onPress,
  colors,
}: {
  date: Date;
  eventCount: number;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
  colors: any;
}) {
  const dayName = ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()];
  const dayNum = date.getDate();
  
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        className={cn(
          'flex-1 items-center py-3 px-2 rounded-lg',
          isSelected && 'bg-primary',
          isToday && !isSelected && 'bg-primary/20',
          !isSelected && !isToday && 'bg-surface'
        )}
      >
        <Text
          className={cn(
            'text-xs font-semibold mb-1',
            isSelected ? 'text-white' : 'text-muted'
          )}
        >
          {dayName}
        </Text>
        <Text
          className={cn(
            'text-lg font-bold',
            isSelected ? 'text-white' : 'text-foreground'
          )}
        >
          {dayNum}
        </Text>
        {eventCount > 0 && (
          <View
            className={cn(
              'mt-1 rounded-full px-2 py-0.5',
              isSelected ? 'bg-white/30' : 'bg-primary/20'
            )}
          >
            <Text
              className={cn(
                'text-xs font-semibold',
                isSelected ? 'text-white' : 'text-primary'
              )}
            >
              {eventCount}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function CalendarView({
  events,
  selectedDate,
  onDateSelected,
  onPreviousWeek,
  onNextWeek,
}: CalendarViewProps) {
  const colors = useColors();
  const weekDays = getWeekDays(selectedDate);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  
  /**
   * Formate la plage de semaine
   */
  const formatWeekRange = () => {
    const monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    const startMonth = monthNames[weekStart.getMonth()];
    const endMonth = monthNames[weekEnd.getMonth()];
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${startDay} - ${endDay} ${startMonth} ${weekStart.getFullYear()}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${weekStart.getFullYear()}`;
    }
  };
  
  /**
   * Vérifie si c'est la semaine actuelle
   */
  const isCurrentWeek = () => {
    const now = new Date();
    return getWeekStart(now).getTime() === weekStart.getTime();
  };
  
  return (
    <View className="bg-surface rounded-xl p-4 mb-4">
      {/* En-tête avec navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onPreviousWeek();
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <View className="w-8 h-8 items-center justify-center">
            <Text className="text-xl text-primary">‹</Text>
          </View>
        </Pressable>
        
        <View className="flex-1 items-center">
          <Text className="text-sm font-semibold text-muted">
            {formatWeekRange()}
          </Text>
          {isCurrentWeek() && (
            <View className="mt-1 bg-primary/20 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-semibold text-primary">
                Semaine actuelle
              </Text>
            </View>
          )}
        </View>
        
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onNextWeek();
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <View className="w-8 h-8 items-center justify-center">
            <Text className="text-xl text-primary">›</Text>
          </View>
        </Pressable>
      </View>
      
      {/* Grille des jours */}
      <View className="flex-row gap-2">
        {weekDays.map((day, index) => (
          <DayCell
            key={index}
            date={day}
            eventCount={getEventCountForDay(events, day)}
            isSelected={isSameDay(day, selectedDate)}
            isToday={isSameDay(day, new Date())}
            onPress={() => onDateSelected(day)}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}
