import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự").max(150, "Họ và tên không được vượt quá 150 ký tự"),
  email: z.string().trim().email("Email không hợp lệ").max(255, "Email không được vượt quá 255 ký tự"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(100, "Mật khẩu không được vượt quá 100 ký tự"),
  phoneNumber: z.string().trim().regex(/^[0-9+() .-]{8,20}$/, "Số điện thoại không hợp lệ").optional(),
  address: z.string().trim().max(1000, "Địa chỉ không được vượt quá 1000 ký tự").optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").max(255, "Email không được vượt quá 255 ký tự"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu").max(100, "Mật khẩu không được vượt quá 100 ký tự")
});

const optionalProfileText = (max: number, message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(max, message).nullable()
  );

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự").max(150, "Họ và tên không được vượt quá 150 ký tự"),
  phoneNumber: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().regex(/^[0-9+() .-]{8,20}$/, "Số điện thoại không hợp lệ").nullable()
  ),
  address: optionalProfileText(1000, "Địa chỉ không được vượt quá 1000 ký tự")
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại").max(100),
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự").max(100),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới").max(100)
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"]
  });

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;
