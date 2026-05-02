import { useState } from 'react';
import { ArrowRight, Phone, AlertTriangle, Building, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SeekerSOS() {
  const [bloodType, setBloodType] = useState('O+');
  const [hospital, setHospital] = useState('');
  const [phone, setPhone] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Real data should come from Firebase
  const responses = [];

  const handleSOS = (e) => {
    e.preventDefault();
    setIsSent(true);
  };

  const handleCall = (phoneNumber) => {
    // In real app, this reveals the phone number first, then calls
    window.location.href = `tel:${phoneNumber.replace(/\*/g, '1')}`; // Mock
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
            className="w-full flex items-center justify-center py-4 rounded-xl font-bold text-lg bg-blood-600 hover:bg-blood-700 text-white shadow-lg shadow-blood-600/30 transition-all transform active:scale-95 animate-pulse-slow"
          >
            <AlertTriangle size={22} className="ml-2" />
            أرسل نداء SOS الآن
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
              {responses.map((resp) => (
                <div key={resp.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">{resp.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{resp.distance} • {resp.time}</p>
                  </div>
                  <button 
                    onClick={() => handleCall(resp.phone)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                  >
                    <Phone size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
