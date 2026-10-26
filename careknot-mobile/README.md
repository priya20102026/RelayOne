# RelayOne — Mobile (Expo / React Native)

*(Project folder/internal name is still `careknot-mobile` — only the
in-app name and branding changed to RelayOne; see note at the bottom.)*

Caregiver-support app for a family circle — a caregiver, plus the sons and
daughters helping out. Pinned to **Expo SDK 57** to match the current Expo
Go app, so `npm install` + `npm run start` should work cleanly. No AI/LLM
anywhere in the app — every score, quote, and sync below is plain,
explainable logic you can read in the source files.

## Folder guide

```
careknot-mobile/
├── App.tsx                      Root — screens, navigation, all app state
├── src/
│   ├── theme.ts                  Two color palettes: classic (default) + neutral (B&W)
│   ├── ThemeContext.tsx          React context that lets any screen read/switch theme
│   ├── quotes.ts                 Mood-based motivational quote banks (no AI)
│   ├── types.ts                  Shared TypeScript types
│   ├── mockData.ts               Placeholder data — swap for a real backend later
│   ├── loadEngine.ts             Deterministic caregiver-load calculation (no AI)
│   ├── momentScripts.ts          Static "In This Moment" scripts + crisis numbers (no AI)
│   ├── calendarSync.ts           Adds claimed/upcoming appointments to the phone's native calendar (no AI)
│   └── components/
│       ├── MedicalInfoScreen.tsx  Care Hub tab: insurance card, PCP contact, appointment notes, appointment sync
│       ├── Header.tsx             Logo + "viewing as" switcher (caregiver / son / daughter)
│       ├── CareRecipientBar.tsx   Patient info + Check-In / Ask the Circle buttons (Robert only)
│       ├── CheckInModal.tsx       The working "Check-In Today" form
│       ├── NeedHelpModal.tsx      The working "Ask the Circle" form (with optional time window)
│       ├── QuickActionTiles.tsx   Home tiles for In This Moment + Wandering Safety (Robert only)
│       ├── InThisMomentModal.tsx  Situation picker → response script → breathing → crisis resources
│       ├── AfterMomentPrompt.tsx  Optional "How did that moment go?" banner, feeds Wellbeing score
│       ├── WanderingSafetyModal.tsx  Safety card, edit form, generated alert (copy/share/call 911)
│       ├── MotivationalQuote.tsx  Banner shown at the top of Home
│       ├── LoadScoreCard.tsx      Score, gauge, explainable factors
│       ├── WorkloadDistribution.tsx  Family % split + per-member stats
│       ├── TaskBoard.tsx / TaskCard.tsx   Task list, claim / mark done / auto-expiry
│       ├── JournalTimeline.tsx    Care journal composer + entry list
│       ├── GroupChat.tsx          Group chat for the circle
│       ├── CalendarScreen.tsx     Shared calendar (auto-fed by tasks)
│       ├── AddEventModal.tsx      Manually add a calendar event
│       ├── SettingsScreen.tsx     Theme switch + people list (roles, add/remove) + Circle invite code
│       ├── WelcomeScreen.tsx      Front/demo page shown once at launch, before Home
│       └── TabBar.tsx             Bottom nav: Home / Chat / Calendar / Settings
├── package.json / app.json / babel.config.js / tsconfig.json
```

## Run it on your phone

1. Install **Expo Go** on your phone (App Store / Google Play).
2. Unzip this project, open it in VS Code.
3. In the terminal:
   ```bash
   npm install
   npm run start
   ```
   (the script is called `start`, not `dev`)
4. Scan the QR code with your phone's camera (iPhone) or the Expo Go app
   (Android). Phone and computer need to be on the same Wi-Fi.

## What's in this build

- **Welcome / front page.** The app opens on a short demo-friendly pitch
  screen — name, tagline, a quick feature list, and a "Get Started"
  button — before landing on Home. Good for showing judges or family what
  the app is before diving in. It's shown once per launch (`hasEnteredApp`
  in `App.tsx`); there's no persistence across restarts in this build, so
  it reappears each time the app is reopened.
