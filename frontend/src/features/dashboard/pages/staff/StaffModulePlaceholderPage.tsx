import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Construction } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type StaffModulePlaceholderPageProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function StaffModulePlaceholderPage({
  title,
  description,
  icon: Icon = Construction,
}: StaffModulePlaceholderPageProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-136px)] w-full max-w-[960px] items-center justify-center">
      <Card className="w-full rounded-card border border-petcenter-border bg-white py-8 text-center shadow-card">
        <CardContent className="flex flex-col items-center px-6">
          <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-card bg-[#D8F3EE] text-petcenter-primary">
            <Icon className="h-8 w-8" />
          </span>
          <h1 className="heading-md text-petcenter-text">{title}</h1>
          <p className="body-md mt-3 max-w-2xl text-petcenter-text-secondary">
            {description}
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-6 h-11 rounded-control border-petcenter-primary bg-white px-4 text-petcenter-primary hover:bg-[#D8F3EE] hover:text-petcenter-primary"
          >
            <Link href="/staff/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Quay về tổng quan
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
