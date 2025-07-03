import { User } from '@/lib/localDatabase';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) return null;
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error reading user session:', error);
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function requireAuth(): User | null {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}
