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
  
  const handleSyncIntervalChange = async (text: string) => {
    const value = parseInt(text, 10);
    if (!isNaN(value) && value > 0) {
      setSyncInterval(value);
      await saveSettings({ syncInterval: value });
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
          <Text className="text-lg font-semibold text-foreground mb-3">
            URL de l'emploi du temps
          </Text>
          
          <TextInput
            value={icsUrl}
            onChangeText={setIcsUrlState}
            placeholder="https://..."
            placeholderTextColor={colors.muted}
            className="bg-surface border border-border rounded-lg p-3 text-foreground mb-3"
            editable={!saving}
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
        </View>
        
        {/* Section Synchronisation Automatique */}
        <View className="mb-8 bg-surface rounded-lg p-4 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              Synchronisation automatique
            </Text>
            <Switch
              value={autoSync}
              onValueChange={handleAutoSyncToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={autoSync ? colors.primary : colors.muted}
            />
          </View>
          
          {autoSync && (
            <View>
              <Text className="text-sm text-muted mb-2">
                Intervalle de synchronisation (minutes)
              </Text>
              <TextInput
                value={syncInterval.toString()}
                onChangeText={handleSyncIntervalChange}
                placeholder="15"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                className="bg-background border border-border rounded-lg p-3 text-foreground"
              />
              <Text className="text-xs text-muted mt-2">
                L'application se synchronisera automatiquement au demarrage si la derniere mise a jour depasse cet intervalle.
              </Text>
            </View>
          )}
        </View>
        
        {/* Section Notifications */}
        <View className="mb-8 bg-surface rounded-lg p-4 border border-border">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-foreground">
              Notifications
            </Text>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notifications ? colors.primary : colors.muted}
            />
          </View>
          <Text className="text-xs text-muted mt-2">
            Recevez des notifications pour les changements de cours.
          </Text>
        </View>
        
        {/* Section Informations */}
        <View className="bg-surface rounded-lg p-4 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-3">
            A propos
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-muted">Version</Text>
              <Text className="text-foreground font-semibold">1.0.2</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted">Plateforme</Text>
              <Text className="text-foreground font-semibold">Expo/React Native</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
