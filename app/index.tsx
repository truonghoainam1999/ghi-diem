import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ActiveGameCard } from '@/components/game/ActiveGameCard';
import { FinishedGameRow } from '@/components/game/FinishedGameRow';
import { BottomBar } from '@/components/ui/BottomBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { NavBar } from '@/components/ui/NavBar';
import { Screen } from '@/components/ui/Screen';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useGames } from '@/storage/GamesProvider';
import { makeStyles } from '@/theme/ThemeProvider';

const useStyles = makeStyles((t) => ({
  body: { paddingHorizontal: t.GUTTER, paddingBottom: t.space.xl, gap: t.space.md + 2 },
}));

/** Màn 01 — mở app để làm hai việc: quay lại ván đang dở, hoặc mở ván mới. */
export default function GameListScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { activeGames, finishedGames, ready } = useGames();

  const isEmpty = ready && activeGames.length === 0 && finishedGames.length === 0;

  return (
    <Screen>
      <NavBar largeTitle="Ghi Điểm" right={<ThemeToggle />} />

      {isEmpty ? (
        <EmptyState
          title="Chưa có ván nào"
          body="Tạo ván đầu tiên, chọn người chơi, rồi ghi điểm từng vòng."
          actionLabel="Bắt đầu ván đầu tiên"
          onAction={() => router.push('/new')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {activeGames.length > 0 ? (
            <>
              <SectionLabel>Đang chơi</SectionLabel>
              <View style={{ gap: 12 }}>
                {activeGames.map((game) => (
                  <ActiveGameCard key={game.id} game={game} onPress={() => router.push(`/game/${game.id}`)} />
                ))}
              </View>
            </>
          ) : null}

          {finishedGames.length > 0 ? (
            <>
              <SectionLabel>Đã xong</SectionLabel>
              <Card flush>
                {finishedGames.map((game, index) => (
                  <FinishedGameRow
                    key={game.id}
                    game={game}
                    last={index === finishedGames.length - 1}
                    onPress={() => router.push(`/game/${game.id}/result`)}
                  />
                ))}
              </Card>
            </>
          ) : null}
        </ScrollView>
      )}

      {isEmpty ? null : (
        <BottomBar>
          <Button label="＋ Ván mới" onPress={() => router.push('/new')} style={{ flex: 1 }} />
        </BottomBar>
      )}
    </Screen>
  );
}
