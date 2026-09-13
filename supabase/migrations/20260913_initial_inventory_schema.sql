-- ==============================================================================
-- ABC (PVT) LTD - Enterprise Inventory Management & Valuation System
-- PostgreSQL / Supabase Database Schema Migration
-- Migration Name: initial_inventory_schema
-- Created: 2026-09-13
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. MASTER INVENTORY CATALOG (SKUs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_items (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    unit VARCHAR(50) DEFAULT 'Units',
    reorder_level INTEGER DEFAULT 10 CHECK (reorder_level >= 0),
    standard_selling_price NUMERIC(14, 2) DEFAULT 0 CHECK (standard_selling_price >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Index for category search
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);

-- ------------------------------------------------------------------------------
-- 2. PURCHASES & GOODS RECEIVED NOTES (FIFO LOT QUEUE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_batches (
    id VARCHAR(50) PRIMARY KEY,
    invoice_no VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    item_code VARCHAR(50) NOT NULL REFERENCES public.inventory_items(code) ON UPDATE CASCADE,
    supplier VARCHAR(255) NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    unit_value NUMERIC(14, 2) NOT NULL CHECK (unit_value >= 0),
    total_value NUMERIC(16, 2) NOT NULL CHECK (total_value >= 0),
    freight_cost NUMERIC(14, 2) DEFAULT 0 CHECK (freight_cost >= 0),
    customs_duty NUMERIC(14, 2) DEFAULT 0 CHECK (customs_duty >= 0),
    handling_cost NUMERIC(14, 2) DEFAULT 0 CHECK (handling_cost >= 0),
    total_landed_cost NUMERIC(16, 2) NOT NULL CHECK (total_landed_cost >= 0),
    landed_unit_cost NUMERIC(14, 2) NOT NULL CHECK (landed_unit_cost >= 0),
    remaining_qty INTEGER NOT NULL CHECK (remaining_qty >= 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'depleted')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for FIFO resolution: chronological order of active batches per item
CREATE INDEX IF NOT EXISTS idx_purchase_batches_fifo ON public.purchase_batches(item_code, status, date ASC);
CREATE INDEX IF NOT EXISTS idx_purchase_batches_invoice ON public.purchase_batches(invoice_no);

-- ------------------------------------------------------------------------------
-- 3. SALES INVOICES & REVENUE JOURNAL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales_records (
    id VARCHAR(50) PRIMARY KEY,
    invoice_no VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    item_code VARCHAR(50) NOT NULL REFERENCES public.inventory_items(code) ON UPDATE CASCADE,
    customer VARCHAR(255) NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    unit_value NUMERIC(14, 2) NOT NULL CHECK (unit_value >= 0),
    total_value NUMERIC(16, 2) NOT NULL CHECK (total_value >= 0),
    fifo_cogs NUMERIC(16, 2) NOT NULL DEFAULT 0,
    avco_cogs NUMERIC(16, 2) NOT NULL DEFAULT 0,
    gross_profit_fifo NUMERIC(16, 2) NOT NULL DEFAULT 0,
    gross_profit_avco NUMERIC(16, 2) NOT NULL DEFAULT 0,
    margin_percent_fifo NUMERIC(8, 2) NOT NULL DEFAULT 0,
    margin_percent_avco NUMERIC(8, 2) NOT NULL DEFAULT 0,
    consumed_layers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_sales_records_item ON public.sales_records(item_code);
CREATE INDEX IF NOT EXISTS idx_sales_records_date ON public.sales_records(date DESC);

-- ------------------------------------------------------------------------------
-- 4. DAMAGED STOCK & DEFECT QUARANTINE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.damaged_items (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    item_code VARCHAR(50) NOT NULL REFERENCES public.inventory_items(code) ON UPDATE CASCADE,
    qty_damaged INTEGER NOT NULL CHECK (qty_damaged > 0),
    reason VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    batch_ref VARCHAR(50),
    unit_cost_at_damage NUMERIC(14, 2) NOT NULL CHECK (unit_cost_at_damage >= 0),
    salvage_value_recovered NUMERIC(14, 2) DEFAULT 0 CHECK (salvage_value_recovered >= 0),
    net_loss NUMERIC(14, 2) NOT NULL CHECK (net_loss >= 0),
    logged_by VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_damaged_items_item ON public.damaged_items(item_code);

-- ------------------------------------------------------------------------------
-- 5. LANDED COSTING PARAMETERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.landed_costing_params (
    item_code VARCHAR(50) PRIMARY KEY REFERENCES public.inventory_items(code) ON UPDATE CASCADE,
    base_purchase_cost NUMERIC(14, 2) NOT NULL DEFAULT 1000,
    freight_per_unit NUMERIC(14, 2) DEFAULT 50,
    customs_duty_percent NUMERIC(8, 2) DEFAULT 12,
    insurance_and_handling NUMERIC(14, 2) DEFAULT 25,
    target_markup_percent NUMERIC(8, 2) DEFAULT 35,
    actual_selling_price NUMERIC(14, 2) NOT NULL DEFAULT 1500,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 6. SYSTEM CONFIGURATION & AUDIT SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Seed default company profile
INSERT INTO public.system_settings (key, value)
VALUES (
    'company_profile',
    '{"companyName": "ABC (PVT) LTD", "taxId": "VAT-998822110-LK", "currency": "Rs.", "fiscalYear": "2026/2027", "address": "No. 45, Enterprise Tower, Galle Road, Colombo 03, Sri Lanka"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. REAL-TIME INVENTORY VALUATION & POSITION VIEW
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_inventory_summary AS
WITH purchase_rollup AS (
    SELECT 
        item_code,
        COALESCE(SUM(qty), 0) AS total_purchased_qty,
        COALESCE(SUM(total_value), 0) AS total_purchased_value,
        COALESCE(SUM(CASE WHEN status = 'active' THEN remaining_qty * unit_value ELSE 0 END), 0) AS fifo_valuation
    FROM public.purchase_batches
    GROUP BY item_code
),
sales_rollup AS (
    SELECT 
        item_code,
        COALESCE(SUM(qty), 0) AS total_sold_qty,
        COALESCE(SUM(total_value), 0) AS total_revenue
    FROM public.sales_records
    GROUP BY item_code
),
damage_rollup AS (
    SELECT 
        item_code,
        COALESCE(SUM(qty_damaged), 0) AS total_damaged_qty,
        COALESCE(SUM(net_loss), 0) AS total_damaged_loss
    FROM public.damaged_items
    GROUP BY item_code
)
SELECT 
    i.code,
    i.name,
    i.category,
    i.unit,
    i.reorder_level,
    i.standard_selling_price,
    COALESCE(p.total_purchased_qty, 0) AS total_purchased_qty,
    COALESCE(s.total_sold_qty, 0) AS total_sold_qty,
    COALESCE(d.total_damaged_qty, 0) AS damaged_qty,
    GREATEST(0, COALESCE(p.total_purchased_qty, 0) - COALESCE(s.total_sold_qty, 0) - COALESCE(d.total_damaged_qty, 0)) AS available_qty,
    CASE 
        WHEN COALESCE(p.total_purchased_qty, 0) > 0 
        THEN ROUND(p.total_purchased_value / p.total_purchased_qty, 2)
        ELSE 0 
    END AS avco_unit_cost,
    ROUND(
        GREATEST(0, COALESCE(p.total_purchased_qty, 0) - COALESCE(s.total_sold_qty, 0) - COALESCE(d.total_damaged_qty, 0)) * 
        (CASE WHEN COALESCE(p.total_purchased_qty, 0) > 0 THEN p.total_purchased_value / p.total_purchased_qty ELSE 0 END),
        2
    ) AS avco_valuation,
    ROUND(COALESCE(p.fifo_valuation, 0), 2) AS fifo_valuation
FROM public.inventory_items i
LEFT JOIN purchase_rollup p ON i.code = p.item_code
LEFT JOIN sales_rollup s ON i.code = s.item_code
LEFT JOIN damage_rollup d ON i.code = d.item_code;

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damaged_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landed_costing_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for authenticated enterprise users
DO $$
BEGIN
    -- inventory_items
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.inventory_items;
    CREATE POLICY "Allow all for authenticated users" ON public.inventory_items
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- purchase_batches
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.purchase_batches;
    CREATE POLICY "Allow all for authenticated users" ON public.purchase_batches
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- sales_records
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.sales_records;
    CREATE POLICY "Allow all for authenticated users" ON public.sales_records
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- damaged_items
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.damaged_items;
    CREATE POLICY "Allow all for authenticated users" ON public.damaged_items
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- landed_costing_params
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.landed_costing_params;
    CREATE POLICY "Allow all for authenticated users" ON public.landed_costing_params
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- system_settings
    DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.system_settings;
    CREATE POLICY "Allow all for authenticated users" ON public.system_settings
        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;
