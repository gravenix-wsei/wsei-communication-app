# WSEI Communicator

Aplikacja czatu czasu rzeczywistego z autentykacją użytkowników, historią wiadomości i możliwością wysyłania wiadomości na żywo.

## 🚀 Demo na żywo

- **Aplikacja Frontend**: https://lively-mud-05efd5203.3.azurestaticapps.net
- **API Backend**: https://wsei-devops-cicd-app-d6bwcmffevaxegbs.westeurope-01.azurewebsites.net

## 🛠️ Stack technologiczny

### Frontend
- **Vue 3** - Progresywny framework JavaScript z Composition API
- **TypeScript** - Typowane programowanie
- **Pinia** - Biblioteka do zarządzania stanem
- **Vue Router** - Routing po stronie klienta z guards autentykacji
- **Socket.IO Client** - Dwukierunkowa komunikacja w czasie rzeczywistym
- **Axios** - Klient HTTP z obsługą cookies
- **Tailwind CSS** - Framework CSS oparty na klasach użytkowych
- **Vite** - Szybkie narzędzie do budowania i serwer deweloperski

### Backend
- **Node.js** - Środowisko uruchomieniowe JavaScript
- **Express.js** - Framework aplikacji webowych
- **TypeScript** - Typowane programowanie po stronie serwera
- **MongoDB** - Baza danych NoSQL
- **Mongoose** - Modelowanie obiektów MongoDB
- **Socket.IO** - Serwer websocket w czasie rzeczywistym
- **JWT (jsonwebtoken)** - Bezpieczne tokeny autentykacji
- **bcryptjs** - Hashowanie haseł
- **cookie-parser** - Middleware do obsługi cookies
- **CORS** - Cross-origin resource sharing

## ✨ Funkcjonalności

- 🔐 **Autentykacja użytkowników** - Rejestracja i logowanie z tokenami JWT
- 💬 **Wiadomości w czasie rzeczywistym** - Natychmiastowe dostarczanie wiadomości przez Socket.IO
- 👥 **Katalog użytkowników** - Przeglądanie wszystkich zarejestrowanych użytkowników
- 📜 **Historia wiadomości** - Wczytywanie i wyświetlanie historii rozmów
- 🎨 **Nowoczesny UI** - Czysty, responsywny interfejs z Tailwind CSS
- 🔒 **Bezpieczeństwo** - Cookies httpOnly, hashowanie haseł, autentykacja JWT
- ⚡ **Szybkość** - Zoptymalizowane dzięki Vite i efektywnemu zarządzaniu stanem

## 📋 Wymagania wstępne

Przed uruchomieniem projektu lokalnie upewnij się, że masz zainstalowane:

- **Docker** i **Docker Compose** - [Pobierz Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Git** - [Pobierz](https://git-scm.com/)

## 🏃 Uruchomienie lokalnie

### Metoda 1: Docker Compose (Zalecana)

Jest to najprostszy sposób uruchomienia całej aplikacji z jedną komendą.

#### 1. Sklonuj repozytorium

```bash
git clone <repository-url>
cd wsei-communicator-devops
```

#### 2. Konfiguracja plików środowiskowych

**Backend:**
```bash
cd wsei-communicator-server
cp .env.example .env
```

Edytuj plik `wsei-communicator-server/.env`:
```env
MONGO_URI=mongodb://mongo:27017/wsei_communicator
PORT=3000
JWT_SECRET=twoj-bardzo-bezpieczny-klucz-tajny-zmien-to
CORS_ORIGIN=http://localhost:5173
```

**Frontend:**
```bash
cd ../wsei-communicator-client
cp .env.example .env
```

Edytuj plik `wsei-communicator-client/.env`:
```env
VITE_API_URL=http://localhost:3000
```

#### 3. Uruchom aplikację

Wróć do głównego katalogu projektu i uruchom Docker Compose:

```bash
cd ..
docker-compose up
```

Przy pierwszym uruchomieniu Docker:
- Pobierze obrazy MongoDB i Node.js
- Zainstaluje wszystkie zależności npm dla backendu i frontendu
- Uruchomi wszystkie serwisy

**Aplikacja będzie dostępna pod adresami:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- MongoDB: `localhost:27017`

## 📁 Monorepo

```
wsei-communicator-devops/
├── wsei-communicator-server/     # Backend Express + Socket.IO
└── wsei-communicator-client/     # Frontend Vue 3
```

## 🔌 Endpointy API

### Autentykacja
- `POST /api/auth/register` - Rejestracja nowego użytkownika
- `POST /api/auth/login` - Logowanie użytkownika

### Użytkownicy
- `GET /api/users` - Pobranie wszystkich zarejestrowanych użytkowników

### Wiadomości
- `GET /api/messages/load?userId={userId}` - Wczytanie historii rozmów
- `POST /api/messages/send` - Wysłanie wiadomości

### Eventy Socket.IO
- **Klient → Serwer**: `message:send` - Wysłanie wiadomości w czasie rzeczywistym
- **Serwer → Klient**: `message:receive` - Otrzymanie wiadomości w czasie rzeczywistym

## 🔧 Zmienne środowiskowe

### Backend (.env)

**Dla Docker Compose:**
```env
MONGO_URI=mongodb://mongo:27017/wsei_communicator
PORT=3000
JWT_SECRET=twoj-tajny-klucz
CORS_ORIGIN=http://localhost:5173
```

**Dla manualnej instalacji:**
```env
MONGO_URI=mongodb://localhost:27017/wsei_communicator
PORT=3000
JWT_SECRET=twoj-tajny-klucz
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 🚢 Deployment

W pełni zintegrowany z GitHub Actions.

## 📝 Licencja

ISC