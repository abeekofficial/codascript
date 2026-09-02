# CodaScript — AGENTS.md

Bu faylni repo **root**iga qo'ying (`/AGENTS.md`). Google Antigravity buni avtomatik o'qiydi
(config ustuvorligi: `AGENTS.md` → `GEMINI.md` → built-in default). `apps/web/AGENTS.md`
ichidagi Next.js'ning o'zi yozgan bloqqa (`<!-- BEGIN:nextjs-agent-rules -->`) tegma va uni
**hurmat qil** — bu rasmiy Next.js 16.3+ funksiyasi, versiya mos hujjatga yo'naltiradi, soxta
emas.

## 1. ROLING

Sen **CodaScript** monorepo bo'yicha 15 yillik tajribaga ega Bosh Muhandissan. Kod yozishdan
oldin har doim mavjud pattern'larni o'qi va o'shanga mos yoz — yangi konventsiya o'ylab topma.

## 2. ARXITEKTURA (haqiqiy holat)

```
apps/web/     Next.js 16 (App Router) + React 19 + Zustand + TanStack Query + Tailwind
apps/server/  Express + Mongoose + Zod + JWT (access+refresh)
              controller → service → repository → model  (bu qatlamlarni buzma)
packages/types/  @codascript/types — web va server umumiy TS type'lari
```

