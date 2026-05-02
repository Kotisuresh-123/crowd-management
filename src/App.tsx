import React from 'react';
import { 
  Users, 
  Clock, 
  Bed, 
  Activity, 
  ChevronRight, 
  Search, 
  Bell, 
  LayoutDashboard, 
  UserPlus, 
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Baby,
  Heart,
  Stethoscope,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from './lib/utils';
import { DEPARTMENTS, PATIENTS as INITIAL_PATIENTS, HOSPITAL_STATS, OCCUPANCY_HISTORY, DOCTORS as INITIAL_DOCTORS } from './mockData';
import { AIInsights } from './components/AIInsights';
import { Patient, PatientCategory, Doctor, DepartmentStatus } from './types';
import { calculatePriorityScore, estimateWaitTime } from './lib/priority';

export default function App() {
  const [patients, setPatients] = React.useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = React.useState<Doctor[]>(INITIAL_DOCTORS);
  const [showCheckIn, setShowCheckIn] = React.useState(false);
  const [showBulkEntry, setShowBulkEntry] = React.useState(false);
  const [bulkText, setBulkText] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'doctors'>('dashboard');
  const [newPatient, setNewPatient] = React.useState<Partial<Patient>>({
    name: '',
    age: 0,
    category: 'Standard',
    triageLevel: 3,
    department: 'Emergency Room',
  });

  // Sort patients by priority score
  const sortedPatients = [...patients].sort((a, b) => {
    if (a.status === 'In Consultation' && b.status !== 'In Consultation') return -1;
    if (b.status === 'In Consultation' && a.status !== 'In Consultation') return 1;
    return calculatePriorityScore(b) - calculatePriorityScore(a);
  });

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const patient: Patient = {
      id: `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: newPatient.name || 'Unknown',
      age: newPatient.age || 0,
      category: newPatient.category as PatientCategory,
      triageLevel: newPatient.triageLevel as any,
      department: newPatient.department || 'Emergency Room',
      checkInTime: new Date().toISOString(),
      status: 'Waiting',
    };
    setPatients(prev => [...prev, patient]);
    setShowCheckIn(false);
    setNewPatient({ name: '', age: 0, category: 'Standard', triageLevel: 3, department: 'Emergency Room' });
  };

  const updatePatientStatus = (id: string, status: Patient['status']) => {
    if (status === 'Discharged') {
      setPatients(prev => prev.filter(p => p.id !== id));
    } else {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    }
  };

  const removePatient = (id: string) => {
    if (window.confirm('Remove this patient from the queue?')) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  const clearQueue = () => {
    if (window.confirm('Are you sure you want to clear the entire waiting queue?')) {
      setPatients([]);
    }
  };

  const handleBulkCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText.split('\n').filter(line => line.trim());
    const newPatients: Patient[] = lines.map((line, index) => {
      const [name, age, triage, category, dept] = line.split(',').map(s => s.trim());
      return {
        id: `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${index}`,
        name: name || 'Unknown',
        age: parseInt(age) || 0,
        triageLevel: (parseInt(triage) as any) || 3,
        category: (category as PatientCategory) || 'Standard',
        department: dept || 'Emergency Room',
        checkInTime: new Date().toISOString(),
        status: 'Waiting',
      };
    });
    setPatients(prev => [...prev, ...newPatients]);
    setShowBulkEntry(false);
    setBulkText('');
  };

  return (
    <div className="min-h-screen flex bg-hospital-bg">
      {/* Sidebar */}
      <aside className="w-64 border-r border-hospital-line bg-hospital-surface flex flex-col">
        <div className="p-6 border-b border-hospital-line">
          <div className="flex items-center gap-2 text-hospital-accent mb-1">
            <Activity className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">CuraFlow</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Medical Command Center</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem 
            icon={<Stethoscope className="w-4 h-4" />} 
            label="Doctors" 
            active={activeTab === 'doctors'} 
            onClick={() => setActiveTab('doctors')}
          />
          <NavItem icon={<Users className="w-4 h-4" />} label="Patient Registry" />
          <NavItem icon={<Bed className="w-4 h-4" />} label="Bed Management" />
          <button 
            onClick={() => setShowCheckIn(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-hospital-ink transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Check-in Patient</span>
          </button>
          <button 
            onClick={() => setShowBulkEntry(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-hospital-ink transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Bulk Patient Entry</span>
          </button>
          <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-hospital-line">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-hospital-accent/20 flex items-center justify-center text-hospital-accent font-bold text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold">Admin User</p>
              <p className="text-[10px] text-slate-500">Chief of Staff</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-hospital-line bg-hospital-bg/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search patients, departments, or staff..." 
                className="w-full pl-10 pr-4 py-2 bg-hospital-surface border border-hospital-line rounded-lg text-sm focus:border-hospital-accent transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:bg-white/5 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-hospital-accent rounded-full border-2 border-hospital-bg"></span>
            </button>
            <div className="h-8 w-[1px] bg-hospital-line mx-2"></div>
            <div className="text-right">
              <p className="text-xs font-mono font-medium">{new Date().toLocaleDateString()}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">System Online</p>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {activeTab === 'dashboard' ? (
            <>
              {/* Stats Overview */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={<Users className="w-5 h-5" />} 
                  label="Total Patients" 
                  value={patients.length} 
                  trend="+0%" 
                  trendType="up"
                />
                <StatCard 
                  icon={<Activity className="w-5 h-5" />} 
                  label="Active Emergency" 
                  value={patients.filter(p => p.triageLevel <= 2).length} 
                  trend="Critical" 
                  trendType="neutral"
                  color="text-rose-500"
                />
                <StatCard 
                  icon={<Bed className="w-5 h-5" />} 
                  label="Available Beds" 
                  value={HOSPITAL_STATS.availableBeds} 
                  trend="-2" 
                  trendType="down"
                />
                <StatCard 
                  icon={<Clock className="w-5 h-5" />} 
                  label="Avg Wait Time" 
                  value={`${patients.filter(p => p.status === 'Waiting').length > 0 
                    ? Math.round(patients.filter(p => p.status === 'Waiting').reduce((acc, p) => acc + estimateWaitTime(p, patients), 0) / patients.filter(p => p.status === 'Waiting').length) 
                    : 0}m`} 
                  trend="-5m" 
                  trendType="down"
                  color="text-emerald-500"
                />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Priority Queue Dashboard */}
                  <div className="bg-hospital-surface border border-hospital-line rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-hospital-line flex items-center justify-between bg-white/5">
                      <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Live Priority Queue</h3>
                        <p className="text-xs text-slate-500">Sorted by Triage Level and Priority Category (Pregnancy &gt; Elderly)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={clearQueue}
                          className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 px-2 py-1 border border-rose-500/30 rounded transition-colors"
                        >
                          Clear Queue
                        </button>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-hospital-accent bg-hospital-accent/10 px-2 py-1 rounded">
                          <div className="w-1.5 h-1.5 bg-hospital-accent rounded-full animate-pulse" />
                          LIVE UPDATES
                        </span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 border-b border-hospital-line">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Patient</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Triage</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Wait Time</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Est. Time to Doctor</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hospital-line">
                          <AnimatePresence mode="popLayout">
                            {sortedPatients.map((patient) => (
                              <motion.tr 
                                key={patient.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                  "group hover:bg-white/5 transition-colors",
                                  patient.status === 'In Consultation' && "bg-emerald-500/5"
                                )}
                              >
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold">{patient.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{patient.id} • {patient.age}y</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <TriageBadge level={patient.triageLevel} />
                                </td>
                                <td className="p-4">
                                  <CategoryBadge category={patient.category} />
                                </td>
                                <td className="p-4">
                                  <span className="text-xs font-mono text-slate-500">
                                    {formatDistanceToNow(new Date(patient.checkInTime))}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {patient.status === 'Waiting' ? (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 text-hospital-accent" />
                                      <span className="text-xs font-bold text-hospital-accent">
                                        ~{estimateWaitTime(patient, patients)}m
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                                      <Stethoscope className="w-3 h-3" />
                                      Consulting
                                    </span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    {patient.status === 'Waiting' ? (
                                      <>
                                        <button 
                                          onClick={() => updatePatientStatus(patient.id, 'In Consultation')}
                                          className="text-[10px] font-bold uppercase tracking-widest bg-hospital-accent text-white px-3 py-1.5 rounded hover:bg-red-900 transition-colors"
                                        >
                                          Call Patient
                                        </button>
                                        <button 
                                          onClick={() => removePatient(patient.id)}
                                          className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                                          title="Remove Patient"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <button 
                                        onClick={() => updatePatientStatus(patient.id, 'Discharged')}
                                        className="text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30 text-emerald-500 px-3 py-1.5 rounded hover:bg-emerald-500/10 transition-colors"
                                      >
                                        Discharge
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Department Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEPARTMENTS.map((dept) => (
                      <DepartmentCard 
                        key={dept.id} 
                        department={dept} 
                        patients={patients}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* AI Insights */}
                  <AIInsights departments={DEPARTMENTS} patients={patients} />

                  {/* Triage Distribution Chart */}
                  <div className="bg-hospital-surface border border-hospital-line rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Triage Distribution</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'T1', value: patients.filter(p => p.triageLevel === 1).length },
                              { name: 'T2', value: patients.filter(p => p.triageLevel === 2).length },
                              { name: 'T3', value: patients.filter(p => p.triageLevel === 3).length },
                              { name: 'T4', value: patients.filter(p => p.triageLevel === 4).length },
                              { name: 'T5', value: patients.filter(p => p.triageLevel === 5).length },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#991b1b" />
                            <Cell fill="#f97316" />
                            <Cell fill="#fbbf24" />
                            <Cell fill="#10b981" />
                            <Cell fill="#3b82f6" />
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-5 gap-1 mt-2">
                      {[1,2,3,4,5].map(l => (
                        <div key={l} className="text-center">
                          <div className={cn("w-full h-1 rounded-full mb-1", 
                            l === 1 ? "bg-hospital-accent" : l === 2 ? "bg-orange-500" : l === 3 ? "bg-amber-400" : l === 4 ? "bg-emerald-500" : "bg-blue-500"
                          )} />
                          <span className="text-[8px] font-bold text-slate-500">T{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Load Forecast Chart */}
                  <div className="bg-hospital-surface border border-hospital-line rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Load Forecast</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={OCCUPANCY_HISTORY}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                          <XAxis hide dataKey="time" />
                          <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626' }} />
                          <Area type="monotone" dataKey="occupancy" stroke="#991b1b" fill="#991b1b" fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Doctors Management View */
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Medical Staff Directory</h2>
                  <p className="text-sm text-slate-500">Real-time status and availability of hospital doctors</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-hospital-line rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Filter by Department
                  </button>
                  <button className="px-4 py-2 bg-hospital-accent text-white rounded-lg text-sm font-bold shadow-lg shadow-hospital-accent/20 hover:bg-blue-600 transition-all">
                    Add New Doctor
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>

              <div className="bg-hospital-surface border border-hospital-line rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-sm uppercase tracking-wider mb-6">Daily Patient Throughput by Doctor</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctors}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                      <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#171717', borderRadius: '8px', border: '1px solid #262626', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'}} />
                      <Bar dataKey="patientsTreatedToday" fill="#991b1b" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bulk Entry Modal */}
      <AnimatePresence>
        {showBulkEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-hospital-surface border border-hospital-line rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-hospital-line flex items-center justify-between bg-white/5">
                <div>
                  <h3 className="font-bold text-lg">Bulk Patient Entry</h3>
                  <p className="text-xs text-slate-500">Enter multiple patients at once using CSV format</p>
                </div>
                <button onClick={() => setShowBulkEntry(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBulkCheckIn} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Format: Name, Age, Triage(1-5), Category, Department
                  </label>
                  <textarea 
                    required
                    rows={10}
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    className="w-full p-4 bg-hospital-bg border border-hospital-line rounded-lg text-sm font-mono focus:border-hospital-accent outline-none text-hospital-ink"
                    placeholder="John Doe, 45, 1, Standard, Emergency Room&#10;Jane Smith, 32, 3, Pregnancy, Outpatient Dept"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 italic">
                    Categories: Pregnancy, Child, Elderly, Standard
                  </p>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-hospital-accent text-white font-bold rounded-xl shadow-lg shadow-hospital-accent/30 hover:bg-red-900 transition-all"
                  >
                    Import Patients
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Check-in Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-hospital-surface border border-hospital-line rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-hospital-line flex items-center justify-between bg-white/5">
                <h3 className="font-bold text-lg">Patient Check-in</h3>
                <button onClick={() => setShowCheckIn(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCheckIn} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newPatient.name}
                    onChange={e => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 bg-hospital-bg border border-hospital-line rounded-lg text-sm focus:border-hospital-accent outline-none text-hospital-ink"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Age</label>
                    <input 
                      required
                      type="number" 
                      value={newPatient.age || ''}
                      onChange={e => setNewPatient(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                      className="w-full p-2.5 bg-hospital-bg border border-hospital-line rounded-lg text-sm focus:border-hospital-accent outline-none text-hospital-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Triage Level</label>
                    <select 
                      value={newPatient.triageLevel}
                      onChange={e => setNewPatient(prev => ({ ...prev, triageLevel: parseInt(e.target.value) as any }))}
                      className="w-full p-2.5 bg-hospital-bg border border-hospital-line rounded-lg text-sm focus:border-hospital-accent outline-none text-hospital-ink"
                    >
                      <option value={1}>T1 - Resuscitation</option>
                      <option value={2}>T2 - Emergent</option>
                      <option value={3}>T3 - Urgent</option>
                      <option value={4}>T4 - Less Urgent</option>
                      <option value={5}>T5 - Non-Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Priority Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Pregnancy', 'Elderly', 'Child', 'Standard'] as PatientCategory[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewPatient(prev => ({ ...prev, category: cat }))}
                        className={cn(
                          "p-2 text-xs rounded-lg border transition-all text-center",
                          newPatient.category === cat 
                            ? "bg-hospital-accent text-white border-hospital-accent" 
                            : "bg-hospital-bg border-hospital-line text-slate-500 hover:bg-white/5"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Department</label>
                  <select 
                    value={newPatient.department}
                    onChange={e => setNewPatient(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2.5 bg-hospital-bg border border-hospital-line rounded-lg text-sm focus:border-hospital-accent outline-none text-hospital-ink"
                  >
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-hospital-accent text-white font-bold rounded-xl shadow-lg shadow-hospital-accent/30 hover:bg-red-900 transition-all mt-4"
                >
                  Confirm Check-in
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active = false, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        active 
          ? "bg-hospital-accent text-white shadow-md shadow-hospital-accent/20" 
          : "text-slate-500 hover:bg-slate-50 hover:text-hospital-ink"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const StatCard: React.FC<any> = ({ icon, label, value, trend, trendType, color = "text-hospital-ink" }) => {
  return (
    <div className="bg-hospital-surface border border-hospital-line rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/5 text-slate-500">
          {icon}
        </div>
        <div className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1",
          trendType === 'up' ? "bg-emerald-500/10 text-emerald-500" : 
          trendType === 'down' ? "bg-rose-500/10 text-rose-500" : "bg-white/5 text-slate-500"
        )}>
          {trendType === 'up' && <TrendingUp className="w-3 h-3" />}
          {trendType === 'down' && <TrendingDown className="w-3 h-3" />}
          {trendType === 'neutral' && <Minus className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className={cn("text-2xl font-bold tracking-tight", color)}>{value}</p>
    </div>
  );
};

const DepartmentCard: React.FC<{ department: any; patients: Patient[] }> = ({ department, patients }) => {
  const currentOccupancy = patients.filter(p => p.department === department.name && p.status !== 'Discharged').length;
  const occupancyRate = (currentOccupancy / department.capacity) * 100;
  
  const status: DepartmentStatus = occupancyRate > 90 ? 'Critical' : occupancyRate > 70 ? 'Busy' : 'Normal';

  return (
    <div className="bg-hospital-surface border border-hospital-line rounded-xl p-5 shadow-sm hover:border-hospital-accent/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-hospital-ink">{department.name}</h4>
          <p className="text-[10px] text-slate-500 font-mono">ID: {department.id.toUpperCase()}</p>
        </div>
        <span className={cn(
          "status-badge",
          status === 'Normal' ? "status-normal" : 
          status === 'Busy' ? "status-busy" : "status-critical"
        )}>
          {status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Occupancy</span>
          <span className="font-semibold">{currentOccupancy} / {department.capacity}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${occupancyRate}%` }}
            className={cn(
              "h-full rounded-full",
              occupancyRate > 90 ? "bg-hospital-accent" : 
              occupancyRate > 70 ? "bg-amber-500" : "bg-emerald-500"
            )}
          />
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Avg Wait: <span className="text-hospital-ink font-medium">{department.avgWaitTime}m</span></span>
          </div>
          <div className={cn(
            "flex items-center gap-0.5 font-bold",
            department.trend === 'up' ? "text-hospital-accent" : 
            department.trend === 'down' ? "text-emerald-500" : "text-slate-500"
          )}>
            {department.trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {department.trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {department.trend === 'stable' && <Minus className="w-3 h-3" />}
            <span className="uppercase tracking-tighter">{department.trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
  const statusColors = {
    'Available': 'bg-emerald-500',
    'In Consultation': 'bg-blue-500',
    'On Break': 'bg-amber-500',
    'Off Duty': 'bg-slate-400',
  };

  return (
    <div className="bg-hospital-surface border border-hospital-line rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">{doctor.name}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{doctor.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-2 h-2 rounded-full", statusColors[doctor.status])} />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{doctor.status}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-hospital-line">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Treated Today</p>
          <p className="text-lg font-bold">{doctor.patientsTreatedToday}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Dept</p>
          <p className="text-xs font-bold text-hospital-accent uppercase">{doctor.departmentId}</p>
        </div>
      </div>
    </div>
  );
};

const TriageBadge: React.FC<{ level: number }> = ({ level }) => {
  const colors = [
    "bg-hospital-accent text-white shadow-lg shadow-hospital-accent/20", // 1
    "bg-orange-600 text-white shadow-lg shadow-orange-600/20", // 2
    "bg-amber-500 text-white shadow-lg shadow-amber-500/20", // 3
    "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20", // 4
    "bg-blue-600 text-white shadow-lg shadow-blue-600/20", // 5
  ];
  
  return (
    <span className={cn(
      "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
      colors[level - 1]
    )}>
      T{level}
    </span>
  );
};

const CategoryBadge: React.FC<{ category: PatientCategory }> = ({ category }) => {
  const icons = {
    'Pregnancy': <Baby className="w-3 h-3" />,
    'Elderly': <Heart className="w-3 h-3" />,
    'Child': <Baby className="w-3 h-3" />,
    'Standard': null,
  };
  
  const colors = {
    'Pregnancy': "bg-pink-500/10 text-pink-400 border-pink-500/20",
    'Elderly': "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    'Child': "bg-sky-500/10 text-sky-400 border-sky-500/20",
    'Standard': "bg-white/5 text-slate-400 border-white/10",
  };

  return (
    <span className={cn(
      "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
      colors[category]
    )}>
      {icons[category]}
      {category}
    </span>
  );
};
