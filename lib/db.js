const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');

// Choose DB connection based on environment variables
const hasPg = !!process.env.DATABASE_URL;
let pool = null;

if (hasPg) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

const FILE_DB_PATH = path.join(process.cwd(), 'db.json');

// Default Seed Data
const DEFAULT_CLIENTS = [
  { id: 'c1', name: 'Lightspeech Consult', email: 'info@lightspeech.com', phone: '2348012345678', address: '12 Lagos Way, Ikeja, Lagos', registration_type: 'Business Name', registration_date: '2024-10-15', annual_returns_due_date: '2026-04-15', annual_returns_status: 'pending' },
  { id: 'c2', name: 'ABC Ventures', email: 'contact@abcventures.com', phone: '2348098765432', address: '45 Port Harcourt Cres, Wuse II, Abuja', registration_type: 'Limited Company', registration_date: '2025-07-01', annual_returns_due_date: '2026-07-01', annual_returns_status: 'pending' },
  { id: 'c3', name: 'Titobiloba Ventures', email: 'tito@titobiloba.com', phone: '2349011223344', address: '78 Ring Road, Ibadan, Oyo', registration_type: 'NGO', registration_date: '2026-01-01', annual_returns_due_date: '2027-01-01', annual_returns_status: 'pending' }
];

const DEFAULT_SERVICES = [
  { id: 's1', name: 'CAC Registration', price: 58000, description: 'Company registration with Corporate Affairs Commission' },
  { id: 's2', name: 'Tax Consultation', price: 25000, description: 'Annual tax filing and planning consultation' },
  { id: 's3', name: 'Business Plan Development', price: 150000, description: 'Complete business plan for grants and loans' },
  { id: 's4', name: 'Financial Audit', price: 85000, description: 'Internal financial auditing and reporting' }
];

// Generate dynamic transactions matching user's requested trends
const DEFAULT_TRANSACTIONS = [
  // Jan 2026
  { id: 't1', type: 'income', category: 'Service Revenue', amount: 250000, date: '2026-01-15', description: 'CAC Registration and Tax consulting', account: 'Bank', client_id: 'c1', service_id: 's1' },
  { id: 't2', type: 'expense', category: 'Transport', amount: 35000, date: '2026-01-18', description: 'Fuel and logistics for client visit', account: 'Cash' },
  { id: 't3', type: 'expense', category: 'Internet', amount: 15000, date: '2026-01-20', description: 'Monthly internet subscription', account: 'Bank' },

  // Feb 2026
  { id: 't4', type: 'income', category: 'Service Revenue', amount: 400000, date: '2026-02-10', description: 'Business Plan Development', account: 'Bank', client_id: 'c2', service_id: 's3' },
  { id: 't5', type: 'expense', category: 'Marketing', amount: 60000, date: '2026-02-14', description: 'Social media ads', account: 'Bank' },
  { id: 't6', type: 'expense', category: 'Transport', amount: 40000, date: '2026-02-18', description: 'Courier and logistics fees', account: 'Cash' },

  // Mar 2026
  { id: 't7', type: 'income', category: 'Service Revenue', amount: 700000, date: '2026-03-05', description: 'Multiple CAC Registrations', account: 'Bank', client_id: 'c3', service_id: 's1' },
  { id: 't8', type: 'expense', category: 'Office Supplies', amount: 25000, date: '2026-03-12', description: 'Stationery and printing papers', account: 'Cash' },
  { id: 't9', type: 'expense', category: 'Internet', amount: 15000, date: '2026-03-20', description: 'Monthly internet subscription', account: 'Bank' },

  // Apr 2026 (High Sales)
  { id: 't10', type: 'income', category: 'Service Revenue', amount: 1200000, date: '2026-04-05', description: 'Consolidated services - CAC & Audit', account: 'Bank', client_id: 'c1', service_id: 's4' },
  { id: 't11', type: 'expense', category: 'Marketing', amount: 100000, date: '2026-04-12', description: 'Google Ads & flyers', account: 'Bank' },
  { id: 't12', type: 'expense', category: 'Transport', amount: 80000, date: '2026-04-15', description: 'Travel logistics to Abuja client', account: 'Bank' },
  
  // Seed massive sales to match the user's specific text: "CAC Registration: 42 Sales, ₦2,450,000 Revenue"
  // Let's spread these out across Jan-May 2026
  ...Array.from({ length: 38 }, (_, i) => ({
    id: `t-cac-${i}`,
    type: 'income',
    category: 'Service Revenue',
    amount: 58000,
    date: `2026-0${Math.floor(i / 8) + 1}-${(i % 25) + 1}`,
    description: `CAC Registration - Batch Client #${i + 4}`,
    account: 'Bank',
    client_id: i % 2 === 0 ? 'c2' : 'c3',
    service_id: 's1'
  })),

  // Some extra expenses to make totals match realistic counts
  { id: 't-exp-1', type: 'expense', category: 'Transport', amount: 125000, date: '2026-04-20', description: 'Logistics and flight transport', account: 'Bank' },
  { id: 't-exp-2', type: 'expense', category: 'Marketing', amount: 95000, date: '2026-04-22', description: 'Brand materials and ads', account: 'Bank' },
  { id: 't-exp-3', type: 'expense', category: 'Internet', amount: 35000, date: '2026-04-25', description: 'Router installation', account: 'Bank' }
];

