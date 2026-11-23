import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  PhoneCall, 
  CalendarCheck, 
  XCircle, 
  Clock,
  Sparkles
} from 'lucide-react';

const STAGES = [
  {
    id: 'yangi',
    title: 'Yangi',
    desc: 'Yangi qoldirilgan arizalar',
    dotColor: 'bg-stone-400'
  },
  {
    id: 'boglandi',
    title: "Bog'landi",
    desc: "Aloqa o'rnatilgan lidlar",
    dotColor: 'bg-amber-500'
  },
  {
    id: 'sinov_darsi',
    title: 'Sinov darsi',
    desc: 'Sinov darsiga taklif qilingan',
    dotColor: 'bg-emerald-600'
  },
  {
    id: 'yozildi',
    title: 'Yozildi',
    desc: 'Guruhga qabul qilinganlar',
    dotColor: 'bg-[#1B4332]'
  },
  {
    id: 'rad_etdi',
    title: 'Rad etdi',
    desc: 'Rad etgan yoki bekor qilgan',
    dotColor: 'bg-rose-500'
  }
];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMsg, setAlertMsg] = useState(null);

  // Drag & Drop holati
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Modal holatlari: Qo'shish / Tahrirlash
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '+998 ',
    course_name: '',
    notes: '',
    status: 'yangi'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // O'chirish holati
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // O'quvchiga aylantirish holati
  const [convertingId, setConvertingId] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertMsg({ message, type });
    setTimeout(() => setAlertMsg(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, coursesData] = await Promise.all([
        api.getLeads(),
        api.getCourses().catch(() => [])
      ]);
      setLeads(leadsData || []);
      setCourses(coursesData || []);
    } catch (err) {
      showAlert(err.message || 'Lidlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (leadId, newStatus) => {
    const prevLeads = [...leads];
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead || targetLead.status === newStatus) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

    try {
      await api.updateLeadStatus(leadId, newStatus);
      const stageName = STAGES.find(s => s.id === newStatus)?.title || newStatus;
      showAlert(`Lid holati "${stageName}" ga o'zgartirildi`);
    } catch (err) {
      setLeads(prevLeads);
      showAlert(err.message || 'Statusni yangilashda xatolik', 'error');
    }
  };

  const onDragStart = (e, lead) => {
    setDraggedLeadId(lead.id);
    e.dataTransfer.setData('text/plain', String(lead.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const onDragLeave = (stageId) => {
    if (dragOverStage === stageId) {
      setDragOverStage(null);
    }
  };

  const onDrop = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadIdStr = e.dataTransfer.getData('text/plain') || String(draggedLeadId);
    const leadId = Number(leadIdStr);
    if (leadId) {
      handleStatusChange(leadId, stageId);
    }
    setDraggedLeadId(null);
  };

  const openCreateModal = () => {
    setEditingLead(null);
    setFormData({
      name: '',
      phone: '+998 ',
      course_name: courses[0]?.name || '',
      notes: '',
      status: 'yangi'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      phone: lead.phone || '+998 ',
      course_name: lead.course_name || '',
      notes: lead.notes || '',
      status: lead.status || 'yangi'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Ism va telefon raqami majburiy');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingLead) {
        const updated = await api.updateLead(editingLead.id, formData);
        setLeads(prev => prev.map(l => l.id === editingLead.id ? updated : l));
        showAlert("Lid ma'lumotlari muvaffaqiyatli tahrirlandi");
      } else {
        const created = await api.createLead(formData);
        setLeads(prev => [created, ...prev]);
        showAlert("Yangi lid muvaffaqiyatli qo'shildi");
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteLead(deleteTarget.id);
      setLeads(prev => prev.filter(l => l.id !== deleteTarget.id));
      showAlert("Lid muvaffaqiyatli o'chirildi");
      setDeleteTarget(null);
    } catch (err) {
      showAlert(err.message || "O'chirishda xatolik yuz berdi", 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleConvertToStudent = async (lead) => {
    setConvertingId(lead.id);
    try {
      await api.convertLeadToStudent(lead);
      await api.updateLeadStatus(lead.id, 'yozildi');
      await loadData();
      showAlert(`"${lead.name}" muvaffaqiyatli o'quvchilar ro'yxatiga qo'shildi!`);
    } catch (err) {
      showAlert(err.message || "O'quvchiga aylantirishda xatolik", 'error');
    } finally {
      setConvertingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const filteredLeads = leads.filter(l => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.course_name && l.course_name.toLowerCase().includes(q)) ||
      (l.notes && l.notes.toLowerCase().includes(q))
    );
  });

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

      {/* Header & Filterlar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-stone-900 tracking-tight">Lidlar (CRM Kanban doskasi)</h2>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-stone-100 border border-stone-200/60 text-stone-700 tabular-nums">
              {leads.length} ta umumiy
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Mijozlar bilan aloqa, sinov darslari va o'quvchiga aylantirish bosqichlari
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Qidiruv */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Qidirish (ism, telefon)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 transition-colors"
            />
          </div>

          {/* Yangilash */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            title="Yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-400 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>

          {/* Asosiy Tugma (Faqat 1 ta sahifada!) */}
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#143326] text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Yangi lid qo'shish</span>
          </button>
        </div>
      </div>

      {/* KANBAN DOSKASI (5 ta ustun) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(l => (l.status || 'yangi') === stage.id);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => onDragOver(e, stage.id)}
              onDragLeave={() => onDragLeave(stage.id)}
              onDrop={(e) => onDrop(e, stage.id)}
              className={`flex flex-col rounded-lg border transition-colors min-h-[580px] p-3 ${
                isOver 
                  ? 'border-stone-400 bg-stone-200/50' 
                  : 'bg-stone-100/60 border-stone-200/80'
              }`}
            >
              {/* Ustun Sarlavhasi (Faqat kichik nuqta va sokin badge) */}
              <div className="pb-2.5 mb-2.5 border-b border-stone-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${stage.dotColor}`} />
                  <h3 className="font-semibold text-stone-800 text-xs tracking-tight">{stage.title}</h3>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-stone-100 border border-stone-200/60 text-stone-600 tabular-nums">
                  {stageLeads.length}
                </span>
              </div>

              {/* Kartochkalar maydoni */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                {stageLeads.length === 0 ? (
                  <div className={`py-10 px-2 text-center rounded-md border border-dashed transition-colors ${
                    isOver ? 'border-stone-400 bg-white/70' : 'border-stone-200 bg-transparent'
                  }`}>
                    <p className="text-[11px] text-stone-400">
                      {isOver ? "Shu yerga tashlang" : "Lidlar yo'q"}
                    </p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const isDragging = draggedLeadId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        draggable={true}
                        onDragStart={(e) => onDragStart(e, lead)}
                        className={`group bg-white rounded-md border border-stone-200/90 p-3 shadow-xs transition-colors cursor-grab active:cursor-grabbing hover:border-stone-300 ${
                          isDragging ? 'opacity-40 border-dashed border-stone-400' : ''
                        }`}
                      >
                        {/* Ism va Amallar */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-medium text-stone-900 text-xs truncate leading-snug" title={lead.name}>
                            {lead.name}
                          </h4>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditModal(lead)}
                              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded transition-colors cursor-pointer"
                              title="Tahrirlash"
                            >
                              <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(lead)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-50 rounded transition-colors cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        {/* Telefon raqami */}
                        <div className="mb-1.5">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
                            <span>{lead.phone}</span>
                          </a>
                        </div>

                        {/* Qiziqqan kursi */}
                        {lead.course_name && (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200/60 max-w-full truncate">
                              <BookOpen className="w-3 h-3 text-stone-400 shrink-0" strokeWidth={1.5} />
                              <span className="truncate">{lead.course_name}</span>
                            </span>
                          </div>
                        )}

                        {/* Izoh */}
                        {lead.notes && (
                          <div className="mb-2 p-1.5 bg-stone-50 rounded border border-stone-100 text-[11px] text-stone-500 italic leading-relaxed">
                            "{lead.notes}"
                          </div>
                        )}

                        {/* Yaratilgan sana va Bosqich tanlash */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3 text-stone-300" strokeWidth={1.5} />
                            {formatDate(lead.created_at)}
                          </span>

                          <select
                            value={lead.status || 'yangi'}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className="text-[10px] font-medium bg-transparent text-stone-500 hover:text-stone-900 border-none focus:outline-none cursor-pointer text-right"
                            title="Bosqichni o'zgartirish"
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>
                                &rarr; {s.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* O'quvchiga aylantirish tugmasi (sokin ikkilamchi tugma) */}
                        {stage.id === 'yozildi' && (
                          <div className="mt-2.5 pt-2 border-t border-stone-100">
                            <button
                              onClick={() => handleConvertToStudent(lead)}
                              disabled={convertingId === lead.id}
                              className="w-full py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-[11px] font-medium rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <UserPlus className="w-3 h-3 text-stone-500" strokeWidth={1.5} />
                              <span>{convertingId === lead.id ? "Qo'shilmoqda..." : "O'quvchiga aylantirish"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* YANGI LID QO'SHISH VA TAHRIRLASH MODALI */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLead ? "Lidni tahrirlash" : "Yangi lid qo'shish"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveLead} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200/60 text-rose-700 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Mijoz Ismi va Familiyasi *
            </label>
            <input
              type="text"
              required
              placeholder="Sardor Rustamov"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Qiziqqan kursi
              </label>
              <input
                type="text"
                list="courses-list"
                placeholder="Kurs nomi"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900"
              />
              <datalist id="courses-list">
                {courses.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Bosqichi (Holati)
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 text-stone-900 cursor-pointer"
              >
                {STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Qo'shimcha izoh
            </label>
            <textarea
              rows={3}
              placeholder="Mijoz haqida eslatma yoki qo'shimcha ma'lumot..."
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
              {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </Modal>

      {/* O'CHIRISHNI TASDIQLASH DIALOGI */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLead}
        title="Lidni o'chirish"
        message={`Rostdan ham "${deleteTarget?.name}" lidini CRM bazasidan butunlay o'chirmoqchimisiz?`}
        loading={deleting}
      />
    </div>
  );
}
