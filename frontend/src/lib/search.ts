export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

export function includesSearchText(value: string | null | undefined, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) return true

  return normalizeSearchText(value ?? "").includes(normalizedQuery)
}
