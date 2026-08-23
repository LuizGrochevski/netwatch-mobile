import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native'
import { createScan } from '../api/netwatchClient'

const CORES = {
  bgVoid: '#0a0e0f',
  bgPanel: '#111618',
  line: '#1f292d',
  lineBright: '#2f3e44',
  textPrimary: '#ffffff',
  textSecondary: '#7f8c8d',
  textDim: '#4a5558',
  signalUp: '#3ddc84',
  signalUpDim: '#1f6e42',
  signalDown: '#ff4d4d',
  radius: 4,
}

export default function NewScanScreen({ token, visible, onClose, onScanComplete }) {
  const [targets, setTargets] = useState('')
  const [ports, setPorts] = useState('22,80,443')
  const [protocol, setProtocol] = useState('tcp')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!targets.trim()) {
      setError('Informe ao menos um target')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const targetList = targets.split(',').map((t) => t.trim()).filter(Boolean)
      await createScan(token, { targets: targetList, ports, protocol })
      setTargets('')
      onClose()
      onScanComplete()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>novo scan</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>targets (separados por vírgula)</Text>
            <TextInput
              value={targets}
              onChangeText={setTargets}
              placeholder="192.168.1.1, google.com"
              placeholderTextColor="#444"
              autoCapitalize="none"
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>portas</Text>
                <TextInput
                  value={ports}
                  onChangeText={setPorts}
                  placeholder="22,80,443"
                  placeholderTextColor="#444"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={{ width: 100 }}>
                <Text style={styles.label}>protocolo</Text>
                <View style={styles.protocolRow}>
                  <TouchableOpacity
                    style={[styles.protocolBtn, protocol === 'tcp' && styles.protocolActive]}
                    onPress={() => setProtocol('tcp')}
                  >
                    <Text style={[styles.protocolText, protocol === 'tcp' && styles.protocolTextActive]}>TCP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.protocolBtn, protocol === 'udp' && styles.protocolActive]}
                    onPress={() => setProtocol('udp')}
                  >
                    <Text style={[styles.protocolText, protocol === 'udp' && styles.protocolTextActive]}>UDP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {error && <Text style={styles.error}>✗ {error}</Text>}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.btn, loading && styles.btnDisabled]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#0a0e0f" size="small" />
              ) : (
                <Text style={styles.btnText}>EXECUTAR SCAN</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: CORES.bgPanel,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: CORES.line,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: CORES.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    fontWeight: '600',
  },
  close: {
    color: CORES.textDim,
    fontSize: 18,
  },
  form: {
    gap: 14,
  },
  label: {
    fontSize: 10,
    color: CORES.textSecondary,
    marginBottom: 5,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: CORES.bgVoid,
    borderWidth: 1,
    borderColor: CORES.lineBright,
    borderRadius: CORES.radius,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: CORES.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  protocolRow: {
    flexDirection: 'row',
    gap: 6,
  },
  protocolBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: CORES.lineBright,
    borderRadius: CORES.radius,
    alignItems: 'center',
  },
  protocolActive: {
    borderColor: CORES.signalUp,
    backgroundColor: 'rgba(61,220,132,0.1)',
  },
  protocolText: {
    color: CORES.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  protocolTextActive: {
    color: CORES.signalUp,
    fontWeight: '700',
  },
  error: {
    color: CORES.signalDown,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  btn: {
    marginTop: 4,
    padding: 12,
    backgroundColor: CORES.signalUp,
    borderRadius: CORES.radius,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: CORES.signalUpDim,
  },
  btnText: {
    color: '#0a0e0f',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.4,
  },
})
