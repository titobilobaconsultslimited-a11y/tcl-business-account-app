'use client';

import { useState, useEffect, useRef } from 'react';

// --- INLINE SVG ICONS FOR ZERO-DEPENDENCY SPEED & SSR SAFETY ---
const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
const IconClients = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconServices = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>;
const IconTransactions = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconInvoices = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconReports = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconMail = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconAlert = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [dbType, setDbType] = useState('Local File');
  
  // Data State
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');

  // Modal Open States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState({ to: '', subject: '', body: '', filename: '', elementId: '' });
  const [emailSending, setEmailSending] = useState(false);

  // Form Inputs
  const [newTx, setNewTx] = useState({ type: 'income', category: 'Service Revenue', amount: '', date: new Date().toISOString().split('T')[0], description: '', account: 'Bank', client_id: '', service_id: '' });
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '', registration_type: '', registration_date: '', annual_returns_due_date: '', annual_returns_status: 'pending' });
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });
  
  // Annual Returns Tracker States
  const [arSubTab, setArSubTab] = useState('overdue');
  const [isARSyncModalOpen, setIsARSyncModalOpen] = useState(false);
  const [arSyncClient, setArSyncClient] = useState(null);
  const [arSyncLogLedger, setArSyncLogLedger] = useState(true);

  // Invoice Builder State
  const [invoiceClient, setInvoiceClient] = useState('');
  const [invoiceIssueDate, setInvoiceIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceDueDate, setInvoiceDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [invoiceItems, setInvoiceItems] = useState([{ service_id: '', description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [invoiceTax, setInvoiceTax] = useState(7.5); // Default 7.5%
  const [invoiceNotes, setInvoiceNotes] = useState('');
  
  // Receipt Viewer State
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceAmountPaid, setInvoiceAmountPaid] = useState(0);

  // Report Builder State
  const [reportMonth, setReportMonth] = useState('2026-04');

  // Chart Refs for destruction on re-render
  const incomeTrendChartRef = useRef(null);
  const expenseBreakdownChartRef = useRef(null);

  // Currency Formatter
  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(value);
  };

  // FETCH ALL DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resClients, resServices, resTransactions, resInvoices, resReceipts, resSettings] = await Promise.all([
        fetch('/api/clients').then(r => r.json()),
        fetch('/api/services').then(r => r.json()),
        fetch('/api/transactions').then(r => r.json()),
        fetch('/api/invoices').then(r => r.json()),
        fetch('/api/receipts').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      setClients(resClients);
      setServices(resServices);
      setTransactions(resTransactions);
      setInvoices(resInvoices);
      setReceipts(resReceipts);
      setSettings(resSettings);
      
      // Determine DB type
      if (resSettings.dbType) {
        setDbType(resSettings.dbType);
      }
      
      // Set Theme
      if (resSettings.theme) {
        setTheme(resSettings.theme);
        document.documentElement.setAttribute('data-theme', resSettings.theme);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // RENDER CHARTS
  useEffect(() => {
    if (activeTab === 'dashboard' && !loading && typeof window !== 'undefined' && window.Chart) {
      renderDashboardCharts();
    }
    return () => {
      destroyCharts();
    };
  }, [activeTab, loading, transactions]);

  const destroyCharts = () => {
    if (incomeTrendChartRef.current) {
      incomeTrendChartRef.current.destroy();
      incomeTrendChartRef.current = null;
    }
    if (expenseBreakdownChartRef.current) {
      expenseBreakdownChartRef.current.destroy();
      expenseBreakdownChartRef.current = null;
    }
  };

  const renderDashboardCharts = () => {
    destroyCharts();
    
    // Aggregate Monthly Income Trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);

    transactions.forEach(tx => {
      const dateObj = new Date(tx.date);
      const year = dateObj.getFullYear();
      // Only chart for year 2026 as designed
      if (year === 2026) {
        const monthIndex = dateObj.getMonth();
        if (tx.type === 'income') {
          monthlyIncome[monthIndex] += Number(tx.amount);
        } else {
          monthlyExpenses[monthIndex] += Number(tx.amount);
        }
      }
    });

    const isDark = theme === 'dark';
    const textColor = isDark ? '#94A3B8' : '#475569';
    const gridColor = isDark ? '#202B3E' : '#E2E8F0';

    // Chart 1: Income Trend
    const ctxIncome = document.getElementById('incomeTrendChart');
    if (ctxIncome) {
      incomeTrendChartRef.current = new window.Chart(ctxIncome, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Revenue',
              data: monthlyIncome,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.35
            },
            {
              label: 'Expenses',
              data: monthlyExpenses,
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              borderWidth: 2,
              fill: true,
              tension: 0.35,
              borderDash: [5, 5]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: textColor, font: { family: 'Outfit' } }
            }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: 'Outfit' } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { 
                color: textColor, 
                font: { family: 'Outfit' },
                callback: (value) => '₦' + (value >= 1000 ? (value / 1000) + 'k' : value)
              }
            }
          }
        }
      });
    }

    // Aggregate Expense Category Breakdown
    const expenseCategories = {};
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        expenseCategories[tx.category] = (expenseCategories[tx.category] || 0) + Number(tx.amount);
      }
    });

    const expenseLabels = Object.keys(expenseCategories);
    const expenseValues = Object.values(expenseCategories);

    // Chart 2: Expense Breakdown
    const ctxExpense = document.getElementById('expenseBreakdownChart');
    if (ctxExpense && expenseLabels.length > 0) {
      expenseBreakdownChartRef.current = new window.Chart(ctxExpense, {
        type: 'doughnut',
        data: {
          labels: expenseLabels,
          datasets: [{
            data: expenseValues,
            backgroundColor: [
              '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#64748B'
            ],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#131B2A' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: textColor, font: { family: 'Outfit', size: 11 } }
            }
          }
        }
      });
    }
  };

  // TRIGGER THEME TOGGLE
  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    
    // Save to settings db
    try {
      const updated = { ...settings, theme: nextTheme };
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setSettings(updated);
    } catch (err) {
      console.error('Failed to save theme setting:', err);
    }
  };

  // --- ADD DATA OPERATIONS ---
  const handleAddTx = async (e) => {
    e.preventDefault();
    try {
      const selectedService = services.find(s => s.id === newTx.service_id);
      const dataToSend = {
        ...newTx,
        category: newTx.type === 'income' ? 'Service Revenue' : newTx.category,
        description: newTx.type === 'income' && selectedService 
          ? `Service rendered: ${selectedService.name} ${newTx.description ? '- ' + newTx.description : ''}`
          : newTx.description
      };
      
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (res.ok) {
        setIsTxModalOpen(false);
        setNewTx({ type: 'income', category: 'Service Revenue', amount: '', date: new Date().toISOString().split('T')[0], description: '', account: 'Bank', client_id: '', service_id: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateInitialDue = (type, regDateStr) => {
    if (!type || !regDateStr) return '';
    const date = new Date(regDateStr);
    const months = type === 'Business Name' ? 18 : 12;
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleNewClientTypeChange = (type) => {
    const dueDate = calculateInitialDue(type, newClient.registration_date);
    setNewClient({
      ...newClient,
      registration_type: type,
      annual_returns_due_date: dueDate
    });
  };

  const handleNewClientDateChange = (dateStr) => {
    const dueDate = calculateInitialDue(newClient.registration_type, dateStr);
    setNewClient({
      ...newClient,
      registration_date: dateStr,
      annual_returns_due_date: dueDate
    });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      if (res.ok) {
        setIsClientModalOpen(false);
        setNewClient({ name: '', email: '', phone: '', address: '', registration_type: '', registration_date: '', annual_returns_due_date: '', annual_returns_status: 'pending' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        setIsServiceModalOpen(false);
        setNewService({ name: '', price: '', description: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (id) => {
    if (confirm('Are you sure you want to delete this client? Invoices and transactions will remain but references will be removed.')) {
      await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleDeleteService = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleDeleteTx = async (id) => {
    if (confirm('Delete this transaction? This will affect your reports and balance calculations.')) {
      await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (confirm('Are you sure you want to delete this invoice? Related receipt and auto-payment will not be deleted, but the invoice record will be gone.')) {
      await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  // --- INVOICE WORKSPACE ACTIONS ---
  const handleInvoiceItemChange = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = value;
    
    if (field === 'service_id') {
      const service = services.find(s => s.id === value);
      if (service) {
        updated[index].unit_price = Number(service.price);
        updated[index].description = service.name;
        
        if (service.name === 'CAC Registration') {
          updated[index].subtype = 'Business Name';
          updated[index].unit_price = 40000;
          updated[index].description = 'CAC Registration: Business Name';
          updated[index].cost_price = 0;
        } else {
          updated[index].subtype = '';
          updated[index].cost_price = 0;
        }
      } else {
        updated[index].subtype = '';
        updated[index].cost_price = 0;
        updated[index].unit_price = 0;
        updated[index].description = '';
      }
    }
    
    updated[index].amount = Number(updated[index].quantity) * Number(updated[index].unit_price);
    setInvoiceItems(updated);
  };

  const handleInvoiceItemSubtypeChange = (index, subtype) => {
    const updated = [...invoiceItems];
    updated[index].subtype = subtype;
    
    if (subtype === 'Business Name') {
      updated[index].unit_price = 40000;
      updated[index].description = 'CAC Registration: Business Name';
    } else if (subtype === 'NGO') {
      updated[index].unit_price = 150000;
      updated[index].description = 'CAC Registration: NGO';
    } else if (subtype === 'Limited Company') {
      updated[index].unit_price = 100000;
      updated[index].description = 'CAC Registration: Limited Company';
    }
    
    updated[index].amount = Number(updated[index].quantity) * Number(updated[index].unit_price);
    setInvoiceItems(updated);
  };

  const addInvoiceItemRow = () => {
    setInvoiceItems([...invoiceItems, { service_id: '', subtype: '', cost_price: 0, description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeInvoiceItemRow = (index) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  // Invoice calculations
  const invoiceSubtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  const invoiceTaxAmount = (invoiceSubtotal - invoiceDiscount) * (invoiceTax / 100);
  const invoiceTotal = invoiceSubtotal - invoiceDiscount + invoiceTaxAmount;

  // Auto-generate invoice number
  const getNextInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    const padded = String(count).padStart(3, '0');
    return `TCL-${year}-${padded}`;
  };

  const getAnnualReturnDetails = (client) => {
    if (!client || !client.registration_type || !client.annual_returns_due_date) return null;
    const type = client.registration_type;
    const dueDateStr = client.annual_returns_due_date;
    
    const filingFee = type === 'NGO' ? 10000 : 5500;
    const serviceFee = 3000;
    let penalty = 0;
    
    const today = new Date();
    const due = new Date(dueDateStr);
    
    const isOverdue = today > due;
    
    if (isOverdue) {
      const dueYear = due.getFullYear();
      if (type === 'Business Name') {
        const penaltyDate = new Date(`${dueYear}-05-30`);
        if (today > penaltyDate) {
          penalty = 5000;
        }
      } else {
        const penaltyDate = new Date(`${dueYear + 1}-01-01`);
        if (today > penaltyDate) {
          penalty = 5000;
        }
      }
    }
    
    return {
      filingFee,
      serviceFee,
      penalty,
      total: filingFee + serviceFee + penalty,
      isOverdue
    };
  };

  const addOneYear = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const triggerARSyncModal = (client) => {
    setArSyncClient(client);
    setIsARSyncModalOpen(true);
  };

  const handleCompleteAnnualReturn = async () => {
    if (!arSyncClient) return;
    const details = getAnnualReturnDetails(arSyncClient);
    const nextDue = addOneYear(arSyncClient.annual_returns_due_date);
    
    if (arSyncLogLedger && details) {
      try {
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'income',
            category: 'Service Revenue',
            amount: Number(details.total),
            date: new Date().toISOString().split('T')[0],
            description: `Annual Returns Filing - ${arSyncClient.name} (For Due Date ${arSyncClient.annual_returns_due_date})`,
            account: 'Bank',
            client_id: arSyncClient.id
          })
        });
      } catch (err) {
        console.error('Failed to log annual return payment in ledger:', err);
      }
    }
    
    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...arSyncClient,
          annual_returns_due_date: nextDue,
          annual_returns_status: 'pending'
        })
      });
      
      if (res.ok) {
        alert('Annual returns completed successfully and moved to next due date!');
        setIsARSyncModalOpen(false);
        setArSyncClient(null);
        fetchData();
      } else {
        const error = await res.json();
        alert('Error updating client: ' + error.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async (status = 'unpaid') => {
    if (!invoiceClient) {
      alert('Please select a client first');
      return;
    }
    
    const invoiceNum = getNextInvoiceNumber();
    
    // Determine status based on payment or button
    let finalStatus = status;
    let finalAmountPaid = invoiceAmountPaid;
    if (status === 'paid') {
      finalAmountPaid = invoiceTotal;
      finalStatus = 'paid';
    } else if (invoiceAmountPaid >= invoiceTotal) {
      finalStatus = 'paid';
    }

    const totalCostPrice = invoiceItems.reduce((sum, item) => sum + Number(item.cost_price || 0), 0);
    
    const invoiceData = {
      invoice_number: invoiceNum,
      client_id: invoiceClient,
      issue_date: invoiceIssueDate,
      due_date: invoiceDueDate,
      status: finalStatus,
      discount: invoiceDiscount,
      tax: invoiceTax,
      total: invoiceTotal,
      amount_paid: finalAmountPaid,
      cost_price: totalCostPrice,
      bank_details: settings.bankDetails || '',
      notes: invoiceNotes,
      items: invoiceItems.map(item => ({
        service_id: item.service_id || null,
        subtype: item.subtype || null,
        cost_price: Number(item.cost_price || 0),
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        amount: Number(item.amount)
      }))
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (res.ok) {
        alert(`Invoice ${invoiceNum} created successfully!`);
        // Reset builder
        setInvoiceClient('');
        setInvoiceItems([{ service_id: '', subtype: '', cost_price: 0, description: '', quantity: 1, unit_price: 0, amount: 0 }]);
        setInvoiceDiscount(0);
        setInvoiceAmountPaid(0);
        setInvoiceNotes('');
        fetchData();
        setActiveTab('invoices');
      } else {
        const error = await res.json();
        alert('Error creating invoice: ' + error.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkInvoiceAsPaid = async (invoiceId) => {
    const paymentDate = new Date().toISOString().split('T')[0];
    try {
      const res = await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoiceId,
          status: 'paid',
          payment_date: paymentDate,
          payment_method: 'Bank Transfer',
          account: 'Bank'
        })
      });

      if (res.ok) {
        alert('Invoice marked as paid! Receipt generated and income logged.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- PDF DOWNLOAD (html2pdf) ---
  const downloadPdf = (elementId, filename) => {
    if (typeof window === 'undefined' || !window.html2pdf) {
      alert('PDF module is loading, please wait a moment...');
      return;
    }
    const element = document.getElementById(elementId);
    const opt = {
      margin:       [0.4, 0.4, 0.4, 0.4],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(element).save();
  };

  // --- EMAIL PDF SENDING ---
  const triggerEmailModal = (elementId, filename, defaultEmail, type = 'Invoice') => {
    setEmailDetails({
      to: defaultEmail || '',
      subject: `${type} from Titobiloba Consults Limited`,
      body: `Hello,\n\nPlease find attached your ${type.toLowerCase()} details. Thank you for your continued business.\n\nBest regards,\nTitobiloba Consults Limited`,
      filename,
      elementId,
      type
    });
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (typeof window === 'undefined' || !window.html2pdf) {
      alert('PDF module is loading, please wait...');
      return;
    }

    setEmailSending(true);
    const element = document.getElementById(emailDetails.elementId);
    const opt = {
      margin:       [0.4, 0.4, 0.4, 0.4],
      filename:     emailDetails.filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      // Generate PDF string in browser
      const pdfBase64 = await window.html2pdf().set(opt).from(element).outputPdf('datauristring');
      
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailDetails.to,
          subject: emailDetails.subject,
          htmlBody: `<p>${emailDetails.body.replace(/\n/g, '<br>')}</p>`,
          filename: emailDetails.filename,
          pdfBase64: pdfBase64
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert('Email sent successfully with PDF attached!');
        setIsEmailModalOpen(false);
      } else {
        alert('Error sending email: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process and send email: ' + err.message);
    } finally {
      setEmailSending(false);
    }
  };

  // --- SETTINGS FORM SAVE ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- STATS COMPUTATIONS ---
  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const outstandingPayments = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + (Number(inv.total) - Number(inv.amount_paid || 0)), 0);

  // Accounts Summaries
  const accountBalances = { Bank: 0, Cash: 0, 'Mobile Money': 0 };
  transactions.forEach(t => {
    const amt = Number(t.amount);
    if (t.type === 'income') {
      accountBalances[t.account] = (accountBalances[t.account] || 0) + amt;
    } else {
      accountBalances[t.account] = (accountBalances[t.account] || 0) - amt;
    }
  });

  // Analytics Calculations
  const getAnalyticsInsights = () => {
    const list = [];
    
    // Revenue percentage change (April vs March 2026 example)
    let marchRevenue = 0;
    let aprilRevenue = 0;
    transactions.forEach(t => {
      if (t.type === 'income' && t.date.startsWith('2026-03')) marchRevenue += Number(t.amount);
      if (t.type === 'income' && t.date.startsWith('2026-04')) aprilRevenue += Number(t.amount);
    });

    if (marchRevenue > 0) {
      const change = ((aprilRevenue - marchRevenue) / marchRevenue) * 100;
      if (change > 0) {
        list.push({ text: `Revenue increased by <strong>${change.toFixed(0)}%</strong> in April compared to March 2026.`, type: 'success' });
      } else {
        list.push({ text: `Revenue decreased by <strong>${Math.abs(change).toFixed(0)}%</strong> in April.`, type: 'warning' });
      }
    }

    // Top Selling Service
    const serviceRevenue = {};
    transactions.forEach(t => {
      if (t.type === 'income' && t.service_id) {
        const s = services.find(srv => srv.id === t.service_id);
        if (s) {
          serviceRevenue[s.name] = (serviceRevenue[s.name] || 0) + Number(t.amount);
        }
      }
    });

    let topService = '';
    let topServiceAmt = 0;
    Object.entries(serviceRevenue).forEach(([name, amt]) => {
      if (amt > topServiceAmt) {
        topService = name;
        topServiceAmt = amt;
      }
    });

    if (topService) {
      list.push({ text: `<strong>${topService}</strong> generated the highest service revenue: <strong>${formatMoney(topServiceAmt)}</strong>.`, type: 'success' });
    }

    // Top Expense Category
    const expenseCats = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        expenseCats[t.category] = (expenseCats[t.category] || 0) + Number(t.amount);
      }
    });

    let topExpenseCat = '';
    let topExpenseAmt = 0;
    Object.entries(expenseCats).forEach(([cat, amt]) => {
      if (amt > topExpenseAmt) {
        topExpenseCat = cat;
        topExpenseAmt = amt;
      }
    });

    if (topExpenseCat) {
      list.push({ text: `<strong>${topExpenseCat}</strong> was your highest expense category: <strong>${formatMoney(topExpenseAmt)}</strong>.`, type: 'danger' });
    }

    // Outstanding Invoices count
    const unpaidCount = invoices.filter(inv => inv.status === 'unpaid').length;
    if (unpaidCount > 0) {
      list.push({ text: `You have <strong>${unpaidCount} unpaid invoices</strong> outstanding, totaling <strong>${formatMoney(outstandingPayments)}</strong>.`, type: 'warning' });
    } else {
      list.push({ text: `All invoices have been settled. No outstanding invoices!`, type: 'success' });
    }

    // Client counts
    const activeClientsCount = clients.length;
    list.push({ text: `You have <strong>${activeClientsCount} registered clients</strong> in your ledger database.`, type: 'info' });

    return list;
  };

  // --- REPORT GENERATOR FILTERING ---
  const generateMonthlyReportData = () => {
    const [year, month] = reportMonth.split('-');
    const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleString('default', { month: 'long' });
    
    // Filter transactions for that specific month & year
    const monthTxs = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getFullYear() === parseInt(year) && (txDate.getMonth() + 1) === parseInt(month);
    });

    const monthRevenue = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const monthExpenses = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const monthNetProfit = monthRevenue - monthExpenses;

    // Revenue by service
    const serviceBreakdown = {};
    monthTxs.forEach(t => {
      if (t.type === 'income' && t.service_id) {
        const s = services.find(srv => srv.id === t.service_id);
        const name = s ? s.name : 'Other Services';
        serviceBreakdown[name] = (serviceBreakdown[name] || 0) + Number(t.amount);
      } else if (t.type === 'income') {
        serviceBreakdown['Miscellaneous Revenue'] = (serviceBreakdown['Miscellaneous Revenue'] || 0) + Number(t.amount);
      }
    });

    // Expenses by category
    const expenseBreakdown = {};
    monthTxs.forEach(t => {
      if (t.type === 'expense') {
        expenseBreakdown[t.category] = (expenseBreakdown[t.category] || 0) + Number(t.amount);
      }
    });

    // Invoices generated in this month
    const monthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.issue_date);
      return invDate.getFullYear() === parseInt(year) && (invDate.getMonth() + 1) === parseInt(month);
    });

    const outstandingInves = monthInvoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + Number(inv.total), 0);

    return {
      monthName,
      year,
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthNetProfit,
      services: Object.entries(serviceBreakdown),
      expensesCats: Object.entries(expenseBreakdown),
      invoicesCount: monthInvoices.length,
      outstanding: outstandingInves,
      txCount: monthTxs.length
    };
  };

  const reportData = generateMonthlyReportData();

  // --- FILTERED TRANSACTIONS LEDGER ---
  const filteredTransactions = transactions.filter(t => {
    // Search filter
    const matchesSearch = t.description.toLowerCase().includes(txSearch.toLowerCase()) || 
                          t.category.toLowerCase().includes(txSearch.toLowerCase()) ||
                          t.account.toLowerCase().includes(txSearch.toLowerCase());
    
    // Type filter
    const matchesType = txTypeFilter === 'all' ? true : t.type === txTypeFilter;

    // Category filter
    const matchesCategory = txCategoryFilter === 'all' ? true : t.category === txCategoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getARBadgeCount = () => {
    let count = 0;
    const today = new Date();
    clients.forEach(c => {
      if (c.registration_type && c.annual_returns_due_date && c.annual_returns_status === 'pending') {
        const due = new Date(c.annual_returns_due_date);
        if (today > due || (due - today) <= 60 * 24 * 60 * 60 * 1000) {
          count++;
        }
      }
    });
    return count;
  };
  const arBadgeCount = getARBadgeCount();

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <img src="/logo.jpeg" alt="TCL Logo" className="logo-img" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
          <span>TCL Portal</span>
        </div>
        
        <ul className="sidebar-nav">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('dashboard')}>
              <IconDashboard /> Dashboard
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('clients')}>
              <IconClients /> Clients & Services
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('transactions')}>
              <IconTransactions /> Transactions
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('invoices')}>
              <IconInvoices /> Invoices & Receipts
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'annual_returns' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('annual_returns')} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <IconCalendar />
              <span style={{ marginLeft: '12px' }}>Annual Returns</span>
              {arBadgeCount > 0 && (
                <span style={{ 
                  marginLeft: 'auto', 
                  backgroundColor: 'var(--accent-red)', 
                  color: 'white', 
                  fontSize: '0.7rem', 
                  fontWeight: '700', 
                  padding: '2px 6px', 
                  borderRadius: '10px'
                }}>
                  {arBadgeCount}
                </span>
              )}
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('reports')}>
              <IconReports /> Monthly Reports
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('settings')}>
              <IconSettings /> Settings
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="db-badge">
            <span>Database:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className={`db-indicator ${dbType === 'PostgreSQL' ? 'pg' : 'local'}`} />
              <strong>{dbType}</strong>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="app-main">
        {/* HEADER */}
        <header className="app-header">
          <div className="header-title">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}</h1>
          </div>
          <div className="header-actions">
            <span className="date-indicator">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <div className="content-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '12px' }}>
              <div className="db-indicator pg" style={{ width: '16px', height: '16px' }} />
              <p>Loading database records...</p>
            </div>
          ) : (
            <div className="tab-content">
              {/* TAB 1: OVERVIEW DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="dashboard-grid">
                  <div className="stats-row">
                    <div className="stat-card revenue">
                      <div className="stat-header">
                        <span className="stat-title">Total Revenue</span>
                        <div className="stat-icon"><IconTransactions /></div>
                      </div>
                      <span className="stat-value">{formatMoney(totalRevenue)}</span>
                      <span className="stat-meta positive">Seeded <span>2026 Earnings</span></span>
                    </div>

                    <div className="stat-card expenses">
                      <div className="stat-header">
                        <span className="stat-title">Total Expenses</span>
                        <div className="stat-icon" style={{color: '#EF4444'}}><IconTrash /></div>
                      </div>
                      <span className="stat-value">{formatMoney(totalExpenses)}</span>
                      <span className="stat-meta">Fuel, Logistics, Marketing</span>
                    </div>

                    <div className="stat-card profit">
                      <div className="stat-header">
                        <span className="stat-title">Net Profit</span>
                        <div className="stat-icon" style={{color: '#3B82F6'}}><IconReports /></div>
                      </div>
                      <span className="stat-value">{formatMoney(netProfit)}</span>
                      <span className="stat-meta positive">Margin: <span>{((netProfit / totalRevenue) * 100).toFixed(0)}%</span></span>
                    </div>

                    <div className="stat-card outstanding">
                      <div className="stat-header">
                        <span className="stat-title">Outstanding Payments</span>
                        <div className="stat-icon" style={{color: '#F59E0B'}}><IconInvoices /></div>
                      </div>
                      <span className="stat-value">{formatMoney(outstandingPayments)}</span>
                      <span className="stat-meta">Pending client settlements</span>
                    </div>
                  </div>

                  <div className="analytics-row">
                    <div className="chart-card">
                      <div className="card-header">
                        <span className="card-title">Monthly Income & Expense Trend (2026)</span>
                      </div>
                      <div className="chart-container">
                        <canvas id="incomeTrendChart" />
                      </div>
                    </div>

                    <div className="list-card">
                      <div className="card-header">
                        <span className="card-title">Smart Business Analytics</span>
                      </div>
                      <div className="insights-list">
                        {getAnalyticsInsights().map((insight, idx) => (
                          <div key={idx} className={`insight-item ${insight.type === 'warning' ? 'warning' : insight.type === 'danger' ? 'danger' : ''}`}>
                            <div className="insight-icon">
                              <IconAlert />
                            </div>
                            <div className="insight-text" dangerouslySetInnerHTML={{ __html: insight.text }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="analytics-row">
                    <div className="chart-card">
                      <div className="card-header">
                        <span className="card-title">Expense Breakdown by Category</span>
                      </div>
                      <div className="chart-container">
                        <canvas id="expenseBreakdownChart" />
                      </div>
                    </div>

                    <div className="list-card">
                      <div className="card-header">
                        <span className="card-title">Account Balances</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                        {Object.entries(accountBalances).map(([name, bal]) => (
                          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                            <span style={{ fontWeight: '500' }}>{name} Account</span>
                            <strong style={{ color: bal >= 0 ? 'var(--primary-color)' : 'var(--accent-red)' }}>{formatMoney(bal)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLIENTS & SERVICES */}
              {activeTab === 'clients' && (
                <div className="dual-grid">
                  {/* Clients List */}
                  <div className="table-card">
                    <div className="table-controls">
                      <h3>Registered Clients</h3>
                      <button className="btn btn-primary btn-sm" onClick={() => setIsClientModalOpen(true)}>
                        <IconPlus /> Add Client
                      </button>
                    </div>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Address</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clients.map(c => (
                            <tr key={c.id}>
                              <td><strong>{c.name}</strong></td>
                              <td>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.email}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                              </td>
                              <td style={{ whiteSpace: 'normal', maxWidth: '180px' }}>{c.address}</td>
                              <td>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClient(c.id)}>
                                  <IconTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="table-card">
                    <div className="table-controls">
                      <h3>Service Price-list</h3>
                      <button className="btn btn-primary btn-sm" onClick={() => setIsServiceModalOpen(true)}>
                        <IconPlus /> Add Service
                      </button>
                    </div>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Service</th>
                            <th>Default Rate</th>
                            <th>Description</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map(s => (
                            <tr key={s.id}>
                              <td><strong>{s.name}</strong></td>
                              <td><strong style={{color: 'var(--primary-color)'}}>{formatMoney(s.price)}</strong></td>
                              <td style={{ whiteSpace: 'normal', maxWidth: '200px' }}>{s.description}</td>
                              <td>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteService(s.id)}>
                                  <IconTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="table-card">
                  <div className="table-controls">
                    <div className="search-box">
                      <div className="search-icon"><IconSearch /></div>
                      <input 
                        type="text" 
                        placeholder="Search ledger..." 
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                      />
                    </div>
                    
                    <div className="filter-box">
                      <select value={txTypeFilter} onChange={(e) => setTxTypeFilter(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expense Only</option>
                      </select>
                      
                      <select value={txCategoryFilter} onChange={(e) => setTxCategoryFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        <option value="Service Revenue">Service Revenue</option>
                        <option value="Transport">Transport</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Internet">Internet</option>
                        <option value="Office Supplies">Office Supplies</option>
                      </select>
                    </div>

                    <button className="btn btn-primary" onClick={() => setIsTxModalOpen(true)}>
                      <IconPlus /> Log Transaction
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Description</th>
                          <th>Account</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map(t => (
                          <tr key={t.id}>
                            <td>{t.date}</td>
                            <td>
                              <span className={`badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                                {t.category}
                              </span>
                            </td>
                            <td style={{ whiteSpace: 'normal', maxWidth: '300px' }}>{t.description}</td>
                            <td>{t.account}</td>
                            <td>
                              <strong style={{ color: t.type === 'income' ? 'var(--primary-color)' : 'var(--accent-red)' }}>
                                {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                              </strong>
                            </td>
                            <td>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTx(t.id)}>
                                <IconTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: INVOICES & RECEIPTS */}
              {activeTab === 'invoices' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Selected Invoice View Overlay */}
                  {selectedInvoice && (
                    <div className="modal-overlay">
                      <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                          <span className="modal-title">Invoice Workspace</span>
                          <button className="modal-close" onClick={() => setSelectedInvoice(null)}>×</button>
                        </div>
                        <div className="modal-body" style={{ backgroundColor: '#F8FAFC' }}>
                          <div id="invoice-print-area" className="invoice-print-layout">
                            <div className="print-header">
                              <div className="print-logo-section" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <img src="/logo.jpeg" alt="TCL Logo" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                                <div>
                                  <span className="print-company-name">{settings.companyName || 'Titobiloba Consults Limited'}</span>
                                  <div style={{fontSize: '0.8rem', color: '#64748B'}}>{settings.companyAddress}</div>
                                  <div style={{fontSize: '0.8rem', color: '#64748B'}}>Phone: {settings.companyPhone}</div>
                                </div>
                              </div>
                              <div style={{textAlign: 'right'}}>
                                <h1 className="print-invoice-title" style={{color: '#059669'}}>INVOICE</h1>
                                <div className="print-invoice-num">{selectedInvoice.invoice_number}</div>
                              </div>
                            </div>
                            
                            <div className="print-details-grid">
                              <div>
                                <h3 style={{fontSize: '0.9rem', color: '#64748B', marginBottom: '8px'}}>BILLED TO:</h3>
                                <strong>{clients.find(c => c.id === selectedInvoice.client_id)?.name || 'Valued Client'}</strong>
                                <p style={{fontSize: '0.85rem'}}>{clients.find(c => c.id === selectedInvoice.client_id)?.address}</p>
                                <p style={{fontSize: '0.85rem'}}>{clients.find(c => c.id === selectedInvoice.client_id)?.email}</p>
                              </div>
                              <div>
                                <table className="print-meta-table">
                                  <tbody>
                                    <tr>
                                      <td>Issue Date:</td>
                                      <td>{selectedInvoice.issue_date}</td>
                                    </tr>
                                    <tr>
                                      <td>Due Date:</td>
                                      <td>{selectedInvoice.due_date}</td>
                                    </tr>
                                    <tr>
                                      <td>Status:</td>
                                      <td>
                                        <span style={{ fontWeight: 'bold', color: selectedInvoice.status === 'paid' ? '#059669' : '#EF4444' }}>
                                          {selectedInvoice.status.toUpperCase()}
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            <table className="print-table">
                              <thead>
                                <tr>
                                  <th>Description</th>
                                  <th style={{textAlign: 'center'}}>Qty</th>
                                  <th style={{textAlign: 'right'}}>Rate</th>
                                  <th style={{textAlign: 'right'}}>Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedInvoice.items?.map((item, idx) => (
                                  <tr key={idx}>
                                    <td>{item.description}</td>
                                    <td style={{textAlign: 'center'}}>{item.quantity}</td>
                                    <td style={{textAlign: 'right'}}>{formatMoney(item.unit_price)}</td>
                                    <td style={{textAlign: 'right'}}>{formatMoney(item.amount)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.9rem' }}>
                              <table className="print-totals-table">
                                <tbody>
                                  <tr>
                                    <td>Subtotal:</td>
                                    <td style={{textAlign: 'right'}}>{formatMoney(selectedInvoice.items?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)}</td>
                                  </tr>
                                  {Number(selectedInvoice.discount) > 0 && (
                                    <tr>
                                      <td>Discount:</td>
                                      <td style={{textAlign: 'right'}}>-{formatMoney(selectedInvoice.discount)}</td>
                                    </tr>
                                  )}
                                  {Number(selectedInvoice.tax) > 0 && (
                                    <tr>
                                      <td>Tax ({selectedInvoice.tax}%):</td>
                                      <td style={{textAlign: 'right'}}>{formatMoney(((selectedInvoice.items?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - Number(selectedInvoice.discount || 0)) * (Number(selectedInvoice.tax) / 100))}</td>
                                    </tr>
                                  )}
                                  <tr className="grand-total">
                                    <td style={{fontWeight: '700'}}>Grand Total (Billed):</td>
                                    <td style={{textAlign: 'right', fontWeight: '700'}}>{formatMoney(selectedInvoice.total)}</td>
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                    <td>Amount Paid:</td>
                                    <td style={{textAlign: 'right', fontWeight: '600', color: '#059669'}}>{formatMoney(selectedInvoice.amount_paid || 0)}</td>
                                  </tr>
                                  <tr style={{ fontWeight: '700' }}>
                                    <td style={{ color: Number(selectedInvoice.total) - Number(selectedInvoice.amount_paid || 0) > 0 ? '#D97706' : '#64748B' }}>Balance Owing:</td>
                                    <td style={{textAlign: 'right', fontWeight: '700', color: Number(selectedInvoice.total) - Number(selectedInvoice.amount_paid || 0) > 0 ? '#D97706' : '#64748B'}}>{formatMoney(Math.max(0, Number(selectedInvoice.total) - Number(selectedInvoice.amount_paid || 0)))}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div style={{ fontSize: '0.85rem', backgroundColor: '#F8FAFC', padding: '16px', border: '1px solid #E2E8F0', borderRadius: '6px', marginTop: '30px' }}>
                              <strong>Bank details for settlement:</strong>
                              <p>{selectedInvoice.bank_details || settings.bankDetails || 'Access Bank - Titobiloba Consults Ltd - 0123456789'}</p>
                            </div>
                            
                            {selectedInvoice.notes && (
                              <div style={{ fontSize: '0.85rem', marginTop: '16px', color: '#64748B' }}>
                                <strong>Notes:</strong> {selectedInvoice.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="modal-footer" style={{ backgroundColor: 'var(--panel-bg)' }}>
                          <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Close</button>
                          <button className="btn btn-secondary" onClick={() => triggerEmailModal(
                            'invoice-print-area',
                            `Invoice-${selectedInvoice.invoice_number}.pdf`,
                            clients.find(c => c.id === selectedInvoice.client_id)?.email,
                            'Invoice'
                          )}>
                            <IconMail /> Send Email
                          </button>
                          <button className="btn btn-primary" onClick={() => downloadPdf('invoice-print-area', `Invoice-${selectedInvoice.invoice_number}.pdf`)}>
                            <IconDownload /> Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Receipt View Overlay */}
                  {selectedReceipt && (
                    <div className="modal-overlay">
                      <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                          <span className="modal-title">Receipt Workspace</span>
                          <button className="modal-close" onClick={() => setSelectedReceipt(null)}>×</button>
                        </div>
                        <div className="modal-body" style={{ backgroundColor: '#F8FAFC' }}>
                          <div id="receipt-print-area" className="invoice-print-layout">
                            <div className="print-header">
                              <div className="print-logo-section" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <img src="/logo.jpeg" alt="TCL Logo" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                                <div>
                                  <span className="print-company-name">{settings.companyName || 'Titobiloba Consults Limited'}</span>
                                  <div style={{fontSize: '0.8rem', color: '#64748B'}}>{settings.companyAddress}</div>
                                  <div style={{fontSize: '0.8rem', color: '#64748B'}}>Phone: {settings.companyPhone}</div>
                                </div>
                              </div>
                              <div>
                                <h1 className="print-invoice-title" style={{color: '#059669'}}>PAYMENT RECEIPT</h1>
                                <div className="print-invoice-num">{selectedReceipt.receipt_number}</div>
                              </div>
                            </div>
                            
                            <div className="print-details-grid">
                              <div>
                                <h3 style={{fontSize: '0.9rem', color: '#64748B', marginBottom: '8px'}}>RECEIVED FROM:</h3>
                                <strong>{clients.find(c => c.id === selectedReceipt.invoice?.client_id)?.name || 'Valued Client'}</strong>
                                <p style={{fontSize: '0.85rem'}}>{clients.find(c => c.id === selectedReceipt.invoice?.client_id)?.address}</p>
                              </div>
                              <div>
                                <table className="print-meta-table">
                                  <tbody>
                                    <tr>
                                      <td>Receipt Date:</td>
                                      <td>{selectedReceipt.payment_date}</td>
                                    </tr>
                                    <tr>
                                      <td>Payment Method:</td>
                                      <td>{selectedReceipt.payment_method}</td>
                                    </tr>
                                    <tr>
                                      <td>Related Invoice:</td>
                                      <td>{selectedReceipt.invoice?.invoice_number}</td>
                                    </tr>
                                    <tr style={{fontWeight: '700'}}>
                                      <td style={{color: '#059669'}}>Amount Settled:</td>
                                      <td style={{color: '#059669'}}>{formatMoney(selectedReceipt.amount)}</td>
                                    </tr>
                                    {selectedReceipt.invoice && (
                                      <tr>
                                        <td>Remaining Balance:</td>
                                        <td style={{fontWeight: '700', color: (Number(selectedReceipt.invoice.total) - Number(selectedReceipt.invoice.amount_paid || 0)) > 0 ? '#D97706' : '#64748B'}}>
                                          {formatMoney(Math.max(0, Number(selectedReceipt.invoice.total) - Number(selectedReceipt.invoice.amount_paid || 0)))}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            <h3 style={{fontSize: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px', marginBottom: '12px'}}>Payment Settlement Details</h3>
                            <table className="print-table">
                              <thead>
                                <tr>
                                  <th>Item Description</th>
                                  <th style={{textAlign: 'right'}}>Settled Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedReceipt.invoice?.items?.map((item, idx) => (
                                  <tr key={idx}>
                                    <td>{item.description} (Qty: {item.quantity})</td>
                                    <td style={{textAlign: 'right'}}>{formatMoney(item.amount)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div style={{ textAlign: 'center', marginTop: '40px', borderTop: '1px solid #E2E8F0', paddingTop: '20px', fontSize: '0.85rem', color: '#64748B' }}>
                              <p>This is a system-generated official receipt for services rendered.</p>
                              <strong style={{color: '#059669'}}>Thank you for your patronage!</strong>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer" style={{ backgroundColor: 'var(--panel-bg)' }}>
                          <button className="btn btn-secondary" onClick={() => setSelectedReceipt(null)}>Close</button>
                          <button className="btn btn-primary" onClick={() => downloadPdf('receipt-print-area', `Receipt-${selectedReceipt.receipt_number}.pdf`)}>
                            <IconDownload /> Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dual Workspace: Invoice Form Builder & Live A4 Preview */}
                  <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Create New Invoice</h3>
                    <div className="invoice-workspace">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Client</label>
                            <select value={invoiceClient} onChange={(e) => setInvoiceClient(e.target.value)}>
                              <option value="">-- Select Client --</option>
                              {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Invoice Number</label>
                            <input type="text" value={getNextInvoiceNumber()} disabled />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Issue Date</label>
                            <input type="date" value={invoiceIssueDate} onChange={(e) => setInvoiceIssueDate(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Due Date</label>
                            <input type="date" value={invoiceDueDate} onChange={(e) => setInvoiceDueDate(e.target.value)} />
                          </div>
                        </div>

                        {/* Invoice Items Builder */}
                        <div style={{ margin: '12px 0' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Invoice Line Items</label>
                          {invoiceItems.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '16px' }}>
                              <div className="item-row-grid" style={{ marginBottom: '8px' }}>
                                <div className="form-group">
                                  <label style={{ fontSize: '0.75rem' }}>Select Service</label>
                                  <select value={item.service_id} onChange={(e) => handleInvoiceItemChange(idx, 'service_id', e.target.value)}>
                                    <option value="">-- Choose --</option>
                                    {services.map(s => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label style={{ fontSize: '0.75rem' }}>Description</label>
                                  <input type="text" value={item.description} onChange={(e) => handleInvoiceItemChange(idx, 'description', e.target.value)} />
                                </div>
                                <div className="form-group">
                                  <label style={{ fontSize: '0.75rem' }}>Qty</label>
                                  <input type="number" min="1" value={item.quantity} onChange={(e) => handleInvoiceItemChange(idx, 'quantity', Number(e.target.value))} />
                                </div>
                                <div className="form-group">
                                  <label style={{ fontSize: '0.75rem' }}>Unit Rate</label>
                                  <input type="number" min="0" value={item.unit_price} onChange={(e) => handleInvoiceItemChange(idx, 'unit_price', Number(e.target.value))} />
                                </div>
                                <button className="btn btn-danger btn-sm" style={{ marginBottom: '4px' }} onClick={() => removeInvoiceItemRow(idx)}>
                                  ×
                                </button>
                              </div>
                              {item.service_id && services.find(s => s.id === item.service_id)?.name === 'CAC Registration' && (
                                <div className="cac-item-details" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px', padding: '12px', backgroundColor: 'var(--panel-bg)', borderRadius: '6px', borderLeft: '3px solid var(--primary-color)', marginLeft: '12px', marginRight: '40px' }}>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CAC Subtype</label>
                                    <select value={item.subtype || ''} onChange={(e) => handleInvoiceItemSubtypeChange(idx, e.target.value)}>
                                      <option value="">-- Choose Subtype --</option>
                                      <option value="Business Name">Business Name (₦40,000)</option>
                                      <option value="NGO">NGO (₦150,000)</option>
                                      <option value="Limited Company">Limited Company (₦100,000)</option>
                                    </select>
                                  </div>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cost Price (₦)</label>
                                    <input type="number" min="0" value={item.cost_price || 0} onChange={(e) => handleInvoiceItemChange(idx, 'cost_price', Number(e.target.value))} />
                                  </div>
                                  <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Selling Price (₦)</label>
                                    <input type="number" min="0" value={item.unit_price || 0} onChange={(e) => handleInvoiceItemChange(idx, 'unit_price', Number(e.target.value))} />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          <button className="btn btn-secondary btn-sm" onClick={addInvoiceItemRow} style={{ marginTop: '8px' }}>
                            <IconPlus /> Add Row
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Discount Value (₦)</label>
                            <input type="number" value={invoiceDiscount} onChange={(e) => setInvoiceDiscount(Number(e.target.value))} />
                          </div>
                          <div className="form-group">
                            <label>Tax rate (%)</label>
                            <input type="number" step="0.1" value={invoiceTax} onChange={(e) => setInvoiceTax(Number(e.target.value))} />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Amount Client Paid (₦)</label>
                            <input type="number" min="0" value={invoiceAmountPaid} onChange={(e) => setInvoiceAmountPaid(Number(e.target.value))} />
                          </div>
                          <div className="form-group">
                            <label>Balance Outstanding (₦)</label>
                            <input type="text" value={formatMoney(Math.max(0, invoiceTotal - invoiceAmountPaid))} disabled style={{ backgroundColor: 'var(--panel-bg)', fontWeight: 'bold', color: 'var(--accent-yellow)' }} />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Notes / Terms</label>
                          <textarea rows="3" placeholder="Payment terms or notes..." value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                          <button className="btn btn-primary" onClick={() => handleCreateInvoice('unpaid')}>
                            Create Unpaid Invoice
                          </button>
                          <button className="btn btn-secondary" onClick={() => handleCreateInvoice('paid')} style={{ backgroundColor: 'var(--primary-glow)', border: '1px solid var(--primary-color)' }}>
                            Save as Paid Immediately
                          </button>
                        </div>
                      </div>

                      {/* LIVE PREVIEW CONTAINER */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4>Invoice Print Preview</h4>
                        <div id="invoice-preview" className="invoice-preview-container">
                          <div className="print-header">
                            <div className="print-logo-section" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <img src="/logo.jpeg" alt="TCL Logo" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                              <div>
                                <span className="print-company-name" style={{color: '#059669', fontSize: '1.2rem'}}>{settings.companyName || 'Titobiloba Consults Limited'}</span>
                                <div style={{fontSize: '0.75rem', color: '#64748B'}}>{settings.companyAddress || 'Lekki Phase 1, Lagos'}</div>
                              </div>
                            </div>
                            <div style={{textAlign: 'right'}}>
                              <span style={{fontSize: '1.75rem', fontWeight: '800'}}>INVOICE</span>
                              <div style={{fontWeight: '700', fontSize: '0.9rem'}}>{getNextInvoiceNumber()}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{color: '#64748B', fontWeight: '600'}}>BILLED TO:</span>
                              <div style={{fontWeight: '700', marginTop: '4px'}}>{clients.find(c => c.id === invoiceClient)?.name || 'Client Name'}</div>
                              <div>{clients.find(c => c.id === invoiceClient)?.email}</div>
                              <div>{clients.find(c => c.id === invoiceClient)?.address}</div>
                            </div>
                            <div>
                              <table className="print-meta-table">
                                <tbody>
                                  <tr>
                                    <td>Date:</td>
                                    <td>{invoiceIssueDate}</td>
                                  </tr>
                                  <tr>
                                    <td>Due Date:</td>
                                    <td>{invoiceDueDate}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <table className="print-table" style={{ fontSize: '0.85rem' }}>
                            <thead>
                              <tr>
                                <th>Description</th>
                                <th style={{textAlign: 'center'}}>Qty</th>
                                <th style={{textAlign: 'right'}}>Rate</th>
                                <th style={{textAlign: 'right'}}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.description || 'Service description'}</td>
                                  <td style={{textAlign: 'center'}}>{item.quantity}</td>
                                  <td style={{textAlign: 'right'}}>{formatMoney(item.unit_price)}</td>
                                  <td style={{textAlign: 'right'}}>{formatMoney(item.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.85rem' }}>
                            <table className="print-totals-table">
                              <tbody>
                                <tr>
                                  <td>Subtotal:</td>
                                  <td style={{textAlign: 'right'}}>{formatMoney(invoiceSubtotal)}</td>
                                </tr>
                                {invoiceDiscount > 0 && (
                                  <tr>
                                    <td>Discount:</td>
                                    <td style={{textAlign: 'right'}}>-{formatMoney(invoiceDiscount)}</td>
                                  </tr>
                                )}
                                <tr>
                                  <td>Tax ({invoiceTax}%):</td>
                                  <td style={{textAlign: 'right'}}>{formatMoney(invoiceTaxAmount)}</td>
                                </tr>
                                <tr className="grand-total">
                                  <td style={{fontWeight: '700'}}>Grand Total (Billed):</td>
                                  <td style={{textAlign: 'right', fontWeight: '700'}}>{formatMoney(invoiceTotal)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                  <td>Amount Paid:</td>
                                  <td style={{textAlign: 'right', fontWeight: '600', color: '#059669'}}>{formatMoney(invoiceAmountPaid)}</td>
                                </tr>
                                <tr style={{ fontWeight: '700' }}>
                                  <td style={{ color: invoiceTotal - invoiceAmountPaid > 0 ? '#D97706' : '#64748B' }}>Balance Owing:</td>
                                  <td style={{textAlign: 'right', fontWeight: '700', color: invoiceTotal - invoiceAmountPaid > 0 ? '#D97706' : '#64748B'}}>{formatMoney(Math.max(0, invoiceTotal - invoiceAmountPaid))}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div style={{ fontSize: '0.75rem', backgroundColor: '#F8FAFC', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '4px', marginTop: '24px' }}>
                            <strong>Bank details for settlement:</strong>
                            <p>{settings.bankDetails || 'Access Bank - Titobiloba Consults Ltd - 0123456789'}</p>
                          </div>
                          
                          {invoiceNotes && (
                            <div style={{ fontSize: '0.75rem', marginTop: '12px', color: '#64748B' }}>
                              <strong>Notes:</strong> {invoiceNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoices List */}
                  <div className="table-card">
                    <div className="table-controls">
                      <h3>Invoices Ledger</h3>
                    </div>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Invoice #</th>
                            <th>Client</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map(inv => (
                            <tr key={inv.id}>
                              <td>
                                <button 
                                  className="btn-link" 
                                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline', color: 'var(--primary-color)', fontWeight: 'bold' }} 
                                  onClick={() => setSelectedInvoice(inv)}
                                >
                                  {inv.invoice_number}
                                </button>
                              </td>
                              <td>{clients.find(c => c.id === inv.client_id)?.name || 'Unknown Client'}</td>
                              <td>{inv.issue_date}</td>
                              <td>{inv.due_date}</td>
                              <td><strong style={{color: 'var(--primary-color)'}}>{formatMoney(inv.total)}</strong></td>
                              <td>
                                <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                                  {inv.status.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInvoice(inv)} title="View Invoice">
                                    View
                                  </button>
                                  {inv.status === 'unpaid' && (
                                    <button className="btn btn-secondary btn-sm" style={{color: 'var(--primary-color)'}} onClick={() => handleMarkInvoiceAsPaid(inv.id)} title="Mark as Paid">
                                      <IconCheck /> Paid
                                    </button>
                                  )}
                                  {inv.status === 'paid' && (
                                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReceipt({
                                      ...receipts.find(r => r.invoice_id === inv.id),
                                      invoice: inv
                                    })} title="View Receipt">
                                      Receipt
                                    </button>
                                  )}
                                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteInvoice(inv.id)}>
                                    <IconTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ANNUAL RETURNS TRACKER */}
              {activeTab === 'annual_returns' && (() => {
                const overdueClients = clients.filter(c => {
                  const details = getAnnualReturnDetails(c);
                  return details && details.isOverdue && c.annual_returns_status === 'pending';
                });

                const dueSoonClients = clients.filter(c => {
                  const details = getAnnualReturnDetails(c);
                  if (!details || details.isOverdue || c.annual_returns_status !== 'pending') return false;
                  const due = new Date(c.annual_returns_due_date);
                  const today = new Date();
                  return (due - today) <= 60 * 24 * 60 * 60 * 1000;
                });

                const upcomingCompletedClients = clients.filter(c => {
                  if (!c.registration_type || !c.annual_returns_due_date) return false;
                  if (c.annual_returns_status === 'done') return true;
                  const details = getAnnualReturnDetails(c);
                  if (!details || details.isOverdue) return false;
                  const due = new Date(c.annual_returns_due_date);
                  const today = new Date();
                  return (due - today) > 60 * 24 * 60 * 60 * 1000;
                });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Stats Row */}
                    <div className="stats-row">
                      <div className="stat-card outstanding" style={{ borderLeft: '4px solid var(--accent-red)' }}>
                        <div className="stat-header">
                          <span className="stat-title">Overdue Filings</span>
                          <div className="stat-icon" style={{ color: 'var(--accent-red)' }}><IconAlert /></div>
                        </div>
                        <span className="stat-value">{overdueClients.length}</span>
                        <span className="stat-meta">Requires immediate action</span>
                      </div>

                      <div className="stat-card outstanding" style={{ borderLeft: '4px solid var(--accent-yellow)' }}>
                        <div className="stat-header">
                          <span className="stat-title">Due in 60 Days</span>
                          <div className="stat-icon" style={{ color: 'var(--accent-yellow)' }}><IconCalendar /></div>
                        </div>
                        <span className="stat-value">{dueSoonClients.length}</span>
                        <span className="stat-meta">Approaching filing deadline</span>
                      </div>

                      <div className="stat-card profit" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                        <div className="stat-header">
                          <span className="stat-title">Upcoming / Filed</span>
                          <div className="stat-icon" style={{ color: 'var(--primary-color)' }}><IconCheck /></div>
                        </div>
                        <span className="stat-value">{upcomingCompletedClients.length}</span>
                        <span className="stat-meta">Filing cycle completed</span>
                      </div>
                    </div>

                    {/* Sub Tab Navigation */}
                    <div className="table-card" style={{ padding: '0px', borderBottom: 'none' }}>
                      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--panel-bg)', borderRadius: '8px 8px 0 0' }}>
                        <button 
                          style={{ 
                            padding: '16px 24px', 
                            background: 'none', 
                            border: 'none', 
                            borderBottom: arSubTab === 'overdue' ? '3px solid var(--accent-red)' : 'none', 
                            color: arSubTab === 'overdue' ? 'var(--accent-red)' : 'var(--text-secondary)',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }} 
                          onClick={() => setArSubTab('overdue')}
                        >
                          Overdue ({overdueClients.length})
                        </button>
                        <button 
                          style={{ 
                            padding: '16px 24px', 
                            background: 'none', 
                            border: 'none', 
                            borderBottom: arSubTab === 'due_soon' ? '3px solid var(--accent-yellow)' : 'none', 
                            color: arSubTab === 'due_soon' ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }} 
                          onClick={() => setArSubTab('due_soon')}
                        >
                          Due Soon ({dueSoonClients.length})
                        </button>
                        <button 
                          style={{ 
                            padding: '16px 24px', 
                            background: 'none', 
                            border: 'none', 
                            borderBottom: arSubTab === 'upcoming' ? '3px solid var(--primary-color)' : 'none', 
                            color: arSubTab === 'upcoming' ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }} 
                          onClick={() => setArSubTab('upcoming')}
                        >
                          Upcoming & Completed ({upcomingCompletedClients.length})
                        </button>
                      </div>

                      {/* Sub Tab Lists */}
                      <div style={{ padding: '24px' }}>
                        {arSubTab === 'overdue' && (
                          <div className="table-wrapper">
                            {overdueClients.length === 0 ? (
                              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No overdue filings found! Excellent.</p>
                            ) : (
                              <table>
                                <thead>
                                  <tr>
                                    <th>Client / Entity</th>
                                    <th>Type</th>
                                    <th>Due Date</th>
                                    <th>Filing Fee</th>
                                    <th>Service Fee</th>
                                    <th>Penalty</th>
                                    <th>Total Cost</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {overdueClients.map(c => {
                                    const details = getAnnualReturnDetails(c);
                                    const text = `Hello *${c.name}*,\n\nThis is a friendly reminder from *Titobiloba Consults Limited* regarding the annual returns filing for your entity registered as a *${c.registration_type}*.\n\n*Next Filing Due Date:* ${c.annual_returns_due_date}\n\n*Payment Breakdown:*\n- Official Filing Cost: ${formatMoney(details.filingFee)}\n- Professional Service Fee: ${formatMoney(details.serviceFee)}\n- Penalty Accrued: ${details.penalty > 0 ? formatMoney(details.penalty) + ' (Overdue)' : 'None'}\n\n*Total Payable:* *${formatMoney(details.total)}*\n\nTo prevent further penalties or CAC query, please reach out to us to process your annual filing. Thank you!`;
                                    return (
                                      <tr key={c.id}>
                                        <td>
                                          <strong>{c.name}</strong>
                                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                                        </td>
                                        <td>
                                          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', fontWeight: 'bold' }}>
                                            {c.registration_type}
                                          </span>
                                        </td>
                                        <td><strong style={{ color: 'var(--accent-red)' }}>{c.annual_returns_due_date}</strong></td>
                                        <td>{formatMoney(details.filingFee)}</td>
                                        <td>{formatMoney(details.serviceFee)}</td>
                                        <td style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>{formatMoney(details.penalty)}</td>
                                        <td><strong style={{ color: 'var(--accent-red)' }}>{formatMoney(details.total)}</strong></td>
                                        <td>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <a 
                                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`}
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="btn btn-secondary btn-sm"
                                              style={{ backgroundColor: '#25D366', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                                              WhatsApp
                                            </a>
                                            <button className="btn btn-primary btn-sm" onClick={() => triggerARSyncModal(c)}>
                                              <IconCheck /> Mark Filed
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}

                        {arSubTab === 'due_soon' && (
                          <div className="table-wrapper">
                            {dueSoonClients.length === 0 ? (
                              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No upcoming filings due soon.</p>
                            ) : (
                              <table>
                                <thead>
                                  <tr>
                                    <th>Client / Entity</th>
                                    <th>Type</th>
                                    <th>Due Date</th>
                                    <th>Filing Fee</th>
                                    <th>Service Fee</th>
                                    <th>Penalty</th>
                                    <th>Total Cost</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dueSoonClients.map(c => {
                                    const details = getAnnualReturnDetails(c);
                                    const text = `Hello *${c.name}*,\n\nThis is a friendly reminder from *Titobiloba Consults Limited* regarding the annual returns filing for your entity registered as a *${c.registration_type}*.\n\n*Next Filing Due Date:* ${c.annual_returns_due_date}\n\n*Payment Breakdown:*\n- Official Filing Cost: ${formatMoney(details.filingFee)}\n- Professional Service Fee: ${formatMoney(details.serviceFee)}\n- Penalty Accrued: ${details.penalty > 0 ? formatMoney(details.penalty) + ' (Overdue)' : 'None'}\n\n*Total Payable:* *${formatMoney(details.total)}*\n\nTo prevent further penalties or CAC query, please reach out to us to process your annual filing. Thank you!`;
                                    return (
                                      <tr key={c.id}>
                                        <td>
                                          <strong>{c.name}</strong>
                                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                                        </td>
                                        <td>
                                          <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-yellow)', fontWeight: 'bold' }}>
                                            {c.registration_type}
                                          </span>
                                        </td>
                                        <td><strong style={{ color: 'var(--accent-yellow)' }}>{c.annual_returns_due_date}</strong></td>
                                        <td>{formatMoney(details.filingFee)}</td>
                                        <td>{formatMoney(details.serviceFee)}</td>
                                        <td>{formatMoney(details.penalty)}</td>
                                        <td><strong style={{ color: 'var(--primary-color)' }}>{formatMoney(details.total)}</strong></td>
                                        <td>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <a 
                                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`}
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="btn btn-secondary btn-sm"
                                              style={{ backgroundColor: '#25D366', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                                              WhatsApp
                                            </a>
                                            <button className="btn btn-primary btn-sm" onClick={() => triggerARSyncModal(c)}>
                                              <IconCheck /> Mark Filed
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}

                        {arSubTab === 'upcoming' && (
                          <div className="table-wrapper">
                            {upcomingCompletedClients.length === 0 ? (
                              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No upcoming returns records found.</p>
                            ) : (
                              <table>
                                <thead>
                                  <tr>
                                    <th>Client / Entity</th>
                                    <th>Type</th>
                                    <th>Registration Date</th>
                                    <th>Next Filing Date</th>
                                    <th>Standard Cost</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {upcomingCompletedClients.map(c => {
                                    const details = getAnnualReturnDetails(c);
                                    return (
                                      <tr key={c.id}>
                                        <td>
                                          <strong>{c.name}</strong>
                                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.phone}</div>
                                        </td>
                                        <td>
                                          <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                            {c.registration_type}
                                          </span>
                                        </td>
                                        <td>{c.registration_date}</td>
                                        <td><strong>{c.annual_returns_due_date}</strong></td>
                                        <td>{formatMoney(details.filingFee + details.serviceFee)}</td>
                                        <td>
                                          <span className={`badge ${c.annual_returns_status === 'done' ? 'badge-success' : 'badge-primary'}`} style={{ textTransform: 'uppercase' }}>
                                            {c.annual_returns_status === 'done' ? 'FILING CYCLE DONE' : 'UPCOMING'}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 5: MONTHLY REPORTS */}
              {activeTab === 'reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="table-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Select Calendar Month</label>
                        <input 
                          type="month" 
                          value={reportMonth} 
                          onChange={(e) => setReportMonth(e.target.value)} 
                          style={{ maxWidth: '240px' }}
                        />
                      </div>
                      <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => downloadPdf('monthly-report-print', `TCL-Business-Performance-Report-${reportMonth}.pdf`)}>
                        <IconDownload /> Export Performance Report (PDF)
                      </button>
                    </div>
                  </div>

                  {/* PRINT PERFORMANCE REPORT TEMPLATE */}
                  <div className="table-card" style={{ padding: '40px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                    <div id="monthly-report-print" className="report-print-layout">
                      <div className="report-title-section" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                        <img src="/logo.jpeg" alt="TCL Logo" style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div>
                          <h1 style={{ color: '#059669', fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Titobiloba Consults Limited</h1>
                          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0 0' }}>12 Corporate Center, Lekki Phase 1, Lagos | Phone: +234 801 234 5678</p>
                        </div>
                      </div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '12px', letterSpacing: '-0.5px' }}>
                        MONTHLY BUSINESS PERFORMANCE REPORT
                      </h2>
                      <strong style={{ color: '#059669', fontSize: '1rem' }}>{reportData.monthName} {reportData.year}</strong>

                      <div className="report-grid-summary">
                        <div className="report-summary-box">
                          <h4 style={{color: '#64748B'}}>Total Monthly Revenue</h4>
                          <p style={{ color: '#059669' }}>{formatMoney(reportData.revenue)}</p>
                        </div>
                        <div className="report-summary-box">
                          <h4 style={{color: '#64748B'}}>Total Monthly Expenses</h4>
                          <p style={{ color: '#DC2626' }}>{formatMoney(reportData.expenses)}</p>
                        </div>
                        <div className="report-summary-box">
                          <h4 style={{color: '#64748B'}}>Net Operational Profit</h4>
                          <p style={{ color: reportData.profit >= 0 ? '#059669' : '#DC2626' }}>{formatMoney(reportData.profit)}</p>
                        </div>
                      </div>

                      <div className="report-section-title">Income Statement Summary</div>
                      <table className="print-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Revenue Source / Service rendered</th>
                            <th style={{ textAlign: 'right' }}>Month Total (NGN)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.services.length > 0 ? (
                            reportData.services.map(([name, val]) => (
                              <tr key={name}>
                                <td>{name}</td>
                                <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatMoney(val)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" style={{ textAlign: 'center', color: '#94A3B8' }}>No revenue recorded in this month.</td>
                            </tr>
                          )}
                          <tr style={{ fontWeight: '750', backgroundColor: '#F8FAFC' }}>
                            <td>GROSS OPERATING REVENUE</td>
                            <td style={{ textAlign: 'right', color: '#059669' }}>{formatMoney(reportData.revenue)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="report-section-title">Operational Expense Ledger</div>
                      <table className="print-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Expense Category</th>
                            <th style={{ textAlign: 'right' }}>Month Total (NGN)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.expensesCats.length > 0 ? (
                            reportData.expensesCats.map(([name, val]) => (
                              <tr key={name}>
                                <td>{name}</td>
                                <td style={{ textAlign: 'right', fontWeight: '600', color: '#DC2626' }}>{formatMoney(val)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" style={{ textAlign: 'center', color: '#94A3B8' }}>No expenses logged in this month.</td>
                            </tr>
                          )}
                          <tr style={{ fontWeight: '750', backgroundColor: '#F8FAFC' }}>
                            <td>TOTAL OPERATIONAL EXPENSES</td>
                            <td style={{ textAlign: 'right', color: '#DC2626' }}>{formatMoney(reportData.expenses)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="report-section-title">Cash Flow & Outstanding Position</div>
                      <table className="print-table" style={{ fontSize: '0.85rem' }}>
                        <tbody>
                          <tr>
                            <td>Net Earnings (Pre-Tax profit margin: {reportData.revenue > 0 ? ((reportData.profit / reportData.revenue) * 100).toFixed(0) : 0}%)</td>
                            <td style={{ textAlign: 'right', fontWeight: '700' }}>{formatMoney(reportData.profit)}</td>
                          </tr>
                          <tr>
                            <td>Invoices generated this Month</td>
                            <td style={{ textAlign: 'right' }}>{reportData.invoicesCount} Invoices</td>
                          </tr>
                          <tr style={{ fontWeight: '650' }}>
                            <td>Uncollected revenue outstanding from this month</td>
                            <td style={{ textAlign: 'right', color: '#D97706' }}>{formatMoney(reportData.outstanding)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div style={{ marginTop: '50px', fontSize: '0.8rem', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                        <p><strong>Verification Endorsement:</strong></p>
                        <p style={{ marginTop: '4px' }}>This performance report details actual accounting records maintained locally or securely synced. It is compiled to meet the standards required for small business grants, bank loans, and audit validation.</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                          <div>
                            <div style={{ width: '150px', borderBottom: '1px solid #000', height: '30px' }}></div>
                            <p style={{ marginTop: '4px' }}>Titobiloba Consults Finance Office</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p>Date Generated: {new Date().toISOString().split('T')[0]}</p>
                            <p>System Hash: TCL-{reportMonth}-{Date.now().toString(36).substring(4, 9).toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="settings-section">
                  <form onSubmit={handleSaveSettings} className="settings-card">
                    <h3 style={{ marginBottom: '16px' }}>Company Information</h3>
                    
                    <div className="form-group">
                      <label>Company Name</label>
                      <input 
                        type="text" 
                        value={settings.companyName || ''} 
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Address</label>
                      <input 
                        type="text" 
                        value={settings.companyAddress || ''} 
                        onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        value={settings.companyPhone || ''} 
                        onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Settlement Bank Account Details</label>
                      <textarea 
                        rows="2" 
                        value={settings.bankDetails || ''} 
                        onChange={(e) => setSettings({ ...settings, bankDetails: e.target.value })} 
                        placeholder="e.g. Access Bank - Titobiloba Consults Ltd - 0123456789"
                      />
                    </div>

                    <h3 style={{ margin: '24px 0 16px 0', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      SMTP Email Server Configuration (For sending invoices/receipts)
                    </h3>

                    <div className="form-row">
                      <div className="form-group">
                        <label>SMTP Host</label>
                        <input 
                          type="text" 
                          value={settings.smtpHost || ''} 
                          onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })} 
                          placeholder="smtp.mailtrap.io"
                        />
                      </div>
                      <div className="form-group">
                        <label>SMTP Port</label>
                        <input 
                          type="text" 
                          value={settings.smtpPort || '587'} 
                          onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })} 
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>SMTP Username</label>
                        <input 
                          type="text" 
                          value={settings.smtpUser || ''} 
                          onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })} 
                          placeholder="smtp_user_key"
                        />
                      </div>
                      <div className="form-group">
                        <label>SMTP Password</label>
                        <input 
                          type="password" 
                          value={settings.smtpPass || ''} 
                          onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })} 
                          placeholder="••••••••••••••"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Sender Email Address</label>
                        <input 
                          type="email" 
                          value={settings.senderEmail || ''} 
                          onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })} 
                          placeholder="billing@titobilobaconsults.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Secure SMTP connection</label>
                        <select 
                          value={settings.smtpSecure || 'false'} 
                          onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.value })}
                        >
                          <option value="false">TLS / STARTTLS (Port 587 / 25)</option>
                          <option value="true">SSL / SMTPS (Port 465)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                      <button type="submit" className="btn btn-primary">
                        Save Configuration
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- POPUP MODAL: LOG TRANSACTION --- */}
      {isTxModalOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleAddTx} className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Log Financial Transaction</span>
              <button type="button" className="modal-close" onClick={() => setIsTxModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Transaction Type</label>
                  <select 
                    value={newTx.type} 
                    onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                  >
                    <option value="income">Income / Payment In</option>
                    <option value="expense">Expense / Payment Out</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Account</label>
                  <select 
                    value={newTx.account} 
                    onChange={(e) => setNewTx({ ...newTx, account: e.target.value })}
                  >
                    <option value="Bank">Bank Account</option>
                    <option value="Cash">Cash Ledger</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>
              </div>

              {newTx.type === 'income' ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>Client</label>
                    <select 
                      value={newTx.client_id} 
                      onChange={(e) => setNewTx({ ...newTx, client_id: e.target.value })}
                    >
                      <option value="">-- Optional Client --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rendered Service</label>
                    <select 
                      value={newTx.service_id} 
                      onChange={(e) => {
                        const sId = e.target.value;
                        const s = services.find(srv => srv.id === sId);
                        setNewTx({ 
                          ...newTx, 
                          service_id: sId,
                          amount: s ? s.price : newTx.amount
                        });
                      }}
                    >
                      <option value="">-- Optional Service --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>Expense Category</label>
                  <select 
                    value={newTx.category} 
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  >
                    <option value="Transport">Transport / Travel</option>
                    <option value="Marketing">Marketing & Ads</option>
                    <option value="Internet">Internet / Subscription</option>
                    <option value="Office Supplies">Office Supplies / Printing</option>
                    <option value="Others">Others / Maintenance</option>
                  </select>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input 
                    type="number" 
                    required 
                    value={newTx.amount} 
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newTx.date} 
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Details</label>
                <input 
                  type="text" 
                  value={newTx.description} 
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="e.g. CAC registration fee or Fuel for office generator"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsTxModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Commit Ledger Entry</button>
            </div>
          </form>
        </div>
      )}

      {/* --- POPUP MODAL: ADD CLIENT --- */}
      {isClientModalOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleAddClient} className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Register Business Client</span>
              <button type="button" className="modal-close" onClick={() => setIsClientModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Client / Company Name</label>
                <input 
                  type="text" 
                  required 
                  value={newClient.name} 
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="e.g. ABC Consulting Ltd"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={newClient.email} 
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="e.g. contact@client.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={newClient.phone} 
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="e.g. +234 80 1234 5678"
                />
              </div>
              <div className="form-group">
                <label>Billing Address</label>
                <input 
                  type="text" 
                  value={newClient.address} 
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="Street address, city, state"
                />
              </div>

              <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                <label>CAC Registration Type</label>
                <select 
                  value={newClient.registration_type || ''} 
                  onChange={(e) => handleNewClientTypeChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                >
                  <option value="">None / Standard Client</option>
                  <option value="Business Name">Business Name</option>
                  <option value="NGO">NGO</option>
                  <option value="Limited Company">Limited Company</option>
                </select>
              </div>

              {newClient.registration_type && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Registration Date</label>
                    <input 
                      type="date" 
                      required 
                      value={newClient.registration_date || ''} 
                      onChange={(e) => handleNewClientDateChange(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Next Returns Due Date</label>
                    <input 
                      type="date" 
                      disabled 
                      value={newClient.annual_returns_due_date || ''}
                      style={{ backgroundColor: 'var(--panel-bg)', fontWeight: 'bold' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsClientModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Register Client</button>
            </div>
          </form>
        </div>
      )}

      {/* --- POPUP MODAL: ADD SERVICE --- */}
      {isServiceModalOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleAddService} className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Create Service Record</span>
              <button type="button" className="modal-close" onClick={() => setIsServiceModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Service Name</label>
                <input 
                  type="text" 
                  required 
                  value={newService.name} 
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g. Corporate Filing Suite"
                />
              </div>
              <div className="form-group">
                <label>Standard Price (₦)</label>
                <input 
                  type="number" 
                  required 
                  value={newService.price} 
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  placeholder="e.g. 75000"
                />
              </div>
              <div className="form-group">
                <label>Service Description</label>
                <input 
                  type="text" 
                  value={newService.description} 
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Brief service description..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsServiceModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Service</button>
            </div>
          </form>
        </div>
      )}

      {/* --- POPUP MODAL: SEND EMAIL --- */}
      {isEmailModalOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleSendEmail} className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Send PDF via Email</span>
              <button type="button" className="modal-close" onClick={() => setIsEmailModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Recipient Email</label>
                <input 
                  type="email" 
                  required 
                  value={emailDetails.to} 
                  onChange={(e) => setEmailDetails({ ...emailDetails, to: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>
              <div className="form-group">
                <label>Email Subject</label>
                <input 
                  type="text" 
                  required 
                  value={emailDetails.subject} 
                  onChange={(e) => setEmailDetails({ ...emailDetails, subject: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email Message Body</label>
                <textarea 
                  rows="5" 
                  required
                  value={emailDetails.body} 
                  onChange={(e) => setEmailDetails({ ...emailDetails, body: e.target.value })}
                />
              </div>
              <div style={{ fontSize: '0.8rem', padding: '10px', backgroundColor: 'var(--input-bg)', borderRadius: '4px', borderLeft: '3px solid var(--primary-color)' }}>
                <strong>Attachment:</strong> {emailDetails.filename} (Automatic PDF generation)
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEmailModalOpen(false)} disabled={emailSending}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={emailSending}>
                {emailSending ? 'Generating & Sending...' : 'Send PDF'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- POPUP MODAL: MARK ANNUAL RETURNS AS DONE --- */}
      {isARSyncModalOpen && arSyncClient && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <span className="modal-title">Complete Filing Cycle</span>
              <button type="button" className="modal-close" onClick={() => { setIsARSyncModalOpen(false); setArSyncClient(null); }}>×</button>
            </div>
            
            <div className="modal-body">
              <p style={{ marginBottom: '16px', lineHeight: '1.5' }}>
                Confirming that the annual returns filing cycle for <strong>{arSyncClient.name}</strong> is completed.
              </p>

              <div style={{ backgroundColor: 'var(--panel-bg)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Filing Cycle:</span>
                  <strong>{arSyncClient.annual_returns_due_date}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Next Cycle Due:</span>
                  <strong style={{ color: 'var(--primary-color)' }}>{addOneYear(arSyncClient.annual_returns_due_date)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Filing Fee:</span>
                  <span>{formatMoney(getAnnualReturnDetails(arSyncClient)?.filingFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Service Fee:</span>
                  <span>{formatMoney(getAnnualReturnDetails(arSyncClient)?.serviceFee)}</span>
                </div>
                {getAnnualReturnDetails(arSyncClient)?.penalty > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-red)' }}>
                    <span>Penalty Accrued:</span>
                    <strong>{formatMoney(getAnnualReturnDetails(arSyncClient)?.penalty)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.05rem', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
                  <span>Total Collected:</span>
                  <span style={{ color: 'var(--primary-color)' }}>{formatMoney(getAnnualReturnDetails(arSyncClient)?.total)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="arSyncLogLedger" 
                  checked={arSyncLogLedger} 
                  onChange={(e) => setArSyncLogLedger(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                />
                <label htmlFor="arSyncLogLedger" style={{ cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
                  Log this payment in the Transactions Ledger
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setIsARSyncModalOpen(false); setArSyncClient(null); }}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCompleteAnnualReturn}>
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
