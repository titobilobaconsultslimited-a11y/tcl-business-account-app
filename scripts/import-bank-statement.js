const fs = require('fs');
const path = require('path');

// Manually parse .env.local to get DATABASE_URL
const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf-8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const db = require('../lib/db');
const { PDFParse } = require('pdf-parse');

const PDF_PATH = path.join(__dirname, '..', 'Media', 'bank statement.pdf');

// Helpers for date and money parsing
function parseDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const day = parts[0].padStart(2, '0');
  const months = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12'
  };
  const month = months[parts[1].toUpperCase()] || '01';
  const year = '20' + parts[2];
  return `${year}-${month}-${day}`;
}

function parseMoney(val) {
  if (!val || val === '-') return 0;
  return parseFloat(val.replace(/,/g, ''));
}

// Categorization helper
function classifyTransaction(desc, isDebit) {
  const text = desc.toUpperCase();
  if (isDebit) {
    if (text.includes('LEVY') || text.includes('STAMP') || text.includes('CHARGE') || text.includes('VAT') || text.includes('MAINTENANCE FEE')) {
      if (text.includes('VAT') || text.includes('VALUE ADDED TAX')) return 'Taxes Paid';
      return 'Bank Charges';
    }
    if (text.includes('AIRTIME') || text.includes('DATA') || text.includes('SUBSCRIPTION') || text.includes('ROUTER') || text.includes('MTN') || text.includes('AIRTEL') || text.includes('GLO')) {
      return 'Communications & Utilities';
    }
    if (text.includes('IKEDC') || text.includes('ELECTRICITY') || text.includes('NEPA') || text.includes('LIGHT') || text.includes('POWER') || text.includes('LAWMA')) {
      return 'Electricity & Utilities';
    }
    if (text.includes('FUEL') || text.includes('OIL') || text.includes('PETROL') || text.includes('DIESEL')) {
      return 'Fuel & Oil';
    }
    if (text.includes('TRANSPORT') || text.includes('LOGISTICS') || text.includes('FLIGHT') || text.includes('TRAVEL') || text.includes('TRIP') || text.includes('BOLT') || text.includes('UBER') || text.includes('FARE') || text.includes('WAY BILL') || text.includes('COURIER')) {
      return 'Travel & Transport';
    }
    if (text.includes('SALARY') || text.includes('WAGES') || text.includes('STAFF') || text.includes('STIPEND')) {
      return 'Salaries & Wages';
    }
    if (text.includes('BREAD') || text.includes('REFRESHMENT') || text.includes('LUNCH') || text.includes('FOOD') || text.includes('WATER') || text.includes('RIBENNA') || text.includes('SOYA') || text.includes('MEATPIE') || text.includes('CATERING')) {
      return 'Office Refreshment';
    }
    if (text.includes('PAPER') || text.includes('PRINTING') || text.includes('PHOTOCOPY') || text.includes('STATIONERY') || text.includes('INK') || text.includes('TONER')) {
      return 'Printing & Stationery';
    }
    if (text.includes('TITHE') || text.includes('OFFERING') || text.includes('RCCG') || text.includes('CHURCH') || text.includes('DONATION') || text.includes('PLEDGE') || text.includes('CHARITY') || text.includes('SEED') || text.includes('WELFARE') || text.includes('THANKSGIVING') || text.includes('OFFERING')) {
      return 'Donations & Tithes';
    }
    if (text.includes('RENT') || text.includes('OFFICE SPACE') || text.includes('ACCOMMODATION') || text.includes('HOUSE RENT')) {
      return 'Rent & Office';
    }
    if (text.includes('INVERTER') || text.includes('COMPUTER') || text.includes('PRINTER') || text.includes('LAPTOP') || text.includes('SEWING TOOLS') || text.includes('FURNITURE') || text.includes('CHAIR') || text.includes('DESK') || text.includes('WATCH') || text.includes('DEVICE') || text.includes('PUMP') || text.includes('SCREEN PROTECTOR') || text.includes('DISPENSER') || text.includes('SOUND CARD')) {
      return 'Capital Expenditure';
    }
    if (text.includes('CAC') || text.includes('REGISTRATION') || text.includes('STATUTORY') || text.includes('ANNUAL RETURNS') || text.includes('FILING') || text.includes('REMITA') || text.includes('TIN') || text.includes('TAXPROMAX') || text.includes('SCUML') || text.includes('LEGAL') || text.includes('COURT DECLARATION') || text.includes('RESERVE') || text.includes('RESERVATION')) {
      return 'Direct Service Cost';
    }
    return 'General & Admin';
  } else {
    return 'Service Revenue';
  }
}

