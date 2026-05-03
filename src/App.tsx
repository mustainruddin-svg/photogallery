import { useState, useEffect, useMemo } from 'react';
import { Search, Heart, ExternalLink, Filter, Calendar, Camera, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Album, UnitType } from './types';
import { MOCK_ALBUMS } from './mockData';

export default function App() {
  const [albums, setAlbums] = useState<Album[]>(MOCK_ALBUMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUnit, setActiveUnit] = useState<UnitType>('semua');
  const [activeYear, setActiveYear] = useState<string>('semua');
  const [myLikes, setMyLikes] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('arrahmah-my-likes');
    return saved ? JSON.parse(saved) : {};
  });
  const [isLikedPanelOpen, setIsLikedPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

  // Fetch data from Google Sheets
  useEffect(() => {
    async function fetchAlbums() {
      if (!API_URL || API_URL === 'PASTE_URL_WEB_APP_DISINI') {
        console.warn('VITE_APPS_SCRIPT_URL belum dikonfigurasi. Menggunakan data demo.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data dari Google Sheets');
        const data = await response.json();
        if (data.albums) {
          setAlbums(data.albums);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data dari Sheets. Pastikan URL benar dan publik.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlbums();
  }, [API_URL]);

  // Sync likes to localStorage
  const availableYears = useMemo(() => {
    const years: string[] = Array.from(new Set(albums.map(a => String(a.Tahun))));
    return ['semua', ...years.sort((a, b) => b.localeCompare(a))];
  }, [albums]);

  // Derived stats
  const totalPhotos = useMemo(() => albums.reduce((s, a) => s + a.Jumlah_Foto, 0), [albums]);

  // Filtering logic
  const filteredAlbums = useMemo(() => {
    return albums.filter(a => {
      const unitOk = activeUnit === 'semua' || a.Unit.toLowerCase() === activeUnit;
      const yearOk = activeYear === 'semua' || String(a.Tahun) === activeYear;
      const query = searchQuery.toLowerCase();
      const searchOk = !query || 
        a.Judul.toLowerCase().includes(query) || 
        a.Deskripsi.toLowerCase().includes(query);
      return unitOk && yearOk && searchOk;
    });
  }, [albums, activeUnit, activeYear, searchQuery]);

  // Sync likes to localStorage
  useEffect(() => {
    localStorage.setItem('arrahmah-my-likes', JSON.stringify(myLikes));
  }, [myLikes]);

  const toggleLike = (albumId: string) => {
    setMyLikes(prev => ({
      ...prev,
      [albumId]: !prev[albumId]
    }));
  };

  const likedAlbums = albums.filter(a => myLikes[a.ID]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b-2 border-sky-light shadow-lg shadow-sky/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-sky to-sky-deep rounded-xl flex items-center justify-center text-white font-serif font-bold text-lg sm:text-xl shadow-md shadow-sky/30 relative">
              AR
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gold rounded-xs border-2 border-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-sky-deep leading-tight">Yayasan Ar-Rahmah Sulawesi</h1>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest">Galeri Dokumentasi</p>
            </div>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              placeholder="Cari kegiatan..."
              className="w-full pl-10 pr-4 py-2 bg-sky-pale border-1.5 border-border rounded-full text-sm focus:outline-none focus:border-sky focus:ring-3 focus:ring-sky-light transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsLikedPanelOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gold-pale border border-gold-light rounded-full text-xs sm:text-sm font-semibold hover:bg-gold/10 transition-colors shrink-0"
          >
            <Heart className={`w-4 h-4 ${likedAlbums.length > 0 ? 'fill-red-500 text-red-500' : 'text-text-dark'}`} />
            <span className="hidden xs:inline">{likedAlbums.length} Disuka</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-linear-to-br from-sky-deep via-sky to-[#7ACFF0] text-white py-12 sm:py-20 px-4 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-gold/10 rounded-full blur-2xl" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
          >
            <Camera className="w-3 h-3" /> Dokumentasi Resmi
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Kenangan <span className="italic text-gold-light">Berharga</span><br />Anak-Anak Kita
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-sm sm:text-base leading-relaxed mb-10 max-w-lg mx-auto"
          >
            Kumpulan album foto kegiatan seluruh unit pendidikan Ar-Rahmah. Klik album untuk membuka galeri di Google Photos.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-8 sm:gap-16 pt-4"
          >
            <div>
              <div className="font-serif text-2xl sm:text-4xl font-bold text-gold-light">{albums.length}</div>
              <div className="text-[10px] font-semibold text-white/70 uppercase tracking-widest mt-1">Album</div>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-4xl font-bold text-gold-light">{totalPhotos.toLocaleString('id-ID')}</div>
              <div className="text-[10px] font-semibold text-white/70 uppercase tracking-widest mt-1">Total Foto</div>
            </div>
            <div className="hidden sm:block">
              <div className="font-serif text-2xl sm:text-4xl font-bold text-gold-light">4</div>
              <div className="text-[10px] font-semibold text-white/70 uppercase tracking-widest mt-1">Unit Sekolah</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FILTERS */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-max">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Unit</span>
              <div className="flex gap-1.5">
                {['semua', 'paud', 'sdit', 'smpit', 'smait', 'yayasan'].map((u) => (
                  <button
                    key={u}
                    onClick={() => setActiveUnit(u as UnitType)}
                    className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                      activeUnit === u 
                        ? 'bg-sky-deep text-white' 
                        : 'bg-sky-pale text-text-mid border border-border hover:border-sky'
                    }`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-px h-6 bg-border" />
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-light uppercase tracking-widest">Tahun</span>
              <div className="flex gap-1.5">
                {availableYears.map((y) => (
                  <button
                    key={y}
                    onClick={() => setActiveYear(y)}
                    className={`px-4 py-1 rounded-full text-xs font-semibold transition-all ${
                       activeYear === y 
                        ? 'bg-gold text-white' 
                        : 'bg-gold-pale text-text-dark border border-border hover:border-gold'
                    }`}
                  >
                    {y === 'semua' ? 'Semua' : y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <Info className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-8">
          <h3 className="font-serif text-xl sm:text-2xl text-sky-deep font-bold">Album Kegiatan</h3>
          <span className="text-xs font-bold text-text-light bg-sky-pale border border-border px-3 py-1 rounded-full whitespace-nowrap">
            {isLoading ? 'Memuat...' : `${filteredAlbums.length} album ditemukan`}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm">
                <div className="aspect-16/10 animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/3 animate-shimmer rounded-full" />
                  <div className="h-5 w-4/5 animate-shimmer rounded-full" />
                  <div className="h-4 w-full animate-shimmer rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAlbums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredAlbums.map((album) => (
                <motion.div
                  key={album.ID}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-2xl hover:shadow-sky/20 hover:-translate-y-1.5 transition-all cursor-pointer flex flex-col"
                  onClick={() => window.open(album.Link_GooglePhotos, '_blank')}
                >
                  <div className="aspect-16/10 bg-sky-light relative overflow-hidden shrink-0">
                    {album.URL_Thumbnail ? (
                      <img 
                        src={album.URL_Thumbnail} 
                        alt={album.Judul} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-5xl bg-linear-to-br from-sky-light to-sky-deep/20`}>
                        {album.Emoji}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md border border-white/40 text-[10px] font-bold text-white uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
                      {album.Unit}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white px-2.5 py-1 rounded-full z-10">
                      📷 {album.Jumlah_Foto} foto
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(album.ID);
                      }}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all z-20 ${
                        myLikes[album.ID]
                         ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/40 text-white'
                         : 'bg-white/20 border-white/40 text-white hover:bg-white/40 hover:scale-110'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${myLikes[album.ID] ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-bold text-sky uppercase tracking-widest leading-none mt-0.5">{album.Tanggal_Label}</span>
                       <div className="w-1 h-1 rounded-full bg-border" />
                       <span className="text-[10px] font-bold text-gold uppercase tracking-widest leading-none mt-0.5">{album.Tahun}</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-text-dark leading-tight mb-2 group-hover:text-sky-deep transition-colors">
                      {album.Judul}
                    </h4>
                    <p className="text-sm text-text-mid leading-relaxed line-clamp-2">
                      {album.Deskripsi}
                    </p>
                  </div>

                  <div className="px-5 py-4 border-t border-sky-pale flex items-center justify-between">
                     <span className={`text-[11px] font-bold flex items-center gap-1.5 ${myLikes[album.ID] ? 'text-red-500' : 'text-text-light'}`}>
                       <Heart className={`w-3.5 h-3.5 ${myLikes[album.ID] ? 'fill-current' : ''}`} />
                       {myLikes[album.ID] ? 'Suka' : 'Simpan'}
                     </span>
                     <div className="flex items-center gap-2 text-[11px] font-bold text-sky-deep uppercase tracking-widest group-hover:gap-3 transition-all">
                       Buka Album <div className="w-6 h-6 rounded-full bg-linear-to-br from-sky to-sky-deep flex items-center justify-center text-white shadow-md shadow-sky/30 text-[10px]">→</div>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-border">
            <Search className="w-16 h-16 text-text-light/30 mx-auto mb-4" />
            <h4 className="font-serif text-2xl text-text-dark font-bold mb-2">Tidak Ada Album Ditemukan</h4>
            <p className="text-text-mid">Coba ubah filter atau kata kunci pencarian Anda.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveUnit('semua');
                setActiveYear('semua');
              }}
              className="mt-6 text-sky-deep font-bold hover:underline"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-sky-deep text-white/70 py-12 px-4 text-center">
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-sky-light" />
          <div className="w-2 h-2 rounded-full bg-gold" />
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <p className="font-bold text-white mb-2 text-lg">Yayasan Ar-Rahmah Sulawesi</p>
        <p className="text-sm italic">PAUD · SDIT · SMPIT · SMAIT — Makassar, Sulawesi Selatan</p>
        <div className="mt-8 pt-8 border-t border-white/10 text-[10px] uppercase tracking-widest opacity-50">
          Galeri ini untuk keluarga besar Ar-Rahmah · © 2025
        </div>
      </footer>

      {/* LIKED PANEL */}
      <AnimatePresence>
        {isLikedPanelOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLikedPanelOpen(false)}
              className="fixed inset-0 bg-text-dark/60 backdrop-blur-xs z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white rounded-t-3xl z-[70] max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <h3 className="font-serif text-xl font-bold text-text-dark">Album Favorit Anda</h3>
                </div>
                <button 
                  onClick={() => setIsLikedPanelOpen(false)}
                  className="w-10 h-10 rounded-full bg-sky-pale flex items-center justify-center text-text-mid hover:bg-sky-light transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {likedAlbums.length > 0 ? (
                  <div className="space-y-4">
                    {likedAlbums.map(album => (
                      <div key={album.ID} className="flex items-center gap-4 p-3 bg-sky-pale rounded-2xl border border-border group">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white flex items-center justify-center text-3xl shadow-sm">
                          {album.Emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-text-dark text-sm sm:text-base truncate">{album.Judul}</h4>
                          <p className="text-[10px] font-bold text-text-light uppercase tracking-widest mt-0.5">
                            {album.Unit} · {album.Tahun}
                          </p>
                        </div>
                        <button 
                          onClick={() => window.open(album.Link_GooglePhotos, '_blank')}
                          className="shrink-0 px-4 py-2 bg-white border border-border rounded-full text-xs font-bold text-sky-deep hover:bg-sky-deep hover:text-white transition-all shadow-sm"
                        >
                          Buka →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-50 px-10">
                    <Heart className="w-12 h-12 text-text-light mx-auto mb-4" />
                    <p className="text-sm font-medium">Belum ada album yang disukai.<br />Tap ❤️ pada album untuk menyimpannya di sini.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
