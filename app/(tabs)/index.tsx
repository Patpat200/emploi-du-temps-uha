import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { CourseCard } from '@/components/course-card';
import { DayHeader } from '@/components/day-header';
import { CourseDetailModal } from '@/components/course-detail-modal';
import { useColors } from '@/hooks/use-colors';
import { syncSchedule, loadEvents, getLastSyncDate } from '@/lib/sync-service';
import { groupEventsByDay, type CourseEvent } from '@/lib/ics-parser';

interface DaySection {
  date: string;
  dateObj: Date;
  isToday: boolean;
  events: CourseEvent[];
}

export default function HomeScreen() {
  const colors = useColors();
  const [sections, setSections] = useState<DaySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CourseEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Charge les événements depuis le cache ou synchronise
   */
  const loadSchedule = useCallback(async (forceSync = false) => {
    try {
      setError(null);
      
      let events: CourseEvent[];
      
      if (forceSync) {
        const result = await syncSchedule();
        events = result.events;
        setLastSync(result.lastSync);
        
        if (!result.success && result.error) {
          setError(result.error);
        }
      } else {
        events = await loadEvents();
        const syncDate = await getLastSyncDate();
        setLastSync(syncDate);
        
        // Si pas d'événements en cache, synchroniser
        if (events.length === 0) {
          const result = await syncSchedule();
          events = result.events;
          setLastSync(result.lastSync);
        }
      }
      
      // Filtrer les événements futurs et actuels (pas les événements passés de plus de 7 jours)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const filteredEvents = events.filter(event => event.startTime >= sevenDaysAgo);
      
      // Grouper par jour
      const grouped = groupEventsByDay(filteredEvents);
      
      // Convertir en sections pour FlatList
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newSections: DaySection[] = [];
      
      grouped.forEach((dayEvents, dateKey) => {
        const dateObj = new Date(dateKey);
        const isToday = dateObj.toDateString() === today.toDateString();
        
        newSections.push({
          date: dateKey,
          dateObj,
          isToday,
          events: dayEvents,
        });
      });
      
      // Trier par date
      newSections.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
      
      setSections(newSections);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  /**
   * Charge les données au montage du composant
   */
  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);
  
  /**
   * Gère le pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSchedule(true);
  }, [loadSchedule]);
  
  /**
   * Ouvre le modal de détails
   */
  const handleEventPress = (event: CourseEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };
  
  /**
   * Ferme le modal de détails
   */
  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  /**
   * Formate la date de dernière synchronisation
   */
  const formatLastSync = () => {
    if (!lastSync) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };
  
  /**
   * Rendu d'un élément de la liste
   */
  const renderItem = ({ item }: { item: DaySection | CourseEvent; index: number }) => {
    // Si c'est un en-tête de jour
    if ('date' in item && 'events' in item) {
      return <DayHeader date={item.dateObj} isToday={item.isToday} />;
    }
    
    // Si c'est un événement
    return <CourseCard event={item as CourseEvent} onPress={() => handleEventPress(item as CourseEvent)} />;
  };
  
  /**
   * Prépare les données pour FlatList (alternance en-têtes et événements)
   */
  const flatListData = sections.flatMap(section => [
    section,
    ...section.events,
  ]);
  
  /**
   * État de chargement initial
   */
  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Chargement de l'emploi du temps...</Text>
      </ScreenContainer>
    );
  }
  
  /**
   * État vide
   */
  if (sections.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-6xl mb-4">📅</Text>
        <Text className="text-xl font-bold text-foreground mb-2">
          Aucun cours à venir
        </Text>
        <Text className="text-muted text-center mb-6">
          Tirez vers le bas pour actualiser
        </Text>
        {error && (
          <View className="bg-error/10 rounded-xl p-4 w-full">
            <Text className="text-error text-sm text-center">
              {error}
            </Text>
          </View>
        )}
      </ScreenContainer>
    );
  }
  
  return (
    <ScreenContainer>
      {/* En-tête */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground mb-1">
          Emploi du Temps
        </Text>
        {lastSync && (
          <Text className="text-sm text-muted">
            Mis à jour {formatLastSync()}
          </Text>
        )}
        {error && (
          <View className="bg-warning/10 rounded-lg p-2 mt-2">
            <Text className="text-warning text-xs">
              ⚠️ {error}
            </Text>
          </View>
        )}
      </View>
      
      {/* Liste des cours */}
      <FlatList
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          if ('date' in item && 'events' in item) {
            return `header-${item.date}`;
          }
          return `event-${(item as CourseEvent).id}-${index}`;
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      
      {/* Modal de détails */}
      <CourseDetailModal
        visible={modalVisible}
        event={selectedEvent}
        onClose={handleCloseModal}
      />
    </ScreenContainer>
  );
}
