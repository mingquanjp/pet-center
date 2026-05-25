"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SocialLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "google"
}

export const SocialLoginButton = React.forwardRef<HTMLButtonElement, SocialLoginButtonProps>(
  ({ provider, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex justify-center items-center gap-3 py-3 px-4 border border-petcenter-border-strong rounded-xl bg-white hover:bg-petcenter-sidebar focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-petcenter-primary transition-colors w-fit min-w-[200px] mx-auto shadow-sm",
          className
        )}
        {...props}
      >
        {provider === "google" && (
          <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
            <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
            <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
            <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
          </svg>
        )}
        <span className="label-md text-petcenter-text font-medium">Google</span>
      </button>
    )
  }
)
SocialLoginButton.displayName = "SocialLoginButton"
