import { Text, View } from 'react-native';
import { cn } from '@/lib/utils';

interface DayHeaderProps {
  date: Date;
  isToday?: boolean;
}

/**
 * Formate la date au format "Lundi 23 janvier"
 */
function formatDate(date: Date): { dayName: string; dateStr: string } {
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  
  return {
    dayName,
    dateStr: `${day} ${month}`,
  };
}

export function DayHeader({ date, isToday = false }: DayHeaderProps) {
  const { dayName, dateStr } = formatDate(date);
  
  return (
    <View className="flex-row items-center justify-between mb-3 mt-4">
      <View className="flex-row items-center gap-2">
        <Text className="text-xl font-bold text-foreground">
          {dayName}
        </Text>
        <Text className="text-base text-muted">
          {dateStr}
        </Text>
      </View>
      
      {isToday && (
        <View className="bg-primary px-3 py-1 rounded-full">
          <Text className="text-xs font-semibold text-white">
            Aujourd'hui
          </Text>
        </View>
      )}
    </View>
  );
}
