# TripGuard AI

> **"Your Journey. Our Intelligence."**  
> *Intelligent Multi-Agent Travel Planning and Autonomous Partial Replanning System*

---

## 🌟 Overview

**TripGuard AI** is a production-grade full-stack web application designed to solve the real-world friction of modern travel. Traditional travel platforms provide static itineraries that break the moment unexpected disruptions occur. TripGuard AI pairs a **central Supervisor Agent** with **six specialized AI subagents** that continuously monitor travel conditions and autonomously adapt your journey without regenerating unaffected plans.

### Core Disruptions Handled
- 🌧️ **Heavy Rainfall & Adverse Weather**: Live telemetry via Open-Meteo API triggers indoor substitutions and timing recalibrations.
- 🚌 **Transport Delays & Corridor Closures**: Live routing intelligence via OSRM recalculates transit duration and shifts downstream schedules.
- 🏛️ **Tourist Attraction Closures**: Proximity search isolates nearby alternatives matching the traveler's exact interest profile.
- 💰 **Budget Reductions**: Deterministic financial auditor swaps high-cost tickets for free self-guided heritage trails while preserving key landmarks.

---

## 🧠 Multi-Agent Architecture

```
User Trip Request / What-If Trigger
              │
              ▼
   ┌──────────────────────┐
   │   Supervisor Agent   │ ◄── Orchestrates pipeline & enforces loop limits
   └──────────┬───────────┘
              │
    ┌─────────┴─────────────────────────────────────────┐
    │                     │                             │
    ▼                     ▼                             ▼
┌──────────────┐   ┌──────────────┐            ┌────────────────┐
│Travel Planner│   │Weather Agent │            │Transport Agent │
│  (Agent 1)   │   │(Agent 2/Meteo)│           │ (Agent 3/OSRM) │
└───────┬──────┘   └──────┬───────┘            └────────┬───────┘
        │                 │                             │
        └─────────────────┼─────────────────────────────┘
                          │
                          ▼
                 ┌────────────────┐
                 │  Budget Agent  │ ◄── Deterministic arithmetic (No hallucinations)
                 │   (Agent 4)    │
                 └────────┬───────┘
                          │
                          ▼
            ┌───────────────────────────┐
            │Disruption Detection Agent │ ◄── Isolates affected activity IDs
            │         (Agent 5)         │
            └─────────────┬─────────────┘
                          │
                          ▼
            ┌───────────────────────────┐
            │Autonomous Replanning Agent│ ◄── Preserves unaffected slots, modifies target
            │         (Agent 6)         │
            └─────────────┬─────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │  Validation Engine   │ ◄── Enforces 10 domain rules
               └──────────┬───────────┘
                          │
                          ▼
            ┌───────────────────────────┐
            │ Traveler Approval & vNext │ ◄── Versioned immutability (v1, v2, v3...)
            └───────────────────────────┘
```

---

## 🚀 Key Features

1. **Autonomous Partial Replanning (The Core Engine)**:
   - When disruptions occur, TripGuard AI **never overwrites** your existing plans or re-creates the entire trip.
   - Preserves all unaffected activities in their original time slots.
   - Assigns stable state badges: `PRESERVED`, `MODIFIED`, `ADDED`, `REMOVED`.
   - Explains the exact reason for every substitution and displays cost variances.
   - Requires traveler approval before committing to the immutable version history.

2. **Interactive What-If Disruption Simulator**:
   - Built directly into the dashboard for users and judges to test real-world scenarios:
     - **Scenario 1: Heavy Rainfall** (Select day, select outdoor venue, simulate 45mm downpour).
     - **Scenario 2: Transport Disruption** (Simulate NH highway blockage or train cancellation).
     - **Scenario 3: Budget Reduction** (Cut trip funds; AI reallocates and finds free alternatives).
     - **Scenario 4: Attraction Closure** (Close a landmark; AI substitutes with nearest cultural spot).

3. **Deterministic Financial Budget Tracker**:
   - Zero hallucinated arithmetic. All budget calculations use strict deterministic backend logic.
   - Interactive **Recharts** donut breakdowns and comparison bar charts (Estimated vs Actual).
   - Receipt logger allowing travelers to add, edit, and delete real receipts.

4. **Live Geolocation & Weather Integration**:
   - **Open-Meteo API**: High-resolution daily forecasts, precipitation sums, and automated outdoor risk evaluation.
   - **OSRM (Open Source Routing Machine)**: Real road routing, driving distances, and travel durations.
   - **Leaflet & OpenStreetMap**: Interactive visual map rendering markers and route polylines.

5. **Verifiable Agent Activity Console**:
   - Live status cards for all 6 agents + Supervisor + Validation Engine (`Idle`, `Running`, `Completed`, `Failed`).
   - Chronological audit log with expandable JSON payloads.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Leaflet, React Router v6.
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS), Supabase Auth, Supabase Edge Functions.
- **AI Intelligence**: Google Gemini API (`gemini-1.5-flash`), Structured JSON output, multi-agent coordination.
- **External Feeds**: Open-Meteo Weather API, OSRM Routing Machine, OpenStreetMap.

---

## 📦 Database Schema (9 Tables with RLS)

Located in `supabase/migrations/20261030_initial_schema.sql`:
1. `profiles`: Traveler identities & metadata.
2. `trips`: Destination, dates, budget in INR, travel preferences, and current lifecycle status.
3. `itineraries`: Versioned records (`v1`, `v2`, ...) holding structured day-by-day JSON.
4. `expenses`: Deterministic receipts categorized into Transport, Lodging, Food, Activities, and Misc.
5. `disruptions`: Structured disruption records with severity and affected activity IDs.
6. `agent_logs`: Full observability and execution trace for the Supervisor and subagents.
7. `approvals`: Traveler approval records for proposed itinerary revisions.
8. `replanning_sessions`: State machine tracking proposed modifications, diffs, and validation outcomes.
9. `monitoring_logs`: Telemetry logs from Open-Meteo and transit feeds.

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### 3. Demo Mode vs. Live Supabase Mode
- **Out of the box**: TripGuard AI operates in **Clearly Labelled Demo Mode**, pre-seeded with sample trips (Jaipur Royal Heritage Tour), interactive What-If simulations, verified Leaflet routing, and Open-Meteo weather.
- **Live Supabase Mode**: Go to **Settings** (`/settings`), enter your Supabase Project URL and Anon Key, and paste your Gemini API key to run live cloud operations!
