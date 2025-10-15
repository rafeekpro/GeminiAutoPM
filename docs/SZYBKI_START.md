# GeminiAutoPM - Szybki Start (Quick Start Guide - Polish)

## Przegląd

GeminiAutoPM udostępnia system zarządzania projektami przez narzędzia MCP (Model Context Protocol). Ten przewodnik pokazuje jak używać komend w Gemini CLI.

---

## Krok 1: Inicjalizacja Projektu

**Komenda w Gemini CLI:**
```
Użyj narzędzia pm_init
```

**Co się stanie:**
```
✅ Struktura PM zainicjalizowana pomyślnie

Utworzone katalogi:
  📁 .claude/
  📁 .claude/epics/
  📁 .claude/prds/
  📁 .claude/memory-bank/
```

---

## Krok 2: Stwórz Dokument Wymagań (PRD)

**Komenda w Gemini CLI:**
```
Użyj narzędzia prd_new aby stworzyć nową funkcję:
- Nazwa: user-authentication
- Executive summary: Zaimplementuj bezpieczny system autentykacji użytkowników z tokenami JWT
- Problem: Użytkownicy potrzebują bezpiecznego sposobu na logowanie i utrzymanie sesji
- Kryteria sukcesu: Użytkownicy mogą się rejestrować, logować, wylogowywać i utrzymywać sesję przez 24 godziny
- User stories: Jako użytkownik, chcę stworzyć konto, aby mieć dostęp do spersonalizowanych funkcji
- Kryteria akceptacji: Rejestracja waliduje format email, hasła są hashowane bcrypt, tokeny JWT wygasają po 24h
```

**Rezultat:**
```
✅ PRD utworzony pomyślnie

Feature: user-authentication
Plik: .claude/prds/user-authentication.md
Status: draft
```

---

## Krok 3: Konwertuj PRD na Epic Techniczny

**Komenda w Gemini CLI:**
```
Użyj narzędzia prd_parse aby przekonwertować PRD user-authentication:
- Podejście techniczne: Implementuj autentykację JWT z middleware Express, przechowywanie użytkowników w PostgreSQL, hashowanie haseł bcrypt
- Fazy implementacji: 1) Schema bazy danych i modele 2) Endpoint rejestracji 3) Endpoint logowania 4) JWT middleware 5) Endpoint wylogowania 6) Chronione endpointy
- Zależności: Express, bcrypt, jsonwebtoken, PostgreSQL, Sequelize ORM
```

**Rezultat:**
```
✅ PRD przekonwertowany na Epic pomyślnie

Epic: user-authentication
Plik: .claude/epics/user-authentication/epic.md
Status: open
Progress: 0%
```

---

## Krok 4: Rozbij Epic na Zadania

**Komenda w Gemini CLI:**
```
Użyj narzędzia epic_decompose aby stworzyć zadania dla Epic user-authentication:
- Stwórz 6 zadań dla każdej fazy implementacji
- Dodaj zależności (np. JWT middleware zależy od endpointu rejestracji)
- Oszacuj nakład pracy (small/medium/large)
```

**Format zadań:**
```javascript
[
  {
    name: "Stwórz schemat bazy danych i model User",
    description: "Zaprojektuj schemat PostgreSQL dla tabeli users z email, password_hash, created_at. Stwórz model Sequelize User z walidacją.",
    acceptance_criteria: "Model User waliduje format email, password_hash jest bezpiecznie przechowywany, timestamps są automatyczne",
    estimated_effort: "medium",
    depends_on: []
  },
  {
    name: "Zaimplementuj endpoint rejestracji",
    description: "Stwórz endpoint POST /auth/register który waliduje input, hashuje hasło bcrypt, zapisuje użytkownika w bazie",
    acceptance_criteria: "Endpoint zwraca 201 przy sukcesie, waliduje unikalność email, zwraca token JWT, hashuje hasło bcrypt (10 rund)",
    estimated_effort: "medium",
    depends_on: ["001"]
  }
  // ... więcej zadań
]
```

**Rezultat:**
```
✅ Epic rozbity na 6 zadań pomyślnie

Epic: user-authentication
Utworzone zadania: 6
Pliki: .claude/epics/user-authentication/001.md - 006.md

Podział zadań:
  001 ✓ Stwórz schemat bazy danych [medium] [bez zależności]
  002 ✓ Zaimplementuj endpoint rejestracji [medium] [zależy: 001]
  003 ✓ Zaimplementuj endpoint logowania [medium] [zależy: 001]
  004 ✓ Stwórz JWT middleware [small] [zależy: 002, 003]
  005 ✓ Zaimplementuj endpoint wylogowania [small] [zależy: 004]
  006 ✓ Dodaj autentykację do chronionych endpointów [medium] [zależy: 004]

Następne zadania do wykonania (bez zależności):
  → 001: Stwórz schemat bazy danych i model User
```

