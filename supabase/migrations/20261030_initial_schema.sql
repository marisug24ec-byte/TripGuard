-- TripGuard AI: PostgreSQL Database Schema with Row Level Security (RLS)
-- Autonomous Multi-Agent Travel Planning & Replanning System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================================
-- 2. TRIPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    travellers INTEGER NOT NULL CHECK (travellers > 0),
    budget NUMERIC(12, 2) NOT NULL CHECK (budget > 0),
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'disrupted', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_dates CHECK (return_date >= departure_date)
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips"
    ON public.trips FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
    ON public.trips FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
    ON public.trips FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
    ON public.trips FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 3. ITINERARIES TABLE (Versioned)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    itinerary_data JSONB NOT NULL,
    total_estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    validation_status TEXT NOT NULL DEFAULT 'valid' CHECK (validation_status IN ('valid', 'pending', 'invalid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_trip_version UNIQUE (trip_id, version)
);

CREATE INDEX IF NOT EXISTS idx_itineraries_trip_id ON public.itineraries(trip_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_version ON public.itineraries(trip_id, version DESC);

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view itineraries for their trips"
    ON public.itineraries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = itineraries.trip_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert itineraries for their trips"
    ON public.itineraries FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = itineraries.trip_id
            AND trips.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 4. EXPENSES TABLE (Deterministic Budget Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'activities', 'miscellaneous')),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage expenses for their trips"
    ON public.expenses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = expenses.trip_id
            AND trips.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 5. DISRUPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.disruptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    disruption_type TEXT NOT NULL CHECK (disruption_type IN ('weather', 'transport', 'closure', 'budget', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
    description TEXT NOT NULL,
    affected_activity TEXT,
    source TEXT NOT NULL,
    is_simulated BOOLEAN NOT NULL DEFAULT false,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_disruptions_trip_id ON public.disruptions(trip_id);

ALTER TABLE public.disruptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view disruptions for their trips"
    ON public.disruptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = disruptions.trip_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert disruptions for their trips"
    ON public.disruptions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = disruptions.trip_id
            AND trips.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 6. AGENT_LOGS TABLE (Multi-Agent Traceability)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    task TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Idle', 'Pending', 'Running', 'Completed', 'Failed')),
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_trip_id ON public.agent_logs(trip_id);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent logs for their trips"
    ON public.agent_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = agent_logs.trip_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert agent logs"
    ON public.agent_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- 7. APPROVALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    approval_status TEXT NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_approvals_trip_id ON public.approvals(trip_id);

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage approvals for their trips"
    ON public.approvals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = approvals.trip_id
            AND trips.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 8. REPLANNING_SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.replanning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    original_itinerary_id UUID REFERENCES public.itineraries(id),
    proposed_itinerary_id UUID REFERENCES public.itineraries(id),
    trigger_disruption_id UUID REFERENCES public.disruptions(id),
    status TEXT NOT NULL CHECK (status IN ('analyzing', 'replanning', 'validated', 'approved', 'rejected')),
    validation_result JSONB,
    outcome JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_replanning_trip_id ON public.replanning_sessions(trip_id);

ALTER TABLE public.replanning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view replanning sessions for their trips"
    ON public.replanning_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = replanning_sessions.trip_id
            AND trips.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 9. MONITORING_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monitoring_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    monitoring_type TEXT NOT NULL CHECK (monitoring_type IN ('weather', 'transport', 'closure', 'system')),
    source TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'alert', 'error')),
    result JSONB,
    error_message TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_monitoring_logs_trip_id ON public.monitoring_logs(trip_id);

ALTER TABLE public.monitoring_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view monitoring logs for their trips"
    ON public.monitoring_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = monitoring_logs.trip_id
            AND trips.user_id = auth.uid()
        )
    );
