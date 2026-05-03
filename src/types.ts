export interface Album {
  ID: string;
  Unit: string;
  Tahun: number;
  Judul: string;
  Deskripsi: string;
  URL_Thumbnail?: string;
  Emoji?: string;
  Jumlah_Foto: number;
  Tanggal_Label: string;
  Link_GooglePhotos: string;
}

export type UnitType = 'semua' | 'paud' | 'sdit' | 'smpit' | 'smait' | 'yayasan';
