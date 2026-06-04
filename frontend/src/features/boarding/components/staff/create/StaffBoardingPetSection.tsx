"use client";

import { Camera, Check, ChevronsUpDown, Loader2, PawPrint, Plus, Search } from "lucide-react";
import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { uploadsApi } from "@/features/uploads/api/uploads.api";
import { boardingApi } from "../../../api/boarding.api";
import { StaffBoardingPetOption } from "../../../types/boarding.types";
import { StaffBoardingPetSelectCard } from "./StaffBoardingPetSelectCard";

interface Props {
  ownerId: string;
  pets: StaffBoardingPetOption[];
  selectedPetId: string;
  onPetSelect: (petId: string) => void;
  onPetCreated?: (pet: StaffBoardingPetOption) => void;
}

type PetSpecies = "Dog" | "Cat" | "Other";
type PetGender = "male" | "female" | "unknown";

export function StaffBoardingPetSection({ ownerId, pets, selectedPetId, onPetSelect, onPetCreated }: Props) {
  const [createdPets, setCreatedPets] = useState<StaffBoardingPetOption[]>([]);
  const mergedPets = [
    ...createdPets.filter((pet) => !pets.some((item) => item.id === pet.id)),
    ...pets
  ];
  const filteredPets = mergedPets.filter((pet) => pet.ownerId === ownerId);
  const selectedPet = filteredPets.find((pet) => pet.id === selectedPetId);

  const [open, setOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSavingPet, setIsSavingPet] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<PetSpecies>("Dog");
  const [gender, setGender] = useState<PetGender>("male");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [estimatedAge, setEstimatedAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [furColor, setFurColor] = useState("");
  const [identifyingMarks, setIdentifyingMarks] = useState("");

  const resetPetForm = () => {
    setProfileImageUrl("");
    setPetName("");
    setSpecies("Dog");
    setGender("male");
    setBreed("");
    setBirthDate("");
    setEstimatedAge("");
    setWeightKg("");
    setFurColor("");
    setIdentifyingMarks("");
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Vui lòng chọn ảnh JPG, PNG hoặc WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB.");
      return;
    }

    try {
      setIsUploadingImage(true);
      const uploadedImage = await uploadsApi.uploadImage(file);
      setProfileImageUrl(uploadedImage.secureUrl || uploadedImage.url);
      toast.success("Tải ảnh thú cưng lên thành công.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload ảnh thất bại.";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreatePet = async () => {
    const normalizedPetName = petName.trim();
    const normalizedBreed = breed.trim();
    const normalizedEstimatedAge = estimatedAge.trim();

    if (!ownerId) {
      toast.error("Vui lòng chọn chủ nuôi trước.");
      return;
    }

    if (!normalizedPetName || !normalizedBreed) {
      toast.error("Vui lòng nhập tên và giống thú cưng.");
      return;
    }

    if (!birthDate && !normalizedEstimatedAge) {
      toast.error("Vui lòng nhập ngày sinh hoặc tuổi ước tính.");
      return;
    }

    const estimatedAgeNumber = normalizedEstimatedAge ? Number(normalizedEstimatedAge) : undefined;
    const weightKgNumber = weightKg.trim() ? Number(weightKg.trim()) : undefined;

    if (estimatedAgeNumber !== undefined && Number.isNaN(estimatedAgeNumber)) {
      toast.error("Tuổi ước tính không hợp lệ.");
      return;
    }

    if (weightKgNumber !== undefined && Number.isNaN(weightKgNumber)) {
      toast.error("Cân nặng không hợp lệ.");
      return;
    }

    try {
      setIsSavingPet(true);
      const pet = await boardingApi.createStaffBoardingPet(ownerId, {
        petName: normalizedPetName,
        species,
        breed: normalizedBreed,
        gender,
        birthDate: birthDate || undefined,
        estimatedAge: estimatedAgeNumber,
        weightKg: weightKgNumber,
        furColor: furColor.trim() || undefined,
        profileImageUrl: profileImageUrl || undefined,
        identifyingMarks: identifyingMarks.trim() || undefined
      });

      setCreatedPets((current) => [pet, ...current.filter((item) => item.id !== pet.id)]);
      onPetSelect(pet.id);
      onPetCreated?.(pet);
      resetPetForm();
      setIsSheetOpen(false);
      toast.success("Đã tạo hồ sơ thú cưng.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tạo hồ sơ thú cưng thất bại";
      toast.error(message);
    } finally {
      setIsSavingPet(false);
    }
  };

  const speciesLabel = (value: PetSpecies) => value === "Dog" ? "Chó" : value === "Cat" ? "Mèo" : "Khác";

  return (
    <div className={`bg-petcenter-card border border-petcenter-border rounded-[16px] shadow-sm p-6 ${!ownerId ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petcenter-primary/10 flex items-center justify-center">
            <PawPrint className="h-5 w-5 text-petcenter-primary" />
          </div>
          <h2 className="text-xl font-bold text-petcenter-text tracking-tight">2. Thú cưng</h2>
        </div>

        <Sheet
          open={isSheetOpen}
          onOpenChange={(nextOpen) => {
            setIsSheetOpen(nextOpen);
            if (!nextOpen) resetPetForm();
          }}
        >
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-[8px] hover:bg-petcenter-primary/10 hover:text-petcenter-primary hover:border-petcenter-primary transition-colors" disabled={!ownerId}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm thú cưng
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton
            className="w-full gap-0 border-l border-petcenter-border-strong bg-petcenter-card p-0 text-petcenter-text shadow-modal data-[side=right]:w-full data-[side=right]:sm:w-[760px] data-[side=right]:sm:max-w-none flex flex-col"
          >
            <SheetHeader className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-8 py-7 shadow-sm relative overflow-hidden">
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0D9488]/10 w-10 h-10 rounded-xl flex items-center justify-center border border-[#0D9488]/20">
                    <PawPrint className="h-5 w-5 text-[#0D9488]" />
                  </div>
                  <SheetTitle className="text-[22px] font-bold text-[#0F172A] tracking-tight">
                    Thêm thú cưng mới
                  </SheetTitle>
                </div>
                <SheetDescription className="text-[15px] font-medium text-[#64748B] pl-[52px]">
                  Nhập thông tin để tạo hồ sơ thú cưng cho chủ nuôi đang chọn.
                </SheetDescription>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0D9488]/5 rounded-bl-full pointer-events-none -z-0" />
            </SheetHeader>

            <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
              <div className="px-8 py-8 space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <input
                    id="staff-pet-avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isUploadingImage || isSavingPet}
                  />
                  <label
                    htmlFor="staff-pet-avatar-upload"
                    className={cn(
                      "w-24 h-24 rounded-full border-2 border-dashed border-[#CBD5E1] bg-[#F1F5F9] flex flex-col items-center justify-center text-[#64748B] mb-3 overflow-hidden cursor-pointer hover:bg-[#E2E8F0] transition-colors",
                      (isUploadingImage || isSavingPet) && "cursor-not-allowed opacity-70"
                    )}
                  >
                    {profileImageUrl ? (
                      <Image src={profileImageUrl} alt="Ảnh đại diện thú cưng" width={96} height={96} className="h-full w-full object-cover" />
                    ) : isUploadingImage ? (
                      <>
                        <Loader2 className="h-6 w-6 mb-1 animate-spin" />
                        <span className="text-[11px] font-medium">Đang tải</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-[11px] font-medium">Tải ảnh</span>
                      </>
                    )}
                  </label>
                  <h3 className="font-bold text-[#0F172A] text-sm mb-1">Ảnh đại diện thú cưng</h3>
                  <p className="text-xs text-[#64748B]">JPG, PNG hoặc WEBP. Tối đa 5MB.</p>
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                  <h3 className="text-base font-bold text-[#0F172A] mb-5 pb-4 border-b border-[#E2E8F0] flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#0D9488] rounded-full" />
                    Thông tin cơ bản
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-[#0F172A]">Tên thú cưng <span className="text-red-500">*</span></label>
                      <Input value={petName} onChange={(event) => setPetName(event.target.value)} placeholder="Nhập tên gọi ở nhà" className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] shadow-sm" />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm font-semibold text-[#0F172A]">Loài <span className="text-red-500">*</span></label>
                      <div className="flex gap-2 bg-[#F8FAFC] p-1 rounded-[10px] border border-[#E2E8F0]">
                        {(["Dog", "Cat", "Other"] as PetSpecies[]).map((item) => (
                          <Button key={item} type="button" variant="ghost" size="sm" onClick={() => setSpecies(item)} className={cn("flex-1 h-9 rounded-[8px] text-xs transition-colors", species === item ? "bg-white shadow-sm text-[#0F172A] border border-[#E2E8F0] hover:bg-white" : "text-[#64748B] hover:text-[#0F172A]")}>{speciesLabel(item)}</Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm font-semibold text-[#0F172A]">Giới tính <span className="text-red-500">*</span></label>
                      <div className="flex gap-2 bg-[#F8FAFC] p-1 rounded-[10px] border border-[#E2E8F0]">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setGender("male")} className={cn("flex-1 h-9 rounded-[8px] text-xs transition-colors", gender === "male" ? "bg-white shadow-sm text-[#0F172A] border border-[#E2E8F0] hover:bg-white" : "text-[#64748B] hover:text-[#0F172A]")}>Đực</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setGender("female")} className={cn("flex-1 h-9 rounded-[8px] text-xs transition-colors", gender === "female" ? "bg-white shadow-sm text-[#0F172A] border border-[#E2E8F0] hover:bg-white" : "text-[#64748B] hover:text-[#0F172A]")}>Cái</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setGender("unknown")} className={cn("flex-1 h-9 rounded-[8px] text-xs transition-colors", gender === "unknown" ? "bg-white shadow-sm text-[#0F172A] border border-[#E2E8F0] hover:bg-white" : "text-[#64748B] hover:text-[#0F172A]")}>Khác</Button>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-[#0F172A]">Giống <span className="text-red-500">*</span></label>
                      <Input value={breed} onChange={(event) => setBreed(event.target.value)} placeholder="VD: Poodle, Golden Retriever..." className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                  <div className="mb-5 pb-4 border-b border-[#E2E8F0]">
                    <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-4 bg-[#0D9488] rounded-full" />
                      Thông tin thể chất
                    </h3>
                    <p className="text-xs text-[#64748B]">Cần nhập ngày sinh hoặc tuổi ước tính để lưu hồ sơ.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm font-semibold text-[#0F172A]">Ngày sinh dự kiến</label>
                      <Input
                        type="date"
                        value={birthDate}
                        disabled={!birthDate && !!estimatedAge.trim()}
                        onChange={(event) => {
                          const value = event.target.value;
                          setBirthDate(value);
                          if (value) {
                            const ageDiff = (Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
                            setEstimatedAge(Math.max(0, Math.floor(ageDiff * 10) / 10).toString());
                          } else {
                            setEstimatedAge("");
                          }
                        }}
                        className={cn(
                          "h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] shadow-sm text-[#475569]",
                          !birthDate && !!estimatedAge.trim() && "opacity-50 cursor-not-allowed bg-gray-50"
                        )}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm font-semibold text-[#0F172A]">Tuổi ước tính</label>
                      <div className="relative">
                        <Input
                          value={estimatedAge}
                          disabled={!!birthDate}
                          onChange={(event) => setEstimatedAge(event.target.value)}
                          placeholder="VD: 2"
                          className={cn(
                            "h-11 pr-12 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] shadow-sm",
                            !!birthDate && "opacity-50 cursor-not-allowed bg-gray-50"
                          )}
                        />
                        <span className="absolute right-4 top-3.5 text-sm text-[#94A3B8]">năm</span>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm font-semibold text-[#0F172A]">Cân nặng</label>
                      <div className="relative">
                        <Input value={weightKg} onChange={(event) => setWeightKg(event.target.value)} placeholder="VD: 12.5" className="h-11 pr-10 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] shadow-sm" />
                        <span className="absolute right-4 top-3.5 text-sm text-[#94A3B8]">kg</span>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm font-semibold text-[#0F172A]">Màu lông</label>
                      <Input value={furColor} onChange={(event) => setFurColor(event.target.value)} placeholder="VD: Vàng rơm, nhị thể..." className="h-11 rounded-[10px] border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0D9488] shadow-sm" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-[#0F172A]">Đặc điểm nhận diện & sức khỏ</label>
                      <textarea
                        value={identifyingMarks}
                        onChange={(event) => setIdentifyingMarks(event.target.value)}
                        placeholder="Ghi chú vết sẹo, đốm lông, dị ứng thức ăn hoặc tình trạng sức khỏe..."
                        className="w-full min-h-[100px] p-3 text-sm rounded-[10px] border border-[#E2E8F0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0D9488] focus-visible:border-[#0D9488] shadow-sm resize-y"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-3 mt-auto shrink-0">
              <SheetClose asChild>
                <Button variant="outline" className="rounded-[10px] h-11 px-6 font-semibold border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-white shadow-sm transition-all" disabled={isSavingPet}>
                  Hủy bỏ
                </Button>
              </SheetClose>
              <Button
                className="rounded-[10px] h-11 px-8 bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm font-semibold transition-all"
                disabled={isSavingPet || isUploadingImage || !petName.trim() || !breed.trim() || (!birthDate && !estimatedAge.trim())}
                onClick={handleCreatePet}
              >
                {isSavingPet && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu hồ sơ thú cưng
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {!ownerId ? (
        <div className="flex items-center justify-center h-14 bg-petcenter-background/50 rounded-[12px] border border-dashed border-petcenter-border">
          <p className="text-petcenter-text-secondary text-sm">Vui lòng chọn chủ nuôi trước</p>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="flex items-center justify-center h-14 bg-petcenter-background/50 rounded-[12px] border border-dashed border-petcenter-border">
          <p className="text-petcenter-text-secondary text-sm">Chủ nuôi chưa có thú cưng.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-14 rounded-[12px] border-petcenter-border bg-white hover:bg-white hover:border-petcenter-primary/50 text-petcenter-text font-normal shadow-sm transition-all focus:ring-1 focus:ring-petcenter-primary focus:border-petcenter-primary px-4"
              >
                {selectedPet ? (
                  <div className="flex items-center gap-3">
                    <div className={cn("h-8 w-8 rounded-full overflow-hidden border border-petcenter-border flex items-center justify-center shrink-0", selectedPet.imageUrl ? "bg-petcenter-background" : "bg-petcenter-primary/10")}>
                      {selectedPet.imageUrl ? (
                        <Image src={selectedPet.imageUrl} alt={selectedPet.name} width={32} height={32} className="object-cover w-full h-full" />
                      ) : (
                        <PawPrint className="h-4 w-4 text-petcenter-primary" />
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-petcenter-text">{selectedPet.name}</span>
                      <span className="text-petcenter-text-secondary text-xs mt-0.5">
                        {speciesLabel(selectedPet.species)} {selectedPet.breed ? `• ${selectedPet.breed}` : ""}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-petcenter-text-muted">
                    <Search className="h-4 w-4" />
                    <span>Tìm kiếm và chọn thú cưng...</span>
                  </div>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-[12px] border-petcenter-border shadow-modal overflow-hidden bg-white z-50" align="start">
              <Command>
                <CommandInput placeholder="Tìm tên thú cưng..." className="border-none focus:ring-0 h-12 text-sm" />
                <CommandList>
                  <CommandEmpty className="py-6 text-center text-sm text-petcenter-text-muted">
                    Không tìm thấy thú cưng nào.
                  </CommandEmpty>
                  <CommandGroup className="p-2">
                    {filteredPets.map((pet) => (
                      <CommandItem
                        key={pet.id}
                        value={`${pet.name} ${pet.breed || ""}`}
                        onSelect={() => {
                          onPetSelect(pet.id);
                          setOpen(false);
                        }}
                        className="cursor-pointer rounded-[8px] my-1 px-3 py-2 data-[selected=true]:bg-petcenter-background/80 aria-selected:bg-petcenter-background transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={cn("h-8 w-8 rounded-full overflow-hidden border border-petcenter-border flex items-center justify-center shrink-0", pet.imageUrl ? "bg-petcenter-background" : "bg-petcenter-primary/10")}>
                            {pet.imageUrl ? (
                              <Image src={pet.imageUrl} alt={pet.name} width={32} height={32} className="object-cover w-full h-full" />
                            ) : (
                              <PawPrint className="h-4 w-4 text-petcenter-primary" />
                            )}
                          </div>
                          <div className="flex flex-col py-1">
                            <span className="font-semibold text-petcenter-text text-sm">{pet.name}</span>
                            <span className="text-xs text-petcenter-text-secondary mt-0.5">
                              {speciesLabel(pet.species)} {pet.breed ? `• ${pet.breed}` : ""}
                            </span>
                          </div>
                        </div>
                        <Check className={cn("ml-auto h-4 w-4 text-petcenter-primary", selectedPetId === pet.id ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedPetId && selectedPet && (
            <StaffBoardingPetSelectCard
              pet={selectedPet}
              isSelected
              onSelect={() => { }}
            />
          )}
        </div>
      )}
    </div>
  );
}
