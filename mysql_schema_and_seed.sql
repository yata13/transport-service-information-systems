-- ====================================================================
-- GONDAR CITY BAJAJ TRAFFIC CONTROL & VERIFICATION SYSTEM
-- Database: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4 / utf8mb4_unicode_ci
-- ====================================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS gondar_traffic_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gondar_traffic_db;

-- 2. Drop existing tables if re-seeding
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS traffic_violation_reports;
DROP TABLE IF EXISTS bajaj_vehicles;
DROP TABLE IF EXISTS bajaj_associations;
DROP TABLE IF EXISTS traffic_zones;
DROP TABLE IF EXISTS officers;
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- TABLE 1: Traffic Officers / Inspectors (ተቆጣጣሪ ፖሊሶች)
-- ====================================================================
CREATE TABLE officers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt/argon2 or SHA-256 password hash',
  full_name VARCHAR(120) NOT NULL COMMENT 'ሙሉ ስም',
  badge_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'የባጅ መለያ ቁጥር',
  role ENUM('FIELD_INSPECTOR', 'CHECKPOINT_LEAD', 'SUPERVISOR', 'ADMIN') NOT NULL DEFAULT 'FIELD_INSPECTOR',
  phone_number VARCHAR(30),
  assigned_zone VARCHAR(100) DEFAULT 'Gondar City',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_officers_username (username),
  INDEX idx_officers_badge (badge_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 2: Traffic Zones (የጎንደር ከተማ የትራፊክ ዞኖች)
-- ====================================================================
CREATE TABLE traffic_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone_name VARCHAR(100) NOT NULL UNIQUE,
  zone_code VARCHAR(20) NOT NULL UNIQUE,
  description VARCHAR(255),
  checkpoint_location VARCHAR(150),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 3: Bajaj Associations (የባጃጅ ማህበራት)
-- ====================================================================
CREATE TABLE bajaj_associations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  association_name VARCHAR(150) NOT NULL UNIQUE,
  association_code VARCHAR(50) NOT NULL UNIQUE,
  representative_name VARCHAR(120),
  contact_phone VARCHAR(30),
  registered_office VARCHAR(150),
  authorized_zone_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorized_zone_id) REFERENCES traffic_zones(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 4: Bajaj Vehicles (የተመዘገቡ ባጃጆች)
-- ====================================================================
CREATE TABLE bajaj_vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  digital_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'DID Number e.g. DID-25-000784521',
  plate_number VARCHAR(30) NOT NULL UNIQUE COMMENT 'Plate e.g. AA-12345 or 3-AM-04891',
  vin_chassis VARCHAR(60) NOT NULL UNIQUE COMMENT 'Chassis / VIN number',
  vehicle_type VARCHAR(50) NOT NULL DEFAULT 'Bajaj',
  bajaj_model VARCHAR(60) NOT NULL COMMENT 'TVS King, Bajaj RE 4S, Piaggio Ape',
  association_id INT,
  color VARCHAR(40) NOT NULL,
  owner_name VARCHAR(120) NOT NULL COMMENT 'ባለቤት',
  owner_phone VARCHAR(30),
  driver_name VARCHAR(120),
  driver_phone VARCHAR(30),
  driver_photo VARCHAR(255),
  kebele VARCHAR(80) DEFAULT 'ቀበሌ 03',
  address VARCHAR(150) DEFAULT 'ጎንደር ከተማ',
  driver_license_number VARCHAR(50),
  permit_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'የፈቃድ ቁጥር e.g. PRM-25-5566',
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  authorized_area VARCHAR(150) NOT NULL COMMENT 'ሰበሰተፖል / ዞን 1 / ዞን 2',
  status ENUM('ACTIVE', 'EXPIRED', 'SUSPENDED', 'ILLEGAL') NOT NULL DEFAULT 'ACTIVE',
  is_blacklisted BOOLEAN NOT NULL DEFAULT FALSE,
  blacklist_reason TEXT,
  qr_code_value VARCHAR(255),
  registered_city VARCHAR(60) NOT NULL DEFAULT 'Gondar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (association_id) REFERENCES bajaj_associations(id) ON DELETE SET NULL,
  INDEX idx_bajaj_digital_id (digital_id),
  INDEX idx_bajaj_plate (plate_number),
  INDEX idx_bajaj_vin (vin_chassis),
  INDEX idx_bajaj_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- TABLE 5: Traffic Violation Reports / Citations (የጥሰትና እርምጃ ሪፖርቶች)
-- ====================================================================
CREATE TABLE traffic_violation_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g. RPT-GD-2025-091',
  bajaj_id INT NULL,
  digital_id VARCHAR(50) NOT NULL,
  vehicle_plate VARCHAR(30) NOT NULL,
  registered_plate VARCHAR(30),
  violation_reason TEXT NOT NULL,
  action_taken VARCHAR(150) NOT NULL,
  fine_amount DECIMAL(10, 2) DEFAULT 0.00,
  checked_by_officer_id INT,
  checked_by_name VARCHAR(120) NOT NULL,
  location VARCHAR(150) NOT NULL DEFAULT 'Gondar City Road',
  notes TEXT,
  status ENUM('SUBMITTED', 'PAID', 'IMPOUNDED', 'RESOLVED') NOT NULL DEFAULT 'SUBMITTED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bajaj_id) REFERENCES bajaj_vehicles(id) ON DELETE SET NULL,
  FOREIGN KEY (checked_by_officer_id) REFERENCES officers(id) ON DELETE SET NULL,
  INDEX idx_reports_plate (vehicle_plate),
  INDEX idx_reports_digital_id (digital_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA: 1. Traffic Officers (Real Gondar Department Staff)
-- Passwords in plain text note: 'admin123' / 'traffic2025'
-- ====================================================================
INSERT INTO officers (username, password_hash, full_name, badge_number, role, phone_number, assigned_zone) VALUES
('inspector_abebe', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'ኢንስፔክተር አበበ ተሰማ', 'GD-TRF-042', 'FIELD_INSPECTOR', '+251 91 812 3456', 'ዞን 1: አራዳ - ፒያሳ'),
('inspector_selemon', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'ረዳት ኢንስፔክተር ሰለሞን አለሙ', 'GD-TRF-019', 'CHECKPOINT_LEAD', '+251 92 114 9988', 'ዞን 2: ፒያሳ - አዘዞ'),
('officer_bethel', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'ሳጅን ቤተልሔም ግርማ', 'GD-TRF-033', 'FIELD_INSPECTOR', '+251 93 555 7711', 'ዞን 3: ማራኪ ዩኒቨርሲቲ'),
('chief_desta', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'አለቃ ደስታ ካሳሁን', 'GD-TRF-SUP-01', 'SUPERVISOR', '+251 91 800 1122', 'ጎንደር ዋና መምሪያ (HQ)');

-- ====================================================================
-- SEED DATA: 2. Traffic Zones
-- ====================================================================
INSERT INTO traffic_zones (zone_name, zone_code, description, checkpoint_location) VALUES
('ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ', 'ZONE-01-PIASSA', 'Central historic district and commercial zone', 'ፒያሳ ቴዎድሮስ አደባባይ'),
('ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት', 'ZONE-02-AZEZO', 'Southern transit corridor connecting airport', 'አዘዞ ማዞሪያ ኬላ'),
('ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18', 'ZONE-03-MARAKI', 'University student campus corridor and residential', 'ማራኪ ግቢ መግቢያ'),
('ዞን 4: አንገረብ - ብልኮ', 'ZONE-04-ANGEREB', 'Angereb reservoir and northern residential', 'አንገረብ ድልድይ');

-- ====================================================================
-- SEED DATA: 3. Bajaj Associations in Gondar
-- ====================================================================
INSERT INTO bajaj_associations (association_name, association_code, representative_name, contact_phone, registered_office, authorized_zone_id) VALUES
('Addis Bajaj Share Company', 'ASC-BAJAJ-01', 'አቶ ብሩክ ወርቁ', '+251 91 123 4567', 'አራዳ ቀበሌ 03', 1),
('ፋሲል የባጃጅ ማህበር (Fasil Bajaj Association)', 'FASIL-ASSOC-02', 'አቶ ዳዊት መንግስቱ', '+251 91 876 5432', 'ፋሲል ግቢ አጠገብ', 1),
('አዘዞ ማህበር (Azezo Bajaj Association)', 'AZEZO-ASSOC-03', 'አቶ ካሳዬ ታደለ', '+251 92 345 6789', 'አዘዞ ቀበሌ 10', 2),
('ማራኪ ዩኒቨርሲቲ ማህበር (Maraki Association)', 'MARAKI-ASSOC-04', 'አቶ ተስፋዬ ተክሌ', '+251 93 456 7890', 'ማራኪ ግቢ ፊትለፊት', 3);

-- ====================================================================
-- SEED DATA: 4. Bajaj Vehicles (The exact vehicles shown in your UI)
-- ====================================================================
INSERT INTO bajaj_vehicles (digital_id, plate_number, vin_chassis, vehicle_type, bajaj_model, association_id, color, owner_name, owner_phone, driver_name, driver_phone, driver_photo, kebele, address, permit_number, issue_date, expiry_date, authorized_area, status, is_blacklisted, qr_code_value, registered_city) VALUES
('DID-25-000784521', 'AA-12345', 'MBN12345678912345', 'Bajaj', 'TVS King', 1, 'Red', 'አቶ ታምራት አለማየሁ', '+251 91 876 5432', 'ዮሐንስ ጌታቸው', '+251 91 432 1098', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80', 'ቀበሌ 03', 'አራዳ መንገድ፣ ቀበሌ 03፣ ጎንደር', 'PRM-25-5566', '2025-01-10', '2026-01-09', 'ሰበሰተፖል (Sebastopol)', 'ACTIVE', FALSE, 'DID-25-000784521|AA-12345|PRM-25-5566', 'Gondar'),
('DID-GD-0489120', '3-AM-04891', 'TVS98234109482103', 'Bajaj', 'TVS King Deluxe', 2, 'Blue', 'ወ/ሮ ሰላማዊት አሰፋ', '+251 92 345 6789', 'ዳንኤል ብርሃኑ', '+251 92 888 1234', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', 'ቀበሌ 01', 'ፒያሳ - ፋሲል ግቢ ፊት ለፊት፣ ቀበሌ 01', 'PRM-GD-2025-102', '2025-02-15', '2026-02-14', 'ዞን 1: አራዳ - ፒያሳ - ፋሲል ግቢ', 'ACTIVE', FALSE, 'DID-GD-0489120|3-AM-04891|PRM-GD-2025-102', 'Gondar'),
('DID-GD-0899211', '3-AM-99999', 'BAJ77341209845112', 'Bajaj', 'Bajaj RE 4S', 3, 'Green', 'አቶ ሙሉጌታ ካሳ', '+251 91 112 3344', 'አበበ ተፈሪ', '+251 91 555 7788', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', 'ቀበሌ 16', 'አዘዞ ማዞሪያ፣ ቀበሌ 16፣ ጎንደር', 'PRM-GD-2024-889', '2024-03-01', '2025-02-28', 'ዞን 2: ፒያሳ - አዘዞ - ጎንደር ኤርፖርት', 'EXPIRED', FALSE, 'DID-GD-0899211|3-AM-99999|PRM-GD-2024-889', 'Gondar'),
('DID-GD-0033221', '3-AM-77214', 'CHAS9921045812033', 'Bajaj', 'Piaggio Ape City', 4, 'White', 'አቶ ተስፋሁን ያሬድ', '+251 93 456 7890', 'ካሳሁን ወርቁ', '+251 93 777 9900', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', 'ቀበሌ 18', 'ማራኪ ዩኒቨርሲቲ በር፣ ቀበሌ 18፣ ጎንደር', 'PRM-GD-2025-331', '2025-01-20', '2026-01-19', 'ዞን 3: ማራኪ ዩኒቨርሲቲ - ሾንቃ - ቀበሌ 18', 'ACTIVE', FALSE, 'DID-GD-0033221|3-AM-77214|PRM-GD-2025-331', 'Gondar'),
('DID-GD-0078900', '3-AM-11002', 'VIN-STOLEN-998811', 'Bajaj', 'Bajaj Maxima Z', 1, 'Yellow', 'ያልታወቀ (Unknown)', '-', 'ያልተመዘገበ', '-', '', 'ያልታወቀ', 'አንገረብ ወንዝ ዳርቻ', 'PRM-SUSP-001', '2023-11-10', '2024-11-09', 'ያልተፈቀደ (Unauthorized)', 'SUSPENDED', TRUE, 'DID-GD-0078900|3-AM-11002|PRM-SUSP-001', 'Gondar');

-- ====================================================================
-- SEED DATA: 5. Traffic Violation Reports
-- ====================================================================
INSERT INTO traffic_violation_reports (report_number, bajaj_id, digital_id, vehicle_plate, registered_plate, violation_reason, action_taken, fine_amount, checked_by_officer_id, checked_by_name, location, notes, status) VALUES
('RPT-GD-2025-091', 1, 'DID-25-000784521', 'AA-99999', 'AA-12345', 'Plate number does not match with registered vehicle.', 'ባጃጅ ወደ ጎንደር ትራፊክ መምሪያ እንዲቆም ተደርጓል (Impounded)', 2000.00, 1, 'ኢንስፔክተር አበበ ተሰማ', 'ጎንደር ፒያሳ አደባባይ (Piassa Square)', 'ተሽከርካሪው በፒያሳ አደባባይ ሲያሽከረክር ተይዟል:: የሰሌዳ ማጭበርበር ተረጋግጧል::', 'IMPOUNDED'),
('RPT-GD-2025-084', 3, 'DID-GD-0899211', '3-AM-99999', '3-AM-99999', 'Transport service operating with expired annual permit.', 'የትራፊክ ቅጣት 1,000 ብር ተጥሏል (Traffic Ticket)', 1000.00, 2, 'ረዳት ኢንስፔክተር ሰለሞን አለሙ', 'አዘዞ ማዞሪያ (Azezo Junction)', 'ባለቤቱ በ3 ቀን ውስጥ ፈቃድ እንዲያድስ ማስጠንቀቂያ ተሰጥቷል::', 'SUBMITTED');
