import { Link } from 'react-router-dom';
import { Heart, Activity, ShieldAlert, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blood-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blood-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blood-100 text-blood-600 mb-4 shadow-inner">
            <Heart size={48} fill="currentColor" className="animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">قطرة حياة</h1>
          <p className="text-lg text-slate-600">منصة الاستجابة السريعة للتبرع بالدم</p>
        </div>

        <div className="grid gap-4 mt-12">
          <Link to="/sos" className="glass-card group flex items-center p-6 transition-all hover:bg-blood-50 hover:border-blood-200">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-blood-100 flex items-center justify-center text-blood-600 group-hover:scale-110 transition-transform">
              <ShieldAlert size={28} />
            </div>
            <div className="mr-6">
              <h3 className="text-xl font-bold text-slate-900">أنا محتاج للدم (استغاثة)</h3>
              <p className="text-sm text-slate-500 mt-1">انشر طلب SOS لتصل رسالتك للمتبرعين فوراً</p>
            </div>
          </Link>

          <Link to="/donor" className="glass-card group flex items-center p-6 transition-all hover:bg-emerald-50 hover:border-emerald-200">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Activity size={28} />
            </div>
            <div className="mr-6">
              <h3 className="text-xl font-bold text-slate-900">أنا متبرع (مستعد)</h3>
              <p className="text-sm text-slate-500 mt-1">سجل فصيلتك لتتلقى إشعارات الحالات الطارئة</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
