"use client";

import { Check, ChevronsUpDown, Search, User } from "lucide-react";
import { useState } from "react";
import { StaffBoardingOwnerOption } from "../../../types/boarding.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  options: StaffBoardingOwnerOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function StaffBoardingOwnerSearchCombobox({ options, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const selectedOwner = options.find((owner) => owner.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-14 rounded-[12px] border-petcenter-border bg-white hover:bg-white hover:border-petcenter-primary/50 text-petcenter-text font-normal shadow-sm transition-all focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary px-4"
        >
          {selectedOwner ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-petcenter-background border border-petcenter-border text-petcenter-primary flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-petcenter-text-secondary" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-petcenter-text">{selectedOwner.fullName}</span>
                <span className="text-petcenter-text-secondary text-xs mt-0.5">
                  {selectedOwner.phoneNumber} {selectedOwner.email ? `• ${selectedOwner.email}` : ""}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-petcenter-text-muted">
              <Search className="h-4 w-4" />
              <span>Tìm kiếm khách hàng bằng Tên hoặc SĐT...</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-[12px] border-petcenter-border shadow-modal overflow-hidden bg-white z-50" align="start">
        <Command>
          <CommandInput placeholder="Nhập tên hoặc số điện thoại..." className="border-none focus:ring-0 h-12 text-sm" />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm text-petcenter-text-muted">
              Không tìm thấy khách hàng nào.
            </CommandEmpty>
            <CommandGroup className="p-2">
              {options.map((owner) => (
                <CommandItem
                  key={owner.id}
                  value={`${owner.fullName} ${owner.phoneNumber}`}
                  onSelect={() => {
                    onChange(owner.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer rounded-[8px] my-1 px-3 py-2 data-[selected=true]:bg-petcenter-background/80 aria-selected:bg-petcenter-background transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-petcenter-background border border-petcenter-border flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-petcenter-text-secondary" />
                    </div>
                    <div className="flex flex-col py-1">
                      <span className="font-semibold text-petcenter-text text-sm">{owner.fullName}</span>
                      <span className="text-xs text-petcenter-text-secondary mt-0.5">
                        {owner.phoneNumber} {owner.email ? `• ${owner.email}` : ""}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 text-petcenter-primary",
                      value === owner.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