// Client Name Extractor
function extractClientName(desc) {
  const text = desc.trim();
  
  // Pattern 1: Transfer from [Name]
  const trfFrom = text.match(/Transfer from\s+([A-Z\s]+)/i);
  if (trfFrom) return trfFrom[1].trim();

  // Pattern 2: TRF/... FROM [Name]
  const trfFrom2 = text.match(/FROM\s+([A-Z\s]+)/i);
  if (trfFrom2) {
    const name = trfFrom2[1].trim();
    if (!name.includes('TITOBILOBA')) return name;
  }

  // Pattern 3: TRF/... TO [Name] FROM [Name] or similar
  const trfFrom3 = text.match(/TRF\/.*FROM\s+([A-Z\s]+)/i);
  if (trfFrom3) return trfFrom3[1].trim();

  // Pattern 4: [Name]/NIP TFR
  if (text.includes('NIP TFR FROM')) {
    const nip = text.match(/NIP TFR FROM\s+([A-Z\s]+)/i);
    if (nip) return nip[1].trim();
  }
  
  const nip2 = text.match(/^([A-Z\s]+)\/NIP TFR/i);
  if (nip2) return nip2[1].trim();

  // Pattern 5: [Name]/via GTWORLD or similar
  const gt = text.match(/^([A-Z\s]+)\/via/i);
  if (gt) return gt[1].trim();

  // Fallback check: if there is "FROM [Name]" in general
  const fallback = text.match(/FROM\s+([A-Z\s]+)/i);
  if (fallback) {
    const name = fallback[1].trim();
    if (!name.includes('TITOBILOBA')) return name;
  }

  return null;
}