const DEFAULT_INVOICES = [
  { id: 'inv1', invoice_number: 'TCL-2026-001', client_id: 'c1', issue_date: '2026-04-01', due_date: '2026-04-15', status: 'paid', discount: 5000, tax: 7.5, total: 60250, bank_details: 'Sterling Bank - 0011223344', notes: 'Thank you for your business!' },
  { id: 'inv2', invoice_number: 'TCL-2026-002', client_id: 'c2', issue_date: '2026-04-10', due_date: '2026-04-24', status: 'paid', discount: 0, tax: 7.5, total: 161250, bank_details: 'Sterling Bank - 0011223344', notes: 'Due upon receipt' },
  { id: 'inv3', invoice_number: 'TCL-2026-003', client_id: 'c3', issue_date: '2026-04-28', due_date: '2026-05-15', status: 'unpaid', discount: 0, tax: 0, total: 450000, bank_details: 'Sterling Bank - 0011223344', notes: 'Outstanding balance for Business Plan & Consult' }
];

const DEFAULT_INVOICE_ITEMS = [
  { id: 'ii1', invoice_id: 'inv1', service_id: 's1', description: 'CAC Registration with Certificate', quantity: 1, unit_price: 58000, amount: 58000 },
  { id: 'ii2', invoice_id: 'inv2', service_id: 's3', description: 'Business Plan Development (Grant focused)', quantity: 1, unit_price: 150000, amount: 150000 },
  { id: 'ii3', invoice_id: 'inv3', service_id: 's3', description: 'Corporate Business Plan Suite', quantity: 3, unit_price: 150000, amount: 450000 }
];

const DEFAULT_RECEIPTS = [
  { id: 'r1', receipt_number: 'RCT-2026-001', invoice_id: 'inv1', payment_date: '2026-04-12', amount: 60250, payment_method: 'Bank Transfer' },
  { id: 'r2', receipt_number: 'RCT-2026-002', invoice_id: 'inv2', payment_date: '2026-04-14', amount: 161250, payment_method: 'Bank Transfer' }
];

const DEFAULT_SETTINGS = {
  theme: 'dark',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  smtpSecure: 'false',
  senderEmail: 'billing@titobilobaconsults.com',
  companyName: 'Titobiloba Consults Limited',
  companyAddress: '12 Corporate Center, Lekki Phase 1, Lagos',
  companyPhone: '+234 801 234 5678',
  bankDetails: 'Access Bank - Titobiloba Consults Ltd - 0123456789'
};

