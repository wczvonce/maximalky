// The 16 built-in exercises from the design. They are seeded with updatedAt 0, so any
// edit (local or from the GitHub backup) wins over the seed.

export const PARTIES = ['Hrudník', 'Chrbát', 'Ramená', 'Nohy', 'Zadná strana', 'Zadok', 'Lýtka', 'Celé telo', 'Výbušnosť'];

const ex = (id, name, party, unit = 'kg', steps = []) =>
  ({ id, name, party, unit, icon: id, steps, archived: false, createdAt: 0, updatedAt: 0 });

export const SEED_EXERCISES = [
  ex('bench', 'Bench press', 'Hrudník'),
  ex('dbinc', 'Tlak s jednoručkami na šikmej lavici', 'Hrudník'),
  ex('dipy', 'Dipy na bradlách', 'Hrudník', '+kg'),
  ex('ohp', 'Tlak nad hlavu', 'Ramená'),
  ex('zhyby', 'Zhyby', 'Chrbát', '+kg'),
  ex('pritahy', 'Príťahy v predklone', 'Chrbát'),
  ex('drep', 'Drep', 'Nohy'),
  ex('legpress', 'Leg press', 'Nohy'),
  ex('bulhar', 'Bulharský drep', 'Nohy'),
  ex('vypady', 'Split squat', 'Nohy', 'kg', [
    { src: 'img/split-squat-1.jpg', title: 'Východiskový postoj',
      caption: 'Nohy na šírku bokov, predné chodidlo celé na zemi, zadná päta zdvihnutá. Spevni brucho.' },
    { src: 'img/split-squat-2.jpg', title: 'Pomaly nadol',
      caption: 'Pokrč obe kolená, zadné koleno smeruje k zemi. Predná päta zostáva na zemi, len do pohodlnej hĺbky.' },
    { src: 'img/split-squat-3.jpg', title: 'Vytlač sa nahor',
      caption: 'Zatlač predným chodidlom do zeme a vráť sa do východiskovej polohy. Chodidlá zostávajú na mieste, potom vymeň nohy.' },
  ]),
  ex('mrtvy', 'Mŕtvy ťah', 'Zadná strana'),
  ex('rdl', 'Rumunský mŕtvy ťah', 'Zadná strana'),
  ex('hip', 'Hip thrust', 'Zadok'),
  ex('lytka', 'Výpony na lýtka', 'Lýtka'),
  ex('clean', 'Power clean', 'Celé telo'),
  ex('vyskok', 'Výskok z miesta', 'Výbušnosť', 'cm'),
];

// IndexedDB returns records sorted by id; keep the design's order, custom exercises after it by creation.
const SEED_INDEX = Object.fromEntries(SEED_EXERCISES.map((e, i) => [e.id, i]));
export const exerciseOrder = (a, b) =>
  (SEED_INDEX[a.id] ?? 1e3) - (SEED_INDEX[b.id] ?? 1e3) || (a.createdAt || 0) - (b.createdAt || 0);

export const DEFAULT_SETTINGS ={ bw: 84.2, formula: 'Epley', step: 2.5, updatedAt: 0 };
