const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');

const monthMap = {
  'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
  'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
};

function formatIsoDate(dateStr) {
  if (!dateStr || dateStr === 'NIL') return null;
  
  const m1 = dateStr.match(/([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})/);
  if (m1) {
    const m = monthMap[m1[1].toUpperCase()] || '01';
    const d = String(m1[2]).padStart(2, '0');
    return `${m1[3]}-${m}-${d}`;
  }

  const m2 = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (m2) {
    const d = String(m2[1]).padStart(2, '0');
    const m = monthMap[m2[2].toUpperCase()] || '01';
    return `${m2[3]}-${m}-${d}`;
  }

  const m3 = dateStr.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (m3) {
    const m = String(m3[2]).padStart(2, '0');
    const d = String(m3[3]).padStart(2, '0');
    return `${m3[1]}-${m}-${d}`;
  }

  const yearMatch = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearMatch) {
    return `${yearMatch[1]}-06-30`;
  }

  return null;
}

function calculateAnnualReturnDueDate(regDateIso, category) {
  if (!regDateIso) return '2026-06-30';

  const parts = regDateIso.split('-');
  const regYear = parseInt(parts[0], 10);
  const regMonth = parts[1];
  const regDay = parts[2];

  const todayYear = 2026;
  const todayMonthDay = '08-26';

  let firstDueYear = regYear + 1;

  if (category === 'Business Name' || category === 'NGO') {
    let dueYear = firstDueYear;
    while (dueYear < todayYear) {
      dueYear++;
    }
    if (dueYear === todayYear && todayMonthDay > '06-30') {
      return `${todayYear}-06-30`;
    }
    return `${dueYear}-06-30`;
  } else {
    // Limited Company
    let dueYear = firstDueYear;
    while (dueYear < todayYear) {
      dueYear++;
    }
    const anniversary = `${dueYear}-${regMonth}-${regDay}`;
    if (dueYear === todayYear && todayMonthDay > `${regMonth}-${regDay}`) {
      return anniversary;
    }
    return anniversary;
  }
}

async function seedCACData() {
  const jsonPath = path.join(__dirname, '../cac_sorted_by_year_month.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('Source JSON file not found:', jsonPath);
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${rawData.length} records from cac_sorted_by_year_month.json...`);

  const clientRecords = rawData.map((item, index) => {
    const regDateIso = formatIsoDate(item.dateOfReg);
    
    let regType = 'Limited Company';
    if (item.category === 'NGO') regType = 'NGO';
    if (item.category === 'Business Name') regType = 'Business Name';

    const dueDateIso = calculateAnnualReturnDueDate(regDateIso, item.category);

    return {
      id: `c_cac_${index + 1}`,
      name: item.companyName,
      email: (item.email && item.email !== 'NIL') ? item.email : '',
      phone: (item.directorPhone && item.directorPhone !== 'NIL') ? item.directorPhone : '',
      address: 'Lagos, Nigeria',
      registration_type: regType,
      registration_number: (item.regNumber && item.regNumber !== 'NIL / Pending') ? item.regNumber : '',
      registration_date: regDateIso || '2024-01-01',
      annual_returns_due_date: dueDateIso,
      annual_returns_status: 'pending',
      birthday: ''
    };
  });

  // 1. Update db.json
  const dbPath = path.join(__dirname, '../db.json');
  let currentDb = {};
  if (fs.existsSync(dbPath)) {
    try {
      currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      console.error('Error reading db.json');
    }
  }

  currentDb.clients = clientRecords;
  fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf8');
  console.log(`✓ Updated db.json with ${clientRecords.length} authentic CAC companies!`);

  // 2. Update PostgreSQL if DATABASE_URL is available
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl && fs.existsSync(path.join(__dirname, '../.env.local'))) {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    const match = envContent.match(/DATABASE_URL="?([^"\r\n]+)"?/);
    if (match) dbUrl = match[1];
  }

  if (dbUrl) {
    console.log('\nSyncing with Neon PostgreSQL Database...');
    const pool = new Pool({ connectionString: dbUrl });
    const pgClient = await pool.connect();
    try {
      // Clear existing clients table
      await pgClient.query('DELETE FROM clients');
      console.log('✓ Cleared old clients from PostgreSQL database table.');

      // Insert all 304 CAC client records
      for (const c of clientRecords) {
        await pgClient.query(
          `INSERT INTO clients (id, name, email, phone, address, registration_type, registration_number, registration_date, annual_returns_due_date, annual_returns_status, birthday, birthday_wished)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [c.id, c.name, c.email, c.phone, c.address, c.registration_type, c.registration_number, c.registration_date, c.annual_returns_due_date, c.annual_returns_status, c.birthday, false]
        );
      }
      console.log(`✓ Successfully inserted all ${clientRecords.length} CAC companies into PostgreSQL!`);
    } catch (pgErr) {
      console.error('Error syncing PostgreSQL:', pgErr.message);
    } finally {
      pgClient.release();
      await pool.end();
    }
  }

  console.log(`\nAll 304 CAC companies are now fully synced in both Local File & PostgreSQL Databases!`);
}

seedCACData().catch(console.error);
