import { useState, useEffect } from 'react';
import { ArrowRight, Phone, AlertTriangle, Building, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export default function SeekerSOS() {
  const [bloodType, setBloodType] = useState('O+');
  const [hospital, setHospital] = useState('');
  const [phone, setPhone] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  // الاستماع لاستجابات المتبرعين اللحظية بعد نشر الطلب
  useEffect(() => {
    if (!requestId) return;

    const q = query(
      collection(db, 'responses'),
      where('requestId', '==', requestId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const responders = [];
      snapshot.forEach((doc) => {
        responders.push({ id: doc.id, ...doc.data() });
      });
      setResponses(responders);
    });

    return () => unsubscribe();
  }, [requestId]);

  const handleSOS = async (e) => {
    e.preventDefault();
    if (!hospital || phone.length < 10) {
      alert("يرجى إدخال اسم المستشفى ورقم هاتف صحيح.");
      return;
    }

    setLoading(true);
    try {
      // إرسال طلب الـ SOS لقاعدة البيانات
      const docRef = await addDoc(collection(db, 'requests'), {
        blood_type: bloodType,
        hospital: hospital,
        phone: phone,
        status: 'active',
        createdAt: serverTimestamp()
      });
      
      setRequestId(docRef.id);
      setIsSent(true);
      // هنا سيقوم Cloud Function بإرسال FCM لجميع المتبرعين المطابقين
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("حدث خطأ في إرسال النداء. تأكد من إعدادات Firebase.");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (phoneNumber, responderId) => {
    // توثيق عملية الاتصال في قاعدة البيانات لأغراض الأمان
    try {
      await addDoc(collection(db, 'calls_log'), {
        responderId,
        requestId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error logging call", error);
    }
    
    // فتح تطبيق الاتصال في الهاتف
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen p-6 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8 pt-4">
        <Link to="/" className="p-2 rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900">
          <ArrowRight size={24} />
        </Link>
        <h1 className="text-2xl font-bold mr-4 text-slate-800">نداء استغاثة</h1>
      </div>

      {!isSent ? (
        <form onSubmit={handleSOS} className="space-y-6">
          <div className="glass-card p-6 bg-blood-50 border-blood-100">
            <div className="flex items-start mb-4 text-blood-700">
              <AlertTriangle className="mr-2 flex-shrink-0" size={24} />
              <p className="text-sm font-semibold leading-relaxed">
                سيتم إرسال إشعار فوري لجميع المتبرعين المؤهلين في منطقتك. يرجى التأكد من صحة المعلومات.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <Droplets size={16} className="mr-2 text-blood-500" />
                  الفصيلة المطلوبة
                </label>
                <select 
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blood-500 shadow-sm"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <Building size={16} className="mr-2 text-slate-500" />
                  اسم المستشفى
                </label>
                <input 
                  type="text"
                  required
                  placeholder="مثال: مستشفى يوسف دمرجي"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blood-500 shadow-sm"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <Phone size={16} className="mr-2 text-slate-500" />
                  رقم الهاتف للتواصل
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="05..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blood-500 shadow-sm text-left dir-ltr"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 rounded-xl font-bold text-lg bg-blood-600 hover:bg-blood-700 text-white shadow-lg shadow-blood-600/30 transition-all transform active:scale-95 animate-pulse-slow disabled:opacity-50"
          >
            <AlertTriangle size={22} className="ml-2" />
            {loading ? 'جاري إرسال النداء...' : 'أرسل نداء SOS الآن'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-8 text-center bg-emerald-50 border-emerald-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">تم إرسال النداء بنجاح</h2>
            <p className="text-slate-600 text-sm">جاري البحث عن متبرعين في محيطك... يرجى إبقاء هذه الصفحة مفتوحة لمتابعة الاستجابات.</p>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">المستجيبون للنداء</h3>
              <span className="bg-blood-100 text-blood-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">مباشر (Live)</span>
            </div>

            <div className="space-y-3">
              {responses.length === 0 ? (
                <div className="bg-white p-4 rounded-xl text-center text-slate-500 shadow-sm border border-slate-100">
                  لا توجد استجابات بعد... سيتم تحديث القائمة تلقائياً.
                </div>
              ) : (
                responses.map((resp) => (
                  <div key={resp.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">{resp.name || 'متبرع فاعل خير'}</h4>
                      <p className="text-xs text-slate-500 mt-1">{resp.distance || 'قريب منك'} • {resp.blood_type}</p>
                    </div>
                    <button 
                      onClick={() => handleCall(resp.phone, resp.id)}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                    >
                      <Phone size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
