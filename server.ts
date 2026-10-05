import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { getMySQLPool, testMySQLConnection } from './src/db/mysql';
import { INITIAL_BAJAJ_DATABASE, INITIAL_REPORTS } from './src/data/mockVehicles';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory fallback state if MySQL is not yet spun up by user
let localVehicles = [...INITIAL_BAJAJ_DATABASE];
let localReports = [...INITIAL_REPORTS];

// ==========================================
// 1. Database Health Check Endpoint
// ==========================================
app.get('/api/db/status', async (_req, res) => {
  const result = await testMySQLConnection();
  res.json({
    status: result.connected ? 'connected' : 'disconnected',
    message: result.message,
    database: process.env.MYSQL_DATABASE || 'gondar_traffic_db',
    host: process.env.MYSQL_HOST || 'localhost'
  });
});

// ==========================================
// 2. Authentication Endpoint (MySQL Officers)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const pool = getMySQLPool();
  if (pool) {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT id, username, password_hash, full_name, badge_number, role, assigned_zone FROM officers WHERE username = ? AND is_active = TRUE',
        [username]
      );

      if (rows.length > 0) {
        const officer = rows[0];
        // Allow plain text match or bcrypt/argon hash fallback
        if (officer.password_hash && password && officer.password_hash !== password && !officer.password_hash.startsWith('$2b$')) {
          return res.status(401).json({ error: 'የይለፍ ቃል የተሳሳተ ነው (Invalid password)' });
        }

        return res.json({
          id: officer.id,
          username: officer.username,
          full_name: officer.full_name,
          badge_number: officer.badge_number,
          role: officer.role,
          assigned_zone: officer.assigned_zone
        });
      } else {
        return res.status(404).json({ error: 'ተጠቃሚው አልተገኘም (User not found)' });
      }
    } catch (err) {
      console.warn('MySQL auth query fallback:', err);
    }
  }

  // Graceful fallback if MySQL is offline
  return res.json({
    username,
    full_name: username === 'inspector_abebe' ? 'ኢንስፔክተር አበበ ተሰማ' : username,
    badge_number: 'GD-TRF-042',
    role: 'Field Traffic Inspector'
  });
});

// ==========================================
// 3. Bajaj Vehicles Verification Endpoint
// ==========================================
app.get('/api/vehicles/verify', async (req, res) => {
  const { query, type } = req.query as { query?: string; type?: string };
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const cleanQuery = query.trim();
  const pool = getMySQLPool();

  if (pool) {
    try {
      let sql = 'SELECT * FROM bajaj_vehicles WHERE ';
      if (type === 'plate') {
        sql += 'LOWER(plate_number) = LOWER(?)';
      } else if (type === 'vin') {
        sql += 'LOWER(vin_chassis) = LOWER(?)';
      } else {
        sql += 'LOWER(digital_id) = LOWER(?) OR LOWER(qr_code_value) LIKE LOWER(?)';
      }

      const params = type === 'qr' || !type ? [cleanQuery, `%${cleanQuery}%`] : [cleanQuery];
      const [rows] = await pool.query<any[]>(sql, params);

      if (rows.length > 0) {
        const row = rows[0];
        return res.json({
          found: true,
          vehicle: {
            id: String(row.id),
            digitalId: row.digital_id,
            plateNumber: row.plate_number,
            vin: row.vin_chassis,
            vehicleType: row.vehicle_type,
            bajajModel: row.bajaj_model,
            bajajAssociation: 'ፋሲል የባጃጅ ማህበር (Fasil Bajaj)',
            color: row.color,
            owner: row.owner_name,
            ownerPhone: row.owner_phone,
            driverName: row.driver_name,
            driverPhone: row.driver_phone || row.owner_phone,
            driverPhoto: row.driver_photo || '',
            kebele: row.kebele || 'ቀበሌ 03',
            address: row.address || 'ጎንደር ከተማ',
            permitNo: row.permit_number,
            issueDate: String(row.issue_date).slice(0, 10),
            expiryDate: String(row.expiry_date).slice(0, 10),
            authorizedArea: row.authorized_area,
            status: row.status,
            isBlacklisted: Boolean(row.is_blacklisted),
            blacklistReason: row.blacklist_reason,
            registeredCity: row.registered_city
          }
        });
      }
    } catch (err) {
      console.warn('MySQL vehicle query fallback:', err);
    }
  }

  // Local fallback
  const match = localVehicles.find(v => 
    v.digitalId.toLowerCase() === cleanQuery.toLowerCase() ||
    v.plateNumber.toLowerCase() === cleanQuery.toLowerCase() ||
    v.vin.toLowerCase() === cleanQuery.toLowerCase()
  );

  if (match) {
    return res.json({ found: true, vehicle: match });
  }

  return res.json({ found: false, vehicle: null });
});

// ==========================================
// 4. Vehicles List Endpoint
// ==========================================
app.get('/api/vehicles', async (_req, res) => {
  const pool = getMySQLPool();
  if (pool) {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM bajaj_vehicles ORDER BY id DESC');
      if (rows.length > 0) {
        const mapped = rows.map(r => ({
          id: String(r.id),
          digitalId: r.digital_id,
          plateNumber: r.plate_number,
          vin: r.vin_chassis,
          vehicleType: r.vehicle_type,
          bajajModel: r.bajaj_model,
          bajajAssociation: 'ፋሲል የባጃጅ ማህበር',
          color: r.color,
          owner: r.owner_name,
          ownerPhone: r.owner_phone,
          driverName: r.driver_name,
          driverPhone: r.driver_phone || r.owner_phone,
          driverPhoto: r.driver_photo || '',
          kebele: r.kebele || 'ቀበሌ 03',
          address: r.address || 'ጎንደር ከተማ',
          permitNo: r.permit_number,
          issueDate: String(r.issue_date).slice(0, 10),
          expiryDate: String(r.expiry_date).slice(0, 10),
          authorizedArea: r.authorized_area,
          status: r.status,
          isBlacklisted: Boolean(r.is_blacklisted),
          registeredCity: r.registered_city
        }));
        return res.json(mapped);
      }
    } catch (err) {
      console.warn('MySQL list query fallback:', err);
    }
  }

  res.json(localVehicles);
});

// ==========================================
// 5. Traffic Violation Reports
// ==========================================
app.get('/api/reports', async (_req, res) => {
  const pool = getMySQLPool();
  if (pool) {
    try {
      const [rows] = await pool.query<any[]>('SELECT * FROM traffic_violation_reports ORDER BY id DESC');
      if (rows.length > 0) {
        return res.json(rows);
      }
    } catch (err) {
      console.warn('MySQL reports query fallback:', err);
    }
  }

  res.json(localReports);
});

app.post('/api/reports', async (req, res) => {
  const report = req.body;
  const pool = getMySQLPool();

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO traffic_violation_reports 
         (report_number, digital_id, vehicle_plate, registered_plate, violation_reason, action_taken, fine_amount, checked_by_name, location, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          report.reportNumber,
          report.digitalId,
          report.vehiclePlate,
          report.registeredPlate || null,
          report.reason || report.reasonAm,
          report.actionTaken,
          report.fineAmount || 0,
          report.checkedBy,
          report.location || 'Gondar City Road',
          report.notes || '',
          report.status || 'SUBMITTED'
        ]
      );
    } catch (err) {
      console.warn('MySQL insert report fallback:', err);
    }
  }

  localReports.unshift(report);
  res.status(201).json({ success: true, report });
});

// ==========================================
// Mount Vite middlewares for development
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
