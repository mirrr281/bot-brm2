# Bot BRM2

Discord bot for KOPASSUS BRM5 community — patrol reporting, rank promotion, hall of honor, and achievement center.

## Features

### 🚓 Patroli
- Submit patrol reports with time, location, notes, and photo evidence
- Dual-channel system: admin channel (with Approve/Reject buttons) and member channel (status-only)
- Auto STATUS tracking: ⏳ MENUNGGU → ✅ DISETUJUI / ❌ DITOLAK
- Automatic +5 point reward on approval via UnbelievaBoat economy
- Daily patrol limit (once per day per user)
- DM notification on approval/rejection with reason

### 🎖 Hall of Honor
- Browseable achievement catalog (LIMITED, BUNKER, COMPOUNDS categories)
- Submit Brevet / Sertifikat / Achievement requests via modal form
- Admin approval workflow with STATUS tracking (same dual-channel system as patroli)
- Banner image support for the Hall of Honor panel

### 🏅 Achievement Center
- Interactive catalog of 26 operator achievements with pagination
- Category browsing and detailed achievement view
- Ephemeral session (private browsing)

### 📈 Promotion System
- Submit rank-up requests with role management
- Auto point deduction from UnbelievaBoat balance
- Automatic role assignment and nickname update with rank logo

### 👮 Check Points
- View user balance from UnbelievaBoat economy

## Setup

### Prerequisites
- Node.js 18+
- Discord Bot Token with `applications.commands` scope
- UnbelievaBoat bot (for economy features)

### Installation
```bash
npm install
```

### Configuration
1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
2. Fill in all values in `.env`:
   - `DISCORD_TOKEN` — your bot token
   - `CLIENT_ID` — bot application ID
   - `GUILD_ID` — your server ID
   - `CHANNEL_ID` — default channel for general use
   - `STAFFSUS_ID` — role ID allowed to approve/reject
   - `LOG_PATROLI_CHANNEL_ID` — member-facing patrol report channel
   - `LOG_PATROLI_ADMIN_CHANNEL_ID` — admin patrol report channel (with buttons)
   - `LOG_PROMOTION_CHANNEL_ID` — promotion log channel
   - `LOG_BOT_CHANNEL_ID` — error/bot log channel
   - `ACHIEVEMENT_CENTER_CHANNEL_ID` — channel for achievement center hub
   - `HALL_OF_HONOR_CHANNEL_ID` — channel for hall of honor hub
   - `HALL_OF_HONOR_LOG_CHANNEL_ID` — admin hall of honor log channel (with buttons)
   - `HALL_OF_HONOR_BOARD_CHANNEL_ID` — hall of honor board/notification channel
   - `HALL_OF_HONOR_MEMBER_CHANNEL_ID` — member-facing hall of honor report channel
   - `UNBELIEVABOAT_TOKEN` — UnbelievaBoat API token
   - `UNBELIEVABOAT_URL` — UnbelievaBoat API URL

### Optional
Place `hall-of-honor-banner.png` in the `assets/` folder to show a banner image on the Hall of Honor panel.

## Running

Register slash commands and start the bot:
```bash
npm run dev
```

This runs `deployment-commands.ts` (registers commands) then starts the bot with file watching.

## Commands

All commands require Administrator permission unless noted:

| Command | Description |
|---|---|
| `/patroli` | Opens patrol form |
| `/reset-patroli <user>` | Reset patrol cooldown for a user |
| `/promotion` | View rank hierarchy and submit promotion |
| `/check-point [user]` | Check UnbelievaBoat balance |
| `/ping` | Test command |
| `/hall-of-honor-post` | Post/update Hall of Honor panel |
| `/achievement-center-post` | Post/update Achievement Center hub |
| `/patroli` (button) | Open form → submit → admin approves/rejects |

## Architecture

```
index.ts              → Client setup + login
loader.ts             → Dynamic command/component/event loading
deployment-commands.ts → Slash command registration
events/               → Client event handlers
commands/utility/     → Slash command implementations
components/buttons/   → Button interaction handlers
components/modals/    → Modal submission handlers
components/selects/   → Select menu handlers
utils/                → Shared utilities and data stores
```

Component interactions use customId prefix matching (e.g., `patroli:approve`, `ach_`, `hall_`). See `events/interactionCreate.ts` for routing logic.

## Data Files

The bot creates these JSON files at runtime:
- `patroli-reports.json` — links patrol reports to member channel messages
- `hall-of-honor-reports.json` — links hall of honor reports to member channel messages
- `patroli.json` — last patrol date per user
- `patroli-reports.json` / `hall-of-honor-reports.json` — member message ID mappings for STATUS updates
- `achievement-center-message.json` — hub message ID (via `ACHIEVEMENT_CENTER_MESSAGE_ID` env var)