// Main execution function
async function run() {
  console.log('Loading bank statement PDF from:', PDF_PATH);
  if (!fs.existsSync(PDF_PATH)) {
    console.error('Error: bank statement.pdf not found in Media folder.');
    process.exit(1);
  }

  const dataBuffer = fs.readFileSync(PDF_PATH);
  const data = new Uint8Array(dataBuffer);
  
  console.log('Parsing PDF...');
  const parser = new PDFParse({ data });
  const res = await parser.getText();
  const text = res.text;
  console.log('PDF text length:', text.length);

  // Split transactions by DD-MMM-YY DD-MMM-YY signature
  const dateRegex = /(\d{2}-[A-Z]{3}-\d{2})\s+(\d{2}-[A-Z]{3}-\d{2})/g;
  const transactionBlocks = [];
  let match;
  const indices = [];

  while ((match = dateRegex.exec(text)) !== null) {
    indices.push({
      index: match.index,
      postedDate: match[1],
      valueDate: match[2]
    });
  }

  console.log('Found', indices.length, 'transaction dates in the statement.');

  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].index;
    const end = (i + 1 < indices.length) ? indices[i + 1].index : text.length;
    let blockText = text.substring(start, end).replace(/\s+/g, ' ').trim();
    
    // Remove the starting dates from the block text to isolate description and amounts
    const datePrefix = `${indices[i].postedDate} ${indices[i].valueDate} `;
    if (blockText.startsWith(datePrefix)) {
      blockText = blockText.substring(datePrefix.length);
    } else {
      // Sometimes spacing is slightly different
      blockText = blockText.replace(/^\d{2}-[A-Z]{3}-\d{2}\s+\d{2}-[A-Z]{3}-\d{2}\s+/, '');
    }
    
    transactionBlocks.push({
      postedDate: indices[i].postedDate,
      valueDate: indices[i].valueDate,
      rawText: blockText
    });
  }

  console.log('Processing transaction entries...');
  const parsedTransactions = [];
  let skipped = 0;

  for (const block of transactionBlocks) {
    const raw = block.rawText;
    
    // Check if it's a debit or credit transaction
    // Debit format: "Description DebitAmount - BalanceAmount"
    // Credit format: "Description - CreditAmount BalanceAmount"
    
    let isDebit = false;
    let amount = 0;
    let balance = 0;
    let description = '';

    const debitMatch = raw.match(/(.+?)\s+([\d,]+\.\d{2})\s+-\s+([\d,]+\.\d{2})\s*$/);
    const creditMatch = raw.match(/(.+?)\s+-\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*$/);

    if (debitMatch) {
      description = debitMatch[1].trim();
      amount = parseMoney(debitMatch[2]);
      balance = parseMoney(debitMatch[3]);
      isDebit = true;
    } else if (creditMatch) {
      description = creditMatch[1].trim();
      amount = parseMoney(creditMatch[2]);
      balance = parseMoney(creditMatch[3]);
      isDebit = false;
    } else {
      // Special case: opening balance which has "Opening Balance - 0.00 100,301.33"
      if (raw.includes('Opening Balance')) {
        description = 'Opening Balance';
        amount = 0;
        const balMatch = raw.match(/([\d,]+\.\d{2})\s*$/);
        balance = balMatch ? parseMoney(balMatch[1]) : 0;
        isDebit = false;
      } else {
        skipped++;
        continue;
      }
    }

    parsedTransactions.push({
      postedDate: block.postedDate,
      valueDate: block.valueDate,
      description,
      amount,
      balance,
      type: isDebit ? 'expense' : 'income',
      category: classifyTransaction(description, isDebit)
    });
  }

  console.log(`Parsed ${parsedTransactions.length} valid transactions. Skipped ${skipped} lines.`);

  // Load current clients & transactions from database
  console.log('Connecting to database...');
  const currentClients = await db.getClients();
  const currentTxs = await db.getTransactions();

  console.log(`Current DB contains ${currentClients.length} clients and ${currentTxs.length} transactions.`);
  
  // Map of client name -> id
  const clientMap = new Map();
  currentClients.forEach(c => {
    clientMap.set(c.name.toUpperCase(), c.id);
  });

  // Set of existing transaction fingerprints (date + type + amount + description) to avoid duplicates
  const existingTxSet = new Set();
  currentTxs.forEach(t => {
    existingTxSet.add(`${t.date}_${t.type}_${parseFloat(t.amount)}_${t.description.trim()}`);
  });

  let newClientsAddedCount = 0;
  let newTransactionsAddedCount = 0;

  // Insert transactions in reverse order (oldest first) so that timestamps/auto IDs align logically
  const reversedTxs = parsedTransactions.reverse();

  for (const pTx of reversedTxs) {
    const dateFormatted = parseDate(pTx.postedDate);
    if (!dateFormatted) continue;

    // Check duplicate
    const fingerPrint = `${dateFormatted}_${pTx.type}_${pTx.amount}_${pTx.description.trim()}`;
    if (existingTxSet.has(fingerPrint)) {
      continue;
    }

    let clientId = null;

    if (pTx.type === 'income' && pTx.description !== 'Opening Balance') {
      const clientName = extractClientName(pTx.description);
      if (clientName) {
        const clientNameUpper = clientName.toUpperCase();
        if (clientMap.has(clientNameUpper)) {
          clientId = clientMap.get(clientNameUpper);
        } else {
          // Register new client
          console.log(`Registering new client: "${clientName}"`);
          try {
            const registered = await db.addClient({
              name: clientName,
              email: '',
              phone: '',
              address: '',
              registration_type: 'Business Name',
              registration_date: dateFormatted,
              annual_returns_due_date: `${parseInt(dateFormatted.split('-')[0]) + 1}-04-15`,
              annual_returns_status: 'pending'
            });
            clientId = registered.id;
            clientMap.set(clientNameUpper, clientId);
            newClientsAddedCount++;
          } catch (err) {
            console.error(`Failed to register client "${clientName}":`, err.message);
          }
        }
      }
    }

    // Insert transaction
    try {
      await db.addTransaction({
        type: pTx.type,
        category: pTx.category,
        amount: pTx.amount,
        date: dateFormatted,
        description: pTx.description,
        account: 'Bank',
        client_id: clientId,
        service_id: null
      });
      newTransactionsAddedCount++;
      // Add to set to avoid internal duplicates if statement has exact duplicates in same day
      existingTxSet.add(fingerPrint);
    } catch (err) {
      console.error(`Failed to add transaction:`, err.message);
    }
  }

  console.log('--- Migration Finished ---');
  console.log(`Added ${newClientsAddedCount} new clients.`);
  console.log(`Imported ${newTransactionsAddedCount} new transactions.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