- **People / user management.** Tap your name in the top-right of any
  screen to switch between circle members. Whoever is "viewing" is who
  claims tasks, posts journal entries, and sends chat messages. Each
  person has one color used everywhere they show up — their Workload bar
  segment, their "Claimed by" badge on a task, their dot/left-border on
  Calendar events, and their chat bubbles.
  - **Add a person.** Settings → "People in this circle" → "+ Add a
    person to this circle" — name and role, and they're in, with their
    own freshly-assigned color.
  - **Remove a person.** Each row (except yourself and the primary
    caregiver) gets a "Remove" link, with a confirmation first. Removing
    someone frees up anything they'd claimed — their open tasks go back
    to unassigned and their calendar events lose their assignee — rather
    than leaving things pointed at someone no longer in the circle.
  - You can't remove yourself, the primary caregiver, or the last
    remaining person — Settings enforces that so the circle never ends up
    empty or ownerless.
- **Check-In Today and Ask the Circle are Robert-only.** Only the primary
  caregiver sees those two buttons (and the two tiles below) — switch to
  David or Sarah and that whole bar collapses to just the patient info.
  This is enforced with a plain `isPrimaryCaregiver` check in
  `CareRecipientBar.tsx` and `App.tsx`, nothing fancier.
- **Editable roles.** In Settings → "People in this circle," whoever
  you're currently viewing as gets an "Edit role" link next to their own
  row — each person sets their own role text independently (Robert,
  David, and Sarah don't share one).
- **In This Moment** (Robert-only Home tile). A fast, calm support flow
  for a hard moment with Margaret:
  - Tap one of four situations (repeating questions, asking for someone
    who's passed, agitation, refusing care) → an instant, pre-written
    script shows up, no loading, works offline.
  - "Breathe with me" (shown on the agitation script) runs a simple
    3-cycle breathing animation for the caregiver.
  - "Try another approach" swaps in an alternate script for the same
    situation.
  - "This feels bigger than I can handle" is always reachable without
    scrolling and opens Crisis Resources: 988, the Alzheimer's
    Association Helpline, a 911 disclaimer, and a one-tap call to your
    saved emergency contact.
  - Afterwards, an optional (never forced, always dismissable) "How did
    that moment go?" banner appears next time you're on Home — tapping an
    option nudges the Wellbeing score via `applyMomentOutcome` in
    `loadEngine.ts`. All script content lives in `src/momentScripts.ts`
    as plain static text — no AI, no backend.
- **Wandering Safety Card** (Robert-only Home tile). Everything needed
  during a wandering crisis, ready instantly:
  - Pre-filled card: Margaret's description, likely wander-to places, and
    emergency contacts pulled straight from the Circle members list (plus
    an optional extra non-Circle contact).
  - "Edit" updates any of it ahead of time — not re-entered each crisis.
  - "Generate Alert" assembles a ready-to-send message, with Copy (via
    `expo-clipboard`), Share (native share sheet), and a direct Call 911
    button with a safety disclaimer.
  - Note: actual photo upload isn't wired up in this build — the card
    shows an initial instead of a real photo. Say the word if you want
    that added (it needs `expo-image-picker` plus a permissions prompt).
- **Task Board with auto-expiring done items.**
  - Marking a task **done** immediately crosses it off (strikethrough) —
    see `titleDone` in `TaskCard.tsx`.
  - **24 hours after** a task is marked done, it quietly drops off the
    board on its own — no manual cleanup needed. This is handled in
    `App.tsx`: `handleMarkDone` stamps a `completedAt` timestamp, and a
    filter (re-checked once a minute while the app is open) hides any
    done task older than 24 hours. Nothing is deleted from history by
    design — it just stops showing on the board once its window passes.
- **Shared Calendar.** The "Calendar" tab shows upcoming events grouped by
  day, each tagged with the assigned person's color. Filling in a time
  window ("When") on the "I Need Help" form automatically creates a
  matching calendar event; claiming that task later fills in the
  claimer's name (and color) on the event automatically. You can also add
  a plain event by hand from the Calendar tab.
- **Check-In Today.** Opens a real form — sleep hours, night awakenings,
  stress (1–5), energy (1–5), care hours today. Submitting runs the
  deterministic load-engine math in `loadEngine.ts` and updates the
  score, status, and explainable factors on the Load Score card
  immediately.
- **Ask the Circle** (renamed from "I Need Help"). Posts a real open task
  to the board, with category, duration, urgency, and an optional time
  window.
- **Settings tab.** Contains:
  - **Appearance** — a theme switcher. *Default* (the color theme, what
    the app opens with) or *Black & White* (a neutral grayscale look).
    Switching it re-themes every screen instantly.
  - **People in this circle** — the caregiver, son, and daughter, with
    their role (editable by whoever's currently viewing) and color.
  - **Circle** — invite-code generation, share, regenerate, and join-by-
    code.
- **Motivational quote.** A short line at the top of Home, picked from a
  small built-in list each time the app opens — the pool depends on the
  current load status. Plain rotating text in `src/quotes.ts`, not
  AI-generated.
- **Group chat**, its own tab, for the whole circle.
- **Care Hub tab** (formerly "Medical"). One place for the care contacts and
  details a caregiver needs at an appointment or in an emergency. RelayOne is
  a family-organization and fatigue-tracking tool — it does not provide
  medical advice or act as an official medical record, and the screen says so:
  - **Insurance card** — provider, member name, policy #, group #, and a
    tap-to-call insurance line. Editable from the same screen.
  - **Primary care physician** — name, specialty, tap-to-call phone, and
    office address.
  - **Appointment notes** — a simple running log (date, provider, reason,
    notes) you add to after every appointment — plain local state in
    `mockData.ts`'s `careRecipient.medicalVisits`, no AI summarization.
  - **Upcoming appointments** — pulled from the same shared Calendar, each
    with an "Add to Phone" button.
- **Appointments sync to your phone's real calendar.** Claiming a task
  with a time window (or tapping "Add to Phone" in the Care Hub) calls
  `src/calendarSync.ts`, which asks for calendar permission and adds the
  event straight into the iOS/Android Calendar app via `expo-calendar` —
  on top of, not instead of, RelayOne's own shared Calendar tab. This only
  works in the installed app on a phone, not in a web browser.

## New dependencies: expo-clipboard, expo-calendar

The Wandering Safety Card's "Copy" button needs `expo-clipboard`, and the
appointment-sync feature needs `expo-calendar` — both are already listed in
`package.json`, so a plain `npm install` pulls them in. If you see a
version-mismatch warning for either, run:
```bash
npx expo install expo-clipboard expo-calendar
```
which re-resolves them to the exact versions Expo SDK 57 expects. On first
use, your phone will prompt for calendar permission — allow it so syncing
can work.

## If npm install or npm run start still complains

This exact version set (Expo 57.0.x, React 19.2.3, React Native 0.86.3,
etc.) was confirmed to install successfully. If you still hit an ERESOLVE
error:
```bash
rm -rf node_modules package-lock.json
npm install
```
If that still errors, fall back to:
```bash
npm install --legacy-peer-deps
```
And if Metro crashes with `EMFILE: too many open files`, install Watchman
(one-time fix, only needed on Mac):
```bash
brew install watchman
```

## Where the data comes from right now

Still all local state in `App.tsx` — nothing persists between app
restarts (theme choice included). To make it persistent and multi-device:

1. Add `@react-native-async-storage/async-storage` for the theme choice.
2. Wire `src/mockData.ts`'s exports to a real backend, plus a
   `calendar_events` table (nullable `task_id` so task-linked events stay
   in sync) and a `chat_messages` table.
3. Use realtime subscriptions so claims, chat messages, and calendar
   changes show up live on everyone's phone.
4. Have `handleJoinWithCode` in `App.tsx` actually look up a circle by its
   code and add the current user, instead of the current no-op.

## Intentionally not included

No AI/LLM integration anywhere. The load score, calendar sync, quotes,
task board (including the done-task crossout and 24-hour expiry), group
chat, and journal are all deterministic logic or plain user input.

## Rename note (CareKnot → RelayOne)

The in-app name, Welcome screen, and the icon title shown on your phone's
home screen were all changed to **RelayOne**. The project folder, GitHub
repo, Vercel project, and Expo/EAS project (`slug`/`bundleIdentifier` in
`app.json`) were intentionally left as `careknot` so your existing
deploy links, GitHub repo, and EAS build credentials keep working without
having to redo any of that setup. If you want the folder/repo/slug
renamed too later, that's a separate, bigger step (new EAS project, new
bundle ID) — just ask.

## Optional: Apple Health import (iPhone only)

The Check-In has an "Import last night from Apple Health" button on iOS builds.
It reads sleep (including sleep recorded by an Apple Watch) after the person
allows access, and pre-fills hours slept and wake-ups. Read-only, on-device,
nothing is stored or sent. It uses `@kingstinct/react-native-healthkit`.

- Needs a native build, not Expo Go: `npx expo run:ios --device` (real iPhone
  recommended; the simulator has no watch data). Web and Android keep manual entry.
- Platform files: `src/healthSync.ts` (web/Android, no-op) and
  `src/healthSync.ios.ts` (HealthKit). Keep them separate so the web build
  never bundles the native library.
