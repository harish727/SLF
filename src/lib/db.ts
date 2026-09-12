// ─── Simulated Backend Database ──────────────────────────────────────────────

// ── Auth ──────────────────────────────────────────────────────────────────────

export type UserRole = 'athlete' | 'coach';

export interface User {
  id: string; email: string; password: string; role: UserRole;
  name: string; emailVerified: boolean; onboardingComplete: boolean;
}

export const users: User[] = [
  { id: 'usr_01', email: 'harish@slf.com',      password: 'Train@2024',   role: 'athlete', name: 'Harish Kumar',   emailVerified: true,  onboardingComplete: true  },
  { id: 'usr_02', email: 'athlete2@slf.com',    password: 'Squat@2024',   role: 'athlete', name: 'Alex Johnson',   emailVerified: true,  onboardingComplete: false },
  { id: 'usr_03', email: 'newathlete@slf.com',  password: 'NewAth@2024',  role: 'athlete', name: 'New Athlete',    emailVerified: false, onboardingComplete: false },
  { id: 'usr_04', email: 'coach@slf.com',       password: 'Coach@2024',   role: 'coach',   name: 'Fluffy (Coach)', emailVerified: true,  onboardingComplete: true  },
];
export const pendingUsers: User[] = [];
export function findUserByEmail(email: string): User | undefined {
  return [...users, ...pendingUsers].find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export interface OnboardingProfile {
  userId: string; dob: string; gender: string; height: string; weight: string;
  experience: string; discipline: string; goals: string[]; daysPerWeek: number; preferredDays: string[];
}
export const onboardingProfiles: OnboardingProfile[] = [];

// ── Training program data model ───────────────────────────────────────────────

export interface SetPrescription {
  setNumber: number;
  reps: number;
  weight: number;       // prescribed kg
  rpe: number;          // prescribed RPE
  // logged actuals (undefined = not done yet)
  loggedWeight?: number;
  loggedReps?: number;
  loggedRpe?: number;
  completed: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  sets: SetPrescription[];
  tempo?: string;       // e.g. "3-1-1-0"
  note?: string;
  previous: string;     // e.g. "137.5 × 5 @ 7"
}

export interface TrainingDay {
  id: string;           // e.g. "w06-thu"
  label: string;        // e.g. "THU"
  fullLabel: string;    // e.g. "Thursday"
  focus: string;        // e.g. "Lower Body"
  exercises: Exercise[];
}

export interface TrainingWeek {
  weekNumber: number;
  label: string;        // "W06"
  days: TrainingDay[];
  completed: boolean;
}

export interface TrainingBlock {
  id: string;
  name: string;
  phase: string;
  totalWeeks: number;
  currentWeek: number;
  weeks: TrainingWeek[];
}

export interface AthleteTrainingData {
  activeBlockId: string;
  blocks: TrainingBlock[];
}

// ── Harish's training data ────────────────────────────────────────────────────

function makeSets(count: number, reps: number, weight: number, rpe: number, doneCount = 0): SetPrescription[] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    reps,
    weight,
    rpe,
    loggedWeight: i < doneCount ? weight : undefined,
    loggedReps:   i < doneCount ? reps   : undefined,
    loggedRpe:    i < doneCount ? rpe    : undefined,
    completed:    i < doneCount,
  }));
}

