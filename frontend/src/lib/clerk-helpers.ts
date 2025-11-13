import { auth, clerkClient } from '@clerk/nextjs/server';

export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  const clerk = await clerkClient();

  if (!userId) {
    return false;
  }
  
  const user = await clerk.users.getUser(userId);
  return user.publicMetadata?.isAdmin === true;
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

