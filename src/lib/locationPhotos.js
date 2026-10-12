// Location references only. These photos do not document OOO attendees or past editions.
// Vite's base path keeps the same asset paths working on GitHub Pages and in
// the site's /out-of-office/ portfolio copy.
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

export const locationPhotos = [
  {
    src: asset('images/locations/tarkwa-bay-front.jpg'),
    alt: 'View of the shoreline at Tarkwa Bay Beach in Lagos',
    place: 'Tarkwa Bay shoreline',
    source: 'Liesel81',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tarkwa_Bay_Beach_Front.jpg',
  },
  {
    src: asset('images/locations/tarkwa-bay-beach.jpg'),
    alt: 'Tarkwa Bay Beach in Lagos, photographed from the sand',
    place: 'Tarkwa Bay Beach',
    source: 'Liesel81',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tarkwa_Bay_Beach_Tire_shot.jpg',
  },
  {
    src: asset('images/locations/jaekel-house.jpg'),
    alt: 'Jaekel House in Ebute Metta, Lagos',
    place: 'Jaekel House',
    source: 'Beendy234',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jaekel_House,_Ebute_Metta,_Lagos.jpg',
  },
  {
    src: asset('images/locations/jaekel-house-garden.jpg'),
    alt: 'Green vegetation at Jaekel House in Lagos',
    place: 'Jaekel House garden',
    source: 'Solasly',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vegetation_at_Jaekel_House,_Lagos.jpg',
  },
];
