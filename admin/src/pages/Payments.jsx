import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  UserX
} from 'lucide-react';

export default function Payments() {
  const [activeTab, setActiveTab] = useState('history');
  
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [payments, setPayments] = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Yangi to'lov modali
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    month: currentMonthStr,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // O'chirish
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Xabarlar
  const [alertMsg, setAlertMsg] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [payData, debtData, studData] = await Promise.all([
        api.getPayments(selectedMonth),
        api.getDebtors(selectedMonth),
        api.getStudents()
      ]);
      setPayments(payData || []);
      setDebtors(debtData || []);
      setStudents(studData || []);
    } catch (err) {
      showAlert(err.message || 'Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const openPaymentModal = (defaultStudentId = '') => {
    setFormData({
      student_id: defaultStudentId || (students[0]?.id ? String(students[0].id) : ''),
      amount: '',
      date: new Date().toISOString().split('T')[0],
      month: selectedMonth,
      notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.amount || Number(formData.amount) <= 0) {
      setFormError('O\'quvchini tanlang va to\'g\'ri to\'lov summasini kiriting');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await api.createPayment(formData);
      showAlert('To\'lov muvaffaqiyatli qabul qilindi!');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'To\'lovni saqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deletePayment(deleteTarget.id);
      showAlert('To\'lov yozuvi o\'chirildi');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showAlert(err.message || 'O\'chirishda xatolik', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatSum = (num) => {
    return new Intl.NumberFormat('uz-UZ').format(num) + " so'm";
  };

  const totalReceived = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalDebt = debtors.reduce((acc, d) => acc + (d.debt_amount || 0), 0);

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

      {/* KPI Kartochkalar (Sokin ikonka, qutisiz, katta raqamlar) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Shu oydagi tushum ({selectedMonth})</span>
            <DollarSign className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-stone-900 tabular-nums">{formatSum(totalReceived)}</p>
          <p className="text-[11px] text-stone-400 mt-2 pt-2 border-t border-stone-100 tabular-nums">{payments.length} ta to'lov qabul qilingan</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200/90 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Jami Qarzdorlik ({selectedMonth})</span>
            <UserX className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-semibold text-stone-900 tabular-nums">{formatSum(totalDebt)}</p>
          <p className="text-[11px] text-stone-400 mt-2 pt-2 border-t border-stone-100 tabular-nums inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {debtors.length} nafar o'quvchi to'liq to'lamagan
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Oy bo'yicha filter</span>
            <Calendar className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
          />
        </div>
      </div>

      {/* Tablar va Yangi to'lov tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center p-0.5 bg-stone-100 rounded-md self-start border border-stone-200/60">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer tabular-nums ${
              activeTab === 'history' 
                ? 'bg-white text-stone-900 shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            To'lovlar Tarixi ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('debtors')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 tabular-nums ${
              activeTab === 'debtors' 
                ? 'bg-white text-stone-900 shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Qarzdorlar Ro'yxati</span>
            {debtors.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-stone-100 text-stone-700 border border-stone-200/60">
                {debtors.length}
              </span>
            )}
          </button>
        </div>

        {/* Sahifadagi yagona asosiy tugma */}
        <button
          onClick={() => openPaymentModal()}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Yangi to'lov qabul qilish</span>
        </button>
      </div>

      {/* 1. TO'LOVLAR TARIXI JADVALI */}
      {activeTab === 'history' && (
        <div className="bg-white border border-stone-200/90 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-stone-400 text-xs">To'lovlar yuklanmoqda...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs">
              Ushbu oy ({selectedMonth}) uchun hali to'lovlar qabul qilinmagan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-medium uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                  <tr>
                    <th className="px-4 py-3">№</th>
                    <th className="px-4 py-3">O'quvchi Ismi</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3">Summa</th>
                    <th className="px-4 py-3">Qaysi oy uchun</th>
                    <th className="px-4 py-3">To'lov sanasi</th>
                    <th className="px-4 py-3">Izoh</th>
                    <th className="px-4 py-3 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {payments.map((pay, index) => (
                    <tr key={pay.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3.5 text-stone-400 tabular-nums">{index + 1}</td>
                      <td className="px-4 py-3.5 font-medium text-stone-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-medium text-xs flex items-center justify-center shrink-0 border border-stone-200/60">
                          {pay.student_name?.charAt(0).toUpperCase() || 'O'}
                        </div>
                        <span>{pay.student_name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-stone-500 tabular-nums">{pay.student_phone || '—'}</td>
                      <td className="px-4 py-3.5 font-medium text-stone-900 tabular-nums">
                        {formatSum(pay.amount)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-stone-600 tabular-nums">{pay.month}</td>
                      <td className="px-4 py-3.5 text-stone-500 tabular-nums">{pay.date}</td>
                      <td className="px-4 py-3.5 text-stone-500">{pay.notes || '—'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setDeleteTarget(pay)}
                          title="To'lovni o'chirish"
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. QARZDORLAR RO'YXATI JADVALI */}
      {activeTab === 'debtors' && (
        <div className="bg-white border border-stone-200/90 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-stone-400 text-xs">Qarzdorlar hisoblanmoqda...</div>
          ) : debtors.length === 0 ? (
            <div className="p-12 text-center text-stone-700 font-medium text-xs flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
              <span>Ajoyib! {selectedMonth} oyi uchun hech qanday qarzdorlik mavjud emas!</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-medium uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                  <tr>
                    <th className="px-4 py-3">№</th>
                    <th className="px-4 py-3">O'quvchi Ismi</th>
                    <th className="px-4 py-3">Telefon</th>
                    <th className="px-4 py-3">Guruhlari</th>
                    <th className="px-4 py-3">Oylik Kurs Narxi</th>
                    <th className="px-4 py-3">To'langan Summa</th>
                    <th className="px-4 py-3">Qarzdorlik</th>
                    <th className="px-4 py-3 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {debtors.map((d, index) => (
                    <tr key={d.student_id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3.5 text-stone-400 tabular-nums">{index + 1}</td>
                      <td className="px-4 py-3.5 font-medium text-stone-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-medium text-xs flex items-center justify-center shrink-0 border border-stone-200/60">
                          {d.name?.charAt(0).toUpperCase() || 'O'}
                        </div>
                        <span>{d.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-stone-700 tabular-nums">{d.phone}</div>
                        {d.parent_phone && (
                          <div className="text-[10px] text-stone-400 tabular-nums">Ota-ona: {d.parent_phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600">{d.groups || '—'}</td>
                      <td className="px-4 py-3.5 font-medium text-stone-700 tabular-nums">
                        {formatSum(d.expected_amount)}
                      </td>
                      <td className="px-4 py-3.5 text-stone-700 font-medium tabular-nums">
                        {formatSum(d.paid_amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700 tabular-nums text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          -{formatSum(d.debt_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {/* Sokin ikkilamchi tugma */}
                        <button
                          onClick={() => openPaymentModal(String(d.student_id))}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium rounded text-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                          <span>To'lov</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Yangi To'lov Qo'shish Modali */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yangi to'lov qabul qilish"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePayment} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              O'quvchini tanlang *
            </label>
            <select
              required
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 cursor-pointer"
            >
              <option value="">O'quvchini tanlang...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                To'lov summasi (so'm) *
              </label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                placeholder="450000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Qaysi oy uchun *
              </label>
              <input
                type="month"
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              To'lov sanasi *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Qo'shimcha izoh (ixtiyoriy)
            </label>
            <input
              type="text"
              placeholder="Masalan: Payme orqali yoki Naqd"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-md cursor-pointer border border-stone-200"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saqlanmoqda...' : 'To\'lovni qabul qilish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* O'chirish Dialogi */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePayment}
        loading={deleting}
        title="To'lovni o'chirish"
        message={`Rostdan ham "${deleteTarget?.student_name}" o'quvchisi tomonidan to'langan ${formatSum(deleteTarget?.amount || 0)} miqdoridagi to'lov yozuvini o'chirmoqchimisiz?`}
      />
    </div>
  );
}
