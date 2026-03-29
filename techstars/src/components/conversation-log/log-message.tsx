import { StyleSheet, Text, View } from 'react-native';

import type { Message } from '@/state/conversation-state';

interface LogMessageProps {
  message: Message;
}

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

export function LogMessage({ message }: LogMessageProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View
        style={[
          styles.dot,
          { backgroundColor: isUser ? '#C5C1F5' : '#1D9E75' },
        ]}
      />
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={styles.text}>{message.text}</Text>
        <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  rowUser: {
    flexDirection: 'row-reverse',
  },
  rowAssistant: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginHorizontal: 6,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: 'rgba(197,193,245,0.15)',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderBottomLeftRadius: 4,
  },
  text: {
    color: '#F0EEF8',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'System',
  },
  time: {
    color: 'rgba(240,238,248,0.4)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
