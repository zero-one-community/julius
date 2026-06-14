```
       
       ▄▄▄▄▄ ▄▄▄▄▄  ▄▄▄▄▄ ▄▄▄▄▄        ▄▄▄▄▄ ▄▄▄▄▄  ▄▄▄▄▄    ▄▄▄▄▄▄▄  
       █   ░ █   ░  ▓   ▒ █   ░        █   ▒ █   ░  ▓   ▒  ▄▀ ·   · ▀▄
       █   ▓ █   ▓  ▒·  ░ █   ▓        █   ░ █   ▓  ▒·  ░ ▐▌ ·▄▀▀▄·  ░
       ▓· ·▒ ▓· ·▒  ░ ·   ▓· ·▒        ▓· ·  ▓· ·▒  ░ ·   ▒  ·▒  ▓▄▄▄▓
       ▓▄▄▄░ ▓▄▄▄░  ▓▄▄▄░ ▓▄▄▄░        ▓▄▄▄░ ▓▄▄▄░  ▓▄▄▄░ ▐▌▄▄▄▀▄     
       ▒░░░▒ ▒░░░▒  ▒░░░░ ▒░░░▒        ▒░░░░ ▒░░░▒  ▒░░░░  ▀▄▓░▒░▀▄   
▄▄▄▄▄  ░▒▒▒░ ░▒▒▒░  ▒▒▒▒▒ ░▒▒▒░  ▄▄▄▄▄ ░▒▒▒▒ ░▒▒▒░  ▒▒▒▒▒    ▀▄▄░░░▀▄ 
▓░░░▒  ░░░░░ ░░░░░  ▓░░░▒ ░░░░░  ▓░░░▒ ░░░░▒ ░░░░░  ▓░░░▒ ▄▄▄▄▄ ▀▄░ ▐▌
▒   ▒  ▓   ▓ ▓   ▓  ▓   ▒ ▓   ▓  ▒   ▒ ▓   ▒ ▓   ▓  ▓   ▒ ░   █  █   ░
░   ▓▄▄▓   ▓ ▓   ▓▄▄▒   ▓ ▓   ▓▄▄░   ▓ ▓   ▓ ▓   ▓▄▄▒   ▓ ▓   ▀▀▀▀   ▓
▓         ▒   ▒        ▒   ▓         ▓ ▒   ▓  ▒        ▒  ▒          ░


```
# J.U.L.I.U.S v2.2

**Justified Universal Link & Intelligence Utility System**

> A professional web surfing & security research portal built by the **Zero One Community**

---

## 🛡️ Overview

J.U.L.I.U.S is a comprehensive web surfing application designed for security researchers, penetration testers, and ethical hackers. It provides a curated intelligence grid organized across five operational levels — from surface web OSINT to restricted red team infrastructure — with integrated security features, privacy protection, and community collaboration tools.
Not everything is documented but it will be soon 

