import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Search, Edit2, Trash2, BookOpen, Layers, AlertCircle, CheckCircle } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal holatlari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '' });
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

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      showAlert(err.message || 'Kurslarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({ name: '', price: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({ name: course.name, price: course.price });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFormError('Barcha maydonlarni to\'ldiring');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingCourse) {
        const updated = await api.updateCourse(editingCourse.id, formData);
        setCourses(courses.map(c => c.id === editingCourse.id ? updated : c));
        showAlert('Kurs muvaffaqiyatli yangilandi');
      } else {
        const created = await api.createCourse(formData);
        setCourses([created, ...courses]);
        showAlert('Yangi kurs muvaffaqiyatli qo\'shildi');
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
      await api.deleteCourse(deleteTarget.id);
      setCourses(courses.filter(c => c.id !== deleteTarget.id));
      showAlert('Kurs tizimdan o\'chirildi');
      setDeleteTarget(null);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {alertMsg && (
        <div className={`p-3.5 rounded-md flex items-center gap-2.5 text-xs animate-fadeIn ${
          alertMsg.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200/60' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
        }`}>
          {alertMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.5} /> : <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" strokeWidth={1.5} />}
          <span className="font-medium">{alertMsg.message}</span>
        </div>
      )}

      {/* Header harakatlari */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Kurs nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 transition-colors"
          />
        </div>

        {/* 1 Primary Button */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Yangi kurs qo'shish</span>
        </button>
      </div>

      {/* Kurslar ro'yxati */}
      <div className="bg-white border border-stone-200/90 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">Yuklanmoqda...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            {searchTerm ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Hozircha kurslar mavjud emas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                <tr>
                  <th className="px-4 py-2.5">№</th>
                  <th className="px-4 py-2.5">Kurs nomi</th>
                  <th className="px-4 py-2.5">Oylik to'lov narxi</th>
                  <th className="px-4 py-2.5">Ochilgan guruhlar</th>
                  <th className="px-4 py-2.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredCourses.map((course, index) => (
                  <tr key={course.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-stone-400 tabular-nums">{index + 1}</td>
                    <td className="px-4 py-3.5 font-medium text-stone-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-600">
                        <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <span>{course.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono tabular-nums font-semibold text-stone-900">
                        {formatPrice(course.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium border border-stone-200/60 tabular-nums text-[11px]">
                        <Layers className="w-3 h-3 text-stone-500" strokeWidth={1.5} />
                        {course.groups_count || 0} ta guruh
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(course)}
                          title="Tahrirlash"
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(course)}
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

      {/* Qo'shish / Tahrirlash Modali */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Kursni tahrirlash' : 'Yangi kurs qo\'shish'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-800 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.5} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Kurs nomi *
            </label>
            <input
              type="text"
              required
              placeholder="Ingliz tili (IELTS)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Oylik narxi (so'mda) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              placeholder="450000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs font-mono tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
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

      {/* O'chirishni tasdiqlash */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Kursni o'chirish"
        message={`Rostdan ham "${deleteTarget?.name}" kursini tizimdan o'chirmoqchimisiz?`}
      />
    </div>
  );
}
