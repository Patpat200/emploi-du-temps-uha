import { View, Text, Pressable, ScrollView } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface SyncDebugProps {
  visible: boolean;
  onClose: () => void;
  logs: string[];
  lastError?: string;
  lastSync?: Date;
  eventCount?: number;
}

export function SyncDebug({
  visible,
  onClose,
  logs,
  lastError,
  lastSync,
  eventCount,
}: SyncDebugProps) {
  const colors = useColors();
  
  if (!visible) return null;
  
  return (
    <View className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <View
        className="bg-surface rounded-xl w-full max-w-md max-h-96 overflow-hidden"
        style={{ backgroundColor: colors.surface }}
      >
        {/* Header */}
        <View className="bg-primary p-4 flex-row items-center justify-between">
          <Text className="text-white font-bold text-lg">Debug Info</Text>
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onClose();
            }}
          >
            <Text className="text-white text-2xl">×</Text>
          </Pressable>
        </View>
        
        {/* Content */}
        <ScrollView className="p-4 flex-1">
          {/* Status */}
          <View className="mb-4">
            <Text className="font-bold text-foreground mb-2">Status</Text>
            {lastSync && (
              <Text className="text-sm text-muted">
                Last sync: {lastSync.toLocaleTimeString()}
              </Text>
            )}
            {eventCount !== undefined && (
              <Text className="text-sm text-muted">
                Events loaded: {eventCount}
              </Text>
            )}
          </View>
          
          {/* Error */}
          {lastError && (
            <View className="mb-4 bg-error/10 p-3 rounded-lg">
              <Text className="text-error text-xs font-bold mb-1">Error:</Text>
              <Text className="text-error text-xs">{lastError}</Text>
            </View>
          )}
          
          {/* Logs */}
          <View>
            <Text className="font-bold text-foreground mb-2">Logs</Text>
            {logs.length === 0 ? (
              <Text className="text-sm text-muted">No logs yet</Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} className="text-xs text-muted font-mono mb-1">
                  {log}
                </Text>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