const harishTraining: AthleteTrainingData = {
  activeBlockId: 'plb-12w',
  blocks: [
    {
      id: 'plb-12w',
      name: 'Powerlifting — 12 Week',
      phase: 'Accumulation',
      totalWeeks: 12,
      currentWeek: 6,
      weeks: [
        // Weeks 1–5 marked complete
        ...([1,2,3,4,5].map((n) => ({
          weekNumber: n, label: `W0${n}`, completed: true,
          days: [] as TrainingDay[],
        }))),
        // Week 6 — active
        {
          weekNumber: 6, label: 'W06', completed: false,
          days: [
            {
              id: 'w06-mon', label: 'MON', fullLabel: 'Monday', focus: 'Lower Body',
              exercises: [
                {
                  id: 1, name: 'Back Squat', previous: '137.5 × 5 @ 7',
                  tempo: '3-1-1-0', note: 'Controlled descent. Pause briefly at the bottom.',
                  sets: makeSets(4, 5, 140, 7, 2),
                },
                {
                  id: 2, name: 'Romanian Deadlift', previous: '115 × 8',
                  sets: makeSets(3, 8, 120, 7),
                },
                {
                  id: 3, name: 'Bulgarian Split Squat', previous: '37.5 × 10',
                  sets: makeSets(3, 10, 40, 7),
                },
                {
                  id: 4, name: 'Hamstring Curl', previous: '57.5 × 12',
                  sets: makeSets(3, 12, 60, 6),
                },
                {
                  id: 5, name: 'Conditioning', previous: 'N/A',
                  note: '10 min AMRAP — KB swings + box jumps',
                  sets: makeSets(1, 0, 0, 0),
                },
              ],
            },
            {
              id: 'w06-wed', label: 'WED', fullLabel: 'Wednesday', focus: 'Upper Body',
              exercises: [
                {
                  id: 1, name: 'Bench Press', previous: '105 × 5 @ 7',
                  tempo: '2-1-1-0',
                  sets: makeSets(4, 5, 107.5, 7),
                },
                {
                  id: 2, name: 'Overhead Press', previous: '65 × 6',
                  sets: makeSets(3, 6, 67.5, 7),
                },
                {
                  id: 3, name: 'Barbell Row', previous: '90 × 6',
                  sets: makeSets(4, 6, 92.5, 7),
                },
                {
                  id: 4, name: 'Tricep Pushdown', previous: '35 × 12',
                  sets: makeSets(3, 12, 37.5, 6),
                },
              ],
            },
            {
              id: 'w06-fri', label: 'FRI', fullLabel: 'Friday', focus: 'Lower Body',
              exercises: [
                {
                  id: 1, name: 'Deadlift', previous: '190 × 3 @ 7',
                  tempo: '1-0-1-0', note: 'Reset each rep. Drive floor away.',
                  sets: makeSets(4, 3, 195, 7),
                },
                {
                  id: 2, name: 'Front Squat', previous: '100 × 4',
                  sets: makeSets(3, 4, 102.5, 7),
                },
                {
                  id: 3, name: 'Leg Press', previous: '200 × 10',
                  sets: makeSets(3, 10, 210, 6),
                },
                {
                  id: 4, name: 'Nordic Curl', previous: '5 reps',
                  sets: makeSets(3, 5, 0, 7),
                },
              ],
            },
            {
              id: 'w06-sat', label: 'SAT', fullLabel: 'Saturday', focus: 'Upper Body',
              exercises: [
                {
                  id: 1, name: 'Bench Press', previous: '102.5 × 3 @ 8',
                  sets: makeSets(3, 3, 110, 8),
                },
                {
                  id: 2, name: 'Weighted Pull-up', previous: '+15 × 5',
                  sets: makeSets(4, 5, 15, 7),
                },
                {
                  id: 3, name: 'Dumbbell Row', previous: '40 × 10',
                  sets: makeSets(3, 10, 42.5, 7),
                },
              ],
            },
          ],
        },
        // Weeks 7–12 future
        ...([7,8,9,10,11,12].map((n) => ({
          weekNumber: n, label: `W${n < 10 ? '0' : ''}${n}`, completed: false,
          days: [] as TrainingDay[],
        }))),
      ],
    },
  ],
};

const athleteTraining: Record<string, AthleteTrainingData> = { usr_01: harishTraining };

export function getTrainingByUserId(userId: string): AthleteTrainingData | null {
  return athleteTraining[userId] ?? harishTraining;
}

// ── Dashboard data model ──────────────────────────────────────────────────────

export interface E1RMPoint { date: string; value: number; }
export interface BWPoint   { date: string; value: number; }

