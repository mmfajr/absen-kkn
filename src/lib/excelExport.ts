import * as XLSX from "xlsx";
import { GroupSummaryRow } from "@/types";

export function exportGroupSummaryToExcel(
  rows: GroupSummaryRow[],
  filename = "Rekap_Absensi_KKN_10_Mentaos_2026.xlsx"
) {
  const data = rows.map((r, idx) => ({
    No: idx + 1,
    Nama: r.member.name,
    Jabatan: r.member.role,
    "Status Hari Ini": r.attendedToday ? "Hadir 🟢" : "Belum Hadir 🔴",
    "Total Hari Hadir": r.totalDays,
    "Total Jam Kerja": r.totalHours,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for clean readability
  worksheet["!cols"] = [
    { wch: 5 },  // No
    { wch: 35 }, // Nama
    { wch: 25 }, // Jabatan
    { wch: 18 }, // Status Hari Ini
    { wch: 18 }, // Total Hari Hadir
    { wch: 16 }, // Total Jam Kerja
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Kelompok");

  XLSX.writeFile(workbook, filename);
}
