import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Save, 
  Layers, 
  Calendar
} from 'lucide-react';

export default function Attendance() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [alertMsg, setAlertMsg] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      setGroupsLoading(true);
      try {
        const data = await api.getGroups();
        setGroups(data || []);
        if (data && data.length > 0) {
          setSelectedGroupId(String(data[0].id));
        }
      } catch (err) {
        showAlert(err.message || 'Guruhlarni yuklashda xatolik', 'error');
      } finally {
        setGroupsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setStudents([]);
      return;
    }

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const data = await api.getGroupAttendance(selectedGroupId, selectedDate);
        setStudents(data || []);
      } catch (err) {
        showAlert(err.message || 'Davomat ma\'lumotlarini yuklashda xatolik', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedGroupId, selectedDate]);

  const handleToggleStatus = (studentId, status) => {
    setStudents(prev => prev.map(s => 
      s.student_id === studentId ? { ...s, status } : s
    ));
  };

  const handleMarkAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    if (!selectedGroupId || students.length === 0) return;
    setSaving(true);
    try {
      await api.saveAttendance(selectedGroupId, selectedDate, students);
      showAlert('Davomat muvaffaqiyatli saqlandi!');
    } catch (err) {
      showAlert(err.message || 'Davomatni saqlashda xatolik', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentGroup = groups.find(g => String(g.id) === String(selectedGroupId));

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {alertMsg && (
        <div className={`p-3.5 rounded-md flex items-center gap-2.5 text-xs animate-fadeIn ${
          alertMsg.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200/70' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${alertMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`} />
          <span className="font-medium">{alertMsg.message}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white border border-stone-200/90 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
              Guruhni tanlang:
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={groupsLoading}
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 font-medium text-stone-900"
            >
              {groups.length === 0 ? (
                <option value="">Guruhlar mavjud emas</option>
              ) : (
                groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} — {g.course_name} ({g.days}, {g.time})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
              Davomat sanasi:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('keldi')}
              disabled={loading || students.length === 0}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md border border-stone-200 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Hammaga "Keldi"</span>
            </button>
            <button
              onClick={() => handleMarkAll('kelmadi')}
              disabled={loading || students.length === 0}
              className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-md border border-stone-200 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span>Hammaga "Kelmadi"</span>
            </button>
          </div>
        </div>

        {currentGroup && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <span>O'qituvchi: <b className="text-stone-800 font-medium">{currentGroup.teacher_name || '—'}</b></span>
            <span>Dars kunlari: <b className="text-stone-800 font-medium">{currentGroup.days} ({currentGroup.time})</b></span>
            <span>O'quvchilar: <b className="text-stone-900 font-medium tabular-nums">{students.length} ta</b></span>
          </div>
        )}
      </div>

      {/* Davomat Jadvali */}
      <div className="bg-white border border-stone-200/90 rounded-lg overflow-hidden">
        {loading || groupsLoading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            Davomat ma'lumotlari yuklanmoqda...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            {groups.length === 0 
              ? 'Avval "Guruhlar" bo\'limida guruh oching.' 
              : 'Ushbu guruhga hali birorta ham o\'quvchi biriktirilmagan.'}
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-medium uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                  <tr>
                    <th className="px-4 py-3">№</th>
                    <th className="px-4 py-3">O'quvchi Ismi</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3 text-center">Davomat Holati ({selectedDate})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {students.map((st, index) => {
                    const isPresent = st.status === 'keldi';
                    const isAbsent = st.status === 'kelmadi';
                    const isExcused = st.status === 'sababli';

                    return (
                      <tr key={st.student_id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-4 py-3.5 text-stone-400 tabular-nums">{index + 1}</td>
                        <td className="px-4 py-3.5 font-medium text-stone-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-medium text-xs flex items-center justify-center shrink-0 border border-stone-200/60">
                            {st.student_name?.charAt(0).toUpperCase() || 'O'}
                          </div>
                          <span>{st.student_name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-stone-600 tabular-nums">
                          {st.student_phone || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5 p-1 bg-stone-100/70 border border-stone-200/60 rounded-md">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(st.student_id, 'keldi')}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                isPresent 
                                  ? 'bg-[#1B4332] text-white shadow-xs' 
                                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
                              <span>Keldi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(st.student_id, 'kelmadi')}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                isAbsent 
                                  ? 'bg-rose-700 text-white shadow-xs' 
                                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isAbsent ? 'bg-rose-300' : 'bg-rose-500'}`} />
                              <span>Kelmadi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(st.student_id, 'sababli')}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                isExcused 
                                  ? 'bg-amber-700 text-white shadow-xs' 
                                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isExcused ? 'bg-amber-300' : 'bg-amber-500'}`} />
                              <span>Sababli</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pastki saqlash paneli (Faqat 1 ta asosiy yashil tugma) */}
            <div className="p-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">
                Jami: <b className="text-stone-800 font-medium tabular-nums">{students.length}</b> | Kelganlar: <b className="text-emerald-800 font-medium tabular-nums">{students.filter(s => s.status === 'keldi').length}</b> | Kelmaganlar: <b className="text-rose-800 font-medium tabular-nums">{students.filter(s => s.status === 'kelmadi').length}</b>
              </span>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{saving ? 'Saqlanmoqda...' : 'Davomatni saqlash'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
