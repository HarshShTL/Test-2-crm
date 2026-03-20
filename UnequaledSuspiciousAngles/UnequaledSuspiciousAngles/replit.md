# Timberline Real Estate CRM

A full-stack real estate CRM application for managing contacts, companies, and deals in a real estate investment context.

## Architecture

- **Frontend**: React + TypeScript + Vite, using wouter for routing, TanStack Query for data fetching, Shadcn UI components, and Tailwind CSS for styling.
- **Backend**: Express.js server with in-memory storage (MemStorage) seeded with realistic real estate CRM data.
- **Shared**: TypeScript interfaces for Contact, Company, and Deal entities, plus schema definitions for field types and enumerations.

## Key Features

- **Dashboard**: Summary statistics, pipeline breakdown by stage, recent activity feed, and active deals table
- **Contacts**: Sortable/filterable data table with inline cell editing, list view tabs (All/KH List), column management, CSV export, and pagination. Supports full contact detail view with key information sidebar.
- **Companies**: Company table with contact count indicators, company detail view showing contacts at each company.
- **Deals**: Kanban pipeline board with 7 stages (Overviews, Deal Review, LOI Sent, Sourcing, Closed, On Hold, Pass). Deal cards show amount, location, close date, owner, asset class, and due diligence status. Click to view/edit deal details and move between stages.
- **Settings**: Team members overview, data sources, and permissions display.

## Data Model

- **Contacts**: 24+ fields including name, company, email, phone, lead status, capital type, relationship, investment strategy, and TREP-specific fields
- **Companies**: Name, domain, fund type, typical check size, preferred capital types, industry
- **Deals**: Name, amount, close date, stage, asset class, location, due diligence status, associated contact IDs, attachments

## Color Theme

- Primary: Teal (`173 78% 34%`) — links, active states, primary buttons
- Accent: Orange (`24 95% 53%`) — CTAs (Add contact, Add deal, etc.)
- Background: Light gray-blue (`220 20% 97%`)
- Sidebar: Dark navy (`225 35% 10%`)

## Tech Stack

- React 18, TypeScript, Vite
- Express.js, in-memory storage
- TanStack Query v5 for data fetching
- Shadcn UI + Radix UI primitives
- Tailwind CSS + tailwindcss-animate
- wouter for routing
- lucide-react for icons
- react-hook-form + zod for forms

## API Routes

- `GET/POST /api/contacts` — list all / create contact
- `GET/PATCH /api/contacts/:id` — get/update contact
- `GET /api/companies` — list all companies
- `GET /api/companies/:id` — get company
- `GET/POST /api/deals` — list all / create deal
- `GET/PATCH /api/deals/:id` — get/update deal
