import { Question } from '../types/quiz';

export const QUIZ_QUESTIONS: Question[] = [
{
  id: 'q-1',
  tech: 'js',
  difficulty: 'medium',
  prompt: 'Quyidagi kod konsolga nimani chiqaradi?',
  code: `const arr = [1, 2, 3];\nconst result = arr.map(x => x * 2).filter(x => x > 2);\n\nconsole.log(result);`,
  options: ['[2, 4, 6]', '[4, 6]', '[2, 4]', 'undefined'],
  correctIndex: 1,
  explanation:
  'map() har bir elementni 2 ga ko‘paytiradi → [2, 4, 6]. filter() 2 dan katta qiymatlarni qoldiradi → [4, 6].',
  status: 'active',
  createdAt: '2026-08-12'
},
{
  id: 'q-2',
  tech: 'js',
  difficulty: 'medium',
  prompt: 'typeof operatori qaysi natijani qaytaradi?',
  code: `console.log(typeof null);`,
  options: ['"null"', '"undefined"', '"object"', '"boolean"'],
  correctIndex: 2,
  explanation:
  'typeof null natijasi "object" bo‘ladi — bu JavaScript‘ning dastlabki versiyasidan qolgan mashhur xatolik.',
  status: 'active',
  createdAt: '2026-08-11'
},
{
  id: 'q-3',
  tech: 'js',
  difficulty: 'medium',
  prompt: 'Kodning bajarilish tartibi qanday bo‘ladi?',
  code: `setTimeout(() => console.log('A'), 0);\nPromise.resolve().then(() => console.log('B'));\nconsole.log('C');`,
  options: ['A → B → C', 'C → B → A', 'C → A → B', 'B → C → A'],
  correctIndex: 1,
  explanation:
  'Sinxron kod birinchi (C), keyin mikrotask navbati (B), so‘ng makrotask navbati (A) bajariladi.',
  status: 'active',
  createdAt: '2026-08-10'
},
{
  id: 'q-4',
  tech: 'js',
  difficulty: 'medium',
  prompt: 'Spread operatori bilan nusxalashda natija qanday?',
  code: `const a = { x: 1, nested: { y: 2 } };\nconst b = { ...a };\nb.nested.y = 99;\n\nconsole.log(a.nested.y);`,
  options: ['2', '99', 'undefined', 'TypeError'],
  correctIndex: 1,
  explanation:
  'Spread yuzaki (shallow) nusxa yaratadi, shuning uchun nested obyekt bir xil havolaga ega bo‘lib qoladi.',
  status: 'active',
  createdAt: '2026-08-09'
},
{
  id: 'q-5',
  tech: 'js',
  difficulty: 'medium',
  prompt: 'Quyidagi taqqoslash natijasi nima?',
  code: `console.log([] == false, [] === false);`,
  options: ['true true', 'false false', 'true false', 'false true'],
  correctIndex: 2,
  explanation:
  '== solishtirishda [] bo‘sh satrga, so‘ng 0 ga aylanadi va false bilan teng bo‘ladi. === da turlar farq qiladi.',
  status: 'active',
  createdAt: '2026-08-08'
},
{
  id: 'q-6',
  tech: 'js',
  difficulty: 'medium',
  prompt: 'this konteksti bu yerda nimaga ishora qiladi?',
  code: `const obj = {\n  name: 'Coda',\n  greet: () => \`Salom, \${this.name}\`,\n};\n\nconsole.log(obj.greet());`,
  options: ['"Salom, Coda"', '"Salom, undefined"', 'ReferenceError', '"Salom, null"'],
  correctIndex: 1,
  explanation:
  'Arrow funksiya o‘z this ga ega emas, u tashqi kontekstdan oladi — obyekt emas, global obyekt.',
  status: 'active',
  createdAt: '2026-08-07'
},
{
  id: 'q-7',
  tech: 'js',
  difficulty: 'medium',
  prompt: 'reduce() natijasi nechchi bo‘ladi?',
  code: `const nums = [1, 2, 3, 4];\nconst total = nums.reduce((acc, n) => acc + n, 10);\n\nconsole.log(total);`,
  options: ['10', '20', '15', '25'],
  correctIndex: 1,
  explanation: 'Boshlang‘ich qiymat 10 ga massiv yig‘indisi 10 qo‘shiladi → 20.',
  status: 'active',
  createdAt: '2026-08-06'
},
{
  id: 'q-8',
  tech: 'js',
  difficulty: 'medium',
  prompt: 'let va var farqi bu kodda qanday ko‘rinadi?',
  code: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}`,
  options: ['0 1 2', '3 3 3', '0 0 0', '1 2 3'],
  correctIndex: 1,
  explanation:
  'var funksiya doirasida bo‘lgani uchun barcha callbacklar tsikl tugagandan keyingi qiymatni (3) ko‘radi.',
  status: 'active',
  createdAt: '2026-08-05'
}];


export const ADMIN_QUESTIONS: Question[] = [
...QUIZ_QUESTIONS,
{
  id: 'q-9',
  tech: 'react',
  difficulty: 'hard',
  prompt: 'useEffect ichida cleanup funksiyasi qachon chaqiriladi?',
  options: [
  'Har render oldidan va unmount paytida',
  'Faqat unmount paytida',
  'Faqat birinchi renderda',
  'Hech qachon'],

  correctIndex: 0,
  explanation: 'Cleanup keyingi effekt ishga tushishidan oldin va komponent yo‘q qilinganda chaqiriladi.',
  status: 'active',
  createdAt: '2026-08-04'
},
{
  id: 'q-10',
  tech: 'css',
  difficulty: 'easy',
  prompt: 'Flexbox‘da elementlarni gorizontal markazlash uchun qaysi xossa ishlatiladi?',
  options: ['align-items: center', 'justify-content: center', 'place-self: center', 'text-align: center'],
  correctIndex: 1,
  explanation: 'Asosiy o‘q gorizontal bo‘lganda justify-content: center markazlaydi.',
  status: 'active',
  createdAt: '2026-08-03'
},
{
  id: 'q-11',
  tech: 'ts',
  difficulty: 'medium',
  prompt: 'unknown va any orasidagi asosiy farq nima?',
  options: [
  'unknown tipi tekshiruvsiz ishlatilmaydi',
  'any xavfsizroq',
  'Farqi yo‘q',
  'unknown faqat obyektlar uchun'],

  correctIndex: 0,
  explanation: 'unknown qiymatini ishlatishdan oldin tipni toraytirish (narrowing) talab qilinadi.',
  status: 'draft',
  createdAt: '2026-08-02'
},
{
  id: 'q-12',
  tech: 'html',
  difficulty: 'easy',
  prompt: '<section> va <div> orasidagi farq nimada?',
  options: [
  '<section> semantik ma’noga ega',
  '<div> semantik ma’noga ega',
  'Ikkalasi bir xil',
  '<section> faqat formalarda'],

  correctIndex: 0,
  explanation: '<section> hujjatning mantiqiy bo‘limini bildiradi va skrin riderlar uchun ma’noga ega.',
  status: 'active',
  createdAt: '2026-08-01'
},
{
  id: 'q-13',
  tech: 'react',
  difficulty: 'medium',
  prompt: 'key prop nima uchun kerak?',
  options: [
  'Ro‘yxat elementlarini barqaror identifikatsiya qilish uchun',
  'Stil berish uchun',
  'Props uzatish uchun',
  'Kalitni shifrlash uchun'],

  correctIndex: 0,
  explanation: 'React reconciliation jarayonida elementlarni solishtirish uchun barqaror key ishlatadi.',
  status: 'active',
  createdAt: '2026-07-30'
},
{
  id: 'q-14',
  tech: 'css',
  difficulty: 'hard',
  prompt: 'Qaysi holatda stacking context yaratiladi?',
  options: [
  'position: relative va z-index: auto',
  'opacity qiymati 1 dan kichik bo‘lsa',
  'display: block',
  'margin: 0 auto'],

  correctIndex: 1,
  explanation: 'opacity < 1, transform, filter va boshqalar yangi stacking context hosil qiladi.',
  status: 'draft',
  createdAt: '2026-07-28'
}];