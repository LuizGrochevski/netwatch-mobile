import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { login } from '../api/netwatchClient';

// Paleta de cores baseada nas variáveis CSS do seu projeto web
const CORES = {
  bgVoid: '#0a0e0f',       // Fundo escuro total
  bgPanel: '#111618',      // Painel central
  line: '#1f292d',         // Borda discreta
  lineBright: '#2f3e44',   // Borda do input
  textPrimary: '#ffffff',  // Texto principal
  textSecondary: '#7f8c8d',// Texto secundário/Labels
  signalUp: '#3ddc84',     // Verde (Sucesso/Online)
  signalUpDim: '#1f6e42',  // Verde escuro (Loading)
  signalDown: '#ff4d4d',   // Vermelho (Erro)
  radius: 4,               // Valor padrão para bordas arredondadas
};

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!username || !password) return;
    setLoading(true);
    setError(null);
    try {
      const token = await login(username, password);
      onLoginSuccess(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    // KeyboardAvoidingView impede que o teclado do celular cubra os campos de input
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.telaCheia}
    >
      <View style={styles.painel}>
        
        {/* Cabeçalho */}
        <View style={styles.headerContainer}>
          <View style={styles.row}>
            <View style={styles.statusDot} />
            <Text style={styles.titulo}>
              NETWATCH // <Text style={styles.tituloVerde}>SENTINEL_RS</Text>
            </Text>
          </View>
          <Text style={styles.subtitulo}>AUTENTICAÇÃO REQUERIDA</Text>
        </View>

        {/* Formulário */}
        <View style={styles.formGap}>
          
          {/* Campo Usuário */}
          <View>
            <Text style={styles.label}>Usuário</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              placeholderTextColor="#444"
              style={styles.input}
            />
          </View>

          {/* Campo Senha */}
          <View>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              placeholderTextColor="#444"
              onSubmitEditing={handleSubmit}
              style={styles.input}
            />
          </View>

          {/* Mensagem de Erro */}
          {error && (
            <Text style={styles.erroTexto}>
              ✗ {error}
            </Text>
          )}

          {/* Botão de Enviar */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            style={[
              styles.botao, 
              loading ? styles.botaoDisabled : styles.botaoActive
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#0a0e0f" size="small" />
            ) : (
              <Text style={styles.botaoTexto}>ENTRAR</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  telaCheia: {
    flex: 1,
    backgroundColor: CORES.bgVoid,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  painel: {
    backgroundColor: CORES.bgPanel,
    borderWidth: 1,
    borderColor: CORES.line,
    borderRadius: CORES.radius,
    padding: 32,
    width: '100%',
    maxWidth: 360,
  },
  headerContainer: {
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CORES.signalUp,
    marginRight: 10, 
    shadowColor: CORES.signalUp,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  titulo: {
    color: CORES.textPrimary,
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', 
  },
  tituloVerde: {
    color: CORES.signalUp,
  },
  subtitulo: {
    fontSize: 12,
    color: CORES.textSecondary,
    letterSpacing: 0.5,
  },
  formGap: {
    gap: 14, 
  },
  label: {
    fontSize: 11,
    color: CORES.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    backgroundColor: CORES.bgVoid,
    borderWidth: 1,
    borderColor: CORES.lineBright,
    borderRadius: CORES.radius,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: CORES.textPrimary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  erroTexto: {
    fontSize: 13,
    color: CORES.signalDown,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  botao: {
    marginTop: 6,
    padding: 11,
    borderRadius: CORES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoActive: {
    backgroundColor: CORES.signalUp,
  },
  botaoDisabled: {
    backgroundColor: CORES.signalUpDim,
  },
  botaoTexto: {
    color: '#0a0e0f',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.4,
  },
});

export default Login;