---

## Krok 5: Śledź Progress

### Wyświetl Szczegóły Epic

**Komenda:**
```
Użyj narzędzia epic_show dla user-authentication
```

**Rezultat:**
```
📊 Epic: user-authentication

Status: in-progress ⚙️
Progress: 33% (2/6 zadań ukończonych)
Utworzony: 2025-01-15T10:35:00Z
Zaktualizowany: 2025-01-15T14:20:00Z

Zadania:
  ✅ 001: Stwórz schemat bazy danych [ukończone]
  ✅ 002: Zaimplementuj endpoint rejestracji [ukończone]
  ⚙️  003: Zaimplementuj endpoint logowania [w trakcie]
  ⏳ 004: Stwórz JWT middleware [otwarte]
  ⏳ 005: Zaimplementuj endpoint wylogowania [otwarte]
  ⏳ 006: Dodaj autentykację do chronionych endpointów [otwarte]

Następne akcje:
  → Ukończ zadanie 003 (w trakcie)
  → Rozpocznij zadanie 004 po ukończeniu 002 i 003
```

---

### Lista Wszystkich Epics

**Komenda:**
```
Użyj narzędzia epic_list z filtrem: status=in-progress, sortBy=progress
```

**Rezultat:**
```
📋 Przegląd Epics (3 w sumie)

W trakcie (2):
  ⚙️  user-authentication       33% ━━━━━━━━━━━━━━━━━━━━────────────────────────────  [2/6 zadań]
  ⚙️  payment-integration       67% ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  [4/6 zadań]

Otwarte (1):
  ⏳ notification-system        0% ──────────────────────────────────────────────────  [0/5 zadań]

Podsumowanie:
  Wszystkie Epics: 3
  W trakcie: 2 (67%)
  Otwarte: 1 (33%)
  Ogólny progress: 33% (6/17 zadań ukończonych)
```

---

### Szybki Status Check

**Komenda:**
```
Użyj narzędzia epic_status dla user-authentication
```

**Rezultat:**
```
⚡ Szybki Status: user-authentication

Progress: 33% ━━━━━━━━━━━━━━━━━━━━────────────────────────────

Zadania:
  ✅ Ukończone: 2
  ⚙️  W trakcie: 1
  ⏳ Otwarte: 3
  🚫 Zablokowane: 0

Obecnie pracujesz nad:
  ⚙️  003: Zaimplementuj endpoint logowania

Następne zadania do wykonania:
  → 004: Stwórz JWT middleware
     (zablokowane przez: 002 ✅, 003 ⚙️)
     Można rozpocząć po ukończeniu 003

Rekomendacje:
  ✓ Skup się na ukończeniu zadania 003
  ✓ Zadanie 004 zostanie odblokowane po 003
  ✓ 2 kolejne zadania zależą od ukończenia 004
```

---

## Dostępne Narzędzia (Tools)

### Podstawowy Workflow

| Narzędzie | Cel | Kiedy używać |
|-----------|-----|--------------|
| **pm_init** | Inicjalizacja struktury .claude | Pierwszy krok w nowym projekcie |
| **prd_new** | Stwórz Dokument Wymagań Produktu | Definiuj wymagania dla nowej funkcji |
| **prd_parse** | Konwertuj PRD na techniczny Epic | Przetłumacz wymagania biznesowe na techniczne |
| **epic_decompose** | Rozbij Epic na wykonalne zadania | Stwórz szczegółowy plan implementacji |
| **epic_show** | Wyświetl szczegóły Epic z zadaniami | Przejrzyj progress i detale Epic |
| **epic_list** | Lista wszystkich Epics z filtrowaniem | Uzyskaj przegląd projektu |
| **epic_status** | Szybki status z następnymi akcjami | Codzienne standupy, sesje planowania |

---

## Częste Przypadki Użycia

### 1. Daily Standup

**Scenariusz:** Poranny standup, potrzebujesz szybkiego statusu wszystkich aktywnych prac

**Komendy:**
```
1. Użyj narzędzia epic_list z status=in-progress
2. Dla każdego Epic, użyj narzędzia epic_status
3. Przejrzyj następne zadania do wykonania
```

---

### 2. Sprint Planning

**Scenariusz:** Planowanie następnego sprinta, potrzebujesz oszacować Epic i zidentyfikować zadania

