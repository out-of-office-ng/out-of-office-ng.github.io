// Confirmed history shared by the homepage and trail. Every edition uses an
// event photo.
import { editionCovers } from './eventPhotos.js';

export const editions = [
  { code: '0x01', title: 'The First Hangout', location: 'Tarkwa Bay Beach', date: '11 April 2026', dateTime: '2026-04-11', note: 'Where we first exhaled.', word: 'Exhale.', tone: '#dce7df', image: editionCovers['0x01'].src, imageAlt: editionCovers['0x01'].alt, imageRatio: editionCovers['0x01'].ratio, imageKind: 'event' },
  { code: '0x02', title: 'Open Canvas', location: 'Jaekel House Garden', date: '30 May 2026', dateTime: '2026-05-30', note: 'An open mind. A little room to create.', word: 'Create.', tone: '#e8d7ca', image: editionCovers['0x02'].src, imageAlt: editionCovers['0x02'].alt, imageRatio: editionCovers['0x02'].ratio, imageKind: 'event' },
  { code: '0x03', title: 'Release and Unwind', location: 'Tarkwa Bay Beach', date: '15 August 2026', dateTime: '2026-08-15', note: 'A little time away from the Lagos palava.', word: 'Unwind.', tone: '#d5e2e1', image: editionCovers['0x03'].src, imageAlt: editionCovers['0x03'].alt, imageRatio: editionCovers['0x03'].ratio, imageKind: 'event' },
];

// Write-ups from the OOO team (Charisa, 16 Oct 2026), trimmed by about half on
// 18 Oct after the review; shown beside the archive cards.
const stories = {
  '0x01': [
    'Every vision starts somewhere. Ours started with a hangout at the beach: a space to clock out, mingle, and let loose without the pressure of everyday life.',
    'More than a first hangout, it was the birth of Out of Office.',
  ],
  '0x02': [
    'Open Canvas was for the artists, the art lovers, the curious, and anyone willing to pick up a brush.',
    "No experience required, just the willingness to show up. Because creativity isn't about being perfect. It's about giving yourself the freedom to create.",
  ],
  '0x03': [
    'A beach retreat to step away from the everyday: stillness, nature, new things, and the freedom of being present.',
    'A reminder that rest can be an adventure, and sometimes all you need is a little space to breathe.',
  ],
};
for (const edition of editions) edition.story = stories[edition.code];
