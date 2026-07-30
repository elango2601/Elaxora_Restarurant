# Premium Table Reservation Module

This is a complete, production-ready table reservation system built with a modern stack.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Shadcn UI, Framer Motion, Zustand
- **Backend:** FastAPI, PostgreSQL, SQLAlchemy
- **Validation:** Zod (Frontend), Pydantic (Backend)

---

## 🚀 Setup Instructions

### 1. Backend Setup

The backend runs on **FastAPI** (Port `8000`). It connects to a local PostgreSQL database named `premium_reservations`.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
*(Note: If you haven't created a requirements.txt, just install the packages as per the previous command).*

**Create Database and Seed Data:**
Ensure PostgreSQL is running locally on port 5432.
```bash
psql -U postgres -c "CREATE DATABASE premium_reservations;"
python3 seed.py
```
*The seed script will automatically create the tables and insert 3 dummy reservations.*

**Run the Backend Server:**
```bash
uvicorn main:app --reload --port 8000
```
API Documentation will be available at: http://localhost:8000/docs

---

### 2. Frontend Setup

The frontend runs on **Next.js** (Port `3000`).

```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:3000.

---

## 🗺️ Project Structure

- **`/`**: The Home Page with the fully animated 9-Step Reservation Wizard.
- **`/admin`**: The Admin Dashboard featuring live metric cards, recent reservations, status controls, and a Recharts analytics chart.
- **`/dashboard/reservations`**: The User Dashboard showing upcoming and past reservations, including dynamically generated QR Codes and the ability to download passes.

## ✨ Features Implemented
- **Glassmorphism Theme**: Fully customized Tailwind theme matching the luxury brand guidelines.
- **Zustand Persistence**: Wizard data is retained in memory.
- **Framer Motion**: Smooth entry and exit transitions for all 9 steps.
- **Zod Validation**: Robust customer information form checking.
- **QR Codes**: Client-side generation of reservation passes on the success page and user dashboard.
- **PostgreSQL Integration**: FastAPI interacts natively with the DB to save, update, and manage table reservations in real-time.