## Table of Contents
* [Key Features](#Key-Features)
* [🏗️ Architecture](#Architecture)
* [Project Structure](#Project-Structure)
* [Usage & install](#Getting-Started)
* [Release](#Release)
* [Features](#Security-Features)
* [web surfing levels](#Operational-Levels)



### Key Features

- **🔒 IP Detection & VPN Suggestion** — Real-time IP exposure detection with automatic VPN recommendations when your real IP is exposed (doesn't work yet)
- **🛡️ Security Center** — Comprehensive security dashboard with score tracking, blocked resources, tunneling, and privacy settings
- **🛑 Ad & Tracker Blocking** — Integrated domain blocking system for trackers, ads, malware, and phishing
- **🔐 Privacy Controls** — DNS-over-HTTPS, WebRTC blocking, canvas fingerprint protection, referrer stripping, cookie auto-delete, and JavaScript restriction
- **📡 5-Level Resource Explorer** — Curated security resources organized from L1 (Surface) to L5 (Restricted)
- **📋 OPSEC Guides** — Operational security configuration guides for each level
- **🔔 Notification System** — Real-time alerts for security events, updates, and community announcements
- **🔗 Links Manager** — Curated collection of helpful links with search, filter, and star features
- **⎆ Toolkit** — Direct access to verified open-source pentest tools
- **◉ AI Assistants** — AI-powered security research assistants [J.U.L.I.U.S ai]
- **☰ Community** — Zero One community charter and collaboration channels
- **🌐 Web Surf Checker** — URL security analysis with threat detection

---

## Architecture

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM (SQLite) |
| State | Zustand + TanStack Query |
| Icons | Lucide React |
| Animations | Framer Motion + CSS |

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard (all tabs)
│   ├── layout.tsx            # Root layout with dark theme
│   ├── globals.css           # Dark cyberpunk theme + effects
│   └── api/
│       ├── ip/route.ts       # IP detection & VPN suggestion
│       ├── notifications/route.ts  # Notification CRUD
│       ├── links/route.ts    # Links CRUD
│       ├── security/route.ts # Security operations
│       └── surf/route.ts     # URL security checker
├── components/ui/            # shadcn/ui component library
├── data/
│   ├── notifications.json    # Notification seed data
│   └── links.json           # Links seed data
├── lib/
│   ├── db.ts                # Prisma client
│   ├── julius-data.ts       # Static data (levels, tools, AI, etc.)
│   ├── julius-store.ts      # Zustand state management
│   └── utils.ts             # Utility functions
└── prisma/
    └── schema.prisma         # Database schema
```

---

## 🗄️ Database Schema

### Models

- **Notification** — System alerts and updates with priority, type, and category
- **Link** — Curated helpful links with category, level, tags, and star status
- **SecurityLog** — Security event tracking with IP, ISP, risk level, and actions
- **BlockedResource** — Domain blocking with reason, category, and hit counter
- **SurfSession** — Web surfing session tracking with threat detection
- **PrivacySetting** — Key-value privacy configuration storage

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/zero-one-community/julius.git
cd julius

# Install dependencies
bun install

# Set up the database
bun run db:push

# Start the development server
bun run dev
```

The application will be available at `http://localhost:3000`

---

## 📖 Operational Levels

### L1 — Surface Web (🟢)
Publicly indexed resources and tools for open-source intelligence gathering. Safe for general research with no special access requirements.
- Shodan, Censys, HaveIBeenPwned, VirusTotal, DNSDumpster, and more

### L2 — Deep Web (🟠)
Non-indexed resources requiring authentication or special access. Includes vulnerability databases and practice platforms.
- Exploit-DB, MITRE CVE, NVD NIST, HackTheBox, TryHackMe, and more

### L3 — Threat Intel (🟡)
Threat intelligence platforms and IOC sharing communities. Access requires vetting and proper authorization.
- MISP, AlienVault OTX, CrowdSec, TheHive, and more

### L4 — Dark Web (🔴)
Dark web research resources accessed via Tor. For legitimate security research and threat monitoring only.
- Ahmia Search, Tor Project, Hunchly, OnionScan, and more

### L5 — Restricted (🟣)
Offensive security and exploitation resources. Strict authorization and rules of engagement required.
- Metasploit, BloodHound, Sliver, Ligolo-ng, and more

---

## 🔒 Security Features

### IP Detection & VPN Suggestion
- Automatically detects your public IP address
- Performs geolocation lookup (city, country, ISP)
- Determines if you're using VPN/Proxy/Tor
- **Alerts when real IP is exposed** with high-risk warning
- Suggests trusted VPN providers (Mullvad, ProtonVPN)

### Security Score
- Dynamic scoring (0-100) based on your current security posture
- Factors in: privacy settings, blocked resources, active threats, VPN status
- Color-coded status: Critical (red) → Vulnerable (orange) → Moderate (yellow) → Secure (green)

### Blocked Resources
- Add domains to block list with categorization
- Categories: Tracker, Ad, Malware, Phishing, Custom
- Hit counter tracks how often blocked resources are encountered
- One-click unblock capability

### Tunnel Status
- Configurable tunnel type (SOCKS5, HTTP Proxy, SSH Tunnel)
- Enable/disable tunneling with one click
- Connection status monitoring

### Privacy Settings
| Setting | Description |
|---------|-------------|
| DNS-over-HTTPS (DoH) | Encrypts DNS queries to prevent ISP snooping |
| WebRTC Blocking | Prevents IP leaks via WebRTC |
| Canvas Fingerprint Protection | Blocks canvas-based browser fingerprinting |
| Referrer Header Stripping | Removes HTTP referrer headers |
| Cookie Auto-Delete | Automatically clears cookies on session end |
| JavaScript Restriction | Limits JavaScript execution for security |

### URL Security Checker
- Submit URLs for security analysis
- Checks against blocked resources database
- Domain threat heuristics (suspicious TLDs, homograph attacks, typosquatting)
- Returns safety score and recommendations

---

## 🔔 Notification System

Notifications are stored in JSON format and synced with the database. Types include:

| Type | Description |
|------|-------------|
| `info` | General information |
| `security` | Security alerts |
| `warning` | Cautions and advisories |
| `update` | Resource/tool updates |
| `alert` | Critical security alerts |

Priority levels: `low`, `medium`, `high`, `critical`

---

## 🔗 Links Manager

The links manager uses JSON storage for all important and helpful links. Features:

- **Search** — Full-text search across names and descriptions
- **Category Filter** — OSINT, Security, Tools, Privacy, Community, Reference
- **Level Filter** — L1 through L5
- **Star System** — Bookmark your most important links
- **Add Custom Links** — Add your own resources with full metadata

---

## 🧪 Testing & Modularity

The project is fully modularized for community development:

### API Routes
Each API route is independently testable:
- `GET/POST /api/ip` — IP detection
- `GET/POST/PATCH/DELETE /api/notifications` — Notifications CRUD
- `GET/POST/PATCH/DELETE /api/links` — Links CRUD
- `GET/POST /api/security` — Security operations
- `GET/POST /api/surf` — URL security checking

### Data Layer
- Prisma models are independently testable
- JSON seed data files provide consistent test data
- Static data module (`julius-data.ts`) is importable for testing

### State Management
- Zustand store (`julius-store.ts`) is fully typed and testable
- TanStack Query integration for server state

---

## 🤝 Contributing

### Community Guidelines

1. ✅ Authorized security research and penetration testing discussion only
2. ✅ No sharing of copyrighted or pirated materials — zero tolerance policy
3. ✅ Always verify written authorization before testing any target
4. ✅ Responsible disclosure: minimum 90-day vendor notification policy
5. ✅ OPSEC: Never share live target information, credentials, or exploit chains in public channels
6. ✅ Help others learn. Mentor junior researchers. Share knowledge, not attack surfaces.
7. ✅ Violations result in immediate removal from all Zero One channels

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Ensure lint passes (`bun run lint`)
5. Submit a pull request

---
## Release
some updates are on going for Windows/linux/android
only windows/linux/android softwares avaliable due to testing purposes , but more updates will be added 
get your platform software here :
## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## ⚠️ Disclaimer

This portal is for **authorized security professionals** conducting legitimate penetration testing, vulnerability research, and threat intelligence analysis. All tools and resources listed are open-source, publicly available, or commercially provided for legitimate security purposes.

Users are responsible for ensuring they have proper authorization before testing any systems. The Zero One community operates under a strict code of ethics: **research responsibly, disclose ethically.**

---

## 👥 Credits

**Project J.U.L.I.U.S** — Built by the **Zero One Community**

- Original concept: Zero One Security Research
- v2.2 Architecture: Community-driven development
- Contributors: Hunter Zen RU & Zero One Community Members

---

*"In the network of knowledge, security is the protocol."* — Zero One
