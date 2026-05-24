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

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
