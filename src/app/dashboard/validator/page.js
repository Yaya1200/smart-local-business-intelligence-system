'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBusinessData } from '@/lib/useBusinessData';
import { logout } from '@/lib/businessStore';
import Tesseract from 'tesseract.js';
import { LayoutDashboard, Package, TrendingUp, BarChart3, LogOut, Plus, Search, Bell, ShieldCheck } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active = false, href }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
      active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default function DashboardValidatorPage() {
  const router = useRouter();
  const { user, dashboard, loading, error } = useBusinessData();
  const [activeTab, setActiveTab] = useState('ocr');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [transactionText, setTransactionText] = useState('');
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [result, setResult] = useState(null);
  const [validationSummary, setValidationSummary] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [expectedReceiver, setExpectedReceiver] = useState('amanuel wassie');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(1);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const parseBankingText = (text) => {
    const parsed = {
      payer: null,
      receiver: null,
      amount: null,
      time_paid_at: null,
      transaction_id: null,
      total_amount: null,
      commission: null,
      vat: null,
      disaster_fund: null,
      raw_text: text,
      currency: 'ETB',
    };

    const debitedFromMatch = text.match(/debited from\s+([A-Z\s]+?)\s+for/i);
    if (debitedFromMatch) {
      parsed.payer = debitedFromMatch[1].trim();
    }

    const receiverMatch = text.match(/for\s+([A-Z\s-]+?)(?:-ETB|\son\s|\swith\s)/i);
    if (receiverMatch) {
      parsed.receiver = receiverMatch[1].trim().replace(/-$/, '').trim();
    }

    const altReceiverMatch = text.match(/([A-Z\s]+)-ETB-\d+/i);
    if (altReceiverMatch && !parsed.receiver) {
      parsed.receiver = altReceiverMatch[1].trim();
    }

    const amountMatch = text.match(/ETB\s+([\d.]+)\s+debited/i);
    if (amountMatch) {
      parsed.amount = parseFloat(amountMatch[1]).toFixed(2);
    }

    const totalAmountMatch = text.match(/Total Amount Debited\s+ETB\s+([\d.]+)/i);
    if (totalAmountMatch) {
      parsed.total_amount = parseFloat(totalAmountMatch[1]).toFixed(2);
    }

    const dateMatch = text.match(/\b(\d{1,2}-[A-Za-z]+-\d{4})\b/);
    if (dateMatch) {
      parsed.time_paid_at = dateMatch[1];
    }

    const txIdMatch = text.match(/transaction\s+ID:\s+([A-Z0-9]+)/i);
    if (txIdMatch) {
      parsed.transaction_id = txIdMatch[1];
    }

    const commissionMatch = text.match(/commission\s+of\s+ETB\s+([\d.]+)/i);
    if (commissionMatch) parsed.commission = parseFloat(commissionMatch[1]).toFixed(2);

    const vatMatch = text.match(/VAT\s+of\s+ETB([\d.]+)/i);
    if (vatMatch) parsed.vat = parseFloat(vatMatch[1]).toFixed(2);

    const disasterMatch = text.match(/Disaster Fund\s+of\s+ETB([\d.]+)/i);
    if (disasterMatch) parsed.disaster_fund = parseFloat(disasterMatch[1]).toFixed(2);

    if (!parsed.amount) {
      const anyETB = text.match(/ETB\s+([\d.]+)/);
      if (anyETB) parsed.amount = parseFloat(anyETB[1]).toFixed(2);
    }

    return parsed;
  };

  const checkReceiverName = (receiver) => {
    if (!receiver) return { isValid: false, message: 'No receiver detected' };

    const normalizedReceiver = receiver.toLowerCase().trim();
    const normalizedExpected = expectedReceiver.toLowerCase().trim();
    let isMatch = normalizedReceiver.includes(normalizedExpected) || normalizedExpected.includes(normalizedReceiver);

    if (!isMatch) {
      const receiverParts = normalizedReceiver.split(' ');
      const expectedParts = normalizedExpected.split(' ');
      for (const part of receiverParts) {
        if (expectedParts.includes(part) && part.length > 2) {
          isMatch = true;
          break;
        }
      }
    }

    return {
      isValid: isMatch,
      message: isMatch ? 'Receiver name matches' : `Receiver name does not match expected: "${expectedReceiver}"`,
    };
  };

  const checkTransactionTime = (timeStr) => {
    if (!timeStr) return { isValid: false, message: 'No transaction time detected', minutesDiff: null };

    const parsedDate = new Date(timeStr);
    if (isNaN(parsedDate.getTime())) {
      return { isValid: false, message: 'Could not parse date format', minutesDiff: null };
    }

    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60));
    const isValid = diffMinutes <= timeLimitMinutes;

    return {
      isValid,
      minutesDiff: diffMinutes,
      warning: !isValid,
      message: isValid
        ? `Transaction time is within ${timeLimitMinutes} minute(s)`
        : `Transaction is ${diffMinutes} minutes old (exceeds ${timeLimitMinutes} minute limit)`,
    };
  };

  const validateAndDisplay = (data) => {
    const receiverValid = checkReceiverName(data.receiver);
    const timeValid = checkTransactionTime(data.time_paid_at);
    const allValid = receiverValid.isValid && timeValid.isValid;

    setValidationSummary({ receiverValid, timeValid, allValid });
    setApiResponse({
      payer: data.payer,
      receiver: data.receiver,
      receiver_valid: receiverValid.isValid,
      amount: data.amount ? `${data.currency} ${data.amount}` : null,
      time_paid_at: data.time_paid_at,
      time_valid: timeValid.isValid,
      time_minutes_diff: timeValid.minutesDiff ?? null,
      transaction_id: data.transaction_id,
      total_amount: data.total_amount ? `${data.currency} ${data.total_amount}` : null,
      validation_status: allValid ? 'PASSED' : 'FAILED',
      flags: {
        receiver_mismatch: !receiverValid.isValid,
        time_stale: !timeValid.isValid,
      },
      settings: {
        expected_receiver: expectedReceiver,
        time_limit_minutes: timeLimitMinutes,
      },
    });
  };

  const scanReceipt = async () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setLoadingOcr(true);
    setOcrProgress('Processing receipt...');
    setResult(null);
    setValidationSummary(null);
    setApiResponse(null);

    try {
      // Simulate OCR delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock banking transaction data for demo
      const mockText = `ETB 1.00 debited from AMANUEL WASSIE MOLLA for AMANUEL WANDIMU ABERA-ETB-2355 on 09-May-2026 with transaction ID: FT26129XG2PT. Total Amount Debited ETB 1.61 with commission of ETB 0.50, 15% VAT of ETB0.08 and 5% Disaster Fund of ETB0.03.`;
      
      const parsedData = parseBankingText(mockText);
      parsedData.source = 'OCR (Demo)';
      setResult(parsedData);
      validateAndDisplay(parsedData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing image: ' + (error?.message || error));
    } finally {
      setLoadingOcr(false);
      setOcrProgress('');
    }
  };

  const parseTextTransaction = () => {
    if (!transactionText.trim()) {
      alert('Please enter transaction text');
      return;
    }

    const parsedData = parseBankingText(transactionText);
    parsedData.source = 'Text';
    setResult(parsedData);
    validateAndDisplay(parsedData);
  };

  const loadExample = () => {
    const exampleText = `ETB 1.00 debited from AMANUEL WASSIE MOLLA for AMANUEL WANDIMU ABERA-ETB-2355 on 09-May-2026 with transaction ID: FT26129XG2PT. Total Amount Debited ETB 1.61 with commission of ETB 0.50, 15% VAT of ETB0.08 and 5% Disaster Fund of ETB0.03.`;
    setTransactionText(exampleText);
    const parsedData = parseBankingText(exampleText);
    parsedData.source = 'Text';
    setResult(parsedData);
    validateAndDisplay(parsedData);
  };

  const copyToClipboard = () => {
    if (apiResponse) {
      navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
      alert('Copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-64 bg-[#0f0f12] text-white flex flex-col">
          <div className="p-6 flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">B</div>
            <span className="text-xl font-bold tracking-tight">Business BI</span>
          </div>
        </aside>
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-64 bg-[#0f0f12] text-white flex flex-col">
          <div className="p-6 flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">B</div>
            <span className="text-xl font-bold tracking-tight">Business BI</span>
          </div>
        </aside>
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-4">Start with a business name</h1>
            <Link className="inline-flex rounded-md bg-[#151515] px-5 py-3 font-semibold text-white" href="/">
              Go to login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-900">
      <aside className="w-64 bg-[#0f0f12] text-white flex flex-col">
        <div className="p-6 flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold">B</div>
          <span className="text-xl font-bold tracking-tight">Business BI</span>
        </div>

        <nav className="flex-1">
          <p className="px-6 text-[10px] uppercase text-gray-500 font-bold mb-2">Main</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
          <SidebarItem icon={Plus} label="Transaction" href="/transaction" />
          <SidebarItem icon={Package} label="Inventory" href="/inventory" />
          <SidebarItem icon={ShieldCheck} label="Validator" active href="/dashboard/validator" />
          <SidebarItem icon={BarChart3} label="Insights" href="/insights" />

          <p className="px-6 text-[10px] uppercase text-gray-500 font-bold mt-8 mb-2">General</p>
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-gray-400 hover:text-white"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </div>
        </nav>

        <div className="p-4 m-4 bg-gradient-to-br from-purple-900 to-black rounded-xl border border-white/10">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center mb-3">⭐</div>
          <p className="text-sm font-bold">Pro Features</p>
          <p className="text-[10px] text-gray-400 mt-1">Advanced analytics and reporting.</p>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.business_name || 'Business'} 👋</h1>
            <p className="text-gray-500 mt-1">{user.business_type}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 ring-purple-500/20"
              />
            </div>
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
              <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold">
                {user?.business_name?.charAt(0).toUpperCase() || 'B'}
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-slate-50 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-purple-600">Dashboard utility</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">Transaction Validator</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Scan receipts or paste banking text to validate the receiver and transaction time. This page keeps the dashboard sidebar for consistent navigation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                ← Back to dashboard
              </Link>
              <button
                onClick={loadExample}
                className="rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Load example
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex gap-3 rounded-3xl bg-slate-50 p-4">
                  <button
                    onClick={() => setActiveTab('ocr')}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      activeTab === 'ocr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    OCR Scanner
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      activeTab === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Text Parser
                  </button>
                </div>

                {activeTab === 'ocr' ? (
                  <div className="mt-6">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      <div className="text-6xl">📸</div>
                      <p className="mt-4 text-sm text-slate-600">Click or drag and drop a receipt image.</p>
                      <p className="mt-2 text-xs text-slate-400">Supports JPG, PNG, WebP. Max 10MB.</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => event.target.files?.[0] && handleFileSelect(event.target.files[0])}
                        className="hidden"
                      />
                    </div>

                    {previewUrl ? (
                      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <img src={previewUrl} alt="Receipt preview" className="mx-auto max-h-56 rounded-2xl object-contain" />
                        <p className="mt-3 text-sm text-slate-500">
                          {selectedFile?.name} • {(selectedFile?.size || 0 / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : null}

                    <button
                      onClick={scanReceipt}
                      disabled={loadingOcr || !selectedFile}
                      className="mt-6 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingOcr ? 'Processing...' : 'Scan Receipt with OCR'}
                    </button>

                    {loadingOcr ? (
                      <div className="mt-4 text-center text-sm text-slate-500">
                        <div className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                        <p className="mt-3">{ocrProgress}</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-6">
                    <label className="text-sm font-semibold text-slate-700">Paste transaction text</label>
                    <textarea
                      value={transactionText}
                      onChange={(event) => setTransactionText(event.target.value)}
                      rows={7}
                      className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                      placeholder="Paste your banking transaction message here..."
                    />
                    <button
                      onClick={parseTextTransaction}
                      className="mt-4 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      Parse Transaction
                    </button>
                  </div>
                )}
              </div>

              {(result || validationSummary) && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">Validation Results</h2>

                  {validationSummary ? (
                    <div className="mt-5 space-y-4">
                      <div className={`rounded-3xl border-l-4 p-4 ${validationSummary.receiverValid.isValid ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">Receiver match</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${validationSummary.receiverValid.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {validationSummary.receiverValid.isValid ? 'Match' : 'Mismatch'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">{result?.receiver || 'Not detected'}</p>
                        {!validationSummary.receiverValid.isValid ? (
                          <p className="mt-2 text-sm text-rose-700">Expected: {expectedReceiver}</p>
                        ) : null}
                      </div>

                      <div className={`rounded-3xl border-l-4 p-4 ${validationSummary.timeValid.isValid ? 'border-emerald-400 bg-emerald-50' : validationSummary.timeValid.warning ? 'border-amber-400 bg-amber-50' : 'border-rose-400 bg-rose-50'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">Transaction time</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${validationSummary.timeValid.isValid ? 'bg-emerald-100 text-emerald-700' : validationSummary.timeValid.warning ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            {validationSummary.timeValid.isValid ? 'Current' : validationSummary.timeValid.warning ? 'Stale' : 'Invalid'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">{result?.time_paid_at || 'Not detected'}</p>
                        {!validationSummary.timeValid.isValid && validationSummary.timeValid.minutesDiff !== null ? (
                          <p className="mt-2 text-sm text-amber-700">Transaction is {validationSummary.timeValid.minutesDiff} minutes old (limit: {timeLimitMinutes} min)</p>
                        ) : null}
                      </div>

                      <div className={`rounded-3xl p-4 text-center font-semibold ${validationSummary.allValid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                        {validationSummary.allValid ? '✅ Validation passed' : '❌ Validation failed'}
                      </div>
                    </div>
                  ) : null}

                  {result ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">Payer</p>
                        <p className="mt-2 text-sm text-slate-900">{result.payer || 'Not detected'}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">Amount</p>
                        <p className="mt-2 text-sm text-slate-900">{result.amount ? `${result.currency} ${result.amount}` : 'Not detected'}</p>
                      </div>
                      {result.total_amount ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-700">Total Debited</p>
                          <p className="mt-2 text-sm text-slate-900">{result.currency} {result.total_amount}</p>
                        </div>
                      ) : null}
                      {result.transaction_id ? (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-700">Transaction ID</p>
                          <p className="mt-2 break-all text-sm text-slate-900">{result.transaction_id}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {apiResponse ? (
                    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">JSON output</p>
                        <button
                          onClick={copyToClipboard}
                          className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-950"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="mt-4 max-h-72 overflow-x-auto rounded-3xl bg-slate-900 p-4 text-xs text-emerald-300">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900">Validation settings</h2>
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">Expected receiver name</label>
                  <input
                    value={expectedReceiver}
                    onChange={(event) => setExpectedReceiver(event.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                    placeholder="amanuel wassie"
                  />
                  <label className="block text-sm font-semibold text-slate-700">Time limit (minutes)</label>
                  <input
                    type="number"
                    value={timeLimitMinutes}
                    min="0"
                    step="1"
                    onChange={(event) => setTimeLimitMinutes(Number(event.target.value) || 1)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
                  />
                  <p className="text-xs text-slate-500">Transactions are valid only if the extracted timestamp is within this window.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900">How it works</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li>• Upload receipt images or paste raw transaction text.</li>
                  <li>• OCR extracts text from the image.</li>
                  <li>• Receiver and timestamp are validated automatically.</li>
                  <li>• Copy JSON output for API or auditing use.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
