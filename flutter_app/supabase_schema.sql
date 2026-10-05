-- ====================================================================
-- GONDAR CITY TRAFFIC POLICE - SUPABASE POSTGRESQL SCHEMA & SEED
-- Paste this script directly into Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. Create bajaj_vehicles table
CREATE TABLE IF NOT EXISTS public.bajaj_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    digital_id TEXT NOT NULL UNIQUE,
    plate_number TEXT NOT NULL UNIQUE,
    vin_chassis TEXT NOT NULL UNIQUE,
    vehicle_type TEXT NOT NULL DEFAULT 'Bajaj (ባጃጅ)',
    bajaj_model TEXT NOT NULL,
    bajaj_association TEXT NOT NULL,
    color TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_phone TEXT,
    driver_name TEXT NOT NULL,
    driver_phone TEXT,
    driver_photo TEXT,
    kebele TEXT DEFAULT 'ቀበሌ 03 (Kebele 03)',
    address TEXT DEFAULT 'አራዳ መንገድ፣ ጎንደር',
    permit_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    authorized_area TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'ILLEGAL', 'MISMATCH')),
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    notes TEXT,
    qr_code_value TEXT,
    registered_city TEXT DEFAULT 'Gondar / ጎንደር',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create officers table
CREATE TABLE IF NOT EXISTS public.officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    badge_number TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Field Traffic Inspector',
    phone_number TEXT,
    assigned_zone TEXT DEFAULT 'Gondar City',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create violation_reports table
CREATE TABLE IF NOT EXISTS public.violation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number TEXT NOT NULL UNIQUE,
    digital_id TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL,
    registered_plate TEXT,
    reason TEXT NOT NULL,
    reason_am TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    fine_amount NUMERIC DEFAULT 0,
    checked_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    checked_by TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'PAID', 'IMPOUNDED', 'RESOLVED')),
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.bajaj_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_reports ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow public read access to vehicles" 
ON public.bajaj_vehicles FOR SELECT USING (true);

CREATE POLICY "Allow public read access to officers" 
ON public.officers FOR SELECT USING (true);

CREATE POLICY "Allow public read access to violation reports" 
ON public.violation_reports FOR SELECT USING (true);

-- Allow inserting violation reports
CREATE POLICY "Allow public insert to violation reports" 
ON public.violation_reports FOR INSERT WITH CHECK (true);

-- Allow updating vehicle status
CREATE POLICY "Allow public update to vehicles" 
ON public.bajaj_vehicles FOR UPDATE USING (true);

-- 5. Seed Officers
INSERT INTO public.officers (username, password_hash, full_name, badge_number, role, phone_number, assigned_zone) VALUES
('inspector_abebe', 'gondar2025', 'ኢንስፔክተር አበበ ተሰማ', 'GD-TRF-042', 'Field Traffic Inspector', '+251 91 812 3456', 'ዞን 1: አራዳ - ፒያሳ - ፋሲል'),
('inspector_selemon', 'gondar2025', 'ረዳት ኢንስፔክተር ሰለሞን አለሙ', 'GD-TRF-019', 'Checkpoint Lead', '+251 92 114 9988', 'ዞን 2: ፒያሳ - አዘዞ - ኤርፖርት')
ON CONFLICT (username) DO NOTHING;

