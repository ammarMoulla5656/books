import { redirect } from 'next/navigation';
import { getAdminSession } from './session';

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect('/secret-admin-panel-xyz');
  }

  return session;
}

export async function checkAdminAuth(): Promise<boolean> {
  const session = await getAdminSession();
  return !!session;
}