**Komendy:**
```
1. Użyj prd_new aby stworzyć PRD dla nowej funkcji
2. Użyj prd_parse aby przekonwertować na Epic
3. Użyj epic_decompose aby rozbić na zadania z oszacowaniami
4. Użyj epic_show aby przejrzeć podział
5. Wybierz zadania do sprinta na podstawie oszacowań i zależności
```

---

### 3. Raport Postępu

**Scenariusz:** Tygodniowy raport postępu dla stakeholderów

**Komendy:**
```
1. Użyj epic_list aby uzyskać przegląd
2. Dla każdego Epic, użyj epic_show z verbose=true
3. Wyciągnij procenty ukończenia i timeline'y
```

---

## Rozwiązywanie Problemów

### Problem: "PM structure not initialized"

**Błąd:**
```
❌ Error: PM structure not initialized
Uruchom pm_init aby stworzyć strukturę katalogów .claude
```

**Rozwiązanie:**
```
Użyj narzędzia pm_init
```

---

### Problem: "PRD not found"

**Błąd:**
```
❌ Error: PRD not found: feature-name
Plik nie istnieje: .claude/prds/feature-name.md
```

**Rozwiązanie:**
```
1. Sprawdź pisownię nazwy PRD
2. Wylistuj istniejące PRD: ls .claude/prds/
3. Stwórz PRD jeśli brakuje: Użyj narzędzia prd_new
```

---

### Problem: "Invalid Epic name format"

**Błąd:**
```
❌ Error: Nieprawidłowy format nazwy Epic
Nazwa Epic musi być lowercase alphanumeric z myślnikami (np. user-authentication)
```

**Rozwiązanie:**
```
Użyj kebab-case naming:
  ✅ user-authentication
  ✅ payment-integration
  ✅ notification-system

  ❌ User Authentication
  ❌ user_authentication
  ❌ UserAuthentication
```

---

## Najlepsze Praktyki

### 1. Zawsze Inicjalizuj Najpierw

Przed rozpoczęciem jakiegokolwiek workflow PM, zainicjalizuj strukturę:
```
Użyj narzędzia pm_init
```

### 2. Zacznij od PRD

Nie pomijaj dokumentacji wymagań:
```
Użyj prd_new → Zdefiniuj jasne wymagania → Użyj prd_parse
```

### 3. Rozbij Epics Wcześnie

Rozłóż Epics na zadania przed rozpoczęciem pracy:
```
Użyj epic_decompose → Przejrzyj z epic_show → Rozpocznij implementację
```

### 4. Śledź Progress Regularnie

Używaj narzędzi statusowych codziennie:
```
Rano: Użyj epic_list (przegląd)
Podczas pracy: Użyj epic_status (następne akcje)
Koniec dnia: Zaktualizuj status zadań w plikach
```

---

## Ściągawka Workflow

```
1. Inicjalizuj:       Użyj pm_init
2. Stwórz PRD:        Użyj prd_new
3. Konwertuj na Epic: Użyj prd_parse
4. Rozbij na zadania: Użyj epic_decompose
5. Śledź progress:    Użyj epic_status
6. Przejrzyj detale:  Użyj epic_show
7. Lista wszystkich:  Użyj epic_list
```

---

## Legenda Emoji Statusów

```
⏳ open          - Zadanie nie rozpoczęte
⚙️  in-progress   - Zadanie obecnie w trakcie
✅ completed     - Zadanie ukończone
🚫 blocked       - Zadanie zablokowane (zależność nie spełniona)
```

---

## Struktura Plików

```
projekt/
├── .claude/
│   ├── epics/
│   │   └── nazwa-epic/
│   │       ├── epic.md        # Specyfikacja Epic
│   │       ├── 001.md         # Zadanie 1
│   │       └── 002.md         # Zadanie 2
│   ├── prds/
│   │   └── nazwa-funkcji.md   # Wymagania Produktu
│   └── memory-bank/
│       └── memory-bank.jsonl  # Ścieżka audytu
```

---

## Dodatkowe Zasoby

- **Status Migracji**: Zobacz `docs/MIGRATION_STATUS.md` dla porównania z ClaudeAutoPM
- **Pełny Przewodnik**: Zobacz `docs/PM_USAGE_GUIDE.md` dla szczegółowej dokumentacji (po angielsku)
- **Standardy Rozwoju**: Zobacz `.claude/DEVELOPMENT-STANDARDS.md` dla standardów kodowania

---

*Ostatnia Aktualizacja: 2025-01-15*
*Wersja: 1.0.0*
*GeminiAutoPM PM MCP Server*
