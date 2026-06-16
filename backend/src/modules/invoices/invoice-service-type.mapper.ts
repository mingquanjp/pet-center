export function mapServiceType(source: string | null): string {
    if (!source) return "OTHER";
    if (source === "medical_exam") return "MEDICAL";
    if (source === "grooming") return "GROOMING";
    if (source === "boarding") return "BOARDING";
    if (source === "prescription") return "PRESCRIPTION";
    return "OTHER";
}
