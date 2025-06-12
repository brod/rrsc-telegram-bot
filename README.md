# 🏀 Round Rock Sports Center Court Checker Bot

Welcome to the **Round Rock Sports Center Court Checker Bot** — your go-to Telegram assistant to check evening full-court basketball availability at RRSC.

This bot helps you plan ahead and avoid crowds by showing which courts are open from **7:00 PM to 10:00 PM** (or 9:00 PM on weekends).

---

## 🔗 Telegram Bot Link

👉 [@RRSCCourtCheckerBot](https://t.me/RRSCCourtCheckerBot)

---

## 💬 How to Use

Just open the bot in Telegram and type any of the following:

### ✅ Check Availability:
- `/check` – Shows availability for default days (**Mon, Tue, Wed**)
- `/all` – Shows **all days** of the week (Mon–Sun)
- `/mon`, `/tue`, `/wed`, `/thu`, `/fri`, `/sat`, `/sun` – Check that specific weekday
- `/june`, `/july`, ..., `/december` – Check that month's court availability (e.g. `/june` shows June dates only)

Or click the **"Check Courts"** button after starting with `/start`.

---

## 📝 Legend

- `Court 1, 2, 3...` – Available for **at least 3 hours**
- `Court 1*` – Available for **2 to 3 hours** only  
- `*` = Indicates shorter time block but still available

---

## 🔄 Update Frequency

This bot checks about 4 months ahead from today’s date and refreshes data each time you send a command.

---

## 🛠️ Self-Hosting & Dev Info

If you're a developer and want to host or modify the bot:

- Requires Node.js v18+
- Uses:
  - Telegram Bot API via `node-telegram-bot-api`
  - Axios + Day.js for date logic
  - Render.com or similar for always-on hosting
- Optional: add a health ping (`/healthz`) using `cron-job.org` to keep it awake

---

Made with ❤️ by Rucky.
