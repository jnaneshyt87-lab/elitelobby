"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function uploadPaymentProof(
  file: File,
  userId: string
): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const ext = file.name.split(".").pop();
  const path = `payment-proofs/${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("payment-proofs")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function createDepositTransaction(params: {
  userId: string;
  amount: number;
  utrNumber: string;
  screenshotUrl: string | null;
  note?: string;
}): Promise<{ id: string } | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: params.userId,
      amount: params.amount,
      type: "deposit",
      status: "pending",
      reference: params.utrNumber,
      screenshot_url: params.screenshotUrl,
      admin_note: params.note ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Transaction error:", error);
    return null;
  }

  return data;
}

export async function createWithdrawalRequest(params: {
  userId: string;
  amount: number;
  upiId: string;
}): Promise<{ id: string } | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: params.userId,
      amount: -params.amount,
      type: "withdrawal",
      status: "pending",
      reference: params.upiId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Withdrawal error:", error);
    return null;
  }

  return data;
}
