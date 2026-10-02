import React, { useState, useEffect, useMemo } from 'react';
import {
  LaundryOrder,
  LaundrySettings,
  formatRupiah,
  formatDateIndo,
  formatMonthYearIndo,
  AppUser,
  PayrollItem,
  ExpenseItem,
} from '../types';
import {
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  Download,
  Store,
  CheckCircle,
  Save,
  RotateCcw,
  ShieldAlert,
  Lock,
  KeyRound,
  Banknote,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  Table as TableIcon,
  Search,
  Check,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';

interface FinanceReportProps {
  orders: LaundryOrder[];
  settings: LaundrySettings;
  onUpdateSettings: (newSettings: LaundrySettings) => void;
  onResetOrders: () => void;
  currentUser?: AppUser | null;
  users?: AppUser[];
  onOpenLoginModal?: () => void;
  payrolls?: PayrollItem[];
  onNavigatePayroll?: () => void;
  expenses?: ExpenseItem[];
  onNavigateBahan?: () => void;
}

export const FinanceReport: React.FC<FinanceReportProps> = ({
  orders,
  settings,
  onUpdateSettings,
  onResetOrders,
  currentUser,
  users = [],
  onOpenLoginModal,
  payrolls = [],
  onNavigatePayroll,
  expenses = [],
  onNavigateBahan,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Store settings form state
  const [shopName, setShopName] = useState(settings.shopName);
  const [shopPhone, setShopPhone] = useState(settings.shopPhone);
  const [shopAddress, setShopAddress] = useState(settings.shopAddress);
  const [footerMessage, setFooterMessage] = useState(settings.footerMessage);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Month selector state for Omset Perbulan (default to current month YYYY-MM)
  const currentMonthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [txSearch, setTxSearch] = useState<string>('');

  useEffect(() => {
    setShopName(settings.shopName);
    setShopPhone(settings.shopPhone);
    setShopAddress(settings.shopAddress);
    setFooterMessage(settings.footerMessage);
  }, [settings]);

  // Extract all available months from orders, expenses, and payrolls
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add(currentMonthKey);
    orders.forEach((o) => {
      if (o.createdAt) monthSet.add(o.createdAt.slice(0, 7));
    });
    expenses.forEach((e) => {
      if (e.date) monthSet.add(e.date.slice(0, 7));
    });
    payrolls.forEach((p) => {
      if (p.paymentDate) monthSet.add(p.paymentDate.slice(0, 7));
      if (p.createdAt) monthSet.add(p.createdAt.slice(0, 7));
    });
    return Array.from(monthSet).sort().reverse();
  }, [orders, expenses, payrolls, currentMonthKey]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(availableMonths[0] || currentMonthKey);
      return;
    }
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx !== -1 && idx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[idx + 1]);
    } else {
      const [y, m] = selectedMonth.split('-').map(Number);
      const prevDate = new Date(y, m - 2, 1);
      setSelectedMonth(prevDate.toISOString().slice(0, 7));
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (selectedMonth === 'all') {
      setSelectedMonth(availableMonths[0] || currentMonthKey);
      return;
    }
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx > 0) {
      setSelectedMonth(availableMonths[idx - 1]);
    } else {
      const [y, m] = selectedMonth.split('-').map(Number);
      const nextDate = new Date(y, m, 1);
      setSelectedMonth(nextDate.toISOString().slice(0, 7));
    }
  };

  // If user is Pekerja (not admin), show friendly permission screen
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm my-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Khusus Administrator</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">
          Laporan Keuangan & Omset Terkunci
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          Anda saat ini masuk sebagai <strong>{currentUser?.name || 'Pekerja / Operator'}</strong> (Role: Pekerja).
          Sesuai kebijakan hak akses sistem, laporan omset bulanan, keuangan, ekspor CSV, dan data toko hanya dapat diakses oleh Administrator/Pemilik.
        </p>

        {onOpenLoginModal && (
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Beralih ke Akun Administrator</span>
          </button>
        )}
      </div>
    );
  }

  // Orders matching selected month
  const selectedMonthOrders = useMemo(() => {
    if (selectedMonth === 'all') return orders;
    return orders.filter((o) => o.createdAt && o.createdAt.startsWith(selectedMonth));
  }, [orders, selectedMonth]);

  // Payrolls matching selected month
  const selectedMonthPayrolls = useMemo(() => {
    if (selectedMonth === 'all') return payrolls;
    return payrolls.filter((p) => {
      if (p.paymentDate && p.paymentDate.startsWith(selectedMonth)) return true;
      if (p.period && p.period.startsWith(selectedMonth)) return true;
      if (p.createdAt && p.createdAt.startsWith(selectedMonth)) return true;
      return false;
    });
  }, [payrolls, selectedMonth]);

  // Expenses matching selected month
  const selectedMonthExpenses = useMemo(() => {
    if (selectedMonth === 'all') return expenses;
    return expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Financial calculations for selected month
  const totalOmset = selectedMonthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalLunas = selectedMonthOrders
    .filter((o) => o.paymentStatus === 'lunas')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const totalBelumLunas = selectedMonthOrders
    .filter((o) => o.paymentStatus === 'belum_lunas')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Volume calculations for selected month
  let totalKg = 0;
  let totalPcs = 0;
  selectedMonthOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      if (item.unit === 'kg') {
        totalKg += item.quantity || 0;
      } else {
        totalPcs += item.quantity || 0;
      }
    });
  });

  const activeOrdersCount = selectedMonthOrders.filter((o) => o.stage !== 'selesai').length;
  const completedOrdersCount = selectedMonthOrders.filter((o) => o.stage === 'selesai').length;

  // Breakdown by payment method for selected month
  const paymentBreakdown = {
    tunai: selectedMonthOrders
      .filter((o) => o.paymentMethod === 'tunai')
      .reduce((sum, o) => sum + (o.total || 0), 0),
    qris: selectedMonthOrders
      .filter((o) => o.paymentMethod === 'qris')
      .reduce((sum, o) => sum + (o.total || 0), 0),
    transfer: selectedMonthOrders
      .filter((o) => o.paymentMethod === 'transfer')
      .reduce((sum, o) => sum + (o.total || 0), 0),
    deposit: selectedMonthOrders
      .filter((o) => o.paymentMethod === 'deposit')
      .reduce((sum, o) => sum + (o.total || 0), 0),
  };

  // Payroll expense for selected month
  const totalGajiBulanIni = selectedMonthPayrolls.reduce(
    (sum, p) => sum + (p.netSalary || 0),
    0
  );
  const totalGajiLunas = selectedMonthPayrolls
    .filter((p) => p.status === 'lunas')
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);

  // Bahan & operasional expense for selected month
  const totalBahanBulanIni = selectedMonthExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  const totalPengeluaranBulanIni = totalGajiBulanIni + totalBahanBulanIni;
  const labaBersihEstimasi = totalLunas - totalPengeluaranBulanIni;
  const marginProfit = totalOmset > 0 ? Math.round((labaBersihEstimasi / totalOmset) * 100) : 0;

  // Month-by-month comparative analysis for all available months
  const monthlySummaryList = useMemo(() => {
    return availableMonths.map((mKey) => {
      const mOrders = orders.filter((o) => o.createdAt && o.createdAt.startsWith(mKey));
      const mPayrolls = payrolls.filter((p) => {
        if (p.paymentDate && p.paymentDate.startsWith(mKey)) return true;
        if (p.period && p.period.startsWith(mKey)) return true;
        if (p.createdAt && p.createdAt.startsWith(mKey)) return true;
        return false;
      });
      const mExpenses = expenses.filter((e) => e.date && e.date.startsWith(mKey));

      const omset = mOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const lunas = mOrders.filter((o) => o.paymentStatus === 'lunas').reduce((sum, o) => sum + (o.total || 0), 0);
      const piutang = mOrders.filter((o) => o.paymentStatus === 'belum_lunas').reduce((sum, o) => sum + (o.total || 0), 0);

      let kg = 0;
      let pcs = 0;
      mOrders.forEach((o) => {
        (o.items || []).forEach((it) => {
          if (it.unit === 'kg') kg += it.quantity || 0;
          else pcs += it.quantity || 0;
        });
      });

      const bebanGaji = mPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
      const bebanBahan = mExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const totalBeban = bebanGaji + bebanBahan;
      const laba = lunas - totalBeban;

      return {
        monthKey: mKey,
        monthName: formatMonthYearIndo(mKey),
        orderCount: mOrders.length,
        volumeKg: kg,
        volumePcs: pcs,
        omset,
        lunas,
        piutang,
        bebanGaji,
        bebanBahan,
        totalBeban,
        laba,
        status: laba >= 0 ? 'surplus' : 'defisit',
      };
    });
  }, [availableMonths, orders, payrolls, expenses]);

  // Filtered transactions within selected month
  const filteredMonthOrders = useMemo(() => {
    if (!txSearch.trim()) return selectedMonthOrders;
    const q = txSearch.toLowerCase();
    return selectedMonthOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
    );
  }, [selectedMonthOrders, txSearch]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      shopName,
      shopPhone,
      shopAddress,
      footerMessage,
    });
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const handleExportCsv = () => {
    const headers = [
      'No Nota',
      'Tanggal & Jam',
      'Nama Pelanggan',
      'No Telepon',
      'Rincian Item Cucian',
      'Status Cucian',
      'Status Bayar',
      'Metode Bayar',
      'Total Omset (Rp)',
    ];

    const rows = selectedMonthOrders.map((o) => [
      `"${o.id}"`,
      `"${formatDateIndo(o.createdAt)}"`,
      `"${o.customer.name}"`,
      `"${o.customer.phone}"`,
      `"${o.items.map((i) => `${i.quantity}${i.unit} ${i.serviceName}`).join('; ')}"`,
      `"${o.stage}"`,
      `"${o.paymentStatus}"`,
      `"${o.paymentMethod}"`,
      o.total,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filenameMonth = selectedMonth === 'all' ? 'semua_waktu' : selectedMonth;
    link.setAttribute('download', `laporan_omset_laundry_${filenameMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="finance-report-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner: Cek Omset Perbulan Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cek Omset Perbulan & Analisis Keuangan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Laporan Omset & Keuangan Bulanan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Periode aktif:{' '}
              <strong className="text-amber-300 font-bold">
                {selectedMonth === 'all' ? 'Semua Waktu' : formatMonthYearIndo(selectedMonth)}
              </strong>{' '}
              &bull; {selectedMonthOrders.length} transaksi pesanan tercatat.
            </p>
          </div>

          {/* Month Selector Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Waktu (All Time)</option>
              {availableMonths.map((m) => {
                const count = orders.filter((o) => o.createdAt && o.createdAt.startsWith(m)).length;
                return (
                  <option key={m} value={m}>
                    {formatMonthYearIndo(m)} ({count} Nota)
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Bulan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {selectedMonth !== currentMonthKey && (
              <button
                type="button"
                onClick={() => setSelectedMonth(currentMonthKey)}
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                Bulan Ini
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download CSV Bulan Ini"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Ekspor CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cetak Laporan Bulanan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Financial Cards Grid (Selected Month) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Omset Bruto
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {formatRupiah(totalOmset)}
          </div>
          <p className="text-[11px] text-slate-500">
            Dari <strong>{selectedMonthOrders.length}</strong> pesanan di bulan{' '}
            {selectedMonth === 'all' ? 'semua waktu' : formatMonthYearIndo(selectedMonth)}
          </p>
        </div>

        {/* Sudah Lunas (Kas Masuk) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Kas Masuk (Lunas)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600">
            {formatRupiah(totalLunas)}
          </div>
          <p className="text-[11px] text-slate-500">
            <strong>{totalOmset > 0 ? Math.round((totalLunas / totalOmset) * 100) : 0}%</strong> dari total tagihan bulan ini
          </p>
        </div>

        {/* Belum Lunas (Piutang) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Piutang Belum Lunas
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-600">
            {formatRupiah(totalBelumLunas)}
          </div>
          <p className="text-[11px] text-slate-500">
            Menunggu pembayaran saat ambil cucian
          </p>
        </div>

        {/* Volume Cucian */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Beban Volume Cucian
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {totalKg.toFixed(1)} <span className="text-xs font-semibold text-slate-500">Kg</span> &bull;{' '}
            {totalPcs} <span className="text-xs font-semibold text-slate-500">Pcs</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {activeOrdersCount} proses aktif &bull; {completedOrdersCount} tuntas
          </p>
        </div>
      </div>

      {/* Laba Bersih & Analisis Pengeluaran Bulanan */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rekap Pengeluaran & Laba Bersih Periode {selectedMonth === 'all' ? 'Semua Waktu' : formatMonthYearIndo(selectedMonth)}</span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
            Analisis Biaya Operasional & Estimasi Laba Bersih
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Total biaya operasional: Gaji Staff{' '}
            <strong className="text-emerald-400 font-mono">{formatRupiah(totalGajiBulanIni)}</strong> ({selectedMonthPayrolls.length} slip) & Belanja Bahan Laundry{' '}
            <strong className="text-sky-300 font-mono">{formatRupiah(totalBahanBulanIni)}</strong> ({selectedMonthExpenses.length} pembelian). Total Pengeluaran:{' '}
            <strong className="text-rose-300 font-mono">{formatRupiah(totalPengeluaranBulanIni)}</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">
              Estimasi Laba Bersih
            </span>
            <div
              className={`text-2xl font-black font-mono tracking-tight ${
                labaBersihEstimasi >= 0 ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              {formatRupiah(labaBersihEstimasi)}
            </div>
            <span className="text-[10px] text-slate-300 font-medium">
              Margin Profit: <strong>{marginProfit}%</strong>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {onNavigateBahan && (
              <button
                type="button"
                onClick={onNavigateBahan}
                className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Bahan ({formatRupiah(totalBahanBulanIni)})</span>
              </button>
            )}

            {onNavigatePayroll && (
              <button
                type="button"
                onClick={onNavigatePayroll}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Gaji ({formatRupiah(totalGajiBulanIni)})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TABEL KOMPARASI & TREN OMSET PERBULAN (MONTH-BY-MONTH) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-emerald-600" />
              Tabel Rekap & Perbandingan Omset Perbulan (Month-by-Month)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau rekap transaksi, pendapatan omset, pengeluaran bahan & gaji, serta laba bersih setiap bulan.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Total {monthlySummaryList.length} Periode Bulan Tercatat
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5">Periode Bulan</th>
                <th className="py-3 px-3.5 text-center">Jumlah Nota</th>
                <th className="py-3 px-3.5">Volume (Kg / Pcs)</th>
                <th className="py-3 px-3.5 text-right">Omset Bruto (Rp)</th>
                <th className="py-3 px-3.5 text-right">Kas Masuk Lunas</th>
                <th className="py-3 px-3.5 text-right">Beban Operasional</th>
                <th className="py-3 px-3.5 text-right">Laba Bersih</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {monthlySummaryList.map((m) => {
                const isCurrentSelected = selectedMonth === m.monthKey;
                return (
                  <tr
                    key={m.monthKey}
                    className={`transition-colors ${
                      isCurrentSelected
                        ? 'bg-emerald-50/80 font-bold'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{m.monthName}</span>
                        {m.monthKey === currentMonthKey && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-100 text-sky-800 font-bold">
                            Bulan Ini
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{m.monthKey}</span>
                    </td>

                    <td className="py-3 px-3.5 text-center font-mono">
                      {m.orderCount} Nota
                    </td>

                    <td className="py-3 px-3.5 font-mono text-slate-600">
                      {m.volumeKg.toFixed(1)} Kg &bull; {m.volumePcs} Pcs
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {formatRupiah(m.omset)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono text-emerald-600 font-bold">
                      {formatRupiah(m.lunas)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono text-rose-600">
                      -{formatRupiah(m.totalBeban)}
                    </td>

                    <td
                      className={`py-3 px-3.5 text-right font-mono font-black ${
                        m.laba >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {formatRupiah(m.laba)}
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          m.status === 'surplus'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {m.status === 'surplus' ? 'Surplus' : 'Defisit'}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedMonth(m.monthKey)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isCurrentSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCurrentSelected ? 'Aktif' : 'Pilih Bulan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Details Grid (Payment Channels & Setting Toko) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Channels for Selected Month */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Metode Pembayaran (Periode: {selectedMonth === 'all' ? 'Semua Waktu' : formatMonthYearIndo(selectedMonth)})
            </h3>
            <span className="text-xs font-mono font-bold text-slate-800">
              Total: {formatRupiah(totalOmset)}
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Pembayaran Tunai (Cash)',
                val: paymentBreakdown.tunai,
                color: 'bg-emerald-500',
              },
              {
                label: 'QRIS (Gopay, OVO, ShopeePay, BCA)',
                val: paymentBreakdown.qris,
                color: 'bg-sky-500',
              },
              {
                label: 'Transfer Bank Mandiri/BCA/BRI',
                val: paymentBreakdown.transfer,
                color: 'bg-indigo-500',
              },
              {
                label: 'Saldo Deposit Pelanggan',
                val: paymentBreakdown.deposit,
                color: 'bg-amber-500',
              },
            ].map((item) => {
              const pct = totalOmset > 0 ? Math.round((item.val / totalOmset) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatRupiah(item.val)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outlet & Settings Config */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> Pengaturan Data Outlet (Kop Nota)
            </h3>
            {savedSettingsNotice && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5" /> Tersimpan!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Nama Usaha Laundry</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                No. WhatsApp Resmi Toko
              </label>
              <input
                type="text"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Alamat Outlet</label>
              <input
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Pesan Footer Nota Struk
              </label>
              <input
                type="text"
                value={footerMessage}
                onChange={(e) => setFooterMessage(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Perubahan Outlet
            </button>
          </form>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DAFTAR TRANSAKSI PESANAN BULAN TERPILIH */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              Daftar Nota Transaksi Periode {selectedMonth === 'all' ? 'Semua Waktu' : formatMonthYearIndo(selectedMonth)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredMonthOrders.length} dari total {selectedMonthOrders.length} nota cucian di bulan ini.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Cari ID nota, nama, atau no HP..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">No. Nota</th>
                <th className="py-2.5 px-3">Tanggal & Jam</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Rincian Layanan</th>
                <th className="py-2.5 px-3 text-center">Status Cucian</th>
                <th className="py-2.5 px-3 text-center">Status Bayar</th>
                <th className="py-2.5 px-3 text-center">Metode</th>
                <th className="py-2.5 px-3 text-right">Nilai Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredMonthOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.id}</td>
                  <td className="py-2.5 px-3 text-slate-500">{formatDateIndo(o.createdAt)}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{o.customer.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{o.customer.phone}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                    {o.items.map((i) => `${i.quantity}${i.unit} ${i.serviceName}`).join(', ')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {o.stage}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        o.paymentStatus === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {o.paymentStatus === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center uppercase font-mono text-[10px] text-slate-600">
                    {o.paymentMethod}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                    {formatRupiah(o.total)}
                  </td>
                </tr>
              ))}
              {filteredMonthOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                    Tidak ada transaksi pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
