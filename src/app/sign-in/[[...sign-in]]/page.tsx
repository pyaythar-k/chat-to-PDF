'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
// import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  // return <SignIn />;
  return (
    <section className="py-24">
      <div className="container flex flex-col items-center justify-center">
        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="bg- w-96 rounded-2xl py-10 px-8 shadow-sm border space-y-6"
          >
            <h1>
              Sign in to{' '}
              <span className="font-bold text-xl text-indigo-600">
                Chat-to-PDF
              </span>
            </h1>
            <span className="text-sm">Welcome! Sign-in to continue.</span>
            <div className="grid grid-cols-2 gap-x-4">
              <Clerk.Connection
                name="google"
                className="flex items-center gap-x-3 justify-center font-medium border shadow-sm py-1.5 px-2.5 rounded-md"
              >
                <Clerk.Icon className="size-4" />
                Google
              </Clerk.Connection>
              <Clerk.Connection
                name="facebook"
                className="flex items-center gap-x-3 justify-center font-medium border shadow-sm py-1.5 px-2.5 rounded-md"
              >
                <Clerk.Icon className="size-4" />
                Facebook
              </Clerk.Connection>
            </div>
          </SignIn.Step>
        </SignIn.Root>
      </div>
    </section>
  );
}
