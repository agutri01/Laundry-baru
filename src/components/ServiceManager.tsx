import React, { useState, useMemo } from 'react';
import { LaundryService, ServiceCategory, AppUser } from '../types';
import { formatRupiah, DEFAULT_SERVICES } from '../data/defaultData';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  X,
  Tag,
  Clock,
  Lock,
  ShieldAlert,
  KeyRound,
  Search,
  Sparkles,
  Layers,
  Copy,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Zap,
} from 'lucide-react';

interface ServiceManagerProps {
  services: LaundryService[];
  onSaveServices: (updated: LaundryService[]) => void;
  currentUser?: AppUser | null;
  onOpenLoginModal?: () => void;
}

// Preset Paket Laundry Siap Pakai
interface PresetPackage {
  name: string;
  category: ServiceCategory;
  price: number;
  unit: 'kg' | 'pcs' | 'meter' | 'set' | 'pasang';
  estimatedHours: number;
  description: string;
  badge?: string;
  processStages?: string[];
}

const PRESET_PACKAGES: PresetPackage[] = [
  {
    name: 'Cuci Komplit Reguler (Cuci + Kering + Setrika)',
    category: 'kiloan',
    price: 7000,
    unit: 'kg',
    estimatedHours: 48,
    description: 'Cuci bersih higienis, pengeringan mesin, setrika uap rapi, dan kemasan wangi.',
    badge: 'Paling Populer',
    processStages: ['cuci', 'kering', 'setrika', 'packing'],
  },
  {
    name: 'Cuci Komplit Express 1 Hari',
    category: 'kiloan',
    price: 12000,
    unit: 'kg',
    estimatedHours: 24,
    description: 'Prioritas pengerjaan selesai rapi dan harum dalam 24 jam.',
    badge: 'Express 1 Hari',
    processStages: ['cuci', 'kering', 'setrika', 'packing'],
  },
  {
    name: 'Cuci Kilat 6 Jam (Same Day)',
    category: 'kiloan',
    price: 18000,
    unit: 'kg',
    estimatedHours: 6,
    description: 'Layanan kilat super cepat siap pakai di hari yang sama.',
    badge: 'Kilat 6 Jam',
    processStages: ['cuci', 'kering', 'setrika', 'packing'],
  },
  {
    name: 'Cuci Kering Lipat (Tanpa Setrika)',
    category: 'kiloan',
    price: 5000,
    unit: 'kg',
    estimatedHours: 24,
    description: 'Dicuci wangi, dikeringkan mesin putar, dilipat rapi siap simpan.',
    badge: 'Hemat',
    processStages: ['cuci', 'kering', 'packing'],
  },
  {
    name: 'Setrika Uap Saja (Pakaian Bersih)',
    category: 'kiloan',
    price: 5000,
    unit: 'kg',
    estimatedHours: 24,
    description: 'Penyetrikaan uap profesional dengan semprotan pelicin harum tahan lama.',
    badge: 'Rapi Licin',
    processStages: ['setrika', 'packing'],
  },
  {
    name: 'Bed Cover King / Queen (Besar)',
    category: 'bedding',
    price: 25000,
    unit: 'pcs',
    estimatedHours: 48,
    description: 'Dicuci dengan deterjen khusus serat tebal dan pengeringan optimal anti apek.',
    badge: 'Bedding',
    processStages: ['cuci', 'kering', 'packing'],
  },
  {
    name: 'Bed Cover Single (Kecil / Sedang)',
    category: 'bedding',
    price: 18000,
    unit: 'pcs',
    estimatedHours: 48,
    description: 'Cuci higienis bed cover single dengan pelembut premium.',
    badge: 'Bedding',
    processStages: ['cuci', 'kering', 'packing'],
  },
  {
    name: 'Cuci Sepatu Sneakers Deep Clean',
    category: 'spesial',
    price: 35000,
    unit: 'pasang',
    estimatedHours: 48,
    description: 'Pembersihan mendalam sol, upper, dan tali sepatu dengan formula khusus.',
    badge: 'Deep Clean',
    processStages: ['cuci', 'kering', 'packing'],
  },
  {
    name: 'Cuci Karpet Rumah / Masjid',
    category: 'spesial',
    price: 15000,
    unit: 'meter',
    estimatedHours: 72,
    description: 'Pencucian karpet berbusa tebal, penyedotan air debu, dan penghilang bau apek.',
    badge: 'Spesial',
    processStages: ['cuci', 'kering', 'packing'],
  },
  {
    name: 'Gorden / Tirai Tebal',
    category: 'spesial',
    price: 10000,
    unit: 'meter',
    estimatedHours: 48,
    description: 'Pencucian kain gorden bebas debu dan setrika uap lurus tanpa lipatan kusut.',
    badge: 'Spesial',
    processStages: ['cuci', 'kering', 'setrika', 'packing'],
  },
  {
    name: 'Boneka & Perlengkapan Bayi',
    category: 'spesial',
    price: 20000,
    unit: 'pcs',
    estimatedHours: 48,
    description: 'Deterjen hypoallergenic aman untuk kulit sensitif bayi dan anak-anak.',
    badge: 'Baby Care',
    processStages: ['cuci', 'kering', 'packing'],
  },
];

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  services,
  onSaveServices,
  currentUser,
  onOpenLoginModal,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Modal State
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // View & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form Fields State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('kiloan');
  const [price, setPrice] = useState<number>(8000);
  const [unit, setUnit] = useState<string>('kg');
  const [estimatedHours, setEstimatedHours] = useState<number>(48);
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [minimumQty, setMinimumQty] = useState<number>(1);
  const [processStages, setProcessStages] = useState<string[]>(['cuci', 'kering', 'setrika', 'packing']);
  const [isActive, setIsActive] = useState<boolean>(true);

  // If user is Pekerja (not admin), show locked permission screen
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
          Paket Laundry & Tarif Terkunci
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          Anda saat ini masuk sebagai <strong>{currentUser?.name || 'Pekerja / Operator'}</strong> (Role: Pekerja).
          Sesuai kebijakan hak akses sistem, pengaturan form paket laundry dan daftar tarif hanya dapat diakses dan diubah oleh Administrator / Pemilik.
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

  // Open Form for Adding New Package
  const handleOpenAddForm = () => {
    setEditingServiceId(null);
    setName('');
    setCategory('kiloan');
    setPrice(7000);
    setUnit('kg');
    setEstimatedHours(48);
    setDescription('Proses cuci bersih, higienis, setrika uap rapi, dan kemasan wangi.');
    setBadge('Paling Populer');
    setMinimumQty(3);
    setProcessStages(['cuci', 'kering', 'setrika', 'packing']);
    setIsActive(true);
    setShowPackageModal(true);
  };

  // Open Form for Editing Existing Package
  const handleOpenEditForm = (srv: LaundryService) => {
    setEditingServiceId(srv.id);
    setName(srv.name);
    setCategory(srv.category || 'kiloan');
    setPrice(srv.price || 0);
    setUnit(srv.unit || 'kg');
    setEstimatedHours(srv.estimatedHours || 24);
    setDescription(srv.description || '');
    setBadge(srv.badge || '');
    setMinimumQty(srv.minimumQty || (srv.unit === 'kg' ? 3 : 1));
    setProcessStages(srv.processStages || ['cuci', 'kering', 'setrika', 'packing']);
    setIsActive(srv.isActive !== false);
    setShowPackageModal(true);
  };

  // Duplicate an existing package to form
  const handleDuplicate = (srv: LaundryService) => {
    setEditingServiceId(null);
    setName(`${srv.name} (Salinan)`);
    setCategory(srv.category);
    setPrice(srv.price);
    setUnit(srv.unit);
    setEstimatedHours(srv.estimatedHours);
    setDescription(srv.description);
    setBadge(srv.badge ? `${srv.badge}` : 'Paket Baru');
    setMinimumQty(srv.minimumQty || 1);
    setProcessStages(srv.processStages || ['cuci', 'kering', 'setrika', 'packing']);
    setIsActive(true);
    setShowPackageModal(true);
  };

  // Apply Preset template to form
  const handleApplyPreset = (preset: PresetPackage) => {
    setName(preset.name);
    setCategory(preset.category);
    setPrice(preset.price);
    setUnit(preset.unit);
    setEstimatedHours(preset.estimatedHours);
    setDescription(preset.description);
    setBadge(preset.badge || '');
    setMinimumQty(preset.unit === 'kg' ? 3 : 1);
    if (preset.processStages) {
      setProcessStages(preset.processStages);
    }
  };

  // Toggle stage in form
  const handleToggleStage = (st: string) => {
    if (processStages.includes(st)) {
      setProcessStages(processStages.filter((s) => s !== st));
    } else {
      setProcessStages([...processStages, st]);
    }
  };

  // Save Package (Create or Update)
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingServiceId) {
      // Update
      const updated = services.map((s) => {
        if (s.id !== editingServiceId) return s;
        return {
          ...s,
          name: name.trim(),
          category,
          price: Number(price) || 0,
          unit,
          estimatedHours: Number(estimatedHours) || 24,
          description: description.trim() || 'Layanan laundry higienis.',
          badge: badge.trim() || undefined,
          minimumQty: Number(minimumQty) || 1,
          processStages,
          isActive,
        };
      });
      onSaveServices(updated);
    } else {
      // Create New
      const newPackage: LaundryService = {
        id: `srv-${Date.now()}`,
        name: name.trim(),
        category,
        price: Number(price) || 0,
        unit,
        estimatedHours: Number(estimatedHours) || 24,
        description: description.trim() || 'Layanan laundry higienis.',
        badge: badge.trim() || undefined,
        minimumQty: Number(minimumQty) || 1,
        processStages,
        isActive,
      };
      onSaveServices([...services, newPackage]);
    }

    setShowPackageModal(false);
  };

  const handleDelete = (serviceId: string, serviceName: string) => {
    if (confirm(`Hapus paket laundry "${serviceName}" dari daftar katalog?`)) {
      onSaveServices(services.filter((s) => s.id !== serviceId));
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua paket ke katalog paket laundry standar?')) {
      onSaveServices(DEFAULT_SERVICES);
    }
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchSearch =
        srv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (srv.badge && srv.badge.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory =
        selectedCategory === 'all' || srv.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  // Metrics
  const metrics = useMemo(() => {
    const total = services.length;
    const kiloan = services.filter((s) => s.category === 'kiloan').length;
    const satuan = services.filter((s) => s.category === 'satuan' || s.category === 'bedding').length;
    const express = services.filter((s) => s.estimatedHours <= 24).length;
    return { total, kiloan, satuan, express };
  }, [services]);

  return (
    <div id="service-manager-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-300 text-xs font-bold border border-sky-400/30">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Katalog & Form Paket Laundry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Form Paket Laundry & Daftar Tarif
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Buat paket cuci kiloan, satuan, bedding, tarif harga per kg/pcs, estimasi waktu selesai, dan promo badge untuk kasir POS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ Buat Paket Laundry Baru</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Paket
          </span>
          <p className="text-2xl font-black text-slate-900 font-mono">{metrics.total}</p>
          <span className="text-[10px] text-slate-500">Tersedia di POS</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
            Cuci Kiloan
          </span>
          <p className="text-2xl font-black text-sky-700 font-mono">{metrics.kiloan}</p>
          <span className="text-[10px] text-slate-500">Paket Reguler & Kilat</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
            Satuan & Bedding
          </span>
          <p className="text-2xl font-black text-purple-700 font-mono">{metrics.satuan}</p>
          <span className="text-[10px] text-slate-500">Item Khusus & Linen</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            Layanan Express
          </span>
          <p className="text-2xl font-black text-amber-600 font-mono">{metrics.express}</p>
          <span className="text-[10px] text-slate-500">Selesai ≤ 24 Jam</span>
        </div>
      </div>

      {/* Search, Category Filter, and View Mode Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama paket, keterangan, atau badge..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'kiloan', label: '🧺 Kiloan' },
            { id: 'satuan', label: '👔 Satuan' },
            { id: 'bedding', label: '🛏️ Bedding' },
            { id: 'spesial', label: '✨ Spesial' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Toggle View Mode */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel Rinci"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. GRID VIEW MODE */}
      {/* ============================================================== */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative"
            >
              <div className="space-y-2.5">
                {/* Header: Category + Promo Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      service.category === 'kiloan'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : service.category === 'bedding'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : service.category === 'spesial'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {service.category}
                  </span>

                  {service.badge && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-xs">
                      {service.badge}
                    </span>
                  )}
                </div>

                {/* Service Name */}
                <h3 className="font-black text-sm text-slate-900 leading-snug group-hover:text-sky-700 transition-colors">
                  {service.name}
                </h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-slate-900">
                    {formatRupiah(service.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/{service.unit}</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    Estimasi Selesai: <strong>{service.estimatedHours} Jam</strong>{' '}
                    ({Math.round(service.estimatedHours / 24)} hari)
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {service.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDuplicate(service)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Duplikat paket ini"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplikat</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditForm(service)}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Buka Form Edit Paket"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Paket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(service.id, service.name)}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Paket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. TABLE VIEW MODE */}
      {/* ============================================================== */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Nama Paket Laundry</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tarif / Harga</th>
                  <th className="py-3 px-4">Estimasi Durasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{service.name}</span>
                        {service.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800">
                            {service.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
                        {service.description}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-800">
                        {service.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                        {formatRupiah(service.price)}
                        <span className="text-slate-500 text-xs font-normal"> /{service.unit}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {service.estimatedHours} Jam ({Math.round(service.estimatedHours / 24)} hari)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(service)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Duplikat"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(service)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 flex items-center gap-1"
                          title="Edit Paket"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service.id, service.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Hapus Paket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-3">
          <p className="text-slate-500 text-xs">
            Tidak ada paket laundry yang sesuai dengan kata kunci pencarian.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL FORM PAKET LAUNDRY (TAMBAH & EDIT LENGKAP) */}
      {/* ============================================================== */}
      {showPackageModal && (
        <div
          id="package-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowPackageModal(false)}
        >
          <div
            id="package-form-modal"
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-4 sm:my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <PackageCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base leading-tight">
                    {editingServiceId ? 'Form Edit Paket Laundry' : 'Form Buat Paket Laundry Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Atur nama paket, kategori cuci, tarif per satuan, durasi, dan promo badge.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPackageModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Carousel */}
            {!editingServiceId && (
              <div className="bg-slate-50 px-5 sm:px-6 py-3 border-b border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Template Cepat Paket Populer (1-Klik Isi Form):
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {PRESET_PACKAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 text-slate-700 font-semibold whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
                    >
                      {preset.name.split('(')[0].trim()} ({formatRupiah(preset.price)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSavePackage} className="p-5 sm:p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Nama Paket Laundry */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  Nama Paket Laundry <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Cuci Komplit Reguler / Cuci Bed Cover Jumbo"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-xs"
                />
              </div>

              {/* Kategori, Satuan & Harga */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Kategori */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Kategori Paket</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value as ServiceCategory;
                      setCategory(val);
                      if (val === 'kiloan') setUnit('kg');
                      else if (val === 'bedding' || val === 'satuan') setUnit('pcs');
                      else if (val === 'spesial') setUnit('pasang');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  >
                    <option value="kiloan">🧺 Cuci Kiloan</option>
                    <option value="satuan">👔 Cuci Satuan</option>
                    <option value="bedding">🛏️ Bedding & Linen</option>
                    <option value="spesial">✨ Spesial (Sepatu/Karpet)</option>
                  </select>
                </div>

                {/* Satuan Unit */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Satuan Hitung</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="pcs">pcs (Potong / Lembar)</option>
                    <option value="meter">meter (Panjang Karpet/Gorden)</option>
                    <option value="set">set (Satu Setel)</option>
                    <option value="pasang">pasang (Sepatu / Sandal)</option>
                  </select>
                </div>

                {/* Tarif / Harga */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Tarif Harga (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                  <span className="text-[10px] text-sky-700 font-mono font-bold block">
                    {formatRupiah(price)} /{unit}
                  </span>
                </div>
              </div>

              {/* Estimasi Durasi Pengerjaan */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>Estimasi Durasi Pengerjaan (Jam)</span>
                  </label>
                  <span className="font-mono font-black text-slate-900 text-xs">
                    {estimatedHours} Jam ({Math.round(estimatedHours / 24)} Hari)
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { h: 6, label: '6 Jam (Kilat)' },
                    { h: 12, label: '12 Jam' },
                    { h: 24, label: '24 Jam (1 Hr)' },
                    { h: 48, label: '48 Jam (2 Hr)' },
                    { h: 72, label: '72 Jam (3 Hr)' },
                  ].map((p) => (
                    <button
                      key={p.h}
                      type="button"
                      onClick={() => setEstimatedHours(p.h)}
                      className={`px-2 py-1.5 rounded-xl font-bold text-[10px] transition-all text-center cursor-pointer ${
                        estimatedHours === p.h
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stasiun & Proses yang Tercakup */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Tahapan Alur Pengerjaan Cucian:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cuci', label: '1. Dicuci (Washer)' },
                    { id: 'kering', label: '2. Dikeringkan (Dryer)' },
                    { id: 'setrika', label: '3. Setrika Uap (Iron)' },
                    { id: 'packing', label: '4. Finishing / Packing' },
                  ].map((st) => {
                    const checked = processStages.includes(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleToggleStage(st.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center justify-between transition-all cursor-pointer ${
                          checked
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{st.label}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badge & Label Promo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Label Promo / Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Contoh: Paling Populer, Kilat, Best Seller"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {['Paling Populer', 'Best Seller', 'Hemat', 'Kilat 6 Jam', 'Express 1 Hari'].map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBadge(bg)}
                        className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        +{bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Minimum Order (Qty)</label>
                  <input
                    type="number"
                    min="1"
                    value={minimumQty}
                    onChange={(e) => setMinimumQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Contoh: 3 kg untuk kiloan atau 1 untuk satuan.
                  </p>
                </div>
              </div>

              {/* Deskripsi & Rincian Layanan */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Deskripsi & Fasilitas Layanan
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan proses pengerjaan, wangi parfum, setrika uap rapi, plastik pembungkus higienis..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Pratinjau Tampilan Paket di Kasir:
                </span>
                <div className="bg-slate-800 p-3 rounded-xl flex items-center justify-between border border-slate-700">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{name || 'Nama Paket Laundry'}</span>
                      {badge && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold text-[9px]">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{description || 'Deskripsi paket...'}</p>
                    <span className="text-[10px] text-slate-400 block">
                      ⏱️ {estimatedHours} Jam &bull; Satuan: {unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-emerald-400">
                      {formatRupiah(price)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/{unit}</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-md shadow-sky-600/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingServiceId ? 'Simpan Perubahan Paket' : 'Simpan Paket Laundry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