export interface StrengthMetric {
  current: number; change3m: number; trainingPR: number; meetPR: number; history: E1RMPoint[];
}
export interface BodyweightData {
  current: number; start: number; change3m: number; goal: number; history: BWPoint[];
}
export interface MeetPerformance {
  squat: number; bench: number; deadlift: number; total: number; date: string; competition: string;
}
export interface TodayWorkout {
  title: string; category: string; exercisesCount: number; estimatedMinutes: number;
  completedCount: number;
  exercises: { id: number; name: string; target: string; previous: string }[];
}
export interface TrainingStatus {
  load: number; rpe: number; adherence: number;
  recovery: 'Good' | 'Moderate' | 'Poor'; fatigue: 'Low' | 'Moderate' | 'High';
}
export interface CurrentBlock {
  name: string; phase: string; week: number; totalWeeks: number; nextPhase: string;
}
export interface AthleteProfile {
  id: string; name: string; firstName: string; program: string; week: number; day: number;
}
export interface AthleteDashboardData {
  athlete: AthleteProfile;
  strength: { squat: StrengthMetric; bench: StrengthMetric; deadlift: StrengthMetric };
  bodyweight: BodyweightData;
  meetPerformance: MeetPerformance;
  todayWorkout: TodayWorkout;
  trainingStatus: TrainingStatus;
  currentBlock: CurrentBlock;
  coachNote: { text: string; author: string; isNew: boolean };
  messages: { id: number; from: string; text: string; time: string; unread: boolean }[];
}

const harishDashboard: AthleteDashboardData = {
  athlete: { id: 'ath_01', name: 'Harish Kumar', firstName: 'Harish', program: 'Powerlifting Performance Block', week: 6, day: 4 },
  strength: {
    squat:    { current: 165, change3m: 7.5, trainingPR: 170, meetPR: 180, history: [{ date:'Jul 1',value:150},{date:'Jul 15',value:155},{date:'Aug 1',value:157.5},{date:'Aug 15',value:160},{date:'Sep 1',value:162.5},{date:'Sep 15',value:165}] },
    bench:    { current: 112, change3m: 2.5, trainingPR: 115, meetPR: 120, history: [{ date:'Jul 1',value:105},{date:'Jul 15',value:107.5},{date:'Aug 1',value:107.5},{date:'Aug 15',value:110},{date:'Sep 1',value:110},{date:'Sep 15',value:112}] },
    deadlift: { current: 205, change3m: 5,   trainingPR: 210, meetPR: 220, history: [{ date:'Jul 1',value:190},{date:'Jul 15',value:195},{date:'Aug 1',value:197.5},{date:'Aug 15',value:200},{date:'Sep 1',value:202.5},{date:'Sep 15',value:205}] },
  },
  bodyweight: { current: 82.4, start: 84.1, change3m: -1.7, goal: 80.0, history: [{date:'Jul 1',value:84.1},{date:'Jul 15',value:83.8},{date:'Aug 1',value:83.5},{date:'Aug 15',value:83.0},{date:'Sep 1',value:82.8},{date:'Sep 15',value:82.4}] },
  meetPerformance: { squat: 180, bench: 120, deadlift: 220, total: 520, date: '15 Aug 2026', competition: 'State Powerlifting Championships' },
  todayWorkout: {
    title: 'Lower Body', category: 'Strength + Competition Prep', exercisesCount: 5, estimatedMinutes: 75, completedCount: 0,
    exercises: [
      { id: 1, name: 'Back Squat',            target: '4 × 5 @ RPE 7', previous: '140 × 5' },
      { id: 2, name: 'Romanian Deadlift',     target: '3 × 8',          previous: '120 × 8' },
      { id: 3, name: 'Bulgarian Split Squat', target: '3 × 10',         previous: '40 × 10' },
      { id: 4, name: 'Hamstring Curl',        target: '3 × 12',         previous: '60 × 12' },
      { id: 5, name: 'Conditioning',          target: '10 min AMRAP',   previous: 'N/A' },
    ],
  },
  trainingStatus: { load: 82, rpe: 7.3, adherence: 91, recovery: 'Good', fatigue: 'Moderate' },
  currentBlock: { name: '12-Week Powerlifting Block', phase: 'Accumulation', week: 6, totalWeeks: 8, nextPhase: 'Intensification' },
  coachNote: { text: "Don't chase the number today. Keep your top set around RPE 7–8. Own the movement — bar speed is the priority.", author: 'Fluffy', isNew: true },
  messages: [
    { id: 1, from: 'Coach', text: 'Great squat session yesterday. How are the knees feeling?', time: '10:30 AM', unread: true },
    { id: 2, from: 'Coach', text: "I've updated your macros slightly for this week. Check the nutrition tab.", time: 'Yesterday', unread: false },
  ],
};

