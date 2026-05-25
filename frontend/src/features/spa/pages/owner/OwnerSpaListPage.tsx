"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ownerBookedSpaRequests,
  ownerSpaHistory,
  ownerSpaServices,
  ownerSpaTabs,
} from "../../constants/spa.constants"
import type { OwnerSpaTab } from "../../types/spa.types"
import { OwnerSpaRequestCard } from "../../components/owner/OwnerSpaRequestCard"
import { OwnerSpaServiceCard } from "../../components/owner/OwnerSpaServiceCard"

export function OwnerSpaListPage() {
  const [activeTab, setActiveTab] = useState<OwnerSpaTab>("available")

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="heading-lg text-balance text-petcenter-text">Dịch vụ làm đẹp</h1>
          <p className="body-md text-pretty text-petcenter-text-secondary">
            Đặt lịch tắm gội, cắt tỉa và chăm sóc thú cưng tại trung tâm.
          </p>
        </div>
        <Button asChild className="h-9 w-fit gap-2 rounded-lg bg-[#FEA619] px-6 text-xs font-medium text-[#2A1700] shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#F59E0B]">
          <Link href="/owner/spa/booking">
            <Plus className="size-3" aria-hidden="true" />
            Đặt dịch vụ
          </Link>
        </Button>
      </section>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as OwnerSpaTab)}
        className="flex w-full flex-col gap-6"
      >
        <TabsList variant="line" className="h-auto w-full justify-start gap-8 border-b border-[#BDC9C5] p-0">
          {ownerSpaTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-auto flex-none rounded-none bg-transparent px-1 pb-3 pt-0 text-xs font-medium leading-4 text-[#3E4946] hover:bg-transparent hover:text-[#005E53] after:bottom-[-1px] after:bg-[#005E53] after:opacity-0 hover:after:opacity-100 data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[#005E53] data-[state=active]:after:opacity-100"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="available" className="mt-0 flex-none">
          <section className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 xl:grid-cols-3">
            {ownerSpaServices.map((service) => (
              <OwnerSpaServiceCard key={service.id} service={service} />
            ))}
          </section>
        </TabsContent>

        <TabsContent value="booked" className="mt-0 flex-none space-y-4">
          {ownerBookedSpaRequests.map((request) => (
            <OwnerSpaRequestCard key={request.id} request={request} />
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex-none space-y-4">
          {ownerSpaHistory.map((request) => (
            <OwnerSpaRequestCard key={request.id} request={request} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
