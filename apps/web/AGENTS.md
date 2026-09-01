# CodaScript Web — StatusCard Rollout Master Prompt

Bu faylni `apps/web/AGENTS.md`ga qo'shing (agar `next dev` avtomatik yozgan
`<!-- BEGIN:nextjs-agent-rules -->` bloki mavjud bo'lsa, uni **o'chirmang** — shu matnni
o'sha bloqdan **keyin**, alohida bo'lim sifatida qo'shing).

## Maqsad

`apps/web/src/components/status/StatusCard.tsx`dagi `LoaderCard` va `ErrorCard`
komponentlarini loyihadagi **barcha** loading/error holatlarida qo'llash — hozir har bir
sahifa o'zicha turlicha ("Loading...", oddiy qizil matn, spinner) ko'rsatib yuritadi,
buni yagona, brendlangan vizual tilga keltirish.

**Qat'iy qoida:** faqat **taqdimot qatlamini** (nima ko'rsatiladi) almashtirasan — hech
qanday sahifaning data-fetching, state, yoki business logikasini o'zgartirma.

## 1-BOSQICH — Route-darajasidagi `loading.tsx` / `error.tsx` (yangi, hozir yo'q)

Repoda hech qanday `loading.tsx`/`error.tsx` fayli yo'q (tekshirildi). Next.js App
Router konventsiyasiga ko'ra, quyidagi segmentlarning har biriga shu ikki faylni qo'sh:

```
apps/web/src/app/(dashboard)/dashboard/{loading,error}.tsx
apps/web/src/app/(dashboard)/test-tanlash/{loading,error}.tsx
apps/web/src/app/(dashboard)/tarix/{loading,error}.tsx
apps/web/src/app/(dashboard)/natijalar/{loading,error}.tsx
apps/web/src/app/(dashboard)/masalalar/{loading,error}.tsx
apps/web/src/app/(dashboard)/masalalar/[id]/{loading,error}.tsx
apps/web/src/app/(dashboard)/jamiyat/{loading,error}.tsx
apps/web/src/app/(dashboard)/leaderboard/{loading,error}.tsx
apps/web/src/app/(dashboard)/profil/{loading,error}.tsx
apps/web/src/app/(dashboard)/foydalanuvchi/[username]/{loading,error}.tsx
apps/web/src/app/(dashboard)/sozlamalar/{loading,error}.tsx
apps/web/src/app/(dashboard)/admin/{loading,error}.tsx
apps/web/src/app/(dashboard)/admin/masalalar/{loading,error}.tsx
```

`error.tsx` Next.js talabiga ko'ra `'use client'` va `{ error, reset }` props oladi —
`reset`ni `ErrorCard`ning `onAction`iga ulang.

## 2-BOSQICH — Sahifa ichidagi mavjud inline loading/error joylarini almashtirish

Quyidagi fayllarda hozir o'z ichida `isLoading`/`"Loading..."`/`isError`/`catch` bilan
qo'lda yozilgan loading yoki xato UI bor — shularni `LoaderCard`/`ErrorCard`ga almashtir
(tekshirildi, grep orqali topilgan haqiqiy ro'yxat):

- `apps/web/src/app/(auth)/login/page.tsx`, `(auth)/reset-parol/page.tsx`,
  `(auth)/parolni-unutdim/page.tsx`
- `apps/web/src/app/(dashboard)/admin/page.tsx`,
  `(dashboard)/admin/masalalar/page.tsx`, `(dashboard)/admin/layout.tsx`
- `apps/web/src/app/(dashboard)/test-tanlash/page.tsx`
- `apps/web/src/app/(dashboard)/masalalar/page.tsx`,
  `(dashboard)/masalalar/[id]/page.tsx`
- `apps/web/src/app/(dashboard)/jamiyat/page.tsx`, `(dashboard)/leaderboard/page.tsx`,
  `(dashboard)/tarix/page.tsx`, `(dashboard)/profil/page.tsx`,
  `(dashboard)/dashboard/page.tsx`, `(dashboard)/sozlamalar/page.tsx`,
  `(dashboard)/foydalanuvchi/[username]/page.tsx`
- `apps/web/src/app/learn/page.tsx`, `apps/web/src/app/quiz/[track]/page.tsx`,
  `apps/web/src/app/test-jarayoni/page.tsx`
- `apps/web/src/components/ui/CodeEditor.tsx`, `apps/web/src/components/quiz/CodeQuestion.tsx`
  — bu ikkisi **to'liq ekran emas**, komponent ichidagi kichik loading/error holati,
  shuning uchun `LoaderCard`/`ErrorCard`ni `max-w-sm mx-auto` kabi konteynerga o'rab,
  kichikroq ko'rinishda joylashtir (illustratsiya o'lchamini `h-40 w-40`dan `h-24 w-24`ga
  tushirish kerak bo'lishi mumkin — komponentga `size?: 'sm' | 'md'` prop qo'shsang bo'ladi).

## 3-BOSQICH — Kontekstga mos illustratsiya tanlash (tasodifiy emas, mantiqiy)

| Bo'lim                                                                          | Loader illustratsiya |
| ------------------------------------------------------------------------------- | -------------------- |
| `/dashboard`, `/sozlamalar`, `/profil`, umumiy                                  | `loader-coding-boy`  |
| `/test-tanlash`, `/test-jarayoni`, `/quiz/[track]`                              | `loader-dino`        |
| `/masalalar`, `/masalalar/[id]` (Run/Submit kutish)                             | `loader-terminal`    |
| `/jamiyat`, `/leaderboard`, `/tarix`, `/natijalar`, `/foydalanuvchi/[username]` | `loader-astronaut`   |

| Xato turi                                                                        | Error illustratsiya                                                                     |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Server/tarmoq xatosi (500, fetch failed)                                         | `error-confused-boy`                                                                    |
| Kod bajarish/sandbox xatosi (`/masalalar/[id]` Run/Submit ichida)                | `error-broken-robot`                                                                    |
| Amal muvaffaqiyatsiz (forma yuborish, saqlash)                                   | `error-spilled-coffee`                                                                  |
| Sahifa/foydalanuvchi topilmadi (404, `foydalanuvchi/[username]` mavjud bo'lmasa) | `error-cat-404` (bu holatda `actionIcon="home"`, `actionLabel="Bosh sahifaga qaytish"`) |

## 4-BOSQICH — Tekshirish

- Har bir o'zgargan sahifada haqiqiy loading holatini (sekin tarmoqni simulyatsiya qilib,
  DevTools "Slow 3G" bilan) va haqiqiy xato holatini (backend'ni vaqtincha o'chirib) ko'rib
  chiq — faqat kod yozib "tayyor" dema.
- `useReducedMotion` hurmat qilinayotganini tasdiqla.
- Hech bir joyda eski oddiy matn/spinner qolmaganini butun `apps/web/src` bo'ylab qidiruv
  bilan tasdiqla (`grep -rn "Loading\.\.\.\|Yuklanmoqda"`).
