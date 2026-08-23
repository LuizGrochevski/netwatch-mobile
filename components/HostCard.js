import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { relativeTime } from '../src/utils'

const CORES = {
  bgVoid: '#0a0e0f',
  bgPanel: '#111618',
  line: '#1f292d',
  textPrimary: '#ffffff',
  textSecondary: '#7f8c8d',
  textDim: '#4a5558',
  signalUp: '#3ddc84',
  signalDown: '#ff4d4d',
  signalWarn: '#e8c547',
  radius: 4,
}

const SEVERITY_COLOR = {
  CRITICAL: '#ff4d4d',
  HIGH: '#ff8c42',
  MEDIUM: '#e8c547',
  LOW: '#6fcf97',
  'N/A': CORES.textDim,
}

function portColor(status) {
  if (!status) return CORES.textDim
  const s = status.toLowerCase()
  if (s.includes('aberta') || s.includes('open')) return CORES.signalUp
  if (s.includes('filtrada') || s.includes('filtered')) return CORES.signalWarn
  return CORES.textDim
}

function findCves(cvesByService, port) {
  if (!cvesByService) return []
  if (port.produto) {
    const keyword = port.versao ? `${port.produto} ${port.versao}` : port.produto
    const key = Object.keys(cvesByService).find(
      (k) => k.toLowerCase() === keyword.toLowerCase()
    )
    if (key) return cvesByService[key]
  }
  if (port.service) {
    const key = Object.keys(cvesByService).find(
      (k) => k.toLowerCase() === port.service.toLowerCase()
    )
    if (key) return cvesByService[key]
  }
  return []
}

function parsePortsScanned(str) {
  if (!str) return []
  return str.split(',').map((p) => p.trim()).filter(Boolean)
}

export default function HostCard({ result, scannedAt, cvesByService = {} }) {
  const [expanded, setExpanded] = useState(false)
  const openPorts = result.open_ports ?? []
  const isAlive = openPorts.length > 0
  const scannedPorts = parsePortsScanned(result.ports_scanned)
  const openPortNumbers = new Set(openPorts.map((p) => String(p.port)))
  const closedPorts = scannedPorts.filter((p) => !openPortNumbers.has(p))

  return (
    <View style={[styles.card, isAlive ? styles.cardUp : styles.cardDown]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <View style={styles.identity}>
          <View style={[styles.dot, isAlive ? styles.dotUp : styles.dotDown]} />
          <Text style={styles.ip}>{result.target}</Text>
        </View>

        <View style={styles.summary}>
          {isAlive ? (
            <Text style={styles.portCount}>{openPorts.length} abertas</Text>
          ) : (
            <Text style={styles.noResponse}>sem portas abertas</Text>
          )}
          <Text style={styles.time}>{relativeTime(scannedAt)}</Text>
          <Text style={[styles.chevron, expanded && styles.chevronOpen]}>▾</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.ports}>
          {openPorts.map((p) => {
            const cves = findCves(cvesByService, p)
            return (
              <View key={`open-${p.port}`} style={styles.portGroup}>
                <View style={styles.portRow}>
                  <View style={[styles.indicator, { backgroundColor: portColor(p.status) }]} />
                  <Text style={styles.portNumber}>{p.port}</Text>
                  <Text style={styles.portService}>{p.service || '—'}</Text>
                  <Text style={[styles.portStatus, { color: portColor(p.status) }]}>aberta</Text>
                </View>

                {cves.length > 0 &&
                  cves.map((cve) => (
                    <View key={cve.id} style={styles.cveRow}>
                      <Text style={[styles.cveSeverity, { color: SEVERITY_COLOR[cve.severity] ?? CORES.textDim }]}>
                        {cve.severity}
                      </Text>
                      <Text style={styles.cveId}>{cve.id}</Text>
                      <Text style={styles.cveDesc} numberOfLines={2}>{cve.description}</Text>
                    </View>
                  ))}
              </View>
            )
          })}

          {closedPorts.map((port) => (
            <View key={`closed-${port}`} style={[styles.portRow, { opacity: 0.5 }]}>
              <View style={[styles.indicator, { backgroundColor: CORES.textDim }]} />
              <Text style={styles.portNumber}>{port}</Text>
              <Text style={styles.portService}>—</Text>
              <Text style={[styles.portStatus, { color: CORES.textDim }]}>fechada</Text>
            </View>
          ))}

          {openPorts.length === 0 && closedPorts.length === 0 && (
            <Text style={styles.empty}>Nenhum dado de porta disponível.</Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CORES.bgPanel,
    borderWidth: 1,
    borderColor: CORES.line,
    borderRadius: CORES.radius,
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardUp: { borderLeftWidth: 3, borderLeftColor: CORES.signalUp },
  cardDown: { borderLeftWidth: 3, borderLeftColor: CORES.signalDown },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  identity: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  dotUp: { backgroundColor: CORES.signalUp },
  dotDown: { backgroundColor: CORES.signalDown },
  ip: {
    color: CORES.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    fontWeight: '600',
  },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  portCount: {
    color: CORES.signalUp,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  noResponse: {
    color: CORES.textSecondary,
    fontSize: 12,
  },
  time: {
    color: CORES.textDim,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
  },
  chevron: { color: CORES.textDim, fontSize: 12 },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  ports: { paddingHorizontal: 12, paddingBottom: 12 },
  portGroup: { marginBottom: 6 },
  portRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  indicator: { width: 6, height: 6, borderRadius: 3 },
  portNumber: {
    color: CORES.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
    width: 40,
  },
  portService: {
    color: CORES.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  portStatus: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
  },
  cveRow: {
    marginLeft: 14,
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: CORES.line,
    paddingLeft: 10,
  },
  cveSeverity: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  cveId: {
    color: CORES.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  cveDesc: {
    color: CORES.textSecondary,
    fontSize: 11,
  },
  empty: {
    color: CORES.textDim,
    fontSize: 12,
    textAlign: 'center',
    padding: 8,
  },
})
