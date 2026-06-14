// 🔴 نسخة وهمية (Mock) لـ Firebase 🔴
// تم بناء هذا الملف ليعمل التطبيق محلياً بدون الحاجة لإنشاء حساب حقيقي في جوجل.
// يعتمد على التخزين المحلي (Local Storage) في متصفحك.

export const db = {};
export const auth = {};

let mockId = Date.now();
const listeners = {};

export const collection = (db, name) => name;

export const addDoc = async (colName, data) => {
  const items = JSON.parse(localStorage.getItem(colName) || '[]');
  const newDoc = { id: String(mockId++), ...data, createdAt: new Date().toISOString() };
  items.push(newDoc);
  localStorage.setItem(colName, JSON.stringify(items));
  
  if (listeners[colName]) {
    listeners[colName].forEach(notify => notify());
  }
  return { id: newDoc.id };
};

export const serverTimestamp = () => new Date().toISOString();

export const query = (colName, ...args) => {
  return { col: colName, args };
};

export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, dir) => ({ type: 'orderBy', field, dir });

export const onSnapshot = (q, callback) => {
  const colName = typeof q === 'string' ? q : q.col;
  if (!listeners[colName]) listeners[colName] = [];
  
  const notify = () => {
    let items = JSON.parse(localStorage.getItem(colName) || '[]');
    if (typeof q === 'object' && q.args) {
       q.args.forEach(arg => {
          if (arg.type === 'where' && arg.op === '==') {
             items = items.filter(i => i[arg.field] === arg.value);
          }
       });
    }
    // الترتيب الأحدث أولاً افتراضياً
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const snapshot = items.map(item => ({
      id: item.id,
      data: () => item
    }));
    snapshot.forEach = (cb) => snapshot.map(cb);
    snapshot.size = snapshot.length;
    callback(snapshot);
  };
  
  listeners[colName].push(notify);
  notify(); // Initial call
  
  return () => {
    listeners[colName] = listeners[colName].filter(cb => cb !== notify);
  };
};

export const signInWithEmailAndPassword = async (authObj, email, password) => {
  // للتبسيط، نقبل هذا الباسورد الوهمي فقط
  if (password === 'اللهم لك') return { user: { email } };
  throw new Error('بيانات الدخول غير صحيحة');
};

export const getDocs = async (q) => {
    // Mock simple getDocs if needed
    return [];
};
