'use client'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { FcGoogle } from 'react-icons/fc'

// import './styles.scss'

const LoginView = () => {
  const loginWith = (provider: string) => {
    signIn(provider, { redirectTo: '/admin' })
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-white">
      <div className="flex h-fit w-[500px] flex-col items-center justify-center gap-6 px-20 py-10">
        <div>
          <div className="flex h-28 w-28 rounded-lg border border-gray-200 px-3 py-3 duration-200 hover:scale-[105%]">
            <Image
              width={1000}
              height={1000}
              alt="orca-logo"
              src={process.env.NEXT_PUBLIC_ORCA_LOGO!}
              className="h-full w-fit"
            />
          </div>
        </div>

        <div className="text-center text-black">
          <p className="text-2xl font-semibold">Access your dashboard</p>
          <p>by signing in to your account</p>
        </div>

        <div className="w-full text-center">
          <button
            onClick={() => loginWith('google')}
            className="flex h-fit w-full cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white p-0 px-4 py-2 text-black shadow-xs duration-100 hover:border-gray-400 hover:shadow-sm"
          >
            <FcGoogle className="h-10 w-10" />
          </button>
          <label className="text-gray-500">Secure sign-in powered by Google</label>
        </div>
      </div>
    </div>
  )
}

export default LoginView
