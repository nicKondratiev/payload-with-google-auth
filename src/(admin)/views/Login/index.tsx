'use client'
import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'

// import './styles.scss'

const LoginView = () => {
  const loginWith = (provider: string) => {
    signIn(provider, { redirectTo: '/admin' })
  }
  return (
    <div className="flex h-full w-full justify-center items-center flex-col gap-4">
      <button
        onClick={() => loginWith('google')}
        className="bg-white hover:bg-amber-50 text-black  py-2 px-4 rounded flex gap-2 items-center w-[230px] justify-between"
      >
        <FcGoogle className="h-5 w-5" />
        Sign up with Google
      </button>
    </div>
  )
}

export default LoginView
