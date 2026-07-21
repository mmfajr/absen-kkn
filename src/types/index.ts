export interface Member {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  photo_url: string;
  hours: number;
  has_geotag: boolean;
  lat?: number;
  lng?: number;
  location_name?: string;
  created_at: string;
}

export interface MemberStats extends Member {
  attendedToday: boolean;
  totalDays: number;
  totalHours: number;
  lastAttendance?: Attendance;
}

export interface GroupSummaryRow {
  member: Member;
  attendedToday: boolean;
  totalDays: number;
  totalHours: number;
}
