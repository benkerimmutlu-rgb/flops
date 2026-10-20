import { advanceVisit, browserTimezone, calendarDay, normalizeVisit, type DailyVisit } from "./daily-visits";

const WALLET_KEY = "flops_wallet_v1";
export interface LocalWallet { bones: number; bonesEarned: number; guestVisit: DailyVisit | null; visitApplied: Record<string, number> }
const amount = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
export function readWallet(): LocalWallet {
  try {
    const saved = JSON.parse(localStorage.getItem(WALLET_KEY) || "null");
    if (saved && typeof saved === "object") return { bones: amount(saved.bones), bonesEarned: amount(saved.bonesEarned),
      guestVisit: normalizeVisit(saved.guestVisit), visitApplied: Object.fromEntries(Object.entries(saved.visitApplied || {}).map(([key, value]) => [key, amount(value)])) };
    const bones = amount(Number(localStorage.getItem("flops_bones_v1")));
    return { bones, bonesEarned: amount(Number(localStorage.getItem("flops_bones_earned_v1") || bones)), guestVisit: null, visitApplied: {} };
  } catch { return { bones: 0, bonesEarned: 0, guestVisit: null, visitApplied: {} }; }
}
export function writeWallet(wallet: LocalWallet) {
  // One authoritative write contains both the visit receipt and its credit.
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  try {
    localStorage.setItem("flops_bones_v1", String(wallet.bones));
    localStorage.setItem("flops_bones_earned_v1", String(wallet.bonesEarned));
  } catch { /* legacy mirrors are optional */ }
}
export function updateWallet(patch: Partial<LocalWallet>) { writeWallet({ ...readWallet(), ...patch }); }
export async function claimGuestVisit(now = new Date()) {
  const claim = () => {
    const wallet = readWallet(), timezone = wallet.guestVisit?.timezone || browserTimezone();
    const result = advanceVisit(wallet.guestVisit, calendarDay(now, timezone), timezone);
    const next = { ...wallet, guestVisit: result.visit, bones: wallet.bones + result.reward, bonesEarned: wallet.bonesEarned + result.reward };
    writeWallet(next);
    return { ...result, wallet: next };
  };
  return navigator.locks ? navigator.locks.request("flops-wallet", claim) : claim();
}
export { WALLET_KEY };
