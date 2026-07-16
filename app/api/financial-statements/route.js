import { NextResponse } from 'next/server';
const db = require('@/lib/db');

// Accounting date parsing helper
function parseDate(dateStr) {
  return new Date(dateStr);
}

function getMonthsOwned(purchaseDateStr, yearEndStr) {
  const purchaseDate = new Date(purchaseDateStr);
  const yearEnd = new Date(yearEndStr);
  
  if (purchaseDate > yearEnd) return 0;
  
  const purchaseYear = purchaseDate.getFullYear();
  const endYear = yearEnd.getFullYear();
  
  if (purchaseYear < endYear) {
    return 12; // owned for the whole year
  } else if (purchaseYear === endYear) {
    const purchaseMonth = purchaseDate.getMonth(); // 0-indexed
    return 12 - purchaseMonth; // months owned in purchase year
  }
  return 0;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');

    let startDate, endDate, periodName;

    if (year) {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
      periodName = `Year ${year}`;
    } else if (customStart && customEnd) {
      startDate = customStart;
      endDate = customEnd;
      periodName = `${customStart} to ${customEnd}`;
    } else {
      // Default to 2024
      startDate = '2024-01-01';
      endDate = '2024-12-31';
      periodName = 'Year 2024';
    }

    const allTransactions = await db.getTransactions();
    const clients = await db.getClients();
    
    // 1. Filter transactions
    const priorTxs = allTransactions.filter(t => t.date < startDate);
    const periodTxs = allTransactions.filter(t => t.date >= startDate && t.date <= endDate);

    // Initial statement setup
    const INITIAL_BANK_STATEMENT_BALANCE = 100301.33; // June 13, 2023
    const SHARE_CAPITAL = 100301.33; // Seed share capital

    // 2. Cash & Bank Balances
    const priorIncome = priorTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const priorExpense = priorTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const openingCash = INITIAL_BANK_STATEMENT_BALANCE + priorIncome - priorExpense;

    const periodIncome = periodTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const periodExpense = periodTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const closingCash = openingCash + periodIncome - periodExpense;

    // 3. Fixed Assets Schedule & Depreciation calculation
    const allAssetPurchases = allTransactions.filter(t => t.category === 'Capital Expenditure');
    
    const assetRate = 0.20; // 20% straight line
    const assetsList = allAssetPurchases.map(t => {
      const name = t.description;
      let assetClass = 'Office Equipment';
      let rate = 0.20;
      if (name.toUpperCase().includes('COMPUTER') || name.toUpperCase().includes('LAPTOP') || name.toUpperCase().includes('PRINTER')) {
        assetClass = 'Computer Equipment';
      } else if (name.toUpperCase().includes('FURNITURE') || name.toUpperCase().includes('CHAIR') || name.toUpperCase().includes('DESK')) {
        assetClass = 'Furniture & Fittings';
        rate = 0.10;
      }

      const cost = parseFloat(t.amount);
      const purchaseDate = t.date;
      
      // Calculate opening accumulated depreciation (prior years)
      let openingAccDep = 0;
      const purchaseYear = new Date(purchaseDate).getFullYear();
      const currentStartYear = new Date(startDate).getFullYear();

      for (let y = purchaseYear; y < currentStartYear; y++) {
        const yearEndStr = `${y}-12-31`;
        const months = getMonthsOwned(purchaseDate, yearEndStr);
        if (months > 0) {
          const depForYear = cost * rate * (months / 12);
          if (openingAccDep + depForYear <= cost) {
            openingAccDep += depForYear;
          } else {
            openingAccDep = cost;
          }
        }
      }

      // Calculate depreciation for the current period
      let currentDep = 0;
      if (purchaseDate <= endDate) {
        const months = getMonthsOwned(purchaseDate, endDate);
        if (months > 0) {
          const fullYearMonths = purchaseDate < startDate ? 12 : getMonthsOwned(purchaseDate, endDate);
          currentDep = cost * rate * (fullYearMonths / 12);
          if (openingAccDep + currentDep > cost) {
            currentDep = cost - openingAccDep;
          }
        }
      }

      const closingAccDep = openingAccDep + currentDep;
      const nbv = cost - closingAccDep;
      const isPrior = purchaseDate < startDate;
      const isAddition = purchaseDate >= startDate && purchaseDate <= endDate;

      return {
        id: t.id,
        name,
        class: assetClass,
        cost,
        purchaseDate,
        isPrior,
        isAddition,
        openingAccDep,
        currentDep,
        closingAccDep,
        nbv
      };
    });

    const openingAssetsCost = assetsList.filter(a => a.isPrior).reduce((sum, a) => sum + a.cost, 0);
    const periodAssetAdditions = assetsList.filter(a => a.isAddition).reduce((sum, a) => sum + a.cost, 0);
    const closingAssetsCost = openingAssetsCost + periodAssetAdditions;

    const totalOpeningAccDep = assetsList.reduce((sum, a) => sum + a.openingAccDep, 0);
    const totalCurrentDep = assetsList.reduce((sum, a) => sum + a.currentDep, 0);
    const totalClosingAccDep = totalOpeningAccDep + totalCurrentDep;
    const closingNBV = closingAssetsCost - totalClosingAccDep;

    // 4. Statement of Profit or Loss
    const revenue = periodIncome;
    const costOfSales = periodTxs.filter(t => t.category === 'Direct Service Cost').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const grossProfit = revenue - costOfSales;

    // Operating expenses grouped by category
    const expenseTxs = periodTxs.filter(t => t.type === 'expense' && t.category !== 'Direct Service Cost' && t.category !== 'Capital Expenditure');
    const expensesByCategory = {};
    expenseTxs.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + parseFloat(t.amount);
    });

    const opexList = Object.entries(expensesByCategory).map(([category, amount]) => ({ category, amount }));
    const sumOpex = opexList.reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = sumOpex + totalCurrentDep;
    const netProfit = grossProfit - totalExpenses;

    // 5. Retained Earnings calculations
    const priorRevenue = priorIncome;
    const priorDirectCost = priorTxs.filter(t => t.category === 'Direct Service Cost').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const priorOpex = priorTxs.filter(t => t.type === 'expense' && t.category !== 'Direct Service Cost' && t.category !== 'Capital Expenditure').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const priorDepreciation = totalOpeningAccDep;
    
    const openingRetainedEarnings = priorRevenue - priorDirectCost - priorOpex - priorDepreciation;
    const closingRetainedEarnings = openingRetainedEarnings + netProfit;

    // Balance Sheet Check
    // Total Assets = closingCash + closingNBV
    // Total Equity = SHARE_CAPITAL + closingRetainedEarnings
    const totalAssets = closingCash + closingNBV;
    const totalEquity = SHARE_CAPITAL + closingRetainedEarnings;

    // 6. Cash Flow Statement
    const investingCashOut = -periodAssetAdditions;
    const netIncreaseInCash = periodIncome - periodExpense;

    // 7. General Ledger accounts & Trial Balance
    const trialBalance = [];
    
    // Add Cash & Bank
    trialBalance.push({ code: '1010', name: 'Cash & Bank Balance', debit: closingCash, credit: 0 });
    // Add Fixed Assets Cost
    trialBalance.push({ code: '1110', name: 'Fixed Assets Cost', debit: closingAssetsCost, credit: 0 });
    // Add Accumulated Depreciation
    trialBalance.push({ code: '1120', name: 'Accumulated Depreciation', debit: 0, credit: totalClosingAccDep });
    // Add Share Capital
    trialBalance.push({ code: '3010', name: 'Share Capital', debit: 0, credit: SHARE_CAPITAL });
    // Add Retained Earnings (Opening)
    trialBalance.push({ code: '3020', name: 'Retained Earnings', debit: 0, credit: closingRetainedEarnings });

    // General Ledger structure
    const generalLedger = {};
    const ledgerCodes = {
      'Cash & Bank Balance': '1010',
      'Fixed Assets Cost': '1110',
      'Accumulated Depreciation': '1120',
      'Share Capital': '3010',
      'Retained Earnings': '3020',
      'Service Revenue': '4010',
      'Direct Service Cost': '5010',
      'Bank Charges': '6010',
      'Communications & Utilities': '6020',
      'Electricity & Utilities': '6030',
      'Fuel & Oil': '6040',
      'Travel & Transport': '6050',
      'Salaries & Wages': '6060',
      'Office Refreshment': '6070',
      'Printing & Stationery': '6080',
      'Donations & Tithes': '6090',
      'Rent & Office': '6100',
      'Depreciation Expense': '6110',
      'General & Admin': '6120'
    };

    // Helper to post to General Ledger
    const postToLedger = (acctName, date, desc, debit, credit) => {
      const code = ledgerCodes[acctName] || '6120';
      if (!generalLedger[code]) {
        generalLedger[code] = { code, name: acctName, postings: [], balance: 0 };
      }
      generalLedger[code].postings.push({ date, description: desc, debit, credit });
    };

    // Post starting balances to Cash, Assets, Capital
    postToLedger('Cash & Bank Balance', startDate, 'Opening Balance', openingCash, 0);
    postToLedger('Fixed Assets Cost', startDate, 'Opening Cost', openingAssetsCost, 0);
    postToLedger('Accumulated Depreciation', startDate, 'Opening Accumulated Depreciation', 0, totalOpeningAccDep);
    postToLedger('Share Capital', startDate, 'Share Capital Seed', 0, SHARE_CAPITAL);
    postToLedger('Retained Earnings', startDate, 'Opening Retained Earnings', 0, openingRetainedEarnings);

    // Post all transactions of the period
    periodTxs.forEach(t => {
      const amountNum = parseFloat(t.amount);
      if (t.type === 'income') {
        postToLedger('Cash & Bank Balance', t.date, t.description, amountNum, 0);
        postToLedger('Service Revenue', t.date, t.description, 0, amountNum);
      } else {
        postToLedger('Cash & Bank Balance', t.date, t.description, 0, amountNum);
        if (t.category === 'Capital Expenditure') {
          postToLedger('Fixed Assets Cost', t.date, t.description, amountNum, 0);
        } else {
          postToLedger(t.category, t.date, t.description, amountNum, 0);
        }
      }
    });

    // Post Depreciation entry
    if (totalCurrentDep > 0) {
      postToLedger('Depreciation Expense', endDate, 'Depreciation Charge for Year', totalCurrentDep, 0);
      postToLedger('Accumulated Depreciation', endDate, 'Accumulated Depreciation Charge', 0, totalCurrentDep);
    }

    // Calculate ending balances of Ledger accounts
    Object.keys(generalLedger).forEach(code => {
      const acct = generalLedger[code];
      let bal = 0;
      acct.postings.forEach(p => {
        if (code.startsWith('1') || code.startsWith('5') || code.startsWith('6')) {
          bal += p.debit - p.credit; // Asset & Expense accounts are Debit balances
        } else {
          bal += p.credit - p.debit; // Equity, Liability, Revenue are Credit balances
        }
      });
      acct.balance = bal;
    });

    const ledgerList = Object.values(generalLedger).sort((a, b) => a.code.localeCompare(b.code));

    // Reconcile Chart of Accounts details
    const chartOfAccounts = Object.entries(ledgerCodes).map(([name, code]) => {
      let type = 'Expense';
      if (code.startsWith('1')) type = 'Asset';
      else if (code.startsWith('2')) type = 'Liability';
      else if (code.startsWith('3')) type = 'Equity';
      else if (code.startsWith('4')) type = 'Revenue';
      else if (code.startsWith('5')) type = 'Cost of Sales';
      return { code, name, type };
    }).sort((a, b) => a.code.localeCompare(b.code));

    // 8. Accountant's Working Papers
    const adjustingEntries = [];
    if (totalCurrentDep > 0) {
      adjustingEntries.push({
        date: endDate,
        debitAccount: '6110 - Depreciation Expense',
        creditAccount: '1120 - Accumulated Depreciation',
        amount: totalCurrentDep,
        narration: 'To record depreciation charge for the period.'
      });
    }

    const workingPapers = {
      adjustingEntries,
      bankReconciliation: {
        balanceAsPerLedger: closingCash,
        unpresentedCheques: 0,
        uncreditedDeposits: 0,
        balanceAsPerStatement: closingCash
      }
    };

    return NextResponse.json({
      periodName,
      startDate,
      endDate,
      financialSummary: {
        totalRevenue: revenue,
        costOfSales,
        grossProfit,
        sumOpex,
        depreciationCharge: totalCurrentDep,
        totalExpenses,
        netProfit
      },
      profitAndLoss: {
        revenue,
        costOfSales,
        grossProfit,
        opex: opexList,
        sumOpex,
        depreciation: totalCurrentDep,
        totalExpenses,
        netProfit
      },
      balanceSheet: {
        cashAndBank: closingCash,
        fixedAssetsCost: closingAssetsCost,
        accumulatedDepreciation: totalClosingAccDep,
        nbv: closingNBV,
        totalAssets,
        shareCapital: SHARE_CAPITAL,
        retainedEarnings: closingRetainedEarnings,
        totalEquity,
        isBalanced: Math.abs(totalAssets - totalEquity) < 0.01
      },
      cashFlow: {
        operating: {
          netProfit,
          depreciation: totalCurrentDep,
          netOperating: netProfit + totalCurrentDep
        },
        investing: {
          purchaseOfAssets: investingCashOut,
          netInvesting: investingCashOut
        },
        financing: {
          netFinancing: 0
        },
        netIncreaseInCash,
        openingCash,
        closingCash
      },
      fixedAssetsSchedule: assetsList,
      trialBalance,
      generalLedger: ledgerList,
      chartOfAccounts,
      notes: {
        accountingPolicies: 'The financial statements have been prepared on a cash-modified historical cost basis in accordance with simplified accounting guidelines for Small & Medium Enterprises. Non-current assets are depreciated on a straight-line basis over their estimated useful lives.',
        revenueNote: 'Revenues are processed directly from Access Bank account deposits. Key revenue streams correspond to Corporate Registrations and related consulting services.',
        opexNote: 'Operating expenses are captured from Access Bank statement debits and categorized using description matching filters.',
        fixedAssetsCost: closingAssetsCost,
        accumulatedDepreciation: totalClosingAccDep,
        cashAndBank: closingCash
      },
      workingPapers
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
