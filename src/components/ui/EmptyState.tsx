import { View } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

import { Button } from './Button';
import { Text } from './Text';

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.md,
    paddingHorizontal: t.space.xxl,
  },
  copy: { textAlign: 'center' },
}));

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Text variant="titleNav" style={styles.copy}>
        {title}
      </Text>
      <Text variant="body" tone="ink3" style={styles.copy}>
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: 8, alignSelf: 'stretch' }} />
      ) : null}
    </View>
  );
}