-- 6. Seed Registered Bajaj Vehicles (Identical to Website)
INSERT INTO public.bajaj_vehicles (
    digital_id, plate_number, vin_chassis, vehicle_type, bajaj_model, bajaj_association, color, 
    owner_name, owner_phone, driver_name, driver_phone, driver_photo, kebele, address, 
    permit_number, issue_date, expiry_date, authorized_area, status, is_blacklisted, notes, qr_code_value, registered_city
) VALUES
(
    'DID-25-000784521', 
    'AA-12345', 
    'MBN12345678912345', 
    'Bajaj (ባጃጅ)', 
    'TVS King', 
    'Addis Bajaj Share Company', 
    'Red (ቀይ)', 
    'አቶ ታምራት አለማየሁ', 
    '+251 91 876 5432', 
    'ዮሐንስ ጌታቸው', 
    '+251 91 432 1098', 
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80', 
    'ቀበሌ 03 (Kebele 03)', 
    'አራዳ መንገድ፣ ቀበሌ 03፣ ጎንደር', 
    'PRM-25-5566', 
    '2025-01-10', 
    '2026-01-09', 
    'ሰበሰተፖል (Sebastopol)', 
    'ACTIVE', 
    FALSE, 
    'መደበኛ ፈቃድ', 
    'DID-25-000784521|AA-12345|PRM-25-5566', 
    'Gondar / ጎንደር'
),
(
    'DID-GD-0489120', 
    '3-AM-04891', 
    'TVS98234109482103', 
    'Bajaj (ባጃጅ)', 
    'TVS King Deluxe', 
    'ፋሲል የባጃጅ ማህበር (Fasil Bajaj Association)', 
    'Blue (ሰማያዊ)', 
    'ወ/ሮ ሰላማዊት አሰፋ', 
    '+251 92 345 6789', 
    'ዳንኤል ብርሃኑ', 
    '+251 92 888 1234', 
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', 
    'ቀበሌ 01 (Kebele 01)', 
    'ፒያሳ - ፋሲል ግቢ ፊት ለፊት፣ ቀበሌ 01', 
    'PRM-GD-2025-102', 
    '2025-02-15', 
    '2026-02-14', 
    'ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ', 
    'ACTIVE', 
    FALSE, 
    'በዞን 1 የተመደበ', 
    'DID-GD-0489120|3-AM-04891|PRM-GD-2025-102', 
    'Gondar / ጎንደር'
),
(
    'DID-GD-0899211', 
    '3-AM-99999', 
    'BAJ77341209845112', 
    'Bajaj (ባጃጅ)', 
    'Bajaj RE 4S', 
    'አዘዞ ማህበር (Azezo Bajaj Association)', 
    'Green (አረንጓዴ)', 
    'አቶ ሙሉጌታ ካሳ', 
    '+251 91 112 3344', 
    'አበበ ተፈሪ', 
    '+251 91 555 7788', 
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', 
    'ቀበሌ 16 (Kebele 16)', 
    'አዘዞ ማዞሪያ፣ ቀበሌ 16፣ ጎንደር', 
    'PRM-GD-2024-889', 
    '2024-03-01', 
    '2025-02-28', 
    'ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት', 
    'EXPIRED', 
    FALSE, 
    'የመንገድ ፈቃድ ጊዜው አልፏል (Permit Expired)', 
    'DID-GD-0899211|3-AM-99999|PRM-GD-2024-889', 
    'Gondar / ጎንደር'
),
(
    'DID-GD-0033221', 
    '3-AM-77214', 
    'CHAS9921045812033', 
    'Bajaj (ባጃጅ)', 
    'Piaggio Ape City', 
    'ማራኪ ዩኒቨርሲቲ ማህበር (Maraki Campus Association)', 
    'White (ነጭ)', 
    'አቶ ተስፋሁን ያሬድ', 
    '+251 93 456 7890', 
    'ካሳሁን ወርቁ', 
    '+251 93 777 9900', 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', 
    'ቀበሌ 18 (Kebele 18)', 
    'ማራኪ ዩኒቨርሲቲ በር፣ ቀበሌ 18፣ ጎንደር', 
    'PRM-GD-2025-331', 
    '2025-01-20', 
    '2026-01-19', 
    'ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18', 
    'ACTIVE', 
    FALSE, 
    'መደበኛ ፈቃድ', 
    'DID-GD-0033221|3-AM-77214|PRM-GD-2025-331', 
    'Gondar / ጎንደር'
),
(
    'DID-GD-0078900', 
    '3-AM-11002', 
    'VIN-STOLEN-998811', 
    'Bajaj (ባጃጅ)', 
    'Bajaj Maxima Z', 
    'አንገረብ ማህበር (Angereb Association)', 
    'Yellow (ቢጫ)', 
    'ያልታወቀ (Unknown)', 
    '-', 
    'ያልተመዘገበ', 
    '-', 
    '', 
    'ያልታወቀ (Unknown)', 
    'አንገረብ ወንዝ ዳርቻ', 
    'PRM-SUSP-001', 
    '2023-11-10', 
    '2024-11-09', 
    'ያልተፈቀደ (Unauthorized)', 
    'SUSPENDED', 
    TRUE, 
    'በጎንደር ፖሊስ መምሪያ የተፈለገ ተሽከርካሪ (Stolen / Blacklisted by Gondar Police)', 
    'DID-GD-0078900|3-AM-11002|PRM-SUSP-001', 
    'Gondar / ጎንደር'
)
ON CONFLICT (digital_id) DO NOTHING;

-- 7. Seed Traffic Violation Reports
INSERT INTO public.violation_reports (
    report_number, digital_id, vehicle_plate, registered_plate, reason, reason_am, 
    action_taken, fine_amount, checked_on, checked_by, notes, status, location
) VALUES
(
    'RPT-GD-2025-091',
    'DID-25-000784521',
    'AA-99999',
    'AA-12345',
    'Plate number does not match with registered vehicle.',
    'የተሰቀለው የሰሌዳ ቁጥር ከተመዘገበው ጋር አይዛመድም (ሐሰተኛ ሰሌዳ)',
    'ባጃጅ ወደ ጎንደር ትራፊክ መምሪያ እንዲቆም ተደርጓል (Impounded)',
    2000,
    '2025-05-20 10:32:18+00',
    'ኢንስፔክተር አበበ ተሰማ',
    'ተሽከርካሪው በፒያሳ አደባባይ ሲያሽከረክር ተይዟል:: የሰሌዳ ማጭበርበር ተረጋግጧል::',
    'IMPOUNDED',
    'ጎንደር ፒያሳ አደባባይ (Piassa Square)'
),
(
    'RPT-GD-2025-084',
    'DID-GD-0899211',
    '3-AM-99999',
    '3-AM-99999',
    'Transport service operating with expired annual permit.',
    'የአመቱ የስራ ፈቃድ ጊዜው ያለፈበት ሆኖ ሲያጓጉዝ ተገኝቷል',
    'የትራፊክ ቅጣት 1,000 ብር ተጥሏል (Traffic Ticket)',
    1000,
    '2025-05-18 14:15:00+00',
    'ረዳት ኢንስፔክተር ሰለሞን አለሙ',
    'ባለቤቱ በ3 ቀን ውስጥ ፈቃድ እንዲያድስ ማስጠንቀቂያ ተሰጥቷል::',
    'SUBMITTED',
    'አዘዞ ማዞሪያ (Azezo Junction)'
)
ON CONFLICT (report_number) DO NOTHING;
