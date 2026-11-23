import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  GraduationCap, 
  AlertCircle, 
  BookOpen, 
  Key, 
  User, 
  Eye, 
  EyeOff, 
  Lock 
} from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal holatlari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // O'chirish dialog holati
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await api.getTeachers();
      setTeachers(data);
    } catch (err) {
      showAlert(err.message || "O'qituvchilarni yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      phone: '+998 ',
      subject: '',
      login: '',
      password: ''
    });
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      phone: teacher.phone || '',
      subject: teacher.subject || '',
      login: teacher.login || '',
      password: teacher.password || ''
    });
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError("Ism va telefon raqamini to'ldiring");
      return;
    }
    if (!formData.login.trim()) {
      setFormError("O'qituvchi kabineti uchun login kiriting");
      return;
    }
    if (!editingTeacher && !formData.password.trim()) {
      setFormError("O'qituvchi kabineti uchun parol kiriting");
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingTeacher) {
        const updated = await api.updateTeacher(editingTeacher.id, formData);
        setTeachers(teachers.map(t => t.id === editingTeacher.id ? updated : t));
        showAlert("O'qituvchi ma'lumotlari muvaffaqiyatli yangilandi");
      } else {
        const created = await api.createTeacher(formData);
        setTeachers([created, ...teachers]);
        showAlert("Yangi o'qituvchi muvaffaqiyatli qo'shildi");
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteTeacher(deleteTarget.id);
      setTeachers(teachers.filter(t => t.id !== deleteTarget.id));
      showAlert("O'qituvchi tizimdan o'chirildi");
      setDeleteTarget(null);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone?.includes(searchTerm) ||
    t.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {alertMsg && (
        <div className={`p-3.5 rounded-md flex items-center gap-2.5 text-xs animate-fadeIn ${
          alertMsg.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200/70' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${alertMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`} />
          <span className="font-medium whitespace-pre-line">{alertMsg.message}</span>
        </div>
      )}

      {/* Header harakatlari */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="O'qituvchi ismi, fani, telefoni yoki logini..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 transition-colors"
          />
        </div>

        {/* Yangi o'qituvchi qo'shish tugmasi */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Yangi o'qituvchi qo'shish</span>
        </button>
      </div>

      {/* O'qituvchilar ro'yxati jadvali */}
      <div className="bg-white border border-stone-200/90 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">Yuklanmoqda...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            {searchTerm ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Hozircha hech qanday o\'qituvchi qo\'shilmagan'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-medium uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                <tr>
                  <th className="px-4 py-3">№</th>
                  <th className="px-4 py-3">O'qituvchi va Fani</th>
                  <th className="px-4 py-3">Telefon raqami</th>
                  <th className="px-4 py-3">Kabinet Logini & Paroli</th>
                  <th className="px-4 py-3">Guruhlar</th>
                  <th className="px-4 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-stone-400 tabular-nums">{index + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 font-medium text-xs flex items-center justify-center shrink-0 border border-stone-200/60">
                          {teacher.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{teacher.name}</p>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <BookOpen className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                            <span>{teacher.subject || "Fan ko'rsatilmagan"}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-stone-700 tabular-nums">
                        <Phone className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                        <span>{teacher.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 font-mono text-[11px] border border-stone-200/70">
                          <User className="w-3 h-3 text-stone-500" strokeWidth={1.5} />
                          <span>{teacher.login || '—'}</span>
                        </div>
                        {teacher.password && (
                          <div className="text-[10px] text-stone-400 font-mono">
                            Parol: <span className="text-stone-600 font-medium">{teacher.password}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium border border-stone-200/60 tabular-nums text-[11px]">
                        <GraduationCap className="w-3 h-3 text-stone-500" strokeWidth={1.5} />
                        {teacher.groups_count || 0} ta guruh
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(teacher)}
                          title="Tahrirlash"
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(teacher)}
                          title="O'chirish"
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Qo'shish / Tahrirlash */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-700 text-xs rounded-md flex items-start gap-2 whitespace-pre-line">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              O'qituvchi Ismi va Familiyasi *
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Javohir Qosimov"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Mutaxassislik fani / yo'nalishi
            </label>
            <input
              type="text"
              placeholder="Masalan: Ingliz tili (IELTS), Matematika, IT"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Telefon raqami *
            </label>
            <input
              type="text"
              required
              placeholder="+998 90 123 45 67"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div className="pt-2 border-t border-stone-100">
            <p className="text-[11px] font-semibold text-stone-900 mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-stone-500" strokeWidth={1.5} />
              <span>O'qituvchi Kabinetiga Kirish (ustoz.sayt.uz)</span>
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Login *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                  <input
                    type="text"
                    required
                    placeholder="Masalan: javohir_ustoz"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Parol {editingTeacher ? "(o'zgartirish shart bo'lmasa bo'sh qoldiring)" : "*"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingTeacher}
                    minLength={4}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-9 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-md cursor-pointer border border-stone-200 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </Modal>

      {/* O'chirish dialogi */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="O'qituvchini o'chirish"
        message={`Rostdan ham "${deleteTarget?.name}" o'qituvchisini tizimdan o'chirmoqchimisiz?`}
      />
    </div>
  );
}
