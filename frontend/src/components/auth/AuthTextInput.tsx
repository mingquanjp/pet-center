"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucideIcon, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
}

export const AuthTextInput = React.forwardRef<HTMLInputElement, AuthTextInputProps>(
  ({ label, icon: Icon, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="label-md text-petcenter-text-secondary">
          {label}
        </Label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-petcenter-text-muted pointer-events-none">
              <Icon size={20} strokeWidth={1.5} />
            </div>
          )}
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              "h-[48px] rounded-[12px] border-petcenter-border-strong bg-white px-4 text-petcenter-text focus-visible:ring-petcenter-primary placeholder:text-petcenter-text-muted body-md",
              Icon && "pl-10",
              isPassword && "pr-10",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-petcenter-text-muted hover:text-petcenter-text transition-colors"
            >
              {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
            </button>
          )}
        </div>
      </div>
    )
  }
)
AuthTextInput.displayName = "AuthTextInput"
