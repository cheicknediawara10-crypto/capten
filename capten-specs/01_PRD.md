# CAPTEN — Product Requirements Document (PRD)

## 1. Vision & Mission

*   **Mission:** CAPTEN is the foundational infrastructure that structures, finances, and develops sports communities (Run Clubs, Walk Social, Trail, Rando).
*   **Tagline:** "Tu as créé ce crew pour partager une passion. Pas pour jouer les secrétaires."
*   **Target Audience:** Founders and organizers of informal running groups in France.
*   **Core Philosophy:** The member never installs an app. 100% web. Zero friction.

## 2. Personas

### Persona 1: L'Organisateur (Le Capten)
*   **Demographics:** Age 25-40, founded a Run Club via Instagram or WhatsApp.
*   **Scale:** Manages a community of 50 to 500+ members.
*   **Pain Points:** Spends Sunday nights doing administrative tasks (managing WhatsApp polls, updating Excel sheets for attendance, dealing with lack of legal protection).
*   **Goals:** Run a professional club without the administrative burden, ensuring safety and legal compliance while focusing on community building.

### Persona 2: Le Coureur (Le Membre)
*   **Demographics:** Age 20-45, joins Run Clubs for social running and fitness.
*   **Habits:** Primarily uses WhatsApp for communication and Instagram for discovery.
*   **Pain Points:** Dislikes having to re-enter personal information for every new club, lacks a sense of belonging or official status beyond a WhatsApp group chat.
*   **Goals:** Show up effortlessly, run safely, feel recognized, and be part of a structured community.

### Persona 3: Le Commerçant Partenaire (CAPTEN Spot)
*   **Profile:** Local café, bar, or restaurant near popular running routes/meeting spots.
*   **Pain Points:** Wants to capture foot traffic from large groups of runners but lacks a direct channel to connect with them.
*   **Goals:** Attract post-run crowds consistently, build loyalty, and generate revenue through targeted partnerships.

## 3. Product Principles

1.  **Zero Friction for Members:** No app downloads, no traditional passwords, minimal barriers to entry.
2.  **Organizer-First Monetization:** Primarily a B2B SaaS model focused on providing value to the organizers.
3.  **Security & Legal Protection:** Non-negotiable. ICE (In Case of Emergency) information and digital waivers are core to the platform.
4.  **Community Belonging > Individual Performance:** Focus on participation and connection over competitive metrics (speed, distance).
5.  **WhatsApp & Instagram are Allies:** We augment these platforms; we do not try to replace them as the primary communication channels.

## 4. Feature Map (Phase 1 MVP)

### 4.1 Organizer Dashboard
*   **Club Management:** Create and configure the club profile. Set name, logo, description, social media links, and invite co-organizers with role-based access.
*   **Event/Sortie Management:** Create events detailing date, time, precise GPS meeting point, maximum capacity, and rich descriptions. Support for recurring events.
*   **Check-in System:** 
    *   GPS-validated check-in (geofence radius of ~200m from the meeting point).
    *   Fallback QR code alternative for manual verification.
*   **ICE (In Case of Emergency) Cards:** View emergency contacts, blood type, allergies, and medical conditions for all registered members. One-click functionality to call the ICE contact during an event.
*   **Digital Waiver (Décharge):** Legally binding digital signature collected automatically upon first registration. Stored securely and timestamped for liability protection.
*   **Attendance Registry (Registre Horodaté):** Automatic, timestamped log of every check-in per event. Exportable as PDF or CSV for legal and administrative purposes.
*   **CAPTEN Spots:** Register partner establishments. Dashboard to view accumulated cashback (e.g., 10% commission on member consumption) and manage payout requests.
*   **Statistics Dashboard:** Visual overview of total members, active members per month, attendance rates, retention rates (% returning), protection coverage (ICE completion rate), cagnotte (cashback) balance, and events created.
*   **Member Management:** Comprehensive view of all members, their earned badges, attendance history, ICE profile completion status, and waiver signature status.

### 4.2 Member Micro-Page (`/p/[token]`)
*   **Digital Member Card:** Displays member name, "member since" date, total participations, and current status/level.
*   **Upcoming Events:** Personalized list of upcoming registered events with date, time, and club context.
*   **Badge Collection:** Visual display of earned community badges.
*   **ICE Management:** Interface to securely view and edit emergency contact information and medical details.
*   **Waiver Status:** Confirmation of signed waivers.
*   **Access Mechanism:** Accessed exclusively via a unique token link sent via SMS or WhatsApp (Magic Link concept). No login/password required.

