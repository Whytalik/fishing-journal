import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import HypothesesStub from '@/components/HypothesesStub';

export default async function HypothesesPage() {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    redirect('/login');
  }

  return <HypothesesStub />;
}
