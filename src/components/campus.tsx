import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getCampus,
  saveAppNote,
  sendNote,
  setLessonDone,
  setMaterialState,
  setRsvp,
  type CampusMessage,
  type CampusSnapshot,
} from "@/lib/campus.functions";
import type { MaterialState } from "@/lib/catalog";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type CampusContextValue = {
  loading: boolean;
  error: string | null;
  snapshot: CampusSnapshot | null;
  toggleLesson: (lessonId: string, done: boolean) => Promise<void>;
  cycleMaterial: (materialId: string, state: MaterialState) => Promise<void>;
  postMessage: (professorId: string, body: string) => Promise<void>;
  toggleRsvp: (eventId: string, going: boolean) => Promise<void>;
  saveNote: (appId: string, payload: string) => Promise<void>;
  reload: () => void;
};

const CampusContext = createContext<CampusContextValue | null>(null);

export function CampusProvider({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const [snapshot, setSnapshot] = useState<CampusSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCampus()
      .then((data) => {
        if (cancelled) return;
        setSnapshot(data);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError("No pudimos abrir tu mesa. Vuelve a intentarlo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  const toggleLesson = useCallback(async (lessonId: string, done: boolean) => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      const others = prev.lessons.filter((row) => row.lessonId !== lessonId);
      return { ...prev, lessons: [...others, { lessonId, done }] };
    });
    await setLessonDone({ data: { lessonId, done } });
  }, []);

  const cycleMaterial = useCallback(async (materialId: string, state: MaterialState) => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      const others = prev.materials.filter((row) => row.materialId !== materialId);
      return { ...prev, materials: [...others, { materialId, state }] };
    });
    await setMaterialState({ data: { materialId, state } });
  }, []);

  const postMessage = useCallback(async (professorId: string, body: string) => {
    const result = await sendNote({ data: { professorId, body } });
    setSnapshot((prev) => {
      if (!prev) return prev;
      const known = new Set(prev.messages.map((message) => message.id));
      const extra = result.messages.filter((message) => !known.has(message.id));
      return { ...prev, messages: [...prev.messages, ...extra] };
    });
  }, []);

  const toggleRsvp = useCallback(async (eventId: string, going: boolean) => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      const others = prev.rsvps.filter((row) => row.eventId !== eventId);
      return { ...prev, rsvps: going ? [...others, { eventId, going: true }] : others };
    });
    await setRsvp({ data: { eventId, going } });
  }, []);

  const saveNote = useCallback(async (appId: string, payload: string) => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      const others = prev.notes.filter((row) => row.appId !== appId);
      return { ...prev, notes: [...others, { appId, payload }] };
    });
    await saveAppNote({ data: { appId, payload } });
  }, []);

  const value = useMemo<CampusContextValue>(
    () => ({
      loading,
      error,
      snapshot,
      toggleLesson,
      cycleMaterial,
      postMessage,
      toggleRsvp,
      saveNote,
      reload,
    }),
    [loading, error, snapshot, toggleLesson, cycleMaterial, postMessage, toggleRsvp, saveNote, reload],
  );

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

export function useCampus() {
  const value = useContext(CampusContext);
  if (!value) throw new Error("useCampus fuera del campus");
  return value;
}

export type { CampusMessage };