// HELPER: Read file DB
function readFileDb() {
  if (!fs.existsSync(FILE_DB_PATH)) {
    const initialDb = {
      clients: DEFAULT_CLIENTS,
      services: DEFAULT_SERVICES,
      transactions: DEFAULT_TRANSACTIONS,
      invoices: DEFAULT_INVOICES,
      invoice_items: DEFAULT_INVOICE_ITEMS,
      receipts: DEFAULT_RECEIPTS,
      settings: DEFAULT_SETTINGS
    };
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
  try {
    const data = fs.readFileSync(FILE_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON database, resetting...', error);
    return {
      clients: [],
      services: [],
      transactions: [],
      invoices: [],
      invoice_items: [],
      receipts: [],
      settings: DEFAULT_SETTINGS
    };
  }
}

// HELPER: Write file DB
function writeFileDb(data) {
  try {
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing JSON database:', error);
  }
}

// SQL Queries for Tables Creation in Postgres
const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    account TEXT NOT NULL,
    client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'overdue')),
    discount NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    bank_details TEXT,
    notes TEXT,
    amount_paid NUMERIC DEFAULT 0,
    cost_price NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    description TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    subtype TEXT,
    cost_price NUMERIC DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    receipt_number TEXT UNIQUE NOT NULL,
    invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
    payment_date TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(50) PRIMARY KEY,
    theme TEXT DEFAULT 'dark',
    smtp_host TEXT,
    smtp_port TEXT,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_secure TEXT,
    sender_email TEXT,
    company_name TEXT,
    company_address TEXT,
    company_phone TEXT,
    bank_details TEXT
  );
