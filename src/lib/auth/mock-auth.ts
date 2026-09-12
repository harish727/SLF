// Mock authentication for local development
// This is a temporary solution - replace with real Supabase in production

interface MockUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'athlete' | 'coach';
  emailConfirmed: boolean;
}

const mockUsers: MockUser[] = [
  {
    id: 'usr_01',
    email: 'athlete@test.com',
    password: 'Test@1234',
    firstName: 'John',
    lastName: 'Athlete',
    role: 'athlete',
    emailConfirmed: true,
  },
  {
    id: 'usr_02',
    email: 'coach@test.com',
    password: 'Coach@1234',
    firstName: 'Jane',
    lastName: 'Coach',
    role: 'coach',
    emailConfirmed: true,
  },
];

let currentSession: { user: any; token: string } | null = null;

function formatUser(mockUser: MockUser) {
  return {
    id: mockUser.id,
    email: mockUser.email,
    email_confirmed_at: mockUser.emailConfirmed ? new Date().toISOString() : null,
    user_metadata: {
      first_name: mockUser.firstName,
      last_name: mockUser.lastName,
      role: mockUser.role,
    },
  };
}

export const mockAuth = {
  signInWithPassword: async (email: string, password: string) => {
    console.log('Mock signInWithPassword:', email);
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      console.log('User not found');
      return { data: { user: null }, error: { message: 'Invalid credentials' } };
    }
    if (!user.emailConfirmed) {
      console.log('Email not confirmed');
      return { data: { user: null }, error: { message: 'Email not verified' } };
    }
    const token = Math.random().toString(36).substring(7);
    const formattedUser = formatUser(user);
    currentSession = { user: formattedUser, token };
    console.log('Session created:', currentSession);
    return { data: { user: formattedUser }, error: null };
  },

  signUp: async (email: string, password: string, metadata: any) => {
    if (mockUsers.some(u => u.email === email)) {
      return { error: { message: 'User already registered' } };
    }
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      firstName: metadata.first_name || '',
      lastName: metadata.last_name || '',
      role: metadata.role || 'athlete',
      emailConfirmed: false,
    };
    mockUsers.push(newUser);
    return { error: null };
  },

  signOut: async () => {
    currentSession = null;
  },

  getUser: async () => {
    console.log('Mock getUser, currentSession:', currentSession);
    return { data: { user: currentSession?.user || null } };
  },

  getProfile: async (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return { data: null, error: null };
    return {
      data: {
        id: user.id,
        role: user.role,
        first_name: user.firstName,
        last_name: user.lastName,
      },
      error: null,
    };
  },

  setCurrentSession: (user: any) => {
    currentSession = { user, token: Math.random().toString(36).substring(7) };
  },

  getCurrentSession: () => currentSession,
};
