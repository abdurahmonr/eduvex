import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layers, 
  Users, 
  Clock, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle,
  Eye,
  UserPlus,
  UserMinus
} from 'lucide-react';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Guruh yaratish / tahrirlash modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    course_id: '',
    teacher_id: '',
    days: 'Du-Chor-Jum',
    time: '14:00'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Guruh tafsilotlari (o'quvchilar ro'yxati) modal
  const [viewingGroup, setViewingGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Guruhga o'quvchi biriktirish
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsData, coursesData, teachersData] = await Promise.all([
        api.getGroups(),
        api.getCourses(),
        api.getTeachers(),
      ]);
      setGroups(groupsData);
      setCourses(coursesData);
      setTeachers(teachersData);
    } catch (err) {
      showAlert(err.message || 'Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      course_id: courses[0]?.id ? String(courses[0].id) : '',
      teacher_id: teachers[0]?.id ? String(teachers[0].id) : '',
      days: 'Du-Chor-Jum',
      time: '14:00'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (group, e) => {
    e?.stopPropagation();
    setEditingGroup(group);
    setFormData({
      name: group.name,
      course_id: group.course_id ? String(group.course_id) : '',
      teacher_id: group.teacher_id ? String(group.teacher_id) : '',
      days: group.days || 'Du-Chor-Jum',
      time: group.time || '14:00'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.course_id || !formData.teacher_id || !formData.days || !formData.time) {
      setFormError('Barcha maydonlarni to\'ldiring');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingGroup) {
        const updated = await api.updateGroup(editingGroup.id, formData);
        setGroups(groups.map(g => g.id === editingGroup.id ? updated : g));
        showAlert('Guruh muvaffaqiyatli yangilandi');
      } else {
        const created = await api.createGroup(formData);
        setGroups([created, ...groups]);
        showAlert('Yangi guruh muvaffaqiyatli ochildi');
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
      await api.deleteGroup(deleteTarget.id);
      setGroups(groups.filter(g => g.id !== deleteTarget.id));
      showAlert('Guruh o\'chirildi');
      setDeleteTarget(null);
      if (viewingGroup?.id === deleteTarget.id) {
        setViewingGroup(null);
      }
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewGroup = async (group) => {
    setViewingGroup(group);
    setDetailsLoading(true);
    try {
      const data = await api.getGroup(group.id);
      setGroupDetails(data);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const openAddStudentModal = async () => {
    try {
      const studs = await api.getStudents();
      setAllStudents(studs);
      setSelectedStudentId(studs[0]?.id || '');
      setEnrollStartDate(new Date().toISOString().split('T')[0]);
      setEnrollError('');
      setIsAddStudentOpen(true);
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !viewingGroup) return;

    setEnrolling(true);
    setEnrollError('');
    try {
      await api.enrollStudent({
        student_id: selectedStudentId,
        group_id: viewingGroup.id,
        start_date: enrollStartDate
      });

      const updatedDetails = await api.getGroup(viewingGroup.id);
      setGroupDetails(updatedDetails);
      
      setGroups(groups.map(g => g.id === viewingGroup.id ? { ...g, student_count: (g.student_count || 0) + 1 } : g));

      showAlert('O\'quvchi guruhga biriktirildi');
      setIsAddStudentOpen(false);
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId) => {
    try {
      await api.removeEnrollment(enrollmentId);
      const updatedDetails = await api.getGroup(viewingGroup.id);
      setGroupDetails(updatedDetails);
      setGroups(groups.map(g => g.id === viewingGroup.id ? { ...g, student_count: Math.max(0, (g.student_count || 1) - 1) } : g));
      showAlert('O\'quvchi guruhdan chiqarildi');
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Guruh, kurs yoki o'qituvchi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 transition-colors"
          />
        </div>

        {/* 1 Primary Button */}
        <button
          onClick={openCreateModal}
          disabled={courses.length === 0 || teachers.length === 0}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-medium rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Yangi guruh ochish</span>
        </button>
      </div>

      {(courses.length === 0 || teachers.length === 0) && (
        <div className="p-3 bg-stone-100 border border-stone-200 rounded-md text-stone-700 text-xs">
          Guruh ochishdan oldin kamida bitta kurs va bitta o'qituvchi qo'shilgan bo'lishi kerak.
        </div>
      )}

      {/* Guruhlar ro'yxati (Grid uslubida toza kartochkalar) */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 text-xs bg-white rounded-lg border border-stone-200/90">
          Guruhlar yuklanmoqda...
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="p-12 text-center text-stone-400 text-xs bg-white rounded-lg border border-stone-200/90">
          {searchTerm ? 'Qidiruv bo\'yicha guruh topilmadi' : 'Hozircha guruhlar ochilmagan'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleViewGroup(group)}
              className="bg-white border border-stone-200/90 hover:border-stone-300 rounded-lg p-4 transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header: Nomi va Action tugmalar */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-600 shrink-0">
                      <Layers className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm leading-snug">
                        {group.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <BookOpen className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                        {group.course_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={(e) => openEditModal(group, e)}
                      title="Tahrirlash"
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(group);
                      }}
                      title="O'chirish"
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Tafsilotlar */}
                <div className="space-y-1.5 py-2.5 border-y border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" strokeWidth={1.5} />
                      O'qituvchi:
                    </span>
                    <span className="font-medium text-stone-800">{group.teacher_name || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Dars kunlari:
                    </span>
                    <span className="font-medium text-stone-800">{group.days}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Dars vaqti:
                    </span>
                    <span className="font-medium text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded font-mono tabular-nums text-[11px]">
                      {group.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: O'quvchilar soni va Ko'rish tugmasi */}
              <div className="mt-3 pt-2 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-medium text-stone-700 bg-stone-100 border border-stone-200/60 px-2 py-0.5 rounded text-[11px] tabular-nums">
                  <Users className="w-3 h-3 text-stone-500" strokeWidth={1.5} />
                  {group.student_count || 0} o'quvchi
                </span>
                <span className="text-stone-600 group-hover:text-stone-900 font-medium inline-flex items-center gap-1 text-xs transition-colors">
                  O'quvchilar ro'yxati <Eye className="w-3 h-3" strokeWidth={1.5} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guruh ochish / tahrirlash Modali */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh ochish'}
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
              Guruh nomi *
            </label>
            <input
              type="text"
              required
              placeholder="IELTS Target 7.0 yoki Frontend #2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Kursi *
              </label>
              <select
                required
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 cursor-pointer"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                O'qituvchi *
              </label>
              <select
                required
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 cursor-pointer"
              >
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Dars kunlari *
              </label>
              <select
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 cursor-pointer"
              >
                <option value="Du-Chor-Jum">Du-Chor-Jum (Toq kunlar)</option>
                <option value="Se-Pay-Shan">Se-Pay-Shan (Juft kunlar)</option>
                <option value="Har kuni">Har kuni</option>
                <option value="Shanba-Yakshanba">Shanba-Yakshanba (Weekend)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Dars vaqti *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs font-mono tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
              />
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

      {/* Guruh tafsilotlari va O'quvchilar ro'yxati modali */}
      {viewingGroup && (
        <Modal
          isOpen={Boolean(viewingGroup)}
          onClose={() => setViewingGroup(null)}
          title={`Guruh: ${viewingGroup.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Guruh qisqacha ma'lumotlari */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-stone-50 border border-stone-200/80 rounded-lg text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Kurs:</span>
                <span className="font-semibold text-stone-900">{viewingGroup.course_name}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">O'qituvchi:</span>
                <span className="font-semibold text-stone-900">{viewingGroup.teacher_name || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Kunlar:</span>
                <span className="font-semibold text-stone-900">{viewingGroup.days}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Vaqti:</span>
                <span className="font-mono font-semibold text-stone-900 tabular-nums">{viewingGroup.time}</span>
              </div>
            </div>

            {/* O'quvchilar ro'yxati */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h5 className="font-semibold text-xs text-stone-900">
                  Guruhdagi o'quvchilar ({groupDetails?.students?.length || 0} nafar)
                </h5>
                <button
                  onClick={openAddStudentModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1B4332] hover:bg-[#143326] text-white rounded text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>O'quvchi biriktirish</span>
                </button>
              </div>

              {detailsLoading ? (
                <div className="py-8 text-center text-stone-400 text-xs">Yuklanmoqda...</div>
              ) : !groupDetails?.students || groupDetails.students.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs bg-stone-50/50 rounded border border-dashed border-stone-200">
                  Ushbu guruhda hali birorta ham o'quvchi yo'q. "O'quvchi biriktirish" tugmasi orqali qo'shing.
                </div>
              ) : (
                <div className="border border-stone-200/80 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50/60 text-stone-500 font-medium uppercase tracking-wider border-b border-stone-200/80">
                      <tr>
                        <th className="px-3.5 py-2.5">№</th>
                        <th className="px-3.5 py-2.5">O'quvchi ismi</th>
                        <th className="px-3.5 py-2.5">Telefon</th>
                        <th className="px-3.5 py-2.5">Boshlagan sana</th>
                        <th className="px-3.5 py-2.5 text-right">Chiqarish</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {groupDetails.students.map((st, i) => (
                        <tr key={st.enrollment_id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="px-3.5 py-3 font-mono text-stone-400 tabular-nums">{i + 1}</td>
                          <td className="px-3.5 py-3 font-medium text-stone-900 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 font-medium text-[11px] flex items-center justify-center shrink-0 border border-stone-200/60">
                              {st.name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{st.name}</span>
                          </td>
                          <td className="px-3.5 py-3 font-mono text-stone-600 tabular-nums">{st.phone}</td>
                          <td className="px-3.5 py-3 font-mono text-stone-500 tabular-nums">{st.start_date || '—'}</td>
                          <td className="px-3.5 py-3 text-right">
                            <button
                              onClick={() => handleRemoveStudent(st.enrollment_id)}
                              title="Guruhdan chiqarish"
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                            >
                              <UserMinus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Guruhga o'quvchi biriktirish Modali */}
      {isAddStudentOpen && (
        <Modal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          title={`Guruhga yangi o'quvchi qo'shish`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEnrollStudent} className="space-y-3.5">
            {enrollError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-800 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.5} />
                <span>{enrollError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                O'quvchini tanlang *
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 cursor-pointer"
              >
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
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
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs font-mono tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
              />
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 rounded-md cursor-pointer border border-stone-200 transition-colors"
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

      {/* O'chirish dialogi */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Guruhni o'chirish"
        message={`Rostdan ham "${deleteTarget?.name}" guruhini o'chirmoqchimisiz?`}
      />
    </div>
  );
}
