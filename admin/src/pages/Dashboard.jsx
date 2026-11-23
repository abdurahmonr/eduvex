import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { 
  Users, 
  Layers, 
  UserCheck, 
  AlertCircle, 
  Clock, 
  Calendar, 
  GraduationCap, 
  Phone, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  PhoneCall, 
  BookOpen,
  DoorOpen
} from 'lucide-react';

export default function Dashboard({ setCurrentTab }) {
  const navigate = useNavigate();

  const goTo = (tab) => {
    if (setCurrentTab) setCurrentTab(tab);
    navigate(tab.startsWith('/') ? tab : `/${tab}`);
  };
  const [data, setData] = useState({
    totalStudents: 0,
    newLeadsCount: 0,
    debtorsCount: 0,
    totalGroups: 0,
    groups: [],
    recentNewLeads: [],
    currentMonth: ''
  });
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState(null);
  const [showAllGroups, setShowAllGroups] = useState(false);

  const showAlert = (message, type = 'success') => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardData();
      setData(res);
    } catch (err) {
      showAlert(err.message || "Dashboard ma'lumotlarini yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleMarkContacted = async (leadId) => {
    try {
      await api.updateLeadStatus(leadId, 'boglandi');
      showAlert("Lid holati 'Bog'landi' ga o'zgartirildi!");
      setData(prev => ({
        ...prev,
        newLeadsCount: Math.max(0, prev.newLeadsCount - 1),
        recentNewLeads: prev.recentNewLeads.filter(l => l.id !== leadId)
      }));
    } catch (err) {
      showAlert(err.message || 'Statusni yangilashda xatolik', 'error');
    }
  };

  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const todayName = dayNames[dayOfWeek];

  const isLessonToday = (daysStr = '') => {
    const s = daysStr.toLowerCase();
    if (s.includes('har kuni')) return true;
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      if (s.includes('du') || s.includes('chor') || s.includes('jum')) return true;
    }
    if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
      if (s.includes('se') || s.includes('pay') || s.includes('shan')) return true;
    }
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (s.includes('shanba-yakshanba')) return true;
    }
    return false;
  };

  const todayGroups = data.groups.filter(g => isLessonToday(g.days));
  const displayedGroups = showAllGroups || todayGroups.length === 0 ? data.groups : todayGroups;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Xabar */}
      {alertMsg && (
        <div className={`p-3.5 rounded-md flex items-center gap-2.5 text-xs animate-fadeIn ${
          alertMsg.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200/70' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${alertMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`} />
          <span className="font-medium">{alertMsg.message}</span>
        </div>
      )}

      {/* Yuqori Panel */}
      <div className="bg-white border border-stone-200/90 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-stone-100 border border-stone-200/60 text-stone-600 text-xs font-medium mb-2">
            <span>Bugun: {todayName}, {now.toLocaleDateString('uz-UZ')}</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-stone-900">Markaz Asosiy Ko'rsatkichlari</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real vaqtdagi o'quvchilar, yangi online arizalar (CRM), qarzdorliklar tahlili va dars jadvallari
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 text-xs font-medium rounded-md border border-stone-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-stone-400 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* 4 TA STATISTIKA KARTASI (Sokin, qutisiz, katta raqamlar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Jami O'quvchilar */}
        <div 
          onClick={() => goTo('students')}
          className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Jami O'quvchilar</span>
            <Users className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-stone-900 tabular-nums">
            {loading ? '...' : `${data.totalStudents} nafar`}
          </p>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100">
            <span className="text-[11px] text-stone-400">Ro'yxatdan o'tganlar</span>
            <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors inline-flex items-center gap-0.5">
              O'tish &rarr;
            </span>
          </div>
        </div>

        {/* 2. Yangi Lidlar */}
        <div 
          onClick={() => goTo('leads')}
          className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Yangi Lidlar</span>
            <UserCheck className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-stone-900 tabular-nums">
            {loading ? '...' : `${data.newLeadsCount} ta`}
          </p>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100">
            <span className="text-[11px] text-stone-400 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Aloqa kutilmoqda
            </span>
            <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors inline-flex items-center gap-0.5">
              Kanban &rarr;
            </span>
          </div>
        </div>

        {/* 3. Joriy Oydagi Qarzdorlar */}
        <div 
          onClick={() => goTo('payments')}
          className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Shu oy qarzdorlari</span>
            <AlertCircle className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-stone-900 tabular-nums">
            {loading ? '...' : `${data.debtorsCount} nafar`}
          </p>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100">
            <span className="text-[11px] text-stone-400 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              To'lov qilmaganlar
            </span>
            <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors inline-flex items-center gap-0.5">
              To'lovlar &rarr;
            </span>
          </div>
        </div>

        {/* 4. Faol Guruhlar */}
        <div 
          onClick={() => goTo('groups')}
          className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Faol Guruhlar</span>
            <Layers className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-stone-900 tabular-nums">
            {loading ? '...' : `${data.totalGroups} ta`}
          </p>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100">
            <span className="text-[11px] text-stone-400">Dars guruhlari</span>
            <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors inline-flex items-center gap-0.5">
              Guruhlar &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* PASTKI QISM: 2 TA BLOK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* BLOK 1: BUGUNGI DARSLAR (7 ustun) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-stone-200/90 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-900">
                  {showAllGroups ? "Barcha Faol Guruhlar" : `Bugungi Darslar (${todayName})`}
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-stone-100 border border-stone-200/60 text-stone-700 tabular-nums">
                  {displayedGroups.length} ta
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {showAllGroups 
                  ? "Markazdagi barcha mavjud guruhlar va dars vaqtlari" 
                  : "Bugun haftaning dars rejasiga to'g'ri keladigan guruhlar"}
              </p>
            </div>

            <button
              onClick={() => setShowAllGroups(!showAllGroups)}
              className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium rounded-md transition-colors cursor-pointer shrink-0"
            >
              {showAllGroups ? `Faqat bugun (${todayName})` : "Barchasini ko'rish"}
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-stone-400 text-xs">Guruhlar yuklanmoqda...</div>
          ) : displayedGroups.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200 p-6">
              <Calendar className="w-6 h-6 text-stone-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="font-medium text-stone-700">
                {data.groups.length === 0 ? "Hozircha guruhlar mavjud emas" : "Bugungi kunga darslar belgilanmagan"}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {data.groups.length === 0 
                  ? "Guruhlar bo'limi orqali yangi guruh qo'shishingiz mumkin." 
                  : "Barcha guruhlar ro'yxatini ko'rish uchun yuqoridagi tugmani bosing."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedGroups.map((grp) => (
                <div
                  key={grp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-stone-50/50 hover:bg-stone-50 border border-stone-200/60 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center font-medium text-xs shrink-0 border border-stone-200/60">
                      {grp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-stone-900 text-xs">{grp.name}</h4>
                        {grp.course_name && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 border border-stone-200/60 text-stone-600 rounded">
                            {grp.course_name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-stone-500">
                        <span className="inline-flex items-center gap-1 text-stone-700">
                          <GraduationCap className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                          {grp.teacher_name || 'Murabbiy biriktirilmagan'}
                        </span>
                        {grp.room && (
                          <span className="inline-flex items-center gap-1">
                            <DoorOpen className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                            {grp.room}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-stone-400 tabular-nums">
                          <Users className="w-3 h-3" strokeWidth={1.5} />
                          {grp.student_count} o'quvchi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200/60 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-stone-900 text-xs font-medium border border-stone-200 tabular-nums">
                      <Clock className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                      {grp.time || '14:00'}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      {grp.days}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BLOK 2: OXIRGI KELGAN LIDLAR (5 ustun) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-stone-200/90 p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-900">Oxirgi Kelgan Lidlar</h3>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200/60 tabular-nums">
                  {data.recentNewLeads.length} ta
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Tezkor qo'ng'iroq va bog'lanish arizalari
              </p>
            </div>

            <button
              onClick={() => goTo('leads')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-stone-400 text-xs">Lidlar yuklanmoqda...</div>
          ) : data.recentNewLeads.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs bg-stone-50/50 rounded-md border border-dashed border-stone-200 p-6">
              <UserCheck className="w-6 h-6 text-stone-300 mx-auto mb-2" strokeWidth={1.5} />
              <p className="font-medium text-stone-700">Hozircha yangi lidlar yo'q</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Landing page orqali ariza tushganda shu yerda ko'rinadi.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.recentNewLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 rounded-md bg-stone-50/50 border border-stone-200/60 hover:border-stone-300 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-stone-900 text-xs">{lead.name}</h4>
                      {lead.course_name && (
                        <p className="text-[11px] text-stone-600 inline-flex items-center gap-1 mt-0.5">
                          <BookOpen className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                          {lead.course_name}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] tabular-nums text-stone-400 shrink-0">
                      {formatDate(lead.created_at)}
                    </span>
                  </div>

                  {lead.notes && (
                    <p className="text-[11px] text-stone-500 italic bg-white p-1.5 rounded border border-stone-200/60">
                      "{lead.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-stone-800 hover:text-stone-950 border border-stone-200 rounded text-xs tabular-nums font-medium transition-colors"
                    >
                      <Phone className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                      <span>{lead.phone}</span>
                    </a>

                    <button
                      onClick={() => handleMarkContacted(lead.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded text-xs font-medium transition-colors cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                      <span>Bog'landi</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
