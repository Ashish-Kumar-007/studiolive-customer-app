import { Tabs } from 'expo-router';
import { Colors } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { LayoutDashboard, Users, UserPlus, ClipboardList, CheckCircle2, CircleDollarSign, Target, User } from 'lucide-react-native';
import { NotificationBell } from '../../src/components/NotificationBell';

export default function AppLayout() {
  const { user } = useAuthStore();
  const role = user?.role;

  const activeTint =
    role === 'MARKETING'
      ? Colors.marketing
      : role === 'RECEPTIONIST'
        ? Colors.receptionist
        : role === 'VIDEOGRAPHER' || role === 'EDITOR'
          ? Colors.videographer
          : Colors.manager;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerRight: () => <NotificationBell />,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: Colors.textDark,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      {/* 1. Shared / Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'STUDIOLIVE',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />

      {/* Leads (Admin/Manager/Marketing/Receptionist) */}
      <Tabs.Screen
        name="leads/index"
        options={{
          title: 'Leads',
          headerTitle: 'LEAD DIRECTORY',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
          href:
            role === 'ADMIN' || role === 'MANAGER' || role === 'MARKETING' || role === 'RECEPTIONIST'
              ? '/leads'
              : null,
        }}
      />

      {/* Marketing Only */}
      <Tabs.Screen
        name="marketing/index"
        options={{
          title: 'Add Lead',
          headerTitle: 'REGISTER LEAD',
          tabBarIcon: ({ color, size }) => <UserPlus color={color} size={size} />,
          href: role === 'MARKETING' ? '/marketing' : null,
        }}
      />

      <Tabs.Screen
        name="target/index"
        options={{
          title: 'Target',
          headerTitle: 'MY GOALS',
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
          href: role === 'MARKETING' ? '/target' : null,
        }}
      />

      {/* Receptionist Only */}
      <Tabs.Screen
        name="receptionist/index"
        options={{
          title: 'Qualify',
          headerTitle: 'QUALIFICATION QUEUE',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
          href: role === 'RECEPTIONIST' ? '/receptionist' : null,
        }}
      />

      {/* Admin & Manager Only */}
      <Tabs.Screen
        name="team/index"
        options={{
          title: 'Team',
          headerTitle: 'TEAM MANAGEMENT',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          href: role === 'ADMIN' || role === 'MANAGER' ? '/team' : null,
        }}
      />

      <Tabs.Screen
        name="reporting/index"
        options={{
          title: 'Reports',
          headerTitle: 'BUSINESS INSIGHTS',
          tabBarIcon: ({ color, size }) => <CircleDollarSign color={color} size={size} />,
          href: role === 'ADMIN' || role === 'MANAGER' ? '/reporting' : null,
        }}
      />

      {/* Production Only */}
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: 'Tasks',
          headerTitle: 'PRODUCTION TASKS',
          tabBarIcon: ({ color, size }) => <CheckCircle2 color={color} size={size} />,
          href: role === 'VIDEOGRAPHER' || role === 'EDITOR' ? '/tasks' : null,
        }}
      />

      {/* 7. Shared / Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'MY PROFILE',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          href: '/profile',
        }}
      />

      {/* Hide non-tab routes from the bottom bar */}
      <Tabs.Screen name="leads/[id]" options={{ href: null }} />
      <Tabs.Screen name="tasks/[id]" options={{ href: null }} />
      <Tabs.Screen name="tasks/calendar" options={{ href: null }} />
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="manager/assign" options={{ href: null }} />
      <Tabs.Screen name="marketing/leads" options={{ href: null }} />
    </Tabs>
  );
}
