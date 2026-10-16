// Photographs from past OOO editions, selected by the OOO team (Charisa,
// 16 Oct 2026). Unlike locationPhotos.js, these document the events
// themselves. 0x01 The First Hangout has one photo so far.
// Web copies are resized to 1400px with EXIF (including GPS) stripped.
const asset = (path) => `${import.meta.env.BASE_URL}images/events/${path}`;

export const editionCovers = {
  '0x01': { src: asset('first-hangout-cover.jpg'), ratio: 719 / 1280, alt: 'A colourful doodled painting in progress on a table, with markers and cups beside it, at The First Hangout' },
  '0x02': { src: asset('open-canvas-cover.jpg'), ratio: 787 / 1400, alt: 'Guests painting at long tables on the lawn at Open Canvas' },
  '0x03': { src: asset('release-and-unwind-cover.jpg'), ratio: 1080 / 1350, alt: 'Collage of friends laughing in the waves at Release and Unwind' },
};

export const openCanvasPhotos = [
  { src: asset('open-canvas-5059.jpg'), alt: 'A guest holds up a painting of Jaekel House with a portrait in front' },
  { src: asset('open-canvas-0024.jpg'), alt: 'A bright painting of a green frog on an orange background' },
  { src: asset('open-canvas-5060.jpg'), alt: 'A guest holds up a painting of a bridge over blue water' },
  { src: asset('open-canvas-0023.jpg'), alt: 'A guest smiles while holding a finished painting in the garden' },
  { src: asset('open-canvas-0026.jpg'), alt: 'A colourful abstract painting on a table of paints and cups' },
  { src: asset('open-canvas-0025.jpg'), alt: 'A guest kneels on the lawn with a painting' },
].map((photo) => ({ ...photo, edition: 'Open Canvas' }));

export const releaseUnwindPhotos = [
  { src: asset('release-and-unwind-5050.jpg'), title: 'Talking by the shore', alt: 'Two friends chat on the sand at the water’s edge' },
  { src: asset('release-and-unwind-5051.jpg'), title: 'The boat over', alt: 'Guests in life jackets on the boat ride to the beach' },
  { src: asset('release-and-unwind-5052.jpg'), title: 'Beach games', alt: 'Guests playing a ball game on the sand by the tents' },
  { src: asset('release-and-unwind-5053.jpg'), title: 'Under the shade', alt: 'Guests relaxing under a thatched shelter with painting supplies laid out' },
  { src: asset('release-and-unwind-5054.jpg'), title: 'Upside down', alt: 'A guest doing a handstand on the beach at dusk' },
  { src: asset('release-and-unwind-5055.jpg'), title: 'Sea-breeze selfie', alt: 'A guest takes a selfie on the beach under a cloudy sky' },
].map((photo) => ({ ...photo, edition: 'Release and Unwind' }));

// Open Canvas clips, re-encoded from the iPhone .MOV originals to H.264 MP4
// (720p-ish, 30fps, metadata stripped). Poster = a frame from each clip.
const video = (path) => `${import.meta.env.BASE_URL}videos/${path}`;
export const openCanvasVideos = [1, 2, 3].map((n) => ({
  src: video(`open-canvas-${n}.mp4`),
  poster: video(`open-canvas-${n}.jpg`),
  label: `Clip ${n}`,
}));

// Three prints per edition for the trail collage. 0x01 has one photo, so the
// trail shows it on its own until more arrive.
export const trailPhotos = {
  '0x02': [openCanvasPhotos[0], { ...editionCovers['0x02'], edition: 'Open Canvas' }, openCanvasPhotos[1]],
  '0x03': [releaseUnwindPhotos[2], releaseUnwindPhotos[0], releaseUnwindPhotos[4]],
};
