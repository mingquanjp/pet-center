"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headset, PawPrint } from "lucide-react";

import { cn } from "@/lib/utils";
import { staffSidebarConfig, staffSupportAction } from "./staff-sidebar.config";

export function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 hidden w-[260px] flex-col border-r border-petcenter-border bg-petcenter-sidebar py-6 md:flex md:w-[280px]">
      <div className="mb-8 flex shrink-0 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-petcenter-primary text-white">
          <PawPrint className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight text-petcenter-primary">
            PetCenter
          </h1>
          <p className="text-sm leading-tight text-petcenter-text-secondary">
            Nhân viên
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {staffSidebarConfig.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mx-2 my-1 flex items-center gap-3 rounded-control px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out",
                isActive
                  ? "bg-petcenter-primary text-white shadow-card"
                  : "text-petcenter-text-secondary hover:bg-petcenter-card hover:text-petcenter-text"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-white" : "text-petcenter-text-secondary"
                )}
              />
              <span className="text-base">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 px-4">
        <Link
          href={staffSupportAction.href}
          className="flex items-center gap-3 rounded-control bg-petcenter-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-petcenter-primary-hover"
        >
          <Headset className="h-5 w-5" />
          <span>{staffSupportAction.title}</span>
        </Link>
      </div>
    </aside>
  );
}
