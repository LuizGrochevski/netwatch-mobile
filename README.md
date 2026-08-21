# Netwatch Mobile 📱🛡️

![Expo](https://img.shields.io/badge/Expo-React%20Native-000020?style=for-the-badge&logo=expo&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Cliente mobile da **[Netwatch-API](https://github.com/LuizGrochevski/netwatch-api)** — app Expo/React Native para autenticar via JWT, visualizar histórico de scans e acompanhar resultados do **[Sentinel-RS](https://github.com/LuizGrochevski/Sentinel-RS)** no celular.

Faz parte do ecossistema Netwatch:

```
Sentinel-RS (scan) → netwatch-api (orquestra) → netwatch-dashboard (web)
                                              → netwatch-mobile (app)
```

---

## 🚀 Funcionalidades

- 🔐 Login JWT contra a Netwatch-API
- 📋 Histórico de scans
- 📱 Telas de autenticação e listagem
- 🔒 Token persistido localmente

---

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo / React Native |
| Linguagem | JavaScript / TypeScript |
| API | Netwatch-API (FastAPI + JWT) |
| Storage | Token local |

---

## ⚙️ Como rodar

```bash
npm install
npx expo start
```

Configure a URL da Netwatch-API no client (`src/api/netwatchClient.js`).

---

## 📁 Estrutura

```
netwatch-mobile/
├── app/                 # entry Expo
├── src/
│   ├── api/             # client HTTP + JWT
│   ├── screens/         # Login, History
│   └── storage/         # token
├── components/
└── package.json
```

---

## 👨‍💻 Autor

**Luiz Felipe Grochevski** — [LinkedIn](https://www.linkedin.com/in/luiz-felipe-grochevski) | [GitHub](https://github.com/LuizGrochevski)
