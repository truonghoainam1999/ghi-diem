import { Text } from './Text';

/** Nhãn nhóm nội dung: ĐANG CHƠI, ĐÃ XONG, NGƯỜI CHƠI… */
export function SectionLabel({ children }: { children: string }) {
  return (
    <Text variant="label" tone="ink3" accessibilityRole="header">
      {children}
    </Text>
  );
}
