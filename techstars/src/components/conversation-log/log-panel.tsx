import { useEffect } from 'react';
import { useWindowDimensions, StyleSheet, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useConversationStore } from '@/state/conversation-state';
import { LogMessageList } from './log-message-list';

export function LogPanel() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isOpen = useConversationStore((s) => s.isLogOpen);
  const setLogOpen = useConversationStore((s) => s.setLogOpen);

  const PANEL_WIDTH = width * 0.85;
  // translateX: 0 = visible (panel fully on-screen), PANEL_WIDTH = hidden (off right)
  const translateX = useSharedValue(PANEL_WIDTH);
  const dragStartX = useSharedValue(PANEL_WIDTH);

  // Sync panel position to isOpen state
  useEffect(() => {
    translateX.value = withSpring(isOpen ? 0 : PANEL_WIDTH, {
      damping: 20,
      stiffness: 200,
    });
  }, [PANEL_WIDTH, isOpen, translateX]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onBegin(() => {
      dragStartX.value = translateX.value;
    })
    .onUpdate((e) => {
      const next = dragStartX.value + e.translationX;
      translateX.value = Math.max(0, Math.min(PANEL_WIDTH, next));
    })
    .onEnd((e) => {
      const shouldClose =
        translateX.value > PANEL_WIDTH * 0.45 || e.velocityX > 300;
      translateX.value = withSpring(shouldClose ? PANEL_WIDTH : 0, {
        damping: 20,
        stiffness: 200,
      });
      setLogOpen(!shouldClose);
    })
    .runOnJS(true);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayOpacity = useAnimatedStyle(() => ({
    opacity: 1 - translateX.value / PANEL_WIDTH,
  }));

  return (
    <>
      {/* Tap-away overlay */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, styles.overlay, overlayOpacity]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setLogOpen(false)} />
      </Animated.View>

      {/* Slide-in panel */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.panel,
            {
              width: PANEL_WIDTH,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 16,
              right: 0,
            },
            panelStyle,
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Conversation</Text>
            <Pressable
              onPress={() => setLogOpen(false)}
              hitSlop={16}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <LogMessageList />
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(14,12,28,0.97)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(197,193,245,0.12)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197,193,245,0.1)',
  },
  headerText: {
    color: '#C5C1F5',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: 'rgba(197,193,245,0.6)',
    fontSize: 16,
  },
});
