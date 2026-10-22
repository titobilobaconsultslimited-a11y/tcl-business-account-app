const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const originalDirectory = process.cwd();
const originalDatabaseUrl = process.env.DATABASE_URL;
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tcl-ledger-test-'));
delete process.env.DATABASE_URL;
process.chdir(temporaryDirectory);
const db = require('../lib/db');

test.after(() => {
  process.chdir(originalDirectory);
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
});

test('records invoice, receipt, and ledger amounts together and rejects overpayment', async () => {
  const phoneClient = await db.addClient({
    name: 'Phone normalization test',
    phone: '08031234567',
  });
  assert.equal(phoneClient.phone, '+2348031234567');

  const invoice = await db.addInvoice({
    invoice_number: 'TEST-ATOMIC-001',
    client_id: 'c1',
    issue_date: '2026-10-01',
    due_date: '2026-10-15',
    status: 'unpaid',
    discount: 0,
    tax: 0,
    total: 100,
    amount_paid: 20,
    cost_price: 0,
    bank_details: '',
    notes: '',
  }, [{
    service_id: null,
    description: 'Test service',
    quantity: 1,
    unit_price: 100,
    amount: 100,
  }]);

  await assert.rejects(
    db.addInvoice({
      invoice_number: 'TEST-ATOMIC-001',
      client_id: 'c1',
      issue_date: '2026-10-01',
      due_date: '2026-10-15',
      status: 'unpaid',
      discount: 0,
      tax: 0,
      total: 100,
      amount_paid: 0,
      cost_price: 0,
    }, []),
    error => error.code === 'INVOICE_NUMBER_TAKEN'
  );

  await db.recordInvoicePayment({
    invoiceId: invoice.id,
    amount: 30.005,
    paymentDate: '2026-10-02',
    paymentMethod: 'Bank Transfer',
    account: 'Bank',
  });

  await assert.rejects(
    db.recordInvoicePayment({
      invoiceId: invoice.id,
      amount: 50.02,
      paymentDate: '2026-10-03',
      paymentMethod: 'Bank Transfer',
      account: 'Bank',
    }),
    error => error.code === 'INVALID_PAYMENT'
  );

  const finalPayment = await db.recordInvoicePayment({
    invoiceId: invoice.id,
    amount: null,
    paymentDate: '2026-10-04',
    paymentMethod: 'Cash',
    account: 'Cash',
  });
  const savedInvoice = (await db.getInvoices()).find(item => item.id === invoice.id);
  const invoiceReceipts = (await db.getReceipts()).filter(item => item.invoice_id === invoice.id);
  const invoiceTransactions = (await db.getTransactions()).filter(item => item.description.includes(invoice.invoice_number));

  assert.equal(finalPayment.invoice.status, 'paid');
  assert.equal(Number(savedInvoice.amount_paid), 100);
  assert.equal(invoiceReceipts.reduce((sum, receipt) => sum + Number(receipt.amount), 0), 100);
  assert.equal(invoiceTransactions.filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0), 100);
  assert.equal(invoiceReceipts.find(receipt => receipt.payment_method === 'Cash').amount, 49.99);
});
