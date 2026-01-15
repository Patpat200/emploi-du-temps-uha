import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Switch, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { getICSUrl, setICSUrl, syncSchedule } from '@/lib/sync-service';
import { getSettings, saveSettings } from '@/lib/settings-service';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const colors = useColors();
  const [icsUrl, setIcsUrlState] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(15);
  const [notifications, setNotifications] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
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
        Alert.alert(
          'Succes',
          `Synchronisation reussie ! ${result.events.length} evenements charges.`
        );
      } else {
        Alert.alert(
          'Erreur de synchronisation',
          result.error || 'Impossible de telecharger les donnees. Verifiez l\'URL et reessayez.'
        );
      }
    } catch (error) {
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
  
  const handleIntervalChange = async (interval: number) => {
    setSyncInterval(interval);
    await saveSettings({ syncInterval: interval });
    
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
      <ScrollView className="flex-1">
        {/* En-tete */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-2xl font-bold text-foreground">
            Parametres
          </Text>
        </View>
        
        {/* URL du flux ICS */}
        <View className="px-4 mb-6">
          <Text className="text-base font-semibold text-foreground mb-2">
            URL du flux ICS
          </Text>
          <Text className="text-sm text-muted mb-3">
            Collez l\'URL de votre emploi du temps depuis le site de l\'UHA. Une URL par defaut est deja configuree.
          </Text>
          <View className="bg-green-500/10 rounded-lg p-3 mb-3">
            <Text className="text-green-600 text-xs font-medium">
              OK L\'URL ICS fonctionne correctement
            </Text>
            <Text className="text-green-600 text-xs mt-1">
              Note: Le service RSS de l\'UHA est en erreur. Utilisez l\'URL ICS.
            </Text>
          </View>
          <TextInput
            value={icsUrl}
            onChangeText={setIcsUrlState}
            placeholder="https://www.emploisdutemps.uha.fr/..."
            placeholderTextColor={colors.muted}
            className="bg-surface rounded-xl p-4 text-foreground mb-3"
            multiline
            numberOfLines={3}
            editable={!testing}
            style={{ color: colors.foreground }}
          />
          <Pressable
            onPress={handleSaveUrl}
            disabled={saving || testing}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View
              className={cn(
                'bg-primary rounded-xl p-4 items-center flex-row justify-center gap-2',
                (saving || testing) && 'opacity-50'
              )}
            >
              {(saving || testing) && (
                <ActivityIndicator size="small" color="#ffffff" />
              )}
              <Text className="text-white font-semibold">
                {testing ? 'Test en cours...' : 'Enregistrer et tester'}
              </Text>
            </View>
          </Pressable>
          
          <View className="bg-blue-500/10 rounded-lg p-3 mt-3">
            <Text className="text-blue-600 text-xs">
              Conseil: Cliquez sur "Enregistrer et tester" pour verifier que l\'URL fonctionne correctement.
            </Text>
          </View>
        </View>
        
        {/* Synchronisation automatique */}
        <View className="px-4 mb-6">
          <View className="bg-surface rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-foreground mb-1">
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
                thumbColor="#ffffff"
              />
            </View>
            
            {autoSync && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-3">
                  Frequence de synchronisation
                </Text>
                <View className="flex-row gap-2">
                  {[5, 15, 30, 60].map((interval) => (
                    <Pressable
                      key={interval}
                      onPress={() => handleIntervalChange(interval)}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View
                        className={cn(
                          'px-4 py-2 rounded-lg',
                          syncInterval === interval ? 'bg-primary' : 'bg-border'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-sm font-medium',
                            syncInterval === interval ? 'text-white' : 'text-muted'
                          )}
                        >
                          {interval} min
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* Notifications */}
        <View className="px-4 mb-6">
          <View className="bg-surface rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-base font-semibold text-foreground mb-1">
                  Notifications
                </Text>
                <Text className="text-sm text-muted">
                  Recevoir une notification en cas de modification
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>
        
        {/* A propos */}
        <View className="px-4 mb-6">
          <View className="bg-surface rounded-xl p-4">
            <Text className="text-base font-semibold text-foreground mb-2">
              A propos
            </Text>
            <Text className="text-sm text-muted mb-1">
              Version 1.0.2
            </Text>
            <Text className="text-sm text-muted">
              Application d\'emploi du temps pour l\'UHA
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
