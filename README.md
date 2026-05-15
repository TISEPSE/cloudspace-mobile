# CloudSpace Mobile

Application Android (Capacitor) pour [CloudSpace](https://github.com/TISEPSE/cloudspace).
Wrapper natif autour du frontend React qui se connecte à un serveur CloudSpace
hébergé ailleurs (auto-hébergement).

## Architecture

- **Frontend React/Vite** dans `src/` — UI complète
- **Capacitor 8** dans `android/` — wrap natif Android
- L'app se connecte à un serveur CloudSpace via QR code de pairing

## Développement

```bash
npm install
npm run dev          # serveur Vite, pour tester l'UI dans le navigateur
```

## Build APK

```bash
npm run android:debug    # APK debug (non signé)
npm run android:release  # APK release (signé si keystore configuré)
```

L'APK debug se trouve dans `android/app/build/outputs/apk/debug/`.

## Pre-requis

- Node.js 20+
- JDK 21
- Android SDK (API 36)

## Déploiement

Push d'un tag `vX.Y.Z` → workflow GitHub Actions construit + publie l'APK
en GitHub Release.

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Première utilisation côté téléphone

1. Installer l'APK
2. Au premier lancement, scanner le QR code depuis Settings → Appareils
   du serveur CloudSpace
3. Se connecter avec email + mot de passe
4. Optionnel : activer le déverrouillage par empreinte digitale
