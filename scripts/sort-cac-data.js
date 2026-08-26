const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

function cleanCompanyName(rawName, filename) {
  let name = rawName ? rawName.trim() : '';
  if (!name || name.toUpperCase() === 'DETAILS' || name.length < 2) {
    let fname = filename.replace(/^.*(?:Application For Registration of Company|Status Report CAC)\s*-\s*/i, '');
    fname = fname.replace(/\.pdf$/i, '').replace(/\s*\(\d+\)$/, '').replace(/\s*correct.*$/i, '').trim();
    name = fname;
  }
  return name.replace(/\s+/g, ' ').trim();
}

function parseCACData(text, filename) {
  let companyName = null;
  let email = null;
  let regNumber = null;
  let directorPhone = null;
  let dateOfReg = null;
  let category = 'Limited';

  // 1. Company Name Extraction
  const compMatch = text.match(/(?:Company Name|Business Name|Incorporated Trustee Name|LLP Name)\s+(?!DETAILS)([^\r\n]+)/i);
  if (compMatch && compMatch[1].trim().toUpperCase() !== 'DETAILS') {
    companyName = compMatch[1].trim();
  } else {
    const nameFallback = text.match(/(?:Name of Company|Name of Business|Proposed Name)\s+([^\r\n]+)/i);
    if (nameFallback) {
      companyName = nameFallback[1].trim();
    }
  }
  companyName = cleanCompanyName(companyName, filename);

  // 2. Registration Number Extraction
  const regMatch = text.match(/(?:RC Number|BN Number|IT Number|LLP Number|Registration Number)\s+([A-Z0-9\/\-]+)/i);
  if (regMatch) {
    regNumber = regMatch[1].trim();
  } else {
    const genericReg = text.match(/(?:BN|RC|IT)\s*[:\.\-]?\s*(\d{5,10})/i);
    regNumber = genericReg ? genericReg[1] : 'NIL / Pending';
  }

  // 3. Email Extraction
  const entityEmail = text.match(/(?:Email|EMAIL)\s+([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  if (entityEmail) {
    email = entityEmail[1].trim();
  } else {
    const genEmail = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    email = genEmail ? genEmail[1] : 'NIL';
  }

  // 4. Date of Registration Extraction
  const dateMatch = text.match(/(?:Date of Registration|Date Registered|Date Approved|Date of Incorporation)\s+([A-Za-z]{3}\s+\d{1,2},\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
  if (dateMatch) {
    dateOfReg = dateMatch[1].trim();
  } else {
    const reportDate = text.match(/Report generated on\s+[^\r\n,]+,\s+([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i);
    dateOfReg = reportDate ? reportDate[1] : 'NIL';
  }

  // 5. Director / Proprietor Phone Number Extraction
  const phoneMatches = [...text.matchAll(/(?:PHONE NUMBER|MOBILE|TEL)\s+(\+?[0-9\s\-]{10,15})/gi)];
  if (phoneMatches.length > 0) {
    directorPhone = phoneMatches[0][1].replace(/\s+/g, '').trim();
  } else {
    const genPhone = text.match(/(\+?234[0-9]{10}|0[789][01][0-9]{8})/);
    directorPhone = genPhone ? genPhone[1] : 'NIL';
  }

  // 6. Categorization Logic (NGO vs Business Name vs Limited)
  // Check exact CAC headers or indicators
  if (/INCORPORATED TRUSTEE DETAILS|Incorporated Trustee Name|IT Number|INCORPORATED TRUSTEE\b|LIMITED BY GUARANTEE/i.test(text)) {
    category = 'NGO';
  } else if (/BUSINESS NAME DETAILS|BN Number|Business Type\s+SOLE PROPRIETOR|Business Type\s+PARTNERSHIP/i.test(text)) {
    category = 'Business Name';
  } else if (/COMPANY DETAILS|RC Number|PRIVATE COMPANY LIMITED BY SHARES|PUBLIC COMPANY LIMITED BY SHARES/i.test(text)) {
    category = 'Limited';
  } else {
    // Fallback checks on Name / Filename
    const normName = (companyName + ' ' + filename).toUpperCase();
    if (/\b(LIMITED|LTD|PLC|LLP)\b/.test(normName)) {
      category = 'Limited';
    } else if (/\b(FOUNDATION|ASSOCIATION|FELLOWSHIP|MINISTRY|CHURCH|INITIATIVE|SOCIETY|CLUB)\b/.test(normName)) {
      category = 'NGO';
    } else {
      category = 'Business Name';
    }
  }

  return {
    category,
    companyName,
    email,
    regNumber,
    directorPhone,
    dateOfReg
  };
}

async function main() {
  const rootDir = './Media/CAC JOBS';
  const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.pdf'));

  const matchingFiles = files.filter(f => {
    const name = f.toLowerCase();
    return name.includes('application for registration') || name.includes('status report');
  });

  console.log(`Processing ${matchingFiles.length} PDF files...`);

  const resultsMap = new Map();

  for (let i = 0; i < matchingFiles.length; i++) {
    const f = matchingFiles[i];
    try {
      const dataBuffer = fs.readFileSync(path.join(rootDir, f));
      const pdf = new PDFParse({ data: dataBuffer });
      const parsedText = await pdf.getText();
      const extracted = parseCACData(parsedText.text, f);

      const key = extracted.companyName.toUpperCase();
      
      if (!resultsMap.has(key)) {
        resultsMap.set(key, { ...extracted, filename: f });
      } else {
        const existing = resultsMap.get(key);
        if (existing.regNumber === 'NIL / Pending' && extracted.regNumber !== 'NIL / Pending') {
          existing.regNumber = extracted.regNumber;
        }
        if (existing.email === 'NIL' && extracted.email !== 'NIL') {
          existing.email = extracted.email;
        }
        if (existing.directorPhone === 'NIL' && extracted.directorPhone !== 'NIL') {
          existing.directorPhone = extracted.directorPhone;
        }
        if (existing.dateOfReg === 'NIL' && extracted.dateOfReg !== 'NIL') {
          existing.dateOfReg = extracted.dateOfReg;
        }
      }
    } catch (err) {
      console.error(`Error processing ${f}:`, err.message);
    }
  }

  const allRecords = Array.from(resultsMap.values());

  // Priority: NGO (1), Limited (2), Business Name (3)
  const categoryOrder = { 'NGO': 1, 'Limited': 2, 'Business Name': 3 };

  allRecords.sort((a, b) => {
    const catDiff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
    if (catDiff !== 0) return catDiff;
    return a.companyName.localeCompare(b.companyName);
  });

  console.log(`\nTotal Companies Categorized & Sorted: ${allRecords.length}`);

  const ngoList = allRecords.filter(r => r.category === 'NGO');
  const ltdList = allRecords.filter(r => r.category === 'Limited');
  const bnList = allRecords.filter(r => r.category === 'Business Name');

  console.log(`\nCategory Breakdown:`);
  console.log(` 1. NGO (Incorporated Trustees / Foundations): ${ngoList.length}`);
  console.log(` 2. Limited (Company Limited by Shares / LTD / PLC): ${ltdList.length}`);
  console.log(` 3. Business Name (Enterprise / Sole Proprietorship / Ventures): ${bnList.length}`);

  // Save JSON
  const jsonPath = './cac_sorted_by_category.json';
  fs.writeFileSync(jsonPath, JSON.stringify(allRecords, null, 2));

  // Save CSV
  const csvHeaders = ['Category', 'Company Name', 'Email', 'Registration Number', 'Director Phone', 'Date of Registration', 'Source File'];
  const csvRows = allRecords.map(r => [
    `"${r.category}"`,
    `"${r.companyName.replace(/"/g, '""')}"`,
    `"${r.email.replace(/"/g, '""')}"`,
    `"${r.regNumber.replace(/"/g, '""')}"`,
    `"${r.directorPhone.replace(/"/g, '""')}"`,
    `"${r.dateOfReg.replace(/"/g, '""')}"`,
    `"${r.filename.replace(/"/g, '""')}"`
  ].join(','));

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  const csvPath = './cac_sorted_by_category.csv';
  fs.writeFileSync(csvPath, csvContent);

  console.log(`\nSaved sorted JSON to: ${jsonPath}`);
  console.log(`Saved sorted CSV to: ${csvPath}`);
}

main().catch(console.error);
