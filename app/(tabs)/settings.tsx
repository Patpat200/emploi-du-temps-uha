import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Switch, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { getICSUrl, setICSUrl, syncSchedule, getLastSyncDate } from '@/lib/sync-service';
import { getSettings, saveSettings } from '@/lib/settings-service';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const SYNC_INTERVALS = [5, 15, 30, 60]; // en minutes

export default function SettingsScreen() {
  const colors = useColors();
  const [icsUrl, setIcsUrlState] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(15);
  const [notifications, setNotifications] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [urlStatus, setUrlStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    const url = await getICSUrl();
    setIcsUrlState(url);
    
    const settings = await getSettings();
    setAutoSync(settings.autoSync);
    setSyncInterval(settings.syncInterval);
    setNotifications(settings.notificationsEnabled);
    
    // Vérifier l'URL au chargement
    checkUrlStatus(url);
  };
  
  const checkUrlStatus = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        setUrlStatus('success');
        setStatusMessage('OK L\'URL ICS fonctionne correctement');
      } else {
        setUrlStatus('error');
        setStatusMessage('Erreur: Le serveur retourne une erreur');
      }
    } catch (error) {
      setUrlStatus('error');
      setStatusMessage('Erreur: Impossible de vérifier l\'URL');
    }
  };
  
  const handleSaveUrl = async () => {
    if (!icsUrl.trim()) {
      Alert.alert('Erreur', 'L\'URL ne peut pas etre vide');
      return;
    }
    
    if (!icsUrl.startsWith('http://') && !icsUrl.startsWith('https://')) {
      Alert.alert('Erreur', 'L\'URL doit commencer par http:// ou https://');
      return;
    }
    
    setSaving(true);
    setTesting(true);
    
    try {
      await setICSUrl(icsUrl);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Synchroniser immediatement pour tester l'URL
      const result = await syncSchedule();
      
      if (result.success) {
        setUrlStatus('success');
        setStatusMessage('OK L\'URL ICS fonctionne correctement');
        Alert.alert(
          'Succes',
          `Synchronisation reussie ! ${result.events.length} evenements charges.`
        );
      } else {
        setUrlStatus('error');
        setStatusMessage(result.error || 'Erreur: Impossible de telecharger les donnees');
        Alert.alert(
          'Erreur de synchronisation',
          result.error || 'Impossible de telecharger les donnees. Verifiez l\'URL et reessayez.'
        );
      }
    } catch (error) {
      setUrlStatus('error');
      setStatusMessage('Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Impossible d\'enregistrer l\'URL'
      );
    } finally {
      setSaving(false);
      setTesting(false);
    }
  };
  
  const handleAutoSyncToggle = async (value: boolean) => {
    setAutoSync(value);
    await saveSettings({ autoSync: value });
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleSyncIntervalChange = async (value: number) => {
    setSyncInterval(value);
    await saveSettings({ syncInterval: value });
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    await saveSettings({ notificationsEnabled: value });
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        {/* Titre */}
        <Text className="text-2xl font-bold text-foreground mb-6">
          Parametres
        </Text>
        
        {/* Section URL */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-foreground mb-2">
            URL du flux ICS
          </Text>
          
          <Text className="text-sm text-muted mb-3">
            Collez l\'URL de votre emploi du temps depuis le site de l\'UHA. Une URL par defaut est deja configuree.
          </Text>
          
          {/* Message de statut */}
          {urlStatus && (
            <View className={cn('rounded-lg p-3 mb-3', urlStatus === 'success' ? 'bg-success/10' : 'bg-error/10')}>
              <Text className={cn('text-sm', urlStatus === 'success' ? 'text-success' : 'text-error')}>
                {statusMessage}
              </Text>
              {urlStatus === 'error' && (
                <Text className="text-xs text-muted mt-1">
                  Note: Le service RSS de l\'UHA est en erreur. Utilisez l\'URL ICS.
                </Text>
              )}
            </View>
          )}
          
          <TextInput
            value={icsUrl}
            onChangeText={setIcsUrlState}
            placeholder="https://..."
            placeholderTextColor={colors.muted}
            className="bg-surface border border-border rounded-lg p-3 text-foreground mb-3 text-xs"
            editable={!saving}
            multiline
          />
          
          <Pressable
            onPress={handleSaveUrl}
            disabled={saving}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            className="rounded-lg p-3 items-center"
          >
            {testing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                Enregistrer et tester
              </Text>
            )}
          </Pressable>
          
          <View className="bg-blue-500/10 rounded-lg p-3 mt-3">
            <Text className="text-blue-400 text-xs">
              Conseil: Cliquez sur "Enregistrer et tester" pour verifier que l\'URL fonctionne correctement.
            </Text>
          </View>
        </View>
        
        {/* Section Synchronisation Automatique */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">
                Synchronisation automatique
              </Text>
              <Text className="text-sm text-muted">
                Actualiser l\'emploi du temps automatiquement
              </Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={handleAutoSyncToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={autoSync ? 'white' : colors.muted}
            />
          </View>
          
          {autoSync && (
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">
                Frequence de synchronisation
              </Text>
              
              <View className="flex-row flex-wrap gap-2">
                {SYNC_INTERVALS.map((interval) => (
                  <Pressable
                    key={interval}
                    onPress={() => handleSyncIntervalChange(interval)}
                    style={({ pressed }) => [
                      {
                        backgroundColor: syncInterval === interval ? colors.primary : colors.surface,
                        opacity: pressed ? 0.8 : 1,
                        borderColor: colors.border,
                        borderWidth: 1,
                      },
                    ]}
                    className="px-4 py-2 rounded-lg"
                  >
                    <Text
                      className={cn(
                        'font-semibold',
                        syncInterval === interval ? 'text-white' : 'text-foreground'
                      )}
                    >
                      {interval} min
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
        
        {/* Section Notifications */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">
                Notifications
              </Text>
              <Text className="text-sm text-muted">
                Recevoir une notification en cas de changement
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notifications ? 'white' : colors.muted}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
