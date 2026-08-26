const fs = require('fs');
const path = require('path');

const monthMap = {
  'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
  'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12,
  'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4, 'JUNE': 6,
  'JULY': 7, 'AUGUST': 8, 'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12
};

const monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseRegDate(dateStr) {
  if (!dateStr || dateStr === 'NIL') {
    return { year: 9999, month: 99, day: 99, formattedMonth: 'NIL', sortKey: 99999999 };
  }

  // Format: "Apr 30, 2024" or "30/04/2024" or "30 April 2024"
  const m1 = dateStr.match(/([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
  if (m1) {
    const mStr = m1[1].toUpperCase();
    const mNum = monthMap[mStr] || 99;
    const day = parseInt(m1[2], 10);
    const year = parseInt(m1[3], 10);
    return {
      year,
      month: mNum,
      day,
      formattedMonth: monthNames[mNum] || m1[1],
      sortKey: year * 10000 + mNum * 100 + day
    };
  }

  const m2 = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
  if (m2) {
    const day = parseInt(m2[1], 10);
    const mStr = m2[2].toUpperCase();
    const mNum = monthMap[mStr] || 99;
    const year = parseInt(m2[3], 10);
    return {
      year,
      month: mNum,
      day,
      formattedMonth: monthNames[mNum] || m2[2],
      sortKey: year * 10000 + mNum * 100 + day
    };
  }

  const m3 = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (m3) {
    const day = parseInt(m3[1], 10);
    const mNum = parseInt(m3[2], 10);
    const year = parseInt(m3[3], 10);
    return {
      year,
      month: mNum,
      day,
      formattedMonth: monthNames[mNum] || `Month ${mNum}`,
      sortKey: year * 10000 + mNum * 100 + day
    };
  }

  const yearOnly = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearOnly) {
    const year = parseInt(yearOnly[1], 10);
    return { year, month: 99, day: 99, formattedMonth: 'Unknown', sortKey: year * 10000 + 9999 };
  }

  return { year: 9999, month: 99, day: 99, formattedMonth: 'NIL', sortKey: 99999999 };
}

function main() {
  const inputData = require('../cac_sorted_by_category.json');

  const enrichedData = inputData.map(item => {
    const parsedDate = parseRegDate(item.dateOfReg);
    return {
      ...item,
      regYear: parsedDate.year === 9999 ? 'NIL / Unknown' : parsedDate.year,
      regMonth: parsedDate.formattedMonth,
      monthNum: parsedDate.month,
      dayNum: parsedDate.day,
      sortKey: parsedDate.sortKey
    };
  });

  // Sort by Year ascending -> Month ascending -> Day ascending -> Company Name
  enrichedData.sort((a, b) => {
    if (a.sortKey !== b.sortKey) {
      return a.sortKey - b.sortKey;
    }
    return a.companyName.localeCompare(b.companyName);
  });

  // Group stats by Year & Month
  const yearGroupStats = {};
  enrichedData.forEach(item => {
    const yr = item.regYear;
    const mo = item.regMonth;
    if (!yearGroupStats[yr]) yearGroupStats[yr] = {};
    if (!yearGroupStats[yr][mo]) yearGroupStats[yr][mo] = 0;
    yearGroupStats[yr][mo]++;
  });

  console.log("=== YEAR & MONTH REGISTRATION BREAKDOWN ===");
  Object.keys(yearGroupStats).sort().forEach(yr => {
    console.log(`\n📅 YEAR: ${yr}`);
    Object.keys(yearGroupStats[yr]).forEach(mo => {
      console.log(`   └─ ${mo}: ${yearGroupStats[yr][mo]} registration(s)`);
    });
  });

  // Save JSON
  const jsonPath = './cac_sorted_by_year_month.json';
  fs.writeFileSync(jsonPath, JSON.stringify(enrichedData, null, 2));

  // Save CSV
  const csvHeaders = ['Year', 'Month', 'Date of Registration', 'Category', 'Company Name', 'Email', 'Registration Number', 'Director Phone', 'Source File'];
  const csvRows = enrichedData.map(r => [
    `"${r.regYear}"`,
    `"${r.regMonth}"`,
    `"${r.dateOfReg.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    `"${r.companyName.replace(/"/g, '""')}"`,
    `"${r.email.replace(/"/g, '""')}"`,
    `"${r.regNumber.replace(/"/g, '""')}"`,
    `"${r.directorPhone.replace(/"/g, '""')}"`,
    `"${r.filename.replace(/"/g, '""')}"`
  ].join(','));

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  const csvPath = './cac_sorted_by_year_month.csv';
  fs.writeFileSync(csvPath, csvContent);

  console.log(`\nSaved sorted JSON to: ${jsonPath}`);
  console.log(`Saved sorted CSV to: ${csvPath}`);
}

main();
