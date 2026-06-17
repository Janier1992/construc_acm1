-- =============================================================================
-- CONSTRUCTORA ACM 1 S.A.S.
-- Script de Base de Datos Idempotente — Insforge (PostgreSQL)
-- Versión: 1.1.1 | Fecha: Mayo 2025
-- =============================================================================

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla quotes
CREATE TABLE IF NOT EXISTS public.quotes (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT          NOT NULL,
  email       TEXT          NOT NULL,
  phone       TEXT,
  service     TEXT,
  message     TEXT,
  status      TEXT          NOT NULL DEFAULT 'nuevo'
              CHECK (status IN ('nuevo', 'cotizado', 'cerrado', 'rechazado')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 3. Tabla testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT          NOT NULL,
  project     TEXT,
  rating      SMALLINT      NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT          NOT NULL,
  image       TEXT,
  approved    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 4. Tabla generated_quotes
CREATE TABLE IF NOT EXISTS public.generated_quotes (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number    TEXT          NOT NULL UNIQUE,
  issue_date      TEXT          NOT NULL,
  valid_until     TEXT          NOT NULL,
  validity_days   SMALLINT      NOT NULL DEFAULT 30,
  client_name     TEXT          NOT NULL,
  client_email    TEXT          NOT NULL,
  client_phone    TEXT,
  service         TEXT,
  request_date    TEXT,
  items           JSONB         NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(5,2)  NOT NULL DEFAULT 0,
  discount_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  include_iva     BOOLEAN       NOT NULL DEFAULT FALSE,
  iva_amount      NUMERIC(18,2) NOT NULL DEFAULT 0,
  total           NUMERIC(18,2) NOT NULL DEFAULT 0,
  payment_terms   TEXT,
  notes           TEXT,
  lead_id         UUID          REFERENCES public.quotes(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(approved);

-- 6. Función de actualización automática de timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers (con limpieza previa para evitar errores de duplicidad)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_quotes_updated_at') THEN
        DROP TRIGGER trg_quotes_updated_at ON public.quotes;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_testimonials_updated_at') THEN
        DROP TRIGGER trg_testimonials_updated_at ON public.testimonials;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_generated_quotes_updated_at') THEN
        DROP TRIGGER trg_generated_quotes_updated_at ON public.generated_quotes;
    END IF;
END $$;

CREATE TRIGGER trg_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_generated_quotes_updated_at BEFORE UPDATE ON public.generated_quotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Seguridad (RLS)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_quotes ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas antiguas
DO $$
BEGIN
    DROP POLICY IF EXISTS "quotes_insert_publico" ON public.quotes;
    DROP POLICY IF EXISTS "quotes_admin_all" ON public.quotes;
    DROP POLICY IF EXISTS "testimonials_insert_publico" ON public.testimonials;
    DROP POLICY IF EXISTS "testimonials_select_publico" ON public.testimonials;
    DROP POLICY IF EXISTS "testimonials_admin_all" ON public.testimonials;
    DROP POLICY IF EXISTS "gen_quotes_admin_all" ON public.generated_quotes;
END $$;

-- Nuevas políticas
CREATE POLICY "quotes_insert_publico" ON public.quotes FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "quotes_admin_all" ON public.quotes FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN ('constructoraacm1@outlook.com', 'jamosquera0518@gmail.com'));
CREATE POLICY "testimonials_insert_publico" ON public.testimonials FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "testimonials_select_publico" ON public.testimonials FOR SELECT TO anon USING (approved = TRUE);
CREATE POLICY "testimonials_admin_all" ON public.testimonials FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN ('constructoraacm1@outlook.com', 'jamosquera0518@gmail.com'));
CREATE POLICY "gen_quotes_admin_all" ON public.generated_quotes FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN ('constructoraacm1@outlook.com', 'jamosquera0518@gmail.com'));
