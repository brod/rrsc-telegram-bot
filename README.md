# 🏀 Court Availability Telegram Bot

This is a Telegram bot that checks which basketball courts in Round Rock are available between **7:00 PM – 10:00 PM** on weekdays and **7:00 PM – 9:00 PM** on weekends. It pulls live data from the city’s scheduling system and shows which full courts are open for at least 2 hours.

---

## Features

- Type `/check` or just say "court" or "availability" to get results
- Shows courts with at least 2 hours open
- Adds a `*` next to any court with less than 3 hours available
- Shows a button you can tap to "Check Courts" when you send `/start`

---

## Commands

| Command     | What It Does                          |
|-------------|----------------------------------------|
| `/start`    | Sends a welcome message with a button  |
| `/check`    | Checks availability for all courts     |
| `court`, `availability`, `status` | Also trigger a check |

---

## Setup

1. Clone this repo
2. Install dependencies:
   ```bash
   npm install