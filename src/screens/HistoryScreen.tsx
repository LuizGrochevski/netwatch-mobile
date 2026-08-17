import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator, RefreshControl } from 'react-native'
import { fetchHistory } from '../api/netwatchClient'

type ScanItem = {
  id: number
  targets: string[]
  status: string
  results: string
}

type Props = {
  token: string
  onLogout: () => void
}

export default function HistoryScreen({ token, onLogout }: Props) {
  const [items, setItems] = useState<ScanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadHistory = useCallback(async () => {
    try {
      const result = await fetchHistory(token, 1)
      setItems(result.items)
    } catch (err: any) {
      setError(err.message)
    }
  }, [token])

  useEffect(() => {
    loadHistory().finally(() => setLoading(false))
  }, [loadHistory])

  async function handleRefresh() {
    setRefreshing(true)
    await loadHistory()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Button title="Sair" onPress={onLogout} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum scan ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.targets.join(', ')}</Text>
            <Text style={styles.cardSub}>{item.status} · {item.results}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontWeight: '600' },
  cardSub: { color: '#666', marginTop: 4 },
  error: { color: 'red', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#999', marginTop: 32 },
})