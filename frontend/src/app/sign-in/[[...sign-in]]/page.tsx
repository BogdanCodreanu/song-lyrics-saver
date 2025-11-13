import { SignIn } from '@clerk/nextjs';

interface ISignInPageProps {}

export default function SignInPage(props: ISignInPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-yellow-50 to-green-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <SignIn />
    </div>
  );
}