### 4.3 Badge System (Phase 1 - Simple)
Badges represent community engagement and milestones. No performance leaderboards.

| Category | Badge Name | Criteria |
| :--- | :--- | :--- |
| **Participation** | 🥉 Premier Run | 1st participation |
| **Participation** | 🔥 Régulier | 10 participations |
| **Participation** | 🏆 Légende | 100 participations |
| **Discovery** | 🌍 Explorer | Participated in 5 different locations |
| **Community** | 🤝 Ambassadeur | Invited 5 new members (via referral link) |
| **Loyalty** | ⭐ Early Member | Joined in the club's first month |

### 4.4 CAPTEN Spots (Ecosystem)
*   Partner establishments register via the organizer's dashboard.
*   A unique QR code placed at the establishment links member consumption to the club's cashback account.
*   10% of consumption is credited to the club's "cagnotte".
*   The dashboard tracks total earned, pending, and paid-out funds.

### 4.5 Landing Page
*   **Hero Section:** Features exactly a 4-line H1 with lines 3-4 highlighted in orange (`#FF5500`).
*   **Problem Cards:** Highlighting the logistic nightmares and legal risks of manual management.
*   **Feature Explanation:** Utilizing a Bento grid layout.
*   **Comparison Table:** CAPTEN vs. manual WhatsApp/Excel management.
*   **FAQ Accordions:** Common questions addressed.
*   **Footer:** Includes a strong Call to Action (CTA) banner.
*   *Note: Already built at `/Users/cd/.gemini/antigravity/scratch/capten/`*

### 4.6 Authentication
*   **Organizer:** Standard Email + Password authentication utilizing Supabase Auth.
*   **Member:** Magic link via phone number (SMS) or WhatsApp deep link. Absolutely no passwords.

## 5. What CAPTEN is NOT (Phase 1)
*   ❌ **No** social feed / timeline
*   ❌ **No** likes / comments
*   ❌ **No** leaderboard / ranking between members
*   ❌ **No** messaging system (WhatsApp handles this)
*   ❌ **No** e-commerce / boutique
*   ❌ **No** Strava-like performance tracking (GPS pace, distance)
*   ❌ **No** native mobile app (React Native/Swift)

## 6. Success Metrics (KPIs)
*   Number of clubs created.
*   Number of events created per club per month.
*   Check-in rate (% of registered members who actually check in).
*   ICE profile completion rate per club.
*   Member retention rate (% returning within 30 days).
*   CAPTEN Spots revenue generated.
*   Badge unlock rate.

## 7. Monetization Model
*   **Phase 1:** Freemium for organizers (free up to X members, paid subscription plans for larger clubs).
*   **Phase 2:** 15% commission on CAPTEN Spots sponsorship deals.
*   **Phase 3:** Full Sponsor Marketplace.

## 8. Pages List (Complete)

| Path | Description | Access Level |
| :--- | :--- | :--- |
| `/` | Landing page (already built) | Public |
| `/login` | Organizer login/signup | Public |
| `/dashboard` | Organizer main hub | Organizer |
| `/dashboard/club` | Club settings | Organizer |
| `/dashboard/events` | Events list | Organizer |
| `/dashboard/events/new` | Create event | Organizer |
| `/dashboard/events/[id]` | Event detail (with live check-ins) | Organizer |
| `/dashboard/members` | Members list | Organizer |
| `/dashboard/members/[id]` | Member detail | Organizer |
| `/dashboard/spots` | CAPTEN Spots management | Organizer |
| `/dashboard/stats` | Statistics | Organizer |
| `/dashboard/settings` | Account settings | Organizer |
| `/join/[club_slug]` | Public club join page (for members) | Public |
| `/event/[event_id]` | Public event page (for members to register & check-in) | Public/Member |
| `/p/[member_token]` | Member micro-page | Member |
| `/checkin/[event_id]` | Check-in page (GPS + QR validation) | Member |
| `/waiver/[club_id]` | Digital waiver signing page | Member |
| `/rgpd` | Privacy policy | Public |
| `/cgu` | Terms of service | Public |
| `/mentions-legales` | Legal mentions | Public |
