# Public Poll 🗳️

A real-time polling application that lets anyone vote on polls without needing to sign up. Built with modern web technologies, Public Poll prioritizes fairness, prevents cheating, and handles millions of votes reliably.

---

## 🎯 What is Public Poll?

Public Poll is a simple, fast polling platform where:
- **Anyone can create a poll** in seconds with registration
- **Anyone can vote** just by clicking a link
- **Results update in real-time** as people vote
- **Results are fair and trustworthy** using anti-cheating measures

Whether you're making a quick decision with friends, running a survey, or gathering public opinion, PublicPoll makes it effortless.

---

## 🛡️ How We Keep Polls Fair (The Anti-Cheating System)

### Layer 1: The "Spam Shield" (60-Second Cooldown)

**What it does:** If you try to vote multiple times in quick succession from the same device/internet connection, the system blocks you for 60 seconds.

**Why it matters:** This stops someone from spamming a poll with hundreds of fake votes in seconds. The system acts so fast that bad actors are caught immediately—before their votes even get close to the database.

---

### Layer 2: The "Fairness Engine" (10 Minutes Vote Lock)

**What it does:** Once you vote on a poll, your internet address gets locked for 10 minutes. Even if you:
- Close your browser
- Clear your cookies
- Try from different browsers
- Restart your computer
- ...you still can't vote again for 10 minutes.

**Why it matters:** This enforces the golden rule: **One person, one vote.** It's impossible to cheat by just clearing your browser history.

**How we do it:** Instead of storing this in a slow database, we use an ultra-fast in-memory system (Redis) that checks this in milliseconds.

---

## ⚡ How We Keep Polls Working (Even When Bad Things Happen)

### 1️⃣ Database Crashes Aren't Catastrophic

**The Problem:** What if the database becomes too slow or crashes?

**Our Solution:** Votes don't go directly to the database. They wait in a fast temporary storage (Redis) and get saved to the database every 10 seconds in bulk. If something goes wrong, we don't lose votes—we just try again.

---

### 2️⃣ Links Never Break (Even After Restarts)

**The Problem:** What if the fast cache (Redis) gets wiped out and we lose all the poll data?

**Our Solution:** If that happens, the system automatically rebuilds the cache from the database the first time someone checks the results. Everything still works perfectly.

---

### 3️⃣ Millions of Votes at Once (No Race Conditions)

**The Problem:** What if 10,000 people vote for the same option at the exact same millisecond?

**Our Solution:** We use special "atomic" operations that guarantee each vote is counted exactly once, with zero double-counting or data corruption, no matter how fast votes come in.

---

### 4️⃣ No "Zombie" Connections Draining Memory

**The Problem:** When people close their browser tabs, the app should clean up after itself.

**Our Solution:** We automatically disconnect unused browser connections so they don't waste server memory.

---

## 🔧 Technical Stack

**Frontend:** React + Redux + Tailwind CSS (modern, responsive UI)  
**Backend:** Node.js + Express (fast API server)  
**Database:** MongoDB (storing polls and results)  
**Real-Time Updates:** Server-Sent Events (SSE) + Redis (instant vote notifications)  
**Speed Cache:** Redis (ultra-fast voting & anti-cheating locks)

---

## 📋 Known Limitations & Future Plans

### Limitation 1: Shared WiFi Networks
**Problem:** People on shared WiFi (universities, offices, airports) share the same internet address. If one person votes, others on that network can't vote for 10 minutes, even if they're different people.

**Future Solution:** Use a "digital fingerprint" (like browser info) combined with IP address to better identify unique users.

---

### Limitation 2: Server Crashes Could Lose Recent Votes
**Problem:** In the extremely rare case of a complete server failure (power outage), the last 10 seconds of votes (stored temporarily) could be lost, though votes that were saved to the database are safe.

**Future Solution:** Enable stronger data durability settings on Redis so even a power outage doesn't lose votes.

---

### Limitation 3: Millions of Live Viewers
**Problem:** Each person watching live results uses a browser connection. Too many simultaneous sse connections can slow things down.

---

### For Users

1. Visit the PublicPoll website
2. Share the link with others
3. Watch votes come in real-time!

---

## 📝 How Voting Works (Technical Overview)

1. **You vote** → Your vote is sent to the server
2. **Spam check** → System checks: "Did you just vote in the last 10 minutes?" If yes, rejected
3. **Fairness check** → System checks: "Has this IP voted on this poll in the last 10 minutes?" If yes, rejected
4. **Vote added** → Your vote is added to temporary queue (Redis)
5. **Soon saved** → Every 10 seconds, all votes are permanently saved to the database
6. **Others see it** → Everyone watching the poll sees your vote appear instantly

---

## 📧 Support

Have questions? Found a bug? Create an issue on GitHub or contact us directly.

---

**Happy polling! 🗳️**
