import { SignUp } from '@clerk/nextjs';

interface ISignUpPageProps {}

export default function SignUpPage(props: ISignUpPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <SignUp />
    </div>
  );
}

