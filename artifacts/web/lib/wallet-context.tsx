"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { MOCK_USER } from "@/lib/mock-data";

type Transaction = {
  id: string;
  type: "deposit" | "withdrawal" | "entry_fee" | "winning";
  amount: number;
  status: "completed" | "pending" | "failed";
  note?: string;
  created_at: string;
};

type WalletContextType = {
  balance: number;
  transactions: Transaction[];
  deductFee: (amount: number, note: string) => boolean;
  addFunds: (amount: number, note: string) => void;
  canAfford: (amount: number) => boolean;
};

const WalletContext = createContext<WalletContextType | null>(null);

const STORAGE_KEY = "elitelobby_wallet_v2";

function loadFromStorage(): { balance: number; transactions: Transaction[] } {
  if (typeof window === "undefined") {
    return { balance: MOCK_USER.wallet_balance, transactions: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { balance: number; transactions: Transaction[] };
  } catch {}
  return { balance: MOCK_USER.wallet_balance, transactions: [] };
}

function saveToStorage(balance: number, transactions: Transaction[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, transactions }));
  } catch {}
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(MOCK_USER.wallet_balance);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    setBalance(stored.balance);
    setTransactions(stored.transactions);
    setHydrated(true);
  }, []);

  const deductFee = useCallback((amount: number, note: string): boolean => {
    let success = false;
    setBalance(prev => {
      if (prev < amount) return prev;
      success = true;
      const newBalance = prev - amount;
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        type: "entry_fee",
        amount: -amount,
        status: "completed",
        note,
        created_at: new Date().toISOString(),
      };
      setTransactions(prevTxs => {
        const updated = [tx, ...prevTxs];
        saveToStorage(newBalance, updated);
        return updated;
      });
      return newBalance;
    });
    return success;
  }, []);

  const addFunds = useCallback((amount: number, note: string) => {
    setBalance(prev => {
      const newBalance = prev + amount;
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        type: "deposit",
        amount,
        status: "completed",
        note,
        created_at: new Date().toISOString(),
      };
      setTransactions(prevTxs => {
        const updated = [tx, ...prevTxs];
        saveToStorage(newBalance, updated);
        return updated;
      });
      return newBalance;
    });
  }, []);

  const canAfford = useCallback((amount: number) => balance >= amount, [balance]);

  return (
    <WalletContext.Provider value={{ balance, transactions, deductFee, addFunds, canAfford }}>
      {hydrated ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
