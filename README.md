# TrustAI – Financial Bodyguard

## Team Name
MindSpark
##  Problem Statement
Rebuilding trust and engagement in digitl fianance.
## Objective
The main objective of this project is to design an AI-based intelligent system that can:
Detect potential digital threats in real-time
Analyze messages, links, or inputs for risk level
Provide instant alerts to users
Improve overall digital safety and awareness

## Gap Analysis (Current vs Proposed Solution)
Current System:
Manual verification or user awareness required
No real-time detection of threats
Low accuracy in identifying scams
Limited or no automated alert system
Proposed System:
AI-powered real-time threat detection
Instant risk analysis and alerts
Higher accuracy using intelligent processing
Automated user protection support

🏗️ System Architecture / Workflow
User Input → Data Collection → AI Processing Engine → Threat Analysis Module → Risk Evaluation → Alert System → User Notification

## technology stack details
  🎨 Frontend
Technology	Purpose
React 18	Core UI library — builds all pages and components
Vite	Lightning-fast dev server and bundler
TypeScript	Type safety across the entire codebase
Tailwind CSS	Utility-first styling with the custom dark theme
shadcn/ui + Radix UI	Accessible UI primitives (dialogs, dropdowns, toasts, etc.)
Framer Motion	Smooth animations (cards fading in, alert popups, transitions)
React Router	Client-side navigation between Dashboard, SMS Scanner, Call Shield, etc.
Recharts	Bar + area charts on the Dashboard (weekly threats, trust trend)
Lucide React	Icon set (Shield, Phone, MessageSquare, etc.)
date-fns	Human-readable timestamps ("5 minutes ago")
TanStack Query	Data fetching/caching layer
⚙️ Backend
Technology	Purpose
Lovable Cloud (powered by Supabase)	Full backend-as-a-service — no separate Node/Express server needed
Supabase Edge Functions (Deno)	Serverless functions: analyze-message (AI scam scan) and chat (AI assistant streaming)
Supabase Auth	Email + password login/signup, session management
Row Level Security (RLS)	Each user can only see/edit their own scan history
🗄️ Database
Technology	Purpose
PostgreSQL (via Lovable Cloud)	Persistent storage
scan_history table	Stores every scan: type, content, risk_score, risk_level, threats[], blocked, user_id, created_at — used by the History page

## future scope
Mobile application version
Improved AI accuracy using large datasets
Integration with messaging apps and browsers
Multi-language support
Real-time API-based threat detection system

## limitations
Requires stable internet connection
Accuracy depends on dataset and model training
Some features may still be under development
##live demo
   (https://trustai-financial-bodyguard.netlify.app/)
