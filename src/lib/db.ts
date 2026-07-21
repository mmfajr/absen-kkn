import { Member, Attendance, MemberStats } from "@/types";
import { INITIAL_MEMBERS } from "./initialMembers";
import { supabase, isSupabaseConfigured } from "./supabase";

const LOCAL_STORAGE_MEMBERS_KEY = "kkn10_mentaos_members_v1";
const LOCAL_STORAGE_ATTENDANCE_KEY = "kkn10_mentaos_attendance_v1";

/**
 * Gets today's date string in YYYY-MM-DD format using local time zone.
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets current local time string in HH:mm format.
 */
export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
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
    return JSON.parse(stored);
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
      const { data, error } = await supabase.from("members").select("*").order("name");
      if (!error && data && data.length > 0) {
        return data as Member[];
      }
      // If table empty, seed Supabase with 16 members
      if (data && data.length === 0) {
        const { data: seeded, error: seedErr } = await supabase
          .from("members")
          .insert(INITIAL_MEMBERS)
          .select();
        if (!seedErr && seeded) return seeded as Member[];
      }
    } catch (e) {
      console.warn("Supabase fetch members failed, falling back to local:", e);
    }
  }
  return getLocalMembers();
}

export async function fetchMemberById(id: string): Promise<Member | null> {
  const members = await fetchMembers();
  return members.find((m) => m.id === id) || null;
}

export async function updateMemberAvatar(memberId: string, avatarUrl: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("members")
        .update({ avatar_url: avatarUrl })
        .eq("id", memberId);
      if (!error) return true;
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
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("member_id", memberId)
        .order("date", { ascending: false });
      if (!error && data) return data as Attendance[];
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
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("member_id", memberId)
        .eq("date", dateStr)
        .single();
      if (!error && data) return data as Attendance;
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
      const { error } = await supabase
        .from("attendance")
        .update({ hours })
        .eq("id", attendanceId);
      if (!error) return true;
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
      const { data, error } = await supabase.from("attendance").select("*");
      if (!error && data) return data as Attendance[];
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
      const { error: uploadError } = await supabase.storage
        .from("attendance-photos")
        .upload(fileName, file, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (!uploadError) {
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
      const { data, error } = await supabase
        .from("attendance")
        .insert({
          member_id: record.member_id,
          date: record.date,
          time: record.time,
          photo_url: record.photo_url,
          hours: record.hours || 8,
          has_geotag: record.has_geotag,
          lat: record.lat,
          lng: record.lng,
          location_name: record.location_name || "Mentaos",
        })
        .select()
        .single();

      if (!error && data) {
        return data as Attendance;
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