const athleteDashboards: Record<string, AthleteDashboardData> = { usr_01: harishDashboard };
export function getDashboardByUserId(userId: string): AthleteDashboardData | null {
  return athleteDashboards[userId] ?? harishDashboard;
}

// Legacy db export
export const db = {
  athlete: { id: 'ath_01', name: 'Harish', weight: 82.4, adherence: 91, prs: 12, squatMax: 160, coachNote: harishDashboard.coachNote.text },
  training: { currentProgram: 'Powerlifting Block', week: 6, day: 3, sessionsCompleted: 4, sessionsTotal: 6, todayWorkout: harishDashboard.todayWorkout },
  messages: harishDashboard.messages,
  progress: { strength: { squat: harishDashboard.strength.squat.history.map((h) => ({ date: h.date, weight: h.value })) } },
};

// ── Progress data model ───────────────────────────────────────────────────────

export interface LiftProgressData {
  current: number;
  meetPR: number;
  trainingPR: number;
  change3m: number;
  changePct: number;
  weeklyTrend: number;        // kg/week
  lastSession: number;
  consistency: number;        // %
  e1rmHistory: { week: string; value: number }[];
  volumeHistory: { week: string; volume: number; e1rm: number }[];
  intensityZones: { zone: string; sets: number }[];
  hardSets: number;
  estimatedMRV: number;
}

export interface ProgressData {
  period: '3M' | '6M' | '1Y' | 'ALL';
  totalE1RM: number;
  totalChange3m: number;
  squat: LiftProgressData;
  bench: LiftProgressData;
  deadlift: LiftProgressData;
  bodyweight: {
    current: number;
    change3m: number;
    history: { week: string; value: number }[];
    relativeStrength: number;   // total / bw
    relativeChange: number;     // % change in relative strength
  };
  strengthToBodyweight: { squat: number; bench: number; deadlift: number; total: number };
  multiLiftTrend: { month: string; squat: number; bench: number; deadlift: number }[];
  nextMeet: {
    name: string;
    date: string;
    daysOut: number;
    currentTotal: number;
    targetTotal: number;
    projectedOpeners: { squat: number; bench: number; deadlift: number };
  };
  blockComparison: {
    label: string;
    squat: number; bench: number; deadlift: number;
    volume: number; avgRpe: number;
  }[];
}

