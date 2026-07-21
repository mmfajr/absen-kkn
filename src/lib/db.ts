import { Member, Attendance, MemberStats } from "@/types";
import { INITIAL_MEMBERS } from "./initialMembers";
import { supabase, isSupabaseConfigured } from "./supabase";

const LOCAL_STORAGE_MEMBERS_KEY = "kkn10_mentaos_members_v1";
const LOCAL_STORAGE_ATTENDANCE_KEY = "kkn10_mentaos_attendance_v1";

/**
 * Gets today's date string in YYYY-MM-DD format using WITA (Asia/Makassar, UTC+8) time zone.
 */
export function getTodayDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Makassar",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
}

/**
 * Gets current local WITA time string in HH:mm format.
 */
export function getCurrentTimeString(): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Makassar",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
}

// Timeout helper for async promises (e.g. Supabase requests)
function withTimeout<T>(promise: PromiseLike<T>, ms = 6000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase request timeout")), ms)
    ),
  ]);
}

// Local Storage Fallback helpers
function getLocalMembers(): Member[] {
  if (typeof window === "undefined") return INITIAL_MEMBERS as Member[];
  const stored = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
    return INITIAL_MEMBERS as Member[];
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_MEMBERS as Member[];
  } catch {
    return INITIAL_MEMBERS as Member[];
  }
}

function getLocalAttendance(): Attendance[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_ATTENDANCE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalAttendance(records: Attendance[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_ATTENDANCE_KEY, JSON.stringify(records));
  }
}

// --- PUBLIC DB API ---

export async function fetchMembers(): Promise<Member[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from("members").select("*").order("name"),
        2000
      );
      if (!res.error && res.data && res.data.length > 0) {
        return res.data as Member[];
      }
      if (!res.error && res.data && res.data.length === 0) {
        const seeded = await withTimeout(
          supabase.from("members").insert(INITIAL_MEMBERS).select(),
          2000
        );
        if (!seeded.error && seeded.data && seeded.data.length > 0) {
          return seeded.data as Member[];
        }
      }
    } catch (e) {
      console.warn("Supabase fetch members failed or timed out, falling back to local:", e);
    }
  }

  const local = getLocalMembers();
  if (local && local.length > 0) return local;

  return INITIAL_MEMBERS as Member[];
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const members = await fetchMembers();
  return members.find((m) => m.id === id) || null;
}

export async function updateMemberAvatar(memberId: string, avatarUrl: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase
          .from("members")
          .update({ avatar_url: avatarUrl })
          .eq("id", memberId),
        2000
      );
      if (!res.error) return true;
    } catch (e) {
      console.warn("Supabase avatar update failed:", e);
    }
  }

  // Update local storage
  const members = getLocalMembers();
  const target = members.find((m) => m.id === memberId);
  if (target) {
    target.avatar_url = avatarUrl;
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
    }
    return true;
  }
  return false;
}

export async function fetchAttendanceForMember(memberId: string): Promise<Attendance[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase
          .from("attendance")
          .select("*")
          .eq("member_id", memberId)
          .order("date", { ascending: false }),
        2000
      );
      if (!res.error && res.data) return res.data as Attendance[];
    } catch (e) {
      console.warn("Supabase attendance fetch failed:", e);
    }
  }
  const all = getLocalAttendance();
  return all
    .filter((a) => a.member_id === memberId)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function fetchAttendanceForDate(memberId: string, dateStr: string): Promise<Attendance | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase
          .from("attendance")
          .select("*")
          .eq("member_id", memberId)
          .eq("date", dateStr)
          .single(),
        2000
      );
      if (!res.error && res.data) return res.data as Attendance;
    } catch {
      // ignore single error if not found
    }
  }
  const all = getLocalAttendance();
  return all.find((a) => a.member_id === memberId && a.date === dateStr) || null;
}

export async function updateAttendanceHours(
  attendanceId: string,
  hours: number
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase
          .from("attendance")
          .update({ hours })
          .eq("id", attendanceId),
        2000
      );
      if (!res.error) return true;
    } catch (e) {
      console.warn("Supabase update hours failed:", e);
    }
  }

  const all = getLocalAttendance();
  const target = all.find((a) => a.id === attendanceId);
  if (target) {
    target.hours = hours;
    saveLocalAttendance(all);
    return true;
  }
  return false;
}

