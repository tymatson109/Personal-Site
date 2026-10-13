import type { Entry, Section } from "@/types/entry";
import { SAMPLE_ENTRIES } from "@/lib/sample/entries";
import { SAMPLE_SECTIONS } from "@/lib/sample/sections";

// Every page reads content through here, so PR 6 swaps sample data for the database in one place

export async function getSections(): Promise<Section[]> {
  return SAMPLE_SECTIONS;
}

export async function getEntries(): Promise<Entry[]> {
  return SAMPLE_ENTRIES;
}