const harishProgress: ProgressData = {
  period: '3M',
  totalE1RM: 482,
  totalChange3m: 15,

  squat: {
    current: 185, meetPR: 190, trainingPR: 187.5,
    change3m: 7.5, changePct: 4.2, weeklyTrend: 1.25,
    lastSession: 182.5, consistency: 91, hardSets: 8, estimatedMRV: 10,
    e1rmHistory: [
      { week: 'W1', value: 177.5 }, { week: 'W2', value: 180 },
      { week: 'W3', value: 180   }, { week: 'W4', value: 182.5 },
      { week: 'W5', value: 185   }, { week: 'W6', value: 185 },
    ],
    volumeHistory: [
      { week: 'W1', volume: 9200,  e1rm: 177.5 },
      { week: 'W2', volume: 9800,  e1rm: 180   },
      { week: 'W3', volume: 10800, e1rm: 180   },
      { week: 'W4', volume: 11600, e1rm: 182.5 },
      { week: 'W5', volume: 12400, e1rm: 185   },
      { week: 'W6', volume: 10800, e1rm: 185   },
    ],
    intensityZones: [
      { zone: '60–70%', sets: 32 },
      { zone: '70–80%', sets: 38 },
      { zone: '80–90%', sets: 24 },
      { zone: '90%+',   sets: 6  },
    ],
  },

  bench: {
    current: 125, meetPR: 127.5, trainingPR: 126,
    change3m: 2.5, changePct: 2.0, weeklyTrend: 0.4,
    lastSession: 122.5, consistency: 88, hardSets: 10, estimatedMRV: 14,
    e1rmHistory: [
      { week: 'W1', value: 122.5 }, { week: 'W2', value: 122.5 },
      { week: 'W3', value: 122.5 }, { week: 'W4', value: 125 },
      { week: 'W5', value: 125   }, { week: 'W6', value: 125 },
    ],
    volumeHistory: [
      { week: 'W1', volume: 6800,  e1rm: 122.5 },
      { week: 'W2', volume: 7200,  e1rm: 122.5 },
      { week: 'W3', volume: 7600,  e1rm: 122.5 },
      { week: 'W4', volume: 8200,  e1rm: 125   },
      { week: 'W5', volume: 8800,  e1rm: 125   },
      { week: 'W6', volume: 7800,  e1rm: 125   },
    ],
    intensityZones: [
      { zone: '60–70%', sets: 28 },
      { zone: '70–80%', sets: 42 },
      { zone: '80–90%', sets: 22 },
      { zone: '90%+',   sets: 8  },
    ],
  },

  deadlift: {
    current: 220, meetPR: 227.5, trainingPR: 222.5,
    change3m: 10, changePct: 4.8, weeklyTrend: 1.67,
    lastSession: 217.5, consistency: 94, hardSets: 6, estimatedMRV: 8,
    e1rmHistory: [
      { week: 'W1', value: 210 }, { week: 'W2', value: 212.5 },
      { week: 'W3', value: 215 }, { week: 'W4', value: 217.5 },
      { week: 'W5', value: 220 }, { week: 'W6', value: 220   },
    ],
    volumeHistory: [
      { week: 'W1', volume: 7400,  e1rm: 210   },
      { week: 'W2', volume: 7800,  e1rm: 212.5 },
      { week: 'W3', volume: 8400,  e1rm: 215   },
      { week: 'W4', volume: 9000,  e1rm: 217.5 },
      { week: 'W5', volume: 9600,  e1rm: 220   },
      { week: 'W6', volume: 8200,  e1rm: 220   },
    ],
    intensityZones: [
      { zone: '60–70%', sets: 20 },
      { zone: '70–80%', sets: 35 },
      { zone: '80–90%', sets: 30 },
      { zone: '90%+',   sets: 15 },
    ],
  },

  bodyweight: {
    current: 82.4, change3m: -1.8,
    relativeStrength: 5.85, relativeChange: 4.1,
    history: [
      { week: 'W1', value: 84.2 }, { week: 'W2', value: 83.8 },
      { week: 'W3', value: 83.6 }, { week: 'W4', value: 83.1 },
      { week: 'W5', value: 82.8 }, { week: 'W6', value: 82.4 },
    ],
  },

  strengthToBodyweight: { squat: 2.25, bench: 1.52, deadlift: 2.67, total: 5.85 },

  multiLiftTrend: [
    { month: 'Jul', squat: 177.5, bench: 122.5, deadlift: 210 },
    { month: 'Aug', squat: 180,   bench: 122.5, deadlift: 215 },
    { month: 'Sep', squat: 185,   bench: 125,   deadlift: 220 },
  ],

  nextMeet: {
    name: 'AP State Championships',
    date: '18 Nov 2026',
    daysOut: 68,
    currentTotal: 482,
    targetTotal: 550,
    projectedOpeners: { squat: 180, bench: 120, deadlift: 210 },
  },

  blockComparison: [
    { label: 'Block 1', squat: 172.5, bench: 117.5, deadlift: 205, volume: 38400, avgRpe: 7.1 },
    { label: 'Block 2', squat: 180,   bench: 122.5, deadlift: 212.5, volume: 42800, avgRpe: 7.3 },
    { label: 'Current', squat: 185,   bench: 125,   deadlift: 220, volume: 45200, avgRpe: 7.4 },
  ],
};

const athleteProgress: Record<string, ProgressData> = { usr_01: harishProgress };

export function getProgressByUserId(userId: string): ProgressData | null {
  return athleteProgress[userId] ?? harishProgress;
}
