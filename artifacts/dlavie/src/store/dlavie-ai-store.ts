import { create } from "zustand";

type DlavieAiStore = {
  activeSessionId: string;
  draft: string;
  sidebarCollapsed: boolean;
  setActiveSessionId: (id: string) => void;
  setDraft: (draft: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

export const useDlavieAiStore = create<DlavieAiStore>((set) => ({
  activeSessionId: "",
  draft:
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("dlavie-ai-draft") || "",
  sidebarCollapsed: false,
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
  setDraft: (draft) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dlavie-ai-draft", draft);
    }
    set({ draft });
  },
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
}));
