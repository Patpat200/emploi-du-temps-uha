import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { CalendarView } from '@/components/calendar-view';
import { CourseCard } from '@/components/course-card';
import { DayHeader } from '@/components/day-header';
import { CourseDetailModal } from '@/components/course-detail-modal';
import { useColors } from '@/hooks/use-colors';
import { syncSchedule, loadEvents, getLastSyncDate } from '@/lib/sync-service';
import type { CourseEvent } from '@/lib/ics-parser';

export default function CalendarScreen() {
  const colors = useColors();
  const [allEvents, setAllEvents] = useState<CourseEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
        
        if (events.length === 0) {
          const result = await syncSchedule();
          events = result.events;
          setLastSync(result.lastSync);
        }
      }
      
      setAllEvents(events);
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
   * Obtient les événements du jour sélectionné
   */
  const getDayEvents = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return allEvents.filter(event => event.startTime.toISOString().split('T')[0] === dateStr);
  };
  
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
   * Navigue vers la semaine précédente
   */
  const handlePreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };
  
  /**
   * Navigue vers la semaine suivante
   */
  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
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
   * Formate le nom du jour sélectionné
   */
  const getSelectedDayName = () => {
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return dayNames[selectedDate.getDay()];
  };
  
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
  
  const dayEvents = getDayEvents();
  
  return (
    <ScreenContainer>
      <FlatList
        data={dayEvents}
        renderItem={({ item }) => (
          <CourseCard event={item} onPress={() => handleEventPress(item)} />
        )}
        keyExtractor={(item, index) => `event-${item.id}-${index}`}
        ListHeaderComponent={
          <View>
            {/* En-tête */}
            <View className="px-4 pt-4 pb-4">
              <Text className="text-2xl font-bold text-foreground mb-1">
                Calendrier
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
            
            {/* Vue calendrier */}
            <View className="px-4 pb-4">
              <CalendarView
                events={allEvents}
                selectedDate={selectedDate}
                onDateSelected={setSelectedDate}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
              />
            </View>
            
            {/* Titre du jour sélectionné */}
            <View className="px-4 pb-4">
              <Text className="text-lg font-semibold text-foreground mb-2">
                {getSelectedDayName()} {selectedDate.getDate()} {
                  ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                   'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'][selectedDate.getMonth()]
                }
              </Text>
              {dayEvents.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-6xl mb-2">📭</Text>
                  <Text className="text-muted text-center">
                    Aucun cours ce jour
                  </Text>
                </View>
              )}
            </View>
          </View>
        }
        contentContainerStyle={{
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
