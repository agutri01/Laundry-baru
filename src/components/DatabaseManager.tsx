import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Copy,
  Check,
  Server,
  RefreshCw,
  Table,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
  Info,
} from 'lucide-react';
import { api } from '../utils/api';
import { DatabaseTableInfo, MySqlConnectionConfig, formatRupiah } from '../types';

export const DatabaseManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'export' | 'tables' | 'config' | 'sql'>('export');
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [tablesInfo, setTablesInfo] = useState<DatabaseTableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('orders');
  const [mySqlConfig, setMySqlConfig] = useState<MySqlConnectionConfig>({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'dlaundry',
    enabled: false,
  });
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // SQL Console state
  const [customSql, setCustomSql] = useState<string>('SELECT * FROM orders ORDER BY created_at DESC;');
  const [queryResult, setQueryResult] = useState<{
    success?: boolean;
    source?: string;
    columns?: string[];
    rows?: any[];
    message?: string;
  } | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [schemaText, tablesRes, configRes] = await Promise.all([
        api.getDatabaseSchemaSql().catch(() => ''),
        api.getDatabaseTables().catch(() => ({ tables: [] })),
        api.getDatabaseConfig().catch(() => ({})),
      ]);

      if (schemaText) setSqlSchema(schemaText);
      if (tablesRes && tablesRes.tables) setTablesInfo(tablesRes.tables);
      if (configRes) {
        setMySqlConfig((prev) => ({
          ...prev,
          host: configRes.host || 'localhost',
          port: configRes.port || 3306,
          user: configRes.user || 'root',
          database: configRes.database || 'dlaundry',
          enabled: !!configRes.enabled,
        }));
      }
    } catch (err) {
      console.error('Failed to load database manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopySql = () => {
    if (!sqlSchema) return;
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    window.location.href = '/api/database/export-sql';
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await api.testDatabaseConnection(mySqlConfig);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menghubungi server MySQL.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.saveDatabaseConfig(mySqlConfig);
      setTestResult({
        success: true,
        message: res.message || 'Konfigurasi MySQL berhasil disimpan.',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menyimpan konfigurasi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToMySql = async () => {
    if (!confirm(`Sinkronkan seluruh data aplikasi ke database MySQL '${mySqlConfig.database}'? Data akan dibuat dan ditimpa di phpMyAdmin.`)) {
      return;
    }
    setLoading(true);
    setSyncResult(null);
    try {
      const res = await api.syncToMySQL(mySqlConfig);
      setSyncResult(res);
      fetchData();
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || 'Gagal melakukan sinkronisasi ke MySQL.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    if (!customSql.trim()) return;
    setLoading(true);
    try {
      const res = await api.executeDatabaseQuery(customSql);
      setQueryResult(res);
    } catch (err: any) {
      setQueryResult({
        success: false,
        message: err.message || 'Gagal mengeksekusi query SQL.',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentTableData = tablesInfo.find((t) => t.name === selectedTable);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Database className="w-3.5 h-3.5" />
            <span>phpMyAdmin & MySQL Relational Database</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Pusat Pengelolaan Database phpMyAdmin
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Format database aplikasi ini 100% kompatibel dengan **MySQL / MariaDB** dan siap diimpor langsung ke **phpMyAdmin** (XAMPP, Laragon, cPanel, atau Cloud Hosting).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadSql}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download .SQL (phpMyAdmin)</span>
          </button>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('export')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'export'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Import & Export phpMyAdmin</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('tables')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tables'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Penjelajah Tabel ({tablesInfo.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'config'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Koneksi Server MySQL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'sql'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Konsol SQL</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: EXPORT & PANDUAN phpMyAdmin */}
      {/* ============================================================== */}
      {activeSubTab === 'export' && (
        <div className="space-y-6">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Download className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Download File SQL (1-Klik)</h3>
                  <p className="text-xs text-slate-500">File <code className="font-mono text-amber-700 font-bold">dlaundry_database.sql</code> siap import</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unduh file skrip SQL lengkap berisi struktur database, seluruh 9 tabel relasional, serta data transaksi terbaru untuk diimpor ke phpMyAdmin Anda.
              </p>
              <button
                type="button"
                onClick={handleDownloadSql}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File .SQL Sekarang</span>
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Copy className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Salin Kode Query SQL</h3>
                  <p className="text-xs text-slate-500">Copy & paste langsung ke tab SQL phpMyAdmin</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Salin seluruh query DDL (`CREATE DATABASE`, `CREATE TABLE`) dan DML (`INSERT INTO`) untuk dieksekusi secara instan pada console SQL phpMyAdmin.
              </p>
              <button
                type="button"
                onClick={handleCopySql}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Kode SQL Berhasil Disalin!' : 'Salin Seluruh Kode SQL'}</span>
              </button>
            </div>
          </div>

          {/* Tutorial Step-by-Step phpMyAdmin */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-4 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                <Info className="w-4 h-4" />
              </span>
              <h3 className="font-black text-sm sm:text-base text-white">
                Panduan Cara Import Database ke phpMyAdmin (XAMPP / Laragon / cPanel)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="font-bold text-white">Buka phpMyAdmin</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Buka browser ke <code className="font-mono text-amber-300">http://localhost/phpmyadmin</code> atau login ke cPanel hosting Anda.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="font-bold text-white">Buat Database</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Klik menu <strong>New</strong> di sidebar kiri, beri nama database <code className="font-mono text-amber-300">dlaundry</code>, lalu klik <strong>Create</strong>.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="font-bold text-white">Tab Import</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Pilih database <code className="font-mono text-amber-300">dlaundry</code>, masuk ke tab <strong>Import</strong> di bagian atas layar.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/70 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                  4
                </div>
                <h4 className="font-bold text-white">Pilih File & Go</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Klik <strong>Choose File</strong>, pilih <code className="font-mono text-amber-300">dlaundry_database.sql</code>, lalu klik tombol <strong>Import / Kirim</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Preview Script SQL */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-slate-800 text-slate-200 px-4 py-3 flex items-center justify-between border-b border-slate-700 text-xs">
              <span className="font-mono font-bold flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                Preview Skrip MySQL (dlaundry_database.sql)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto select-all">
              {sqlSchema || 'Memuat skrip SQL...'}
            </pre>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: PENJELAJAH TABEL (phpMyAdmin Explorer) */}
      {/* ============================================================== */}
      {activeSubTab === 'tables' && (
        <div className="space-y-5">
          {/* Table Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {tablesInfo.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setSelectedTable(t.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTable === t.name
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.name}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono">
                  {t.rows}
                </span>
              </button>
            ))}
          </div>

          {currentTableData ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
              {/* Table Info Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-slate-900">
                      Tabel: `{currentTableData.name}`
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                      Engine: {currentTableData.engine}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono">
                      {currentTableData.collation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{currentTableData.description}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-600">Total Baris / Records:</span>
                  <p className="text-lg font-mono font-black text-indigo-700">{currentTableData.rows}</p>
                </div>
              </div>

              {/* Table Schema / Columns */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Struktur Kolom Database
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Kolom (Field)</th>
                        <th className="py-2 px-3">Tipe Data</th>
                        <th className="py-2 px-3 text-center">Null</th>
                        <th className="py-2 px-3 text-center">Key</th>
                        <th className="py-2 px-3">Default</th>
                        <th className="py-2 px-3">Extra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {currentTableData.columns.map((col, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                          <td className="py-2 px-3 font-bold text-indigo-900">{col.field}</td>
                          <td className="py-2 px-3 text-amber-700 font-medium">{col.type}</td>
                          <td className="py-2 px-3 text-center text-slate-600">{col.null}</td>
                          <td className="py-2 px-3 text-center font-bold text-rose-600">{col.key}</td>
                          <td className="py-2 px-3 text-slate-600">{col.default}</td>
                          <td className="py-2 px-3 text-slate-400">{col.extra || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Data Records */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Data Terkini (5 Sampel Record)
                </h4>
                {currentTableData.sampleData && currentTableData.sampleData.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                        <tr>
                          {Object.keys(currentTableData.sampleData[0] || {}).map((k) => (
                            <th key={k} className="py-2 px-3">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {currentTableData.sampleData.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                            {Object.values(row).map((val: any, vIdx) => (
                              <td key={vIdx} className="py-2 px-3 font-mono">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Belum ada baris data pada tabel ini.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Pilih salah satu tabel di atas.</p>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: KONEKSI SERVER MYSQL (phpMyAdmin Live) */}
      {/* ============================================================== */}
      {activeSubTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-black text-sm text-slate-900">
                Konfigurasi Parameter MySQL / phpMyAdmin
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hubungkan server Node.js backend langsung ke database MySQL (misalnya XAMPP localhost atau cPanel Remote MySQL).
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Host Server MySQL</label>
                  <input
                    type="text"
                    value={mySqlConfig.host}
                    onChange={(e) => setMySqlConfig({ ...mySqlConfig, host: e.target.value })}
                    placeholder="localhost / 127.0.0.1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Gunakan 'localhost' untuk XAMPP lokal.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Port MySQL</label>
                  <input
                    type="number"
                    value={mySqlConfig.port}
                    onChange={(e) => setMySqlConfig({ ...mySqlConfig, port: Number(e.target.value) })}
                    placeholder="3306"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Default MySQL: 3306.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Username MySQL</label>
                  <input
                    type="text"
                    value={mySqlConfig.user}
                    onChange={(e) => setMySqlConfig({ ...mySqlConfig, user: e.target.value })}
                    placeholder="root"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Username default XAMPP adalah 'root'.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Password MySQL</label>
                  <input
                    type="password"
                    value={mySqlConfig.password}
                    onChange={(e) => setMySqlConfig({ ...mySqlConfig, password: e.target.value })}
                    placeholder="Kosongkan jika tanpa password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400">Default XAMPP biasanya tanpa password.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Database</label>
                <input
                  type="text"
                  value={mySqlConfig.database}
                  onChange={(e) => setMySqlConfig({ ...mySqlConfig, database: e.target.value })}
                  placeholder="dlaundry"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs font-bold text-indigo-700"
                  required
                />
                <p className="text-[10px] text-slate-400">Nama database yang dibuat di phpMyAdmin.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Test Koneksi MySQL</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncToMySql}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sinkronkan Semua Tabel ke MySQL</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer ml-auto"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>

            {/* Test Results Message */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.success ? 'Koneksi Sukses' : 'Koneksi Gagal'}</p>
                  <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}

            {/* Sync Results Message */}
            {syncResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                  syncResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {syncResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{syncResult.success ? 'Sinkronisasi Berhasil' : 'Pemberitahuan'}</p>
                  <p className="mt-0.5 leading-relaxed">{syncResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Sidecard */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              Status Mode Penyimpanan
            </h4>

            <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
              <p>
                Sistem secara otomatis mengaktifkan skema relasional MySQL / phpMyAdmin.
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Kompabilitas Penuh:</span>
                <p>&bull; phpMyAdmin 4.x / 5.x</p>
                <p>&bull; MySQL 5.7 / 8.0</p>
                <p>&bull; MariaDB 10.x</p>
                <p>&bull; UTF8mb4 Unicode Collation</p>
              </div>
              <p>
                Jika Anda menjalankan aplikasi di cloud tanpa server MySQL lokal yang terbuka, gunakan fitur <strong>Download File SQL</strong> untuk mengimpor data ke phpMyAdmin kapan saja.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: KONSOL QUERY SQL phpMyAdmin */}
      {/* ============================================================== */}
      {activeSubTab === 'sql' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Konsol Eksekusi Query SQL
              </span>

              {/* Template Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400 font-bold">Template:</span>
                <button
                  type="button"
                  onClick={() => setCustomSql('SELECT * FROM orders ORDER BY created_at DESC;')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                >
                  orders
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSql('SELECT * FROM customers ORDER BY deposit_balance DESC;')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                >
                  customers
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSql('SELECT * FROM payrolls;')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                >
                  payrolls
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSql('SELECT * FROM services;')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                >
                  services
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              placeholder="Ketik query SQL di sini (contoh: SELECT * FROM orders;)"
              className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-950 text-emerald-400"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Tekan tombol jalankan untuk melihat hasil query dalam bentuk tabel.
              </span>
              <button
                type="button"
                onClick={handleRunQuery}
                disabled={loading || !customSql.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Jalankan Query (Execute)</span>
              </button>
            </div>
          </div>

          {/* Query Results View */}
          {queryResult && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Hasil Eksekusi: <span className="text-indigo-600 font-mono">{queryResult.source}</span>
                </span>
                {queryResult.rows && (
                  <span className="font-mono text-slate-500 font-bold">
                    {queryResult.rows.length} baris ditemukan
                  </span>
                )}
              </div>

              {queryResult.rows && queryResult.rows.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                      <tr>
                        {queryResult.columns?.map((col) => (
                          <th key={col} className="py-2 px-3">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                          {queryResult.columns?.map((col) => (
                            <td key={col} className="py-2 px-3 font-mono">
                              {typeof row[col] === 'object'
                                ? JSON.stringify(row[col])
                                : String(row[col] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">
                  {queryResult.message || 'Tidak ada baris data yang cocok dengan query tersebut.'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