Ikki **mustaqil** domen bor, aralashtirma:
- `Question` / `QuizAttempt` — MCQ-testlar ("Testlar" bo'limi, `/admin`)
- `Problem` / `ProblemSubmission` — LeetCode-uslubidagi kod masalalari ("Masalalar" bo'limi, `/admin/masalalar`)

Kod bajarish `apps/server/src/services/sandbox.service.ts`da `isolated-vm` orqali
isolyatsiyalangan — bu **to'g'ri** yechim, uni oddiy `eval`/`vm` bilan almashtirma.

## 3. P0 — ZUDLIK BILAN TUZATISH (xavfsizlik va noto'g'ri natija)

1. **`apps/server/src/seed.ts`** — hardcoded admin email + `admin123` parol source kodda.
   Env var'ga o'tkaz (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`), va agar bu parol allaqachon
   ishlatilgan bo'lsa foydalanuvchiga darhol almashtirishni ayt.
2. **`apps/server/src/utils/jwt.ts`** — `'access_secret'`/`'refresh_secret'` fallback'lar bor.
   Env var yo'q bo'lsa server **ishga tushmasin** (`throw`), zaif secret'ga jim o'tmasin.
3. **`apps/server/src/services/problem.service.ts`** — `submitCode` va `runCode`da
   `let allPassed = true` sikldan oldin e'lon qilingan; agar `problem.testCases`
   (yoki `runCode` uchun `publicTestCases`) bo'sh bo'lsa, sikl ishlamaydi va natija
   noto'g'ri ravishda `status: 'accepted'` chiqadi (0/0 testda ham "muvaffaqiyatli o'tdi").
   Sikldan OLDIN guard qo'sh:
   ```ts
   if (problem.testCases.length === 0) {   // runCode'da: publicTestCases.length === 0
     return { success: false, data: { problemId, status: 'no_test_cases',
       passedTests: 0, totalTests: 0, results: [], score: 0 } };
   }
   ```
   `packages/types/src/problem.ts`dagi `RunResult.data.status` turiga `'no_test_cases'`ni
   qo'sh, aks holda TypeScript xato beradi.
4. **`apps/web/src/app/(dashboard)/admin/layout.tsx`** — sahifa yangilanganda/`to'g'ridan-to'g'ri
   URL bilan ochilganda `useEffect` `isHydrated=true, isAuthenticated=true, user=null`
   (profil hali async yuklanmagan) oraliq holatda ham `router.push('/')` qilib yuboradi —
   admin har doim chiqarib yuboriladi. Tuzatish: `user` `null` bo'lganda hali hech qanday
   qarorga kelma, faqat kutish holatini ko'rsat:
   ```tsx
   useEffect(() => {
     if (!isHydrated) return;
     if (!isAuthenticated) { router.push('/'); return; }
     if (user && user.role !== 'admin') { router.push('/'); }
   }, [isHydrated, isAuthenticated, user, router]);

   if (!isHydrated || !isAuthenticated || !user) return <Loading />;
   if (user.role !== 'admin') return <Loading />;
   ```

## 4. P1 — FUNKSIONAL BUZILISHLAR

5. **`apps/server/src/validations/question.validation.ts`** — `createQuestionSchema`,
   `updateQuestionSchema`, `createBulkQuestionSchema`da
   `difficulty: z.enum(['beginner', 'intermediate', 'advanced'])` — lekin butun loyiha
   (frontend, `packages/types`, seed data) `'easy' | 'medium' | 'hard'` ishlatadi. Natija:
   **yangi savol qo'shib bo'lmaydi** (har doim 400 validation error). Enumni
   `z.enum(['easy', 'medium', 'hard'])`ga almashtir.
6. **`apps/server/src/validations/quiz.validation.ts`** — `startQuizSchema`da xuddi shu xato
   (`['mixed', 'beginner', 'intermediate', 'advanced']`) — bu **oddiy foydalanuvchilarning
   test boshlashini** ham buzishi mumkin. `['mixed', 'easy', 'medium', 'hard']`ga tuzat.
7. **`apps/web/src/app/(dashboard)/admin/masalalar/page.tsx`** — jadvalda hech qanday
   edit/delete tugmasi yo'q (tekshirildi — `edit`, `delete`, `updateProblem` so'zlari faylda
   umuman uchramaydi), backend esa `PUT /api/problems/:id`ni qo'llab-quvvatlaydi. Ya'ni
   yaratilgan masalaga keyinchalik test case qo'shib bo'lmaydi. Edit modal/panel qo'sh
   (yaratish formasidagi struktura asosida, `api.updateProblem(id, payload)` chaqiruvi bilan).

## 5. P2 — TOZALASH (dead code, tasdiqlangan)

- `apps/web/src/data/questions.js` — o'chir (faqat `.ts` versiyasi `seed.ts`da ishlatiladi).
- `apps/web/src/types/quiz.js` — o'chir (2 qatorlik stub, `.ts` versiyasi ishlatiladi).
- `old_dashboard.tsx` (repo root) — ishlatilishini tekshir, ishlatilmasa o'chir.
- `apps/server/src/data/quizzes/*.json` — `seed.ts` bu fayllarni import qilmaydi (u
  `apps/web/src/data/questions.ts`dan oladi). Boshqa joydan ham ishlatilmasa — orphaned,
  o'chir yoki `seed.ts`ga qo'sh (ikkalanini bir manbaga birlashtir).

## 6. NATIJANI TEKSHIRISH ANIQLIGI (aniqlik muammosi, kelajakda tuzatish uchun)

`problem.service.ts`dagi solishtirish qat'iy string tenglik:
`actualOutput === testCase.expectedOutput.trim()`. `sandbox.service.ts`da object/array
`JSON.stringify` bilan probelsiz chiqadi (`[1,2,3]`). Bu degani: mantiqan to'g'ri kod ham
formatlash farqi (probel, `9.0` vs `9`) tufayli "Wrong Answer" olishi mumkin. Kelajakda:
JSON-parse qilib mumkin bo'lganda deep-equal solishtirish qo'shishni ko'rib chiq (raqam/array
uchun), matn uchun qat'iy string qoldir.

## 7. KENGAYTIRISH REJASI (P1 tuzatilgach)

- Admin panelga savol (`Question`) uchun ham edit/delete UI qo'sh (masalalar bilan bir xil
  muammo bo'lishi mumkin — tekshir).
- Submission endpointlariga (`/api/problems/:id/run`, `/submit`) alohida, qattiqroq
  per-user rate-limit qo'sh — hozirgi global 100/15min resurs talab qiluvchi kod bajarish
  uchun yetarli emas.
- Faqat JavaScript qo'llab-quvvatlanadi (`sandbox.service.ts`). Boshqa til (Python va h.k.)
  qo'shish — `isolated-vm` JS uchungina ishlaydi, boshqa til uchun butunlay boshqa
  isolyatsiya strategiyasi (masalan konteyner-based judge) kerak bo'ladi — buni katta
  arxitektura qarori sifatida alohida rejalashtir, shoshilib qo'shma.

## 8. ISH QOIDALARI

- Har bir o'zgarishdan keyin `turbo build` va `turbo lint` ishga tushir — xato qoldirma.
- `next-dev-loop` Skill mavjud bo'lsa, brauzer orqali haqiqiy natijani (masalan admin
  sahifaga kirish, yangi savol/masala qo'shish) tekshirib tasdiqla — faqat kod
  yozib "tayyor" dema.
- Hech qachon secret/parolni kodga hardcode qilma.
- `Question` va `Problem` domenlarini aralashtirma — ikkalasi alohida model/route.
- `apps/web/AGENTS.md`dagi Next.js managed bloqni o'chirma/e'tiborsiz qoldirma (2-bo'limga
  qara) — versiyaga mos hujjat sifatida undan foydalan.
- Senga to'g'ridan-to'g'ri loyihada `git commit` yoki `git add` kabi buyruqlarni ishlashish QAT'IYAN VA HECH QACHON MUMKIN EMAS. Qachonki nimadir o'zgartirish kiritsang, o'sha kiritgan o'zgartirishing mazmunidan kelib chiqib, commit buyrug'ini faqat menga chat orqali yubor! Men barcha git jarayonlarini O'ZIM MANUAL QILAMAN. Bunga qat'iy rioya qil!
