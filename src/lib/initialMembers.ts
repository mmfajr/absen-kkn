import { Member } from "@/types";

export const INITIAL_MEMBERS: Omit<Member, "created_at">[ ] = [
  { id: "m-1", name: "Muhammad Fajar", role: "Ketua" },
  { id: "m-2", name: "Muhammad Dien Akbar Putra Rasiobar", role: "Sekretaris" },
  { id: "m-3", name: "Siti Nurhaliza", role: "Bendahara" },
  { id: "m-4", name: "Devina Yulianti", role: "Koordinator Acara" },
  { id: "m-5", name: "Alisya Dwi Nurhaliza", role: "Acara" },
  { id: "m-6", name: "Kemuning Amalia Putri", role: "Acara" },
  { id: "m-7", name: "Saira Aulia Ananda", role: "Acara" },
  { id: "m-8", name: "Tuty Al Wiah H.J", role: "Acara" },
  { id: "m-9", name: "Rachmadsyah Buchari Pohan", role: "Koordinator Media" },
  { id: "m-10", name: "Elva Nurdiana", role: "Media" },
  { id: "m-11", name: "Khalisa Muthia Widodo", role: "Media" },
  { id: "m-12", name: "Siska Noraini", role: "Media" },
  { id: "m-13", name: "Naliza Safitri", role: "Koordinator Humas & Perkap" },
  { id: "m-14", name: "Adryan Maulana Saputra", role: "Humas & Perkap" },
  { id: "m-15", name: "Muhammad Faturrahman", role: "Humas & Perkap" },
  { id: "m-16", name: "Muhammad Noki", role: "Humas & Perkap" },
];
