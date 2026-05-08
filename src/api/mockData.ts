import { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { UserRole } from '../store/authStore';

// === DEMO DATA SEED ===
let mockUsers = [
  { id: 'usr_1', name: 'Super Admin', email: 'admin@studiolive.com', role: 'ADMIN' as UserRole, phone: '9999999999', emailVerified: true, isFirstLogin: false },
  { id: 'usr_2', name: 'Ashish Manager', email: 'ashish.manager@studiolive.com', role: 'MANAGER' as UserRole, phone: '9999999998', emailVerified: true, isFirstLogin: false },
  { id: 'usr_3', name: 'Marketing Lead', email: 'marketing@studiolive.com', role: 'MARKETING' as UserRole, phone: '9999999997', emailVerified: true, isFirstLogin: false },
  { id: 'usr_4', name: 'Front Desk', email: 'reception@studiolive.com', role: 'RECEPTIONIST' as UserRole, phone: '9999999996', emailVerified: true, isFirstLogin: false },
  { id: 'usr_5', name: 'Senior Editor', email: 'editor@studiolive.com', role: 'EDITOR' as UserRole, phone: '9999999995', emailVerified: true, isFirstLogin: false },
  { id: 'usr_6', name: 'Visual Director', email: 'new@studiolive.com', role: 'VIDEOGRAPHER' as UserRole, phone: '9999999994', emailVerified: true, isFirstLogin: false },
];

let mockLeads = [
  { id: 'ld_1', name: 'ABC Corp', email: 'contact@abccorp.com', phone: '8888888881', business: 'Corporate', source: 'Instagram', service: 'Corporate Video', status: 'NEW', amount: null, createdAt: new Date().toISOString(), marketingId: 'usr_3' },
  { id: 'ld_2', name: 'Startup Inc', email: 'hello@startup.io', phone: '8888888882', business: 'Tech', source: 'Referral', service: 'Product Shoot', status: 'QUALIFIED', amount: 35000, createdAt: new Date().toISOString(), marketingId: 'usr_3', receptionistId: 'usr_4' },
  { id: 'ld_3', name: 'Event Co', email: 'events@eventco.com', phone: '8888888883', business: 'Events', source: 'Google', service: 'Event Coverage', status: 'CONVINCED', amount: 80000, createdAt: new Date().toISOString(), marketingId: 'usr_3', receptionistId: 'usr_4' },
];

let mockTasks = [
  { id: 'tsk_1', type: 'SHOOT', status: 'ASSIGNED', details: 'Bring drone and wide lenses', deadline: new Date(Date.now() + 86400000).toISOString(), leadId: 'ld_2', assignedId: 'usr_6', createdAt: new Date().toISOString(), assignedTo: mockUsers[5], lead: mockLeads[1], expenses: [] },
  { id: 'tsk_2', type: 'EDIT', status: 'IN_PROGRESS', details: 'Color grading required', deadline: new Date(Date.now() + 172800000).toISOString(), leadId: 'ld_3', assignedId: 'usr_5', createdAt: new Date().toISOString(), assignedTo: mockUsers[4], lead: mockLeads[2], expenses: [{ id: 'exp_1', amount: 500, category: 'SOFTWARE', description: 'Plugin license', createdAt: new Date().toISOString() }] },
  { id: 'tsk_3', type: 'SHOOT', status: 'COMPLETED', details: 'All B-roll footage captured', deadline: new Date(Date.now() - 86400000).toISOString(), leadId: 'ld_3', assignedId: 'usr_6', createdAt: new Date().toISOString(), assignedTo: mockUsers[5], lead: mockLeads[2], expenses: [] },
];

let mockTargets = {
  'usr_3': { count: 15, date: new Date().toISOString(), notes: 'Focus on corporate clients' }
};

export const setupMockAdapter = (apiClient: AxiosInstance) => {
  console.log('🚧 [MOCK] Initializing Mock Backend Adapter');
  
  // Set delay to simulate network latency
  const mock = new MockAdapter(apiClient, { delayResponse: 500 });

  // === AUTHENTICATION MOCKS ===
  mock.onPost('/auth/login').reply((config) => {
    const { email, password } = JSON.parse(config.data);
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password123') return [401, { message: 'Invalid credentials. (Hint: password is password123)' }];
    if (!user.emailVerified) return [401, { message: 'Email not confirmed', user, access_token: `mock_token_${user.id}` }];
    return [200, { access_token: `mock_token_${user.id}`, user, needsVerification: !user.emailVerified }];
  });
  mock.onPost('/auth/send-email-otp').reply(200, { message: '6-digit code sent to your email.' });
  mock.onPost('/auth/verify-email-otp').reply((config) => {
    const { email, token } = JSON.parse(config.data);
    if (token !== '123456') return [401, { message: 'Invalid code. (Hint: code is 123456)' }];
    const user = mockUsers.find(u => u.email === email);
    if (user) user.emailVerified = true;
    return [200, { message: 'Email verified successfully!' }];
  });
  mock.onPatch('/auth/change-password').reply((config) => {
    const token = config.headers?.Authorization?.replace('Bearer ', '');
    const userId = token?.replace('mock_token_', '');
    const user = mockUsers.find(u => u.id === userId);
    if (user) user.isFirstLogin = false;
    return [200, { message: 'Password updated successfully' }];
  });

  // === USERS / TEAM MOCKS ===
  mock.onGet('/users').reply(200, { data: mockUsers, meta: { lastPage: 1 } });
  mock.onGet(/\/users\/[^\/]+$/).reply((config) => {
    const id = config.url?.split('/').pop();
    const user = mockUsers.find(u => u.id === id);
    return user ? [200, user] : [404, { message: 'User not found' }];
  });
  mock.onPost('/users/register').reply((config) => {
    const data = JSON.parse(config.data);
    const newUser = { id: `usr_${Date.now()}`, emailVerified: false, isFirstLogin: true, ...data };
    mockUsers.push(newUser);
    return [201, newUser];
  });
  mock.onDelete(/\/users\/usr_.*/).reply((config) => {
    const id = config.url?.split('/').pop();
    mockUsers = mockUsers.filter(u => u.id !== id);
    return [200, { message: 'User deleted' }];
  });

  // TARGETS
  mock.onGet('/users/me/target').reply((config) => {
    const token = config.headers?.Authorization?.replace('Bearer ', '');
    const userId = token?.replace('mock_token_', '') || 'usr_3';
    return [200, (mockTargets as any)[userId] || null];
  });
  mock.onPost(/\/users\/usr_.*\/target/).reply((config) => {
    const userId = config.url?.split('/')[2];
    if (userId) (mockTargets as any)[userId] = JSON.parse(config.data);
    return [201, { message: 'Target set' }];
  });

  // === DASHBOARD / REPORTING MOCKS ===
  mock.onGet('/reporting/summary').reply(200, {
    totalLeads: 124,
    pendingQualification: 18,
    completedTasks: 45,
    activeTasks: 12,
    totalEarned: 1540000,
    convertedLeads: 45,
    conversionRate: 36,
    pendingPayments: 245000
  });
  mock.onGet('/reporting/leaderboard').reply(200, [
    { id: 'usr_3', name: 'Marketing Lead', leadsCount: 24, conversionRate: 50 }, 
    { id: 'usr_X', name: 'Sarah Junior', leadsCount: 15, conversionRate: 35 }
  ]);
  mock.onGet('/reporting/finance').reply(200, { earned: 1540000, pipeline: 245000, totalPotential: 1785000 });
  mock.onGet(/\/reporting\/staff\/.*\/stats/).reply(200, {
    totalLeads: 24,
    convincedLeads: 12,
    archivedLeads: 6,
    conversionRate: 50,
    revenueGenerated: 450000,
    revenue: 450000,
    activeTasks: 3
  });

  // === LEADS MOCKS ===
  mock.onGet('/leads/convinced').reply(200, { data: mockLeads.filter(l => l.status === 'CONVINCED'), meta: { lastPage: 1 } });
  mock.onGet('/leads').reply(200, { data: mockLeads, meta: { lastPage: 1 } });
  mock.onPost('/leads').reply((config) => {
    const newLead = { id: `ld_${Date.now()}`, status: 'NEW', createdAt: new Date().toISOString(), ...JSON.parse(config.data) };
    mockLeads.push(newLead);
    return [201, newLead];
  });
  mock.onGet(/\/leads\/ld_.*/).reply((config) => {
    if (config.url?.includes('timeline')) {
      return [200, [
        { id: 'evt_1', type: 'CREATED', description: 'Lead captured', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 'evt_2', type: 'QUALIFIED', description: 'Reception qualified the lead', createdAt: new Date().toISOString() }
      ]];
    }
    const id = config.url?.split('/').pop();
    const lead = mockLeads.find(l => l.id === id);
    if (!lead) return [404, { message: 'Not found' }];
    const leadMarketing = mockUsers.find(u => u.id === lead.marketingId);
    return [200, { ...lead, marketing: leadMarketing }];
  });
  mock.onPatch(/\/leads\/.*\/qualify/).reply((config) => {
    const id = config.url?.split('/')[2];
    const data = JSON.parse(config.data);
    const lead = mockLeads.find(l => l.id === id);
    if (lead) { lead.status = data.status; lead.amount = data.amount || lead.amount; }
    return [200, lead];
  });
  mock.onPatch(/\/leads\/.*\/transfer/).reply((config) => {
    const id = config.url?.split('/')[2];
    const data = JSON.parse(config.data);
    const lead = mockLeads.find(l => l.id === id);
    if (lead) lead.marketingId = data.newMarketingId;
    return [200, lead];
  });

  // === TASKS MOCKS ===
  mock.onGet('/tasks/calendar').reply(200, mockTasks);
  mock.onGet('/tasks/my').reply((config) => {
    const token = config.headers?.Authorization?.replace('Bearer ', '');
    const userId = token?.replace('mock_token_', '');
    const user = mockUsers.find(u => u.id === userId);
    
    let filteredTasks = mockTasks.filter(t => t.assignedId === userId);
    
    if (user?.role === 'EDITOR') {
      // Editor only sees their EDIT tasks IF the corresponding SHOOT for that lead is COMPLETED
      filteredTasks = filteredTasks.filter(editTask => {
        if (editTask.type === 'EDIT') {
          const hasCompletedShoot = mockTasks.some(t => 
            t.leadId === editTask.leadId && 
            t.type === 'SHOOT' && 
            t.status === 'COMPLETED'
          );
          return hasCompletedShoot;
        }
        return true; // Keep other types if any
      });
    }
    
    return [200, { data: filteredTasks, meta: { lastPage: 1 } }];
  });
  mock.onGet('/tasks').reply(200, { data: mockTasks, meta: { lastPage: 1 } });
  mock.onPost('/tasks').reply((config) => {
    const data = JSON.parse(config.data);
    const newTask = { id: `tsk_${Date.now()}`, status: 'ASSIGNED', createdAt: new Date().toISOString(), ...data, expenses: [] };
    mockTasks.push(newTask);
    return [201, newTask];
  });
  mock.onGet(/\/tasks\/tsk_.*/).reply((config) => {
    const id = config.url?.split('/').pop();
    const task = mockTasks.find(t => t.id === id);
    return task ? [200, task] : [404, { message: 'Not found' }];
  });
  mock.onPatch(/\/tasks\/.*\/status/).reply((config) => {
    const id = config.url?.split('/')[2];
    const data = JSON.parse(config.data);
    const task = mockTasks.find(t => t.id === id);
    if (task) task.status = data.status;
    return [200, task];
  });
  mock.onPost(/\/tasks\/.*\/expense/).reply((config) => {
    const id = config.url?.split('/')[2];
    const data = JSON.parse(config.data);
    const task = mockTasks.find(t => t.id === id);
    if (task) task.expenses.push({ id: `exp_${Date.now()}`, createdAt: new Date().toISOString(), ...data });
    return [201, { message: 'Expense added' }];
  });

  // === NOTIFICATIONS ===
  mock.onGet('/notifications').reply(200, [
    { id: 'n1', title: 'New Lead Assigned', message: 'You have a new lead from ABC Corp.', isRead: false, createdAt: new Date().toISOString() },
    { id: 'n2', title: 'Target Reached', message: 'Congratulations! You reached your daily target.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ]);
  mock.onPost('/notifications/read-all').reply(200, { message: 'All read' });

  // Fallback
  mock.onAny().reply((config) => {
    console.warn(`[MOCK UNHANDLED] ${config.method?.toUpperCase()} ${config.url}`);
    return [404, { message: 'Mock endpoint not defined' }];
  });
};
