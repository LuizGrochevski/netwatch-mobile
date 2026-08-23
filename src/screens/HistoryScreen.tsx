import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView,
} from 'react-native'
import { fetchHistory, fetchScanDetail, fetchScanCves } from '../api/netwatchClient'
import HostCard from '../../components/HostCard'
import NewScanScreen from './NewScanScreen'
import { relativeTime } from '../utils'

type ScanItem = {
  id: number
  targets: string[]
  status: string
  created_at?: string
}

type Props = {
  token: string
  onLogout: () => void
}

const CORES = {
  bgVoid: '#0a0e0f',
  bgPanel: '#111618',
  line: '#1f292d',
  lineBright: '#2f3e44',
  textPrimary: '#ffffff',
  textSecondary: '#7f8c8d',
  textDim: '#4a5558',
  signalUp: '#3ddc84',
  signalWarn: '#e8c547',
  radius: 4,
}

export default function HistoryScreen({ token, onLogout }: Props) {
  const [items, setItems] = useState<ScanItem[]>([])
  const [scanDetail, setScanDetail] = useState<any>(null)
  const [cvesByService, setCvesByService] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showNewScan, setShowNewScan] = useState(false)

  const load = useCallback(async () => {
    try {
      setError('')
      const history = await fetchHistory(token, 1)
      setItems(history.items ?? [])

      if (history.items?.length > 0) {
        const latestId = history.items[0].id
        setSelectedId(latestId)
        const detail = await fetchScanDetail(token, latestId)
        const cves = await fetchScanCves(token, latestId).catch(() => ({ cves: {} }))
        setScanDetail(detail)
        setCvesByService(cves.cves ?? {})
      } else {
        setScanDetail(null)
        setCvesByService({})
      }
    } catch (err: any) {
      setError(err.message)
    }
  }, [token])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function selectScan(id: number) {
    if (id === selectedId) return
    setSelectedId(id)
    setLoading(true)
    try {
      const detail = await fetchScanDetail(token, id)
      const cves = await fetchScanCves(token, id).catch(() => ({ cves: {} }))
      setScanDetail(detail)
      setCvesByService(cves.cves ?? {})
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !scanDetail) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CORES.signalUp} />
        <Text style={styles.loadingText}>consultando sentinel-rs…</Text>
      </View>
    )
  }

  const results = scanDetail?.results ?? []

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NETWATCH</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>sair</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>✗ {error}</Text> : null}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={CORES.signalUp} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            targets detectados ({results.length})
          </Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowNewScan(true)}>
            <Text style={styles.newBtnText}>+ novo scan</Text>
          </TouchableOpacity>
        </View>

        {results.length === 0 && (
          <Text style={styles.empty}>Nenhum scan ainda. Use "+ novo scan" para começar.</Text>
        )}

        {results.map((result: any) => (
          <HostCard
            key={result.target}
            result={result}
            scannedAt={scanDetail?.created_at}
            cvesByService={cvesByService}
          />
        ))}

        {items.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              histórico de execuções
            </Text>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.historyItem,
                  selectedId === item.id && styles.historyItemActive,
                ]}
                onPress={() => selectScan(item.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        item.status === 'completed'
                          ? CORES.signalUp
                          : CORES.signalWarn,
                    },
                  ]}
                />
                <Text style={styles.historyId}>#{item.id}</Text>
                <Text style={styles.historyTargets} numberOfLines={1}>
                  {item.targets?.join(', ')}
                </Text>
                <Text style={styles.historyTime}>
                  {relativeTime(item.created_at)}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <NewScanScreen
        token={token}
        visible={showNewScan}
        onClose={() => setShowNewScan(false)}
        onScanComplete={load}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.bgVoid,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CORES.bgVoid,
  },
  loadingText: {
    marginTop: 12,
    color: CORES.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: CORES.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  logout: {
    color: CORES.textDim,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: CORES.textSecondary,
    fontWeight: '500',
  },
  newBtn: {
    backgroundColor: CORES.bgPanel,
    borderWidth: 1,
    borderColor: CORES.lineBright,
    borderRadius: CORES.radius,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  newBtnText: {
    color: CORES.signalUp,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    color: '#ff4d4d',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
  },
  empty: {
    color: CORES.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.bgPanel,
    borderWidth: 1,
    borderColor: CORES.line,
    borderRadius: CORES.radius,
    padding: 10,
    marginBottom: 6,
    gap: 8,
  },
  historyItemActive: {
    borderColor: CORES.signalUp,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  historyId: {
    color: CORES.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  historyTargets: {
    flex: 1,
    color: CORES.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  historyTime: {
    color: CORES.textDim,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
  },
})
