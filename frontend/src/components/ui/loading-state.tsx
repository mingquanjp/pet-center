import * as React from "react"
import { cn } from "@/lib/utils"
import { Dog3DScene } from "./dog-3d"

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function LoadingState({
  title = "Đang tải dữ liệu...",
  description,
  icon,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-32 px-4 animate-in fade-in duration-1000", 
        className
      )} 
      {...props}
    >
      <div className="relative mb-2 flex flex-col items-center justify-center">
        {/* Khung 3D chó Minecraft chạy */}
        {icon ? (
          <div className="relative flex items-center justify-center w-24 h-24 mb-4">
             {icon}
          </div>
        ) : (
          <Dog3DScene />
        )}
      </div>
      
      {/* Solid text, no gradient, refined typography */}
      <h3 
        className="heading-sm text-petcenter-text mb-2 tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-700"
        style={{ animationFillMode: 'backwards', animationDelay: '150ms' }}
      >
        {title}
      </h3>
      
      {description && (
        <p 
          className="body-md text-petcenter-text-secondary whitespace-nowrap animate-in slide-in-from-bottom-2 fade-in duration-700"
          style={{ animationFillMode: 'backwards', animationDelay: '300ms' }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
