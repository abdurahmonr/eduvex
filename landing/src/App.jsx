import React, { useState, useEffect } from 'react';
import { 
  School, 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck 
} from 'lucide-react';
import { submitLead, supabase } from './lib/supabase';

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '+998 ',
    course_name: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!supabase) {
        setCoursesLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('courses').select('*');
        if (data && data.length > 0) {
          setCourses(data.map((c, i) => ({
            id: c.id,
            title: c.name,
            desc: c.description || "Zamonaviy o'quv dasturi va amaliy mashg'ulotlar asosida mukammal ta'lim.",
            duration: "Muntazam",
            price: `${Number(c.price || 0).toLocaleString('uz-UZ')} so'm / oy`,
            badge: i === 0 ? 'Eng mashhur' : 'Kurs'
          })));
          setFormData(prev => ({ ...prev, course_name: data[0].name }));
        } else {
          setCourses([]);
          setFormData(prev => ({ ...prev, course_name: '' }));
        }
      } catch (err) {
        console.warn('Courses fetch error:', err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Ism va telefon raqamingizni kiriting');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await submitLead(formData);
      setSuccess(true);
      setFormData({
        name: '',
        phone: '+998 ',
        course_name: courses[0]?.title || '',
        notes: ''
      });
      setTimeout(() => setSuccess(false), 8000);
    } catch (err) {
      setError(err.message || 'Arizani yuborishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const scrollToApply = (courseName) => {
    if (courseName) {
      setFormData(prev => ({ ...prev, course_name: courseName }));
    }
    document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-[#1B4332] selection:text-white">
      {/* 1. Header & Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-stone-200/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#1B4332] flex items-center justify-center text-white shadow-xs">
              <School className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-sm font-semibold text-stone-900 tracking-tight">KELAJAK TA'LIM</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-medium text-stone-500 uppercase tracking-wider">O'quv Markazi</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
            <a href="#courses" className="hover:text-stone-900 transition-colors">Kurslar</a>
            <a href="#features" className="hover:text-stone-900 transition-colors">Afzalliklar</a>
            <a href="#apply-section" className="hover:text-stone-900 transition-colors">Qabul</a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-md transition-colors border border-stone-200"
              title="Admin CRM & ERP"
            >
              <span>Admin</span>
              <ExternalLink className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
            </a>

            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-md transition-colors border border-stone-200"
              title="Direktor Boshqaruvi"
            >
              <span>Direktor</span>
              <ExternalLink className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
            </a>

            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 rounded-md transition-colors border border-stone-200"
              title="Ustoz Portali"
            >
              <span>Ustoz</span>
              <ExternalLink className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
            </a>

            <button
              onClick={() => scrollToApply()}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors cursor-pointer shadow-xs"
            >
              Ariza qoldirish
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 sm:pt-24 sm:pb-20 border-b border-stone-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332]"></span>
            <span>Yangi guruhlarga qabul boshlandi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold text-stone-900 tracking-tight leading-[1.2] mb-5 max-w-3xl mx-auto">
            Zamonaviy bilimlar bilan kelajagingiz poydevorini quring
          </h1>

          <p className="text-sm sm:text-base text-stone-500 leading-relaxed mb-8 max-w-2xl mx-auto">
            Xalqaro standartlar asosida chet tillari, IT dasturlash va intellektual rivojlanish kurslari. 
            Amaliy tajribaga ega kuchli mutaxassis ustozlar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* 1 Primary Action Button */}
            <button
              onClick={() => scrollToApply()}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-medium rounded-md text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Bepul sinov darsiga yozilish</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
            
            <a
              href="#courses"
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium rounded-md text-xs sm:text-sm transition-colors text-center"
            >
              Barcha kurslarni ko'rish
            </a>
          </div>

          {/* Statistika ko'rsatkichlari */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-stone-100 max-w-4xl mx-auto">
            <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200/80">
              <p className="text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">1,200+</p>
              <p className="text-xs text-stone-500 mt-1">Bitiruvchilar</p>
            </div>
            <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200/80">
              <p className="text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">15+</p>
              <p className="text-xs text-stone-500 mt-1">Malakali o'qituvchilar</p>
            </div>
            <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200/80">
              <p className="text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">98%</p>
              <p className="text-xs text-stone-500 mt-1">Ijobiy natijalar</p>
            </div>
            <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200/80">
              <p className="text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">8 ta</p>
              <p className="text-xs text-stone-500 mt-1">Ta'lim yo'nalishlari</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Kurslar bo'limi */}
      <section id="courses" className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-1.5">Dasturlar</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">Eng ommabop va talabgir kurslar</h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">O'zingizga ma'qul yo'nalishni tanlang va birinchi bepul darsda qatnashing</p>
          </div>

          {coursesLoading ? (
            <div className="text-center py-12 text-stone-400 text-xs flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Kurslar yuklanmoqda...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-stone-200/90 max-w-lg mx-auto p-8">
              <p className="text-stone-800 font-semibold text-sm">Hozircha kurslar jadvali yangilanmoqda</p>
              <p className="text-xs text-stone-500 mt-1.5">
                Administrator paneli orqali kurslar kiritilgach, ular avtomatik shu yerda aks etadi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((course, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-stone-200/90 rounded-lg p-5 flex flex-col justify-between hover:border-stone-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 bg-stone-100 border border-stone-200/80 text-stone-700 text-[11px] font-medium rounded">
                        {course.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-stone-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed mb-6">
                      {course.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                        Davomiyligi:
                      </span>
                      <span className="font-medium text-stone-700">{course.duration}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Oylik to'lov:</span>
                      <span className="font-semibold text-stone-900 tabular-nums">{course.price}</span>
                    </div>

                    <button
                      onClick={() => scrollToApply(course.title)}
                      className="w-full py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 font-medium text-xs rounded-md transition-colors cursor-pointer"
                    >
                      Yozilish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Afzalliklar */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-1.5">Afzalliklar</p>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">Sifatli ta'lim uchun yaratilgan sharoitlar</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FAF9F6] p-5 rounded-lg border border-stone-200/80">
              <div className="w-8 h-8 bg-stone-100 text-stone-600 rounded-md border border-stone-200/60 flex items-center justify-center mb-3">
                <Award className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h4 className="font-semibold text-stone-900 text-sm mb-1.5">Tajribali ustozlar</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Har bir yo'nalish bo'yicha kamida 3-5 yillik tajribaga ega sertifikatlangan mutaxassislar.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-lg border border-stone-200/80">
              <div className="w-8 h-8 bg-stone-100 text-stone-600 rounded-md border border-stone-200/60 flex items-center justify-center mb-3">
                <Users className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h4 className="font-semibold text-stone-900 text-sm mb-1.5">Kichik guruhlar</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Har bir o'quvchiga individual yondashuv uchun guruhda ko'pi bilan 10-12 nafar o'quvchi.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-lg border border-stone-200/80">
              <div className="w-8 h-8 bg-stone-100 text-stone-600 rounded-md border border-stone-200/60 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h4 className="font-semibold text-stone-900 text-sm mb-1.5">Kafolatlangan natija</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Muntazam testlar va davomat monitoringi orqali o'zlashtirish doimiy nazoratda bo'ladi.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-lg border border-stone-200/80">
              <div className="w-8 h-8 bg-stone-100 text-stone-600 rounded-md border border-stone-200/60 flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h4 className="font-semibold text-stone-900 text-sm mb-1.5">Zamonaviy muhit</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Yorug' va shinam xonalar, sifatli o'quv materiallari va qulay sharoitlar bilan to'liq ta'minlangan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Ariza qoldirish */}
      <section id="apply-section" className="py-16 sm:py-20 bg-[#FAF9F6] border-t border-b border-stone-200/80">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-medium inline-block mb-2 shadow-2xs">
              Ro'yxatdan o'tish
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
              Bepul konsultatsiya va sinov darsi
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-2">
              Ma'lumotlaringizni qoldiring, 15 daqiqa ichida siz bilan bog'lanib barcha savollaringizga javob beramiz.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-stone-200/90 p-6 sm:p-8 shadow-xs">
            {success && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-md flex items-start gap-2.5 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">Arizangiz muvaffaqiyatli qabul qilindi</p>
                  <p className="text-emerald-700 mt-0.5">Tez orada menejerlarimiz siz bilan bog'lanishadi.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/60 rounded-md flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.5} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Ism va Familiya *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sardor Rustamov"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Telefon raqam *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+998 90 123 45 67"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 tabular-nums focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Qiziqqan kursingiz
                  </label>
                  <select
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 transition-colors cursor-pointer"
                  >
                    {courses.length > 0 ? (
                      courses.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))
                    ) : (
                      <option value="">Kurslar kiritilmagan</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Qo'shimcha izoh
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: kechki guruhlar"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-md text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1B4332] hover:bg-[#143326] text-white font-medium rounded-md text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{loading ? 'Yuborilmoqda...' : 'Arizani yuborish'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <School className="w-4 h-4 text-stone-700" strokeWidth={1.5} />
            <span className="font-medium text-stone-900">Kelajak Ta'lim O'quv Markazi</span>
          </div>
          <p className="tabular-nums">© 2026 Barcha huquqlar himoyalangan. sayt.uz</p>
          <div className="flex items-center gap-4">
            <a href="http://localhost:3001" className="hover:text-stone-900 transition-colors">Admin Panel</a>
            <a href="http://localhost:3002" className="hover:text-stone-900 transition-colors">Direktor Paneli</a>
            <a href="http://localhost:3003" className="hover:text-stone-900 transition-colors">Ustoz Paneli</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
