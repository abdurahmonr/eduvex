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
  Layers, 
  AlertCircle, 
  CheckCircle, 
  X 
} from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // O'quvchi qo'shish / tahrirlash modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '+998 ',
    parent_phone: '',
    group_id: '',
    start_date: new Date().toISOString().split('T')[0]
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Alohida guruhga biriktirish modal
  const [enrollingStudent, setEnrollingStudent] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [enrollStartDate, setEnrollStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [enrollError, setEnrollError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // O'chirish dialog holati
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const fetchStudents = async (query = '') => {
    try {
      setLoading(true);
      const data = await api.getStudents(query);
      setStudents(data);
    } catch (err) {
      showAlert(err.message || 'O\'quvchilarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents(searchTerm);
    fetchGroups();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchStudents(val);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      phone: '+998 ',
      parent_phone: '',
      group_id: '',
      start_date: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      phone: student.phone,
      parent_phone: student.parent_phone || '',
      group_id: '',
      start_date: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('O\'quvchi to\'liq ismini kiriting');
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 9) {
      setFormError('Telefon raqamini to\'liq kiriting (masalan: +998 90 123 45 67)');
      return;
    }

    let cleanParent = formData.parent_phone ? formData.parent_phone.trim() : '';
    if (cleanParent && cleanParent.replace(/\D/g, '').length <= 3) {
      cleanParent = '';
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingStudent) {
        const updated = await api.updateStudent(editingStudent.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          parent_phone: cleanParent || null
        });
        setStudents(students.map(s => s.id === editingStudent.id ? updated : s));
        showAlert('O\'quvchi ma\'lumotlari yangilandi');
      } else {
        await api.createStudent({
          ...formData,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          parent_phone: cleanParent || null
        });
        await fetchStudents(searchTerm);
        showAlert('Yangi o\'quvchi muvaffaqiyatli qo\'shildi');
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteStudent(deleteTarget.id);
      setStudents(students.filter(s => s.id !== deleteTarget.id));
      showAlert('O\'quvchi tizimdan o\'chirildi');
      setDeleteTarget(null);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openEnrollModal = (student) => {
    setEnrollingStudent(student);
    setSelectedGroupId(groups[0]?.id || '');
    setEnrollStartDate(new Date().toISOString().split('T')[0]);
    setEnrollError('');
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !enrollingStudent) return;

    setEnrolling(true);
    setEnrollError('');
    try {
      await api.enrollStudent({
        student_id: enrollingStudent.id,
        group_id: selectedGroupId,
        start_date: enrollStartDate
      });

      await fetchStudents(searchTerm);
      showAlert(`O'quvchi guruhga biriktirildi`);
      setEnrollingStudent(null);
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemoveFromGroup = async (enrollmentId) => {
    try {
      await api.removeEnrollment(enrollmentId);
      await fetchStudents(searchTerm);
      showAlert('O\'quvchi guruhdan chiqarildi');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

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

      {/* Header harakatlari */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki telefoni..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 transition-colors"
          />
        </div>

        {/* Sahifadagi yagona asosiy tugma */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Yangi o'quvchi qo'shish</span>
        </button>
      </div>

      {/* O'quvchilar jadvali */}
      <div className="bg-white border border-stone-200/90 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">O'quvchilar yuklanmoqda...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            {searchTerm ? 'Qidiruv bo\'yicha o\'quvchi topilmadi' : 'Hozircha o\'quvchilar mavjud emas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-medium uppercase tracking-wider text-[11px] border-b border-stone-200/80">
                <tr>
                  <th className="px-4 py-3">№</th>
                  <th className="px-4 py-3">O'quvchi ismi</th>
                  <th className="px-4 py-3">Telefon raqamlari</th>
                  <th className="px-4 py-3">A'zo bo'lgan guruhlari</th>
                  <th className="px-4 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-stone-400 tabular-nums">{index + 1}</td>
                    
                    {/* Ism va Sokin Avatar doirasi */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-medium text-xs flex items-center justify-center shrink-0 border border-stone-200/60">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{student.name}</p>
                          <span className="text-[10px] text-stone-400 tabular-nums">#{student.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Telefonlar */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-stone-700 tabular-nums">
                          <Phone className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                          <span>{student.phone}</span>
                        </div>
                        {student.parent_phone && (
                          <div className="text-[10px] text-stone-400 tabular-nums">
                            Ota-ona: {student.parent_phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Guruhlari */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {student.groups && student.groups.length > 0 ? (
                          student.groups.map((grp) => (
                            <span 
                              key={grp.id || grp.enrollment_id}
                              className="inline-flex items-center gap-1 text-[11px] bg-stone-100 border border-stone-200/60 text-stone-700 px-2 py-0.5 rounded"
                            >
                              <Layers className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                              <span className="font-medium">{grp.name}</span>
                              {grp.start_date && (
                                <span className="text-[10px] text-stone-400 tabular-nums">({grp.start_date})</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveFromGroup(grp.enrollment_id)}
                                title="Guruhdan chiqarish"
                                className="ml-0.5 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                              >
                                <X className="w-3 h-3" strokeWidth={1.5} />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">Biriktirilmagan</span>
                        )}

                        <button
                          onClick={() => openEnrollModal(student)}
                          title="Guruhga qo'shish"
                          className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                          <span>Guruhga</span>
                        </button>
                      </div>
                    </td>

                    {/* Amallar */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(student)}
                          title="Tahrirlash"
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
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

      {/* O'quvchi qo'shish va Tahrirlash Modali */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'O\'quvchi ma\'lumotlarini tahrirlash' : 'Yangi o\'quvchi qo\'shish'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-700 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              To'liq Ismi va Familiyasi *
            </label>
            <input
              type="text"
              required
              placeholder="Ali Valiyev"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Ota-onasining telefoni
              </label>
              <input
                type="text"
                placeholder="+998 90 987 65 43"
                value={formData.parent_phone}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
              />
            </div>
          </div>

          {!editingStudent && (
            <div className="pt-2 border-t border-stone-100 space-y-3">
              <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Guruhga biriktirish (ixtiyoriy)
              </p>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Boshlang'ich guruh
                </label>
                <select
                  value={formData.group_id}
                  onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 cursor-pointer"
                >
                  <option value="">Guruh tanlanmagan (Keyinroq biriktirish)</option>
                  {groups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.name} ({grp.course_name} — {grp.days})
                    </option>
                  ))}
                </select>
              </div>

              {formData.group_id && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Darsni boshlash sanasi
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
                  />
                </div>
              )}
            </div>
          )}

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
              {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Guruhga biriktirish Modali */}
      {enrollingStudent && (
        <Modal
          isOpen={Boolean(enrollingStudent)}
          onClose={() => setEnrollingStudent(null)}
          title={`"${enrollingStudent.name}"ni guruhga biriktirish`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEnroll} className="space-y-3.5">
            {enrollError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-700 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{enrollError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Guruhni tanlang *
              </label>
              <select
                required
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
              >
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name} ({grp.course_name} — {grp.days}, {grp.time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Darsni boshlash sanasi *
              </label>
              <input
                type="date"
                required
                value={enrollStartDate}
                onChange={(e) => setEnrollStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
              />
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEnrollingStudent(null)}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-md cursor-pointer border border-stone-200"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={enrolling}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {enrolling ? 'Biriktirilmoqda...' : 'Guruhga qo\'shish'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* O'chirish tasdiqlash dialogi */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="O'quvchini o'chirish"
        message={`Rostdan ham "${deleteTarget?.name}" o'quvchisini tizimdan o'chirmoqchimisiz? Guruhlar va davomat ma'lumotlari ham to'liq o'chiriladi.`}
      />
    </div>
  );
}
