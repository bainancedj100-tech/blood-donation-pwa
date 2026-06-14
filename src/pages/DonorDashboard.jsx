import { useState, useEffect } from 'react';
import { ArrowRight, BellRing, Calendar, MapPin, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DonorDashboard() {
  const [bloodType, setBloodType] = useState('O+');
  const [city, setCity] = useState('تيارت');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isEligible, setIsEligible] = useState(true);
  const [loading, setLoading] = useState(false);

  // حساب الأهلية (90 يوم)
  useEffect(() => {
    if (!lastDonationDate) {
      setIsEligible(true);
      return;
    }
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDonation);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setIsEligible(diffDays >= 90);
  }, [lastDonationDate]);

  const handleSubscribe = async () => {
    if (!isEligible) {
      alert("عذراً، يجب أن يمر 90 يوماً على الأقل من تاريخ آخر تبرع.");
      return;
    }
    
    setLoading(true);
    try {
      // حفظ بيانات المتبرع في Firestore
      await addDoc(collection(db, 'donors'), {
        blood_type: bloodType,
        city: city,
        last_donation: lastDonationDate,
        status: 'مؤهل',
        createdAt: serverTimestamp()
      });

      // هنا يتم الاشتراك الفعلي في FCM Topics مستقبلاً
      // messaging.subscribeToTopic(`${city}_${bloodType.replace('+','_pos').replace('-','_neg')}`);
      
      setSubscribed(true);
    } catch (error) {
      console.error("خطأ في الاشتراك:", error);
      alert("حدث خطأ أثناء الاتصال بقاعدة البيانات. تأكد من إعداد Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8 pt-4">
        <Link to="/" className="p-2 rounded-full bg-white shadow-sm text-slate-600 hover:text-slate-900">
          <ArrowRight size={24} />
        </Link>
        <h1 className="text-2xl font-bold mr-4 text-slate-800">حساب المتبرع</h1>
      </div>

      {/* Status Card */}
      <div className="glass-card p-6 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-md mb-4 border-4 border-emerald-100">
          <Droplets className="text-emerald-500" size={36} />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mb-1">أنت بطل حقيقي!</h2>
        <p className="text-sm text-slate-500 mb-4">
          أهليتك للتبرع: 
          {isEligible ? (
            <span className="text-emerald-600 font-bold mr-2">مؤهل حالياً</span>
          ) : (
            <span className="text-red-500 font-bold mr-2">غير مؤهل (لم يمر 90 يوماً)</span>
          )}
        </p>
      </div>

      {/* Settings Form */}
      <div className="space-y-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <Droplets size={18} className="mr-2 text-blood-500" />
            فصيلة الدم
          </label>
          <select 
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            disabled={subscribed}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blood-500 disabled:opacity-50"
          >
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <MapPin size={18} className="mr-2 text-blue-500" />
            الولاية / المدينة
          </label>
          <select 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={subscribed}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {['تيارت', 'وهران', 'الجزائر العاصمة', 'قسنطينة'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-3">
            <Calendar size={18} className="mr-2 text-purple-500" />
            تاريخ آخر تبرع
          </label>
          <input 
            type="date"
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
            disabled={subscribed}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSubscribe}
          disabled={subscribed || !isEligible || loading}
          className={`w-full flex items-center justify-center py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg ${
            subscribed 
            ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
            : !isEligible 
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blood-600 hover:bg-blood-700 text-white shadow-blood-600/30'
          }`}
        >
          <BellRing size={22} className="ml-2" />
          {loading ? 'جاري التفعيل...' : subscribed ? 'أنت مستعد لتلقي نداءات الاستغاثة' : 'أنا مستعد للطوارئ (تفعيل التنبيهات)'}
        </button>
      </div>
    </div>
  );
}
