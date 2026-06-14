import { useState, useEffect } from 'react';
import { ArrowRight, Search, Users, Activity, MessageSquare, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminPanel() {
  const [filterType, setFilterType] = useState('All');
  const [searchName, setSearchName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [donors, setDonors] = useState([]);
  const [activeSOS, setActiveSOS] = useState(0);

  // جلب البيانات من Firestore عند تسجيل الدخول
  useEffect(() => {
    if (!isAuthenticated) return;

    // جلب المتبرعين
    const qDonors = query(collection(db, 'donors'));
    const unsubDonors = onSnapshot(qDonors, (snapshot) => {
      const donorsList = [];
      snapshot.forEach(doc => {
        donorsList.push({ id: doc.id, ...doc.data() });
      });
      setDonors(donorsList);
    });

    // جلب طلبات الـ SOS النشطة
    const qSOS = query(collection(db, 'requests'), where('status', '==', 'active'));
    const unsubSOS = onSnapshot(qSOS, (snapshot) => {
      setActiveSOS(snapshot.size);
    });

    return () => {
      unsubDonors();
      unsubSOS();
    };
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى إدخال البريد وكلمة المرور');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
      setError('');
    } catch (err) {
      console.error(err);
      // كحل بديل في حال لم يتم إعداد Auth في Firebase بعد (كما طلب المستخدم)
      if (password === 'اللهم لك' && email === 'admin@qatra.com') {
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
    }
  };

  const handleBulkSMS = () => {
    if (donors.length === 0) return;
    const filteredDonors = donors.filter(d => 
      (filterType === 'All' || d.blood_type === filterType) &&
      (!searchName || d.name?.includes(searchName))
    );
    
    if (filteredDonors.length === 0) {
      alert("لا يوجد متبرعون يطابقون الفلتر الحالي.");
      return;
    }

    const phones = filteredDonors.map(d => d.phone).filter(p => p).join(',');
    if (!phones) {
      alert("لا توجد أرقام هواتف مسجلة لهؤلاء المتبرعين.");
      return;
    }

    window.location.href = `sms:${phones}?body=نداء عاجل للتبرع بالدم فصيلة ${filterType === 'All' ? 'تناسب المريض' : filterType}`;
  };

  const filteredDonors = donors.filter(donor => {
    const matchesType = filterType === 'All' || donor.blood_type === filterType;
    const matchesName = !searchName || donor.name?.includes(searchName);
    return matchesType && matchesName;
  });

  const eligibleCount = donors.filter(d => d.status === 'مؤهل').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">تسجيل الدخول للإدارة</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 text-left dir-ltr"
              dir="ltr"
            />
            <input
              type="password"
              placeholder="أدخل كلمة المرور السرية"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
              dir="auto"
            />
            {error && <p className="text-blood-600 text-sm font-semibold">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors"
            >
              دخول
            </button>
            <Link to="/" className="block mt-4 text-sm text-slate-500 hover:text-slate-700">
              العودة للرئيسية
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8 pt-4">
        <Link to="/" className="p-2 rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900">
          <ArrowRight size={24} />
        </Link>
        <h1 className="text-2xl font-bold mr-4 text-slate-800">إدارة المتبرعين</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 bg-white border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">إجمالي المتبرعين</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{donors.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
          </div>
        </div>
        
        <div className="glass-card p-6 bg-white border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">المؤهلون حالياً</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{eligibleCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={24} /></div>
          </div>
        </div>
        
        <div className="glass-card p-6 bg-white border-l-4 border-l-blood-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">طلبات SOS النشطة</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{activeSOS}</h3>
            </div>
            <div className="p-3 bg-blood-50 text-blood-600 rounded-xl"><Activity size={24} /></div>
          </div>
        </div>
      </div>

      <div className="glass-card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-3 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث بالاسم..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">كل الفصائل</option>
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button 
            onClick={handleBulkSMS}
            disabled={filteredDonors.length === 0}
            className="flex items-center justify-center py-3 px-6 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <MessageSquare size={18} className="ml-2" />
            إرسال SMS جماعي
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="pb-3 pr-4 font-semibold">الاسم</th>
                <th className="pb-3 font-semibold">الفصيلة</th>
                <th className="pb-3 font-semibold">الولاية</th>
                <th className="pb-3 font-semibold">الحالة</th>
                <th className="pb-3 font-semibold">الهاتف</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">لا يوجد متبرعين حالياً</td>
                </tr>
              ) : (
                filteredDonors.map(donor => (
                  <tr key={donor.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-4 font-semibold text-slate-800">{donor.name || 'متبرع بدون اسم'}</td>
                    <td className="py-4">
                      <span className="bg-blood-100 text-blood-700 px-2 py-1 rounded-md text-xs font-bold">{donor.blood_type || donor.type}</span>
                    </td>
                    <td className="py-4 text-slate-600">{donor.city}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        donor.status === 'مؤهل' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {donor.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600 text-sm" dir="ltr">{donor.phone || 'لا يوجد'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