export async function fetchAttendanceTodayForMember(memberId: string): Promise<Attendance | null> {
  const today = getTodayDateString();
  return fetchAttendanceForDate(memberId, today);
}

export async function fetchAllAttendance(): Promise<Attendance[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await withTimeout(
        supabase.from("attendance").select("*"),
        2000
      );
      if (!res.error && res.data) return res.data as Attendance[];
    } catch (e) {
      console.warn("Supabase fetch all attendance failed:", e);
    }
  }
  return getLocalAttendance();
}

export async function fetchMembersWithStats(): Promise<MemberStats[]> {
  const members = await fetchMembers();
  const allAttendance = await fetchAllAttendance();
  const today = getTodayDateString();

  return members.map((m) => {
    const memberLogs = allAttendance.filter((a) => a.member_id === m.id);
    const todayLog = memberLogs.find((a) => a.date === today);
    const totalDays = new Set(memberLogs.map((a) => a.date)).size;
    const totalHours = memberLogs.reduce((sum, a) => sum + (a.hours || 8), 0);

    return {
      ...m,
      attendedToday: Boolean(todayLog),
      totalDays,
      totalHours,
      lastAttendance: memberLogs[0],
    };
  });
}

export async function uploadAttendancePhoto(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileName = `photos/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const res = await withTimeout(
        supabase.storage
          .from("attendance-photos")
          .upload(fileName, file, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: true,
          }),
        5000
      );

      if (!res.error) {
        const { data: urlData } = supabase.storage
          .from("attendance-photos")
          .getPublicUrl(fileName);
        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn("Supabase Storage upload failed, using Data URL fallback:", err);
    }
  }

  // Fallback: Convert file to Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export async function submitAttendanceRecord(record: {
  member_id: string;
  date: string;
  time: string;
  photo_url: string;
  hours?: number;
  has_geotag: boolean;
  lat?: number;
  lng?: number;
  location_name?: string;
}): Promise<Attendance> {
  const newAttendance: Attendance = {
    id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    member_id: record.member_id,
    date: record.date,
    time: record.time,
    photo_url: record.photo_url,
    hours: record.hours || 8,
    has_geotag: record.has_geotag,
    lat: record.lat,
    lng: record.lng,
    location_name: record.location_name || "Mentaos",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Ensure member exists in Supabase members table to avoid foreign key error
      const targetMember = INITIAL_MEMBERS.find((m) => m.id === record.member_id);
      if (targetMember) {
        await withTimeout(
          supabase.from("members").upsert({
            id: targetMember.id,
            name: targetMember.name,
            role: targetMember.role,
          }),
          2000
        ).catch(() => {});
      }

      // 2. Insert attendance record
      const res = await withTimeout(
        supabase
          .from("attendance")
          .upsert(
            {
              member_id: record.member_id,
              date: record.date,
              time: record.time,
              photo_url: record.photo_url,
              hours: record.hours || 8,
              has_geotag: record.has_geotag,
              lat: record.lat,
              lng: record.lng,
              location_name: record.location_name || "Mentaos",
            },
            { onConflict: "member_id,date" }
          )
          .select()
          .single(),
        4000
      );

      if (res.error) {
        console.warn("Supabase attendance insert error:", res.error);
      } else if (res.data) {
        return res.data as Attendance;
      }
    } catch (e) {
      console.warn("Supabase submit failed, saving locally:", e);
    }
  }

  // Save to local storage
  const currentLocal = getLocalAttendance();
  // Ensure no duplicate for the specific date
  const existingIdx = currentLocal.findIndex(
    (a) => a.member_id === record.member_id && a.date === record.date
  );
  if (existingIdx >= 0) {
    currentLocal[existingIdx] = newAttendance;
  } else {
    currentLocal.push(newAttendance);
  }
  saveLocalAttendance(currentLocal);

  return newAttendance;
}
