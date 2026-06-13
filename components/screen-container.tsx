import { type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";

import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  edges?: Edge[];
  className?: string;
  containerClassName?: string;
  safeAreaClassName?: string;
}

export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  style,
  ...props
}: ScreenContainerProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className={cn("flex-1", "bg-background", containerClassName)}
      {...(props as any)}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={style}
      >
        <Animated.View className={cn("flex-1", className)}>{children}</Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}
