export interface Personalization {
  id: string;
  childId: string | null;
  childNameFa: string | null;
  childNameEn: string | null;
  birthDateAt: number | null;
  message: string | null;
  symbol: string | null;
  photoFileId: string | null;
  previewFileId: string | null;
  lockedAt: number | null;
}

export interface PersonalizationInput {
  childId?: string;
  childNameFa?: string;
  childNameEn?: string;
  birthDateAt?: number;
  message?: string;
  symbol?: string;
  photoFileId?: string;
}