`;

// Self-healing function for Postgres initialization
async function initPgDb() {
  if (!hasPg) return;
  const client = await pool.connect();
  try {
    // Run creation scripts
    await client.query(CREATE_TABLES_SQL);

    // Apply migrations for new columns
    await client.query(`
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
      ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS subtype TEXT;
      ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS registration_type TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS registration_date TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS annual_returns_due_date TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS annual_returns_status TEXT DEFAULT 'pending';
    `);

    // Check if empty and seed
    const checkClients = await client.query('SELECT COUNT(*) FROM clients');
    if (parseInt(checkClients.rows[0].count) === 0) {
      console.log('Seeding initial PostgreSQL database tables...');
      
      // Seed clients
      for (const c of DEFAULT_CLIENTS) {
        await client.query('INSERT INTO clients (id, name, email, phone, address, registration_type, registration_date, annual_returns_due_date, annual_returns_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
          [c.id, c.name, c.email, c.phone, c.address, c.registration_type, c.registration_date, c.annual_returns_due_date, c.annual_returns_status]);
      }
      
      // Seed services
      for (const s of DEFAULT_SERVICES) {
        await client.query('INSERT INTO services (id, name, price, description) VALUES ($1, $2, $3, $4)', [s.id, s.name, s.price, s.description]);
      }
      
      // Seed transactions
      for (const t of DEFAULT_TRANSACTIONS) {
        await client.query('INSERT INTO transactions (id, type, category, amount, date, description, account, client_id, service_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
          [t.id, t.type, t.category, t.amount, t.date, t.description, t.account, t.client_id || null, t.service_id || null]);
      }

      // Seed invoices
      for (const inv of DEFAULT_INVOICES) {
        await client.query('INSERT INTO invoices (id, invoice_number, client_id, issue_date, due_date, status, discount, tax, total, bank_details, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', 
          [inv.id, inv.invoice_number, inv.client_id, inv.issue_date, inv.due_date, inv.status, inv.discount, inv.tax, inv.total, inv.bank_details, inv.notes]);
      }

      // Seed invoice items
      for (const item of DEFAULT_INVOICE_ITEMS) {
        await client.query('INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, amount) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [item.id, item.invoice_id, item.service_id, item.description, item.quantity, item.unit_price, item.amount]);
      }

      // Seed receipts
      for (const r of DEFAULT_RECEIPTS) {
        await client.query('INSERT INTO receipts (id, receipt_number, invoice_id, payment_date, amount, payment_method) VALUES ($1, $2, $3, $4, $5, $6)',
          [r.id, r.receipt_number, r.invoice_id, r.payment_date, r.amount, r.payment_method]);
      }

      // Seed settings
      const s = DEFAULT_SETTINGS;
      await client.query('INSERT INTO settings (id, theme, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, sender_email, company_name, company_address, company_phone, bank_details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        ['main', s.theme, s.smtpHost, s.smtpPort, s.smtpUser, s.smtpPass, s.smtpSecure, s.senderEmail, s.companyName, s.companyAddress, s.companyPhone, s.bankDetails]);
    }
  } catch (error) {
    console.error('Error initializing PostgreSQL tables:', error);
  } finally {
    client.release();
  }
}

// Call on startup
if (hasPg) {
  initPgDb();
} else {
  readFileDb(); // Trigger file DB creation on start if it doesn't exist
}

// EXPORTED DATA ACCESS METHODS
module.exports = {
  dbType: hasPg ? 'PostgreSQL' : 'Local File',

  // --- CLIENTS ---
  async getClients() {
    if (hasPg) {
      const res = await pool.query('SELECT * FROM clients ORDER BY name ASC');
      return res.rows;
    } else {
      const db = readFileDb();
      return db.clients.sort((a, b) => a.name.localeCompare(b.name));
    }
  },

  async addClient(client) {
    const id = 'c_' + Date.now();
    const newClient = { 
      id, 
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      registration_type: client.registration_type || null,
      registration_date: client.registration_date || null,
      annual_returns_due_date: client.annual_returns_due_date || null,
      annual_returns_status: client.annual_returns_status || 'pending'
    };
    if (hasPg) {
      await pool.query('INSERT INTO clients (id, name, email, phone, address, registration_type, registration_date, annual_returns_due_date, annual_returns_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
        [newClient.id, newClient.name, newClient.email, newClient.phone, newClient.address, newClient.registration_type, newClient.registration_date, newClient.annual_returns_due_date, newClient.annual_returns_status]);
      return newClient;
    } else {
      const db = readFileDb();
      db.clients.push(newClient);
      writeFileDb(db);
      return newClient;
    }
  },

  async updateClient(id, client) {
    if (hasPg) {
      await pool.query(
        'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4, registration_type = $5, registration_date = $6, annual_returns_due_date = $7, annual_returns_status = $8 WHERE id = $9',
        [client.name, client.email, client.phone, client.address, client.registration_type, client.registration_date, client.annual_returns_due_date, client.annual_returns_status, id]
      );
      return { id, ...client };
    } else {
      const db = readFileDb();
      const idx = db.clients.findIndex(c => c.id === id);
      if (idx !== -1) {
        db.clients[idx] = { ...db.clients[idx], ...client };
        writeFileDb(db);
        return db.clients[idx];
      }
      return null;
    }
  },

  async deleteClient(id) {
    if (hasPg) {
      await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    } else {
      const db = readFileDb();
      db.clients = db.clients.filter(c => c.id !== id);
      // Clean transactions reference
      db.transactions = db.transactions.map(t => t.client_id === id ? { ...t, client_id: null } : t);
      // Clean invoices reference
      db.invoices = db.invoices.map(inv => inv.client_id === id ? { ...inv, client_id: null } : inv);
      writeFileDb(db);
    }
    return true;
  },

  // --- SERVICES ---
  async getServices() {
    if (hasPg) {
      const res = await pool.query('SELECT * FROM services ORDER BY name ASC');
      return res.rows;
    } else {
      const db = readFileDb();
      return db.services.sort((a, b) => a.name.localeCompare(b.name));
    }
  },

  async addService(service) {
    const id = 's_' + Date.now();
    const newService = { id, ...service };
    if (hasPg) {
      await pool.query('INSERT INTO services (id, name, price, description) VALUES ($1, $2, $3, $4)', 
        [newService.id, newService.name, newService.price, newService.description]);
      return newService;
    } else {
      const db = readFileDb();
      db.services.push(newService);
      writeFileDb(db);
      return newService;
    }
  },

  async deleteService(id) {
    if (hasPg) {
      await pool.query('DELETE FROM services WHERE id = $1', [id]);
    } else {
      const db = readFileDb();
      db.services = db.services.filter(s => s.id !== id);
      writeFileDb(db);
    }
    return true;
  },

  // --- TRANSACTIONS ---
  async getTransactions() {
    if (hasPg) {
      const res = await pool.query('SELECT * FROM transactions ORDER BY date DESC, created_at DESC');
      return res.rows;
    } else {
      const db = readFileDb();
      return db.transactions.sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  async addTransaction(tx) {
    const id = 't_' + Date.now();
    const newTx = { id, ...tx };
    if (hasPg) {
      await pool.query('INSERT INTO transactions (id, type, category, amount, date, description, account, client_id, service_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
        [newTx.id, newTx.type, newTx.category, newTx.amount, newTx.date, newTx.description || '', newTx.account, newTx.client_id || null, newTx.service_id || null]);
      return newTx;
    } else {
      const db = readFileDb();
      db.transactions.unshift(newTx);
      writeFileDb(db);
      return newTx;
    }
  },

  async deleteTransaction(id) {
    if (hasPg) {
      await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    } else {
      const db = readFileDb();
      db.transactions = db.transactions.filter(t => t.id !== id);
      writeFileDb(db);
    }
    return true;
  },

  // --- INVOICES & ITEMS ---
  async getInvoices() {
    if (hasPg) {
      const invoicesRes = await pool.query('SELECT * FROM invoices ORDER BY invoice_number DESC');
      const itemsRes = await pool.query('SELECT * FROM invoice_items');
      const invoices = invoicesRes.rows;
      const items = itemsRes.rows;
      
      return invoices.map(inv => ({
        ...inv,
        items: items.filter(item => item.invoice_id === inv.id)
      }));
    } else {
      const db = readFileDb();
      return db.invoices.map(inv => ({
        ...inv,
        items: db.invoice_items.filter(item => item.invoice_id === inv.id)
      })).sort((a, b) => b.invoice_number.localeCompare(a.invoice_number));
    }
  },

  async addInvoice(invoice, items) {
    const id = 'inv_' + Date.now();
    const newInvoice = { id, ...invoice };
    
    if (hasPg) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('INSERT INTO invoices (id, invoice_number, client_id, issue_date, due_date, status, discount, tax, total, bank_details, notes, amount_paid, cost_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [newInvoice.id, newInvoice.invoice_number, newInvoice.client_id, newInvoice.issue_date, newInvoice.due_date, newInvoice.status, newInvoice.discount, newInvoice.tax, newInvoice.total, newInvoice.bank_details, newInvoice.notes, newInvoice.amount_paid || 0, newInvoice.cost_price || 0]);
        
        const insertedItems = [];
        for (const item of items) {
          const item_id = 'ii_' + Math.random().toString(36).substr(2, 9);
          const newItem = { id: item_id, invoice_id: newInvoice.id, ...item };
          await client.query('INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, amount, subtype, cost_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [newItem.id, newItem.invoice_id, newItem.service_id || null, newItem.description, newItem.quantity, newItem.unit_price, newItem.amount, newItem.subtype || null, newItem.cost_price || 0]);
          insertedItems.push(newItem);
        }
        await client.query('COMMIT');
        return { ...newInvoice, items: insertedItems };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      const db = readFileDb();
      db.invoices.unshift(newInvoice);
      const insertedItems = items.map(item => {
        const item_id = 'ii_' + Math.random().toString(36).substr(2, 9);
        const newItem = { id: item_id, invoice_id: newInvoice.id, ...item };
        db.invoice_items.push(newItem);
        return newItem;
      });
      writeFileDb(db);
      return { ...newInvoice, items: insertedItems };
    }
  },

  async updateInvoiceStatus(id, status, amountPaid = null) {
    if (hasPg) {
      if (status === 'paid') {
        if (amountPaid !== null) {
          await pool.query('UPDATE invoices SET status = $1, amount_paid = $2 WHERE id = $3', [status, amountPaid, id]);
        } else {
          await pool.query('UPDATE invoices SET status = $1, amount_paid = total WHERE id = $2', [status, id]);
        }
      } else {
        await pool.query('UPDATE invoices SET status = $1 WHERE id = $2', [status, id]);
      }
    } else {
      const db = readFileDb();
      db.invoices = db.invoices.map(inv => {
        if (inv.id === id) {
          const updated = { ...inv, status };
          if (status === 'paid') {
            updated.amount_paid = amountPaid !== null ? amountPaid : inv.total;
          }
          return updated;
        }
        return inv;
      });
      writeFileDb(db);
    }
    return true;
  },

  async deleteInvoice(id) {
    if (hasPg) {
      await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
    } else {
      const db = readFileDb();
      db.invoices = db.invoices.filter(inv => inv.id !== id);
      db.invoice_items = db.invoice_items.filter(item => item.invoice_id !== id);
      db.receipts = db.receipts.filter(r => r.invoice_id !== id);
      writeFileDb(db);
    }
    return true;
  },

  // --- RECEIPTS ---
  async getReceipts() {
    if (hasPg) {
      const res = await pool.query('SELECT * FROM receipts ORDER BY receipt_number DESC');
      return res.rows;
    } else {
      const db = readFileDb();
      return db.receipts.sort((a, b) => b.receipt_number.localeCompare(a.receipt_number));
    }
  },

  async addReceipt(receipt) {
    const id = 'r_' + Date.now();
    const newReceipt = { id, ...receipt };
    if (hasPg) {
      await pool.query('INSERT INTO receipts (id, receipt_number, invoice_id, payment_date, amount, payment_method) VALUES ($1, $2, $3, $4, $5, $6)',
        [newReceipt.id, newReceipt.receipt_number, newReceipt.invoice_id, newReceipt.payment_date, newReceipt.amount, newReceipt.payment_method]);
      return newReceipt;
    } else {
      const db = readFileDb();
      db.receipts.unshift(newReceipt);
      writeFileDb(db);
      return newReceipt;
    }
  },

  // --- SETTINGS ---
  async getSettings() {
    const dbType = hasPg ? 'PostgreSQL' : 'Local File';
    if (hasPg) {
      const res = await pool.query('SELECT * FROM settings WHERE id = $1', ['main']);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          dbType,
          theme: row.theme,
          smtpHost: row.smtp_host || '',
          smtpPort: row.smtp_port || '587',
          smtpUser: row.smtp_user || '',
          smtpPass: row.smtp_pass || '',
          smtpSecure: row.smtp_secure || 'false',
          senderEmail: row.sender_email || '',
          companyName: row.company_name || 'Titobiloba Consults Limited',
          companyAddress: row.company_address || '',
          companyPhone: row.company_phone || '',
          bankDetails: row.bank_details || ''
        };
      }
      return { ...DEFAULT_SETTINGS, dbType };
    } else {
      const db = readFileDb();
      return { ...(db.settings || DEFAULT_SETTINGS), dbType };
    }
  },

  async updateSettings(s) {
    if (hasPg) {
      await pool.query('UPDATE settings SET theme = $1, smtp_host = $2, smtp_port = $3, smtp_user = $4, smtp_pass = $5, smtp_secure = $6, sender_email = $7, company_name = $8, company_address = $9, company_phone = $10, bank_details = $11 WHERE id = $12',
        [s.theme, s.smtpHost, s.smtpPort, s.smtpUser, s.smtpPass, s.smtpSecure, s.senderEmail, s.companyName, s.companyAddress, s.companyPhone, s.bankDetails, 'main']);
    } else {
      const db = readFileDb();
      db.settings = { ...db.settings, ...s };
      writeFileDb(db);
    }
    return s;
  }
};
