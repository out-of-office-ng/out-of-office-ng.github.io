// Confirmed history shared by the homepage and trail. Every edition uses an
// event photo.
import { editionCovers } from './eventPhotos.js';

export const editions = [
  { code: '0x01', title: 'The First Hangout', location: 'Tarkwa Bay Beach', date: '11 April 2025', dateTime: '2025-04-11', note: 'Where we first exhaled.', word: 'Exhale.', tone: '#dce7df', image: editionCovers['0x01'].src, imageAlt: editionCovers['0x01'].alt, imageRatio: editionCovers['0x01'].ratio, imageKind: 'event' },
  { code: '0x02', title: 'Open Canvas', location: 'Jaekel House Garden', date: '30 May 2025', dateTime: '2025-05-30', note: 'An open mind. A little room to create.', word: 'Create.', tone: '#e8d7ca', image: editionCovers['0x02'].src, imageAlt: editionCovers['0x02'].alt, imageRatio: editionCovers['0x02'].ratio, imageKind: 'event' },
  { code: '0x03', title: 'Release and Unwind', location: 'Tarkwa Bay Beach', date: '15 August 2026', dateTime: '2026-08-15', note: 'A little time away from the Lagos palava.', word: 'Unwind.', tone: '#d5e2e1', image: editionCovers['0x03'].src, imageAlt: editionCovers['0x03'].alt, imageRatio: editionCovers['0x03'].ratio, imageKind: 'event' },
];

// Write-ups from the OOO team (Charisa, 16 Oct 2026), shown under the
// archive cards and swapped as the visitor steps through editions.
const stories = {
  '0x01': [
    'Every vision starts somewhere. Ours started with a hangout.',
    'What began as a simple gathering at the beach became the beginning of a bigger idea: creating a space where people could clock out, relax, express themselves, mingle, and let loose without the pressure of everyday life.',
    'It was the start of a conversation about community, connection, and making room for experiences that feel different. More than a first hangout, it was the birth of Out Of Office.',
  ],
  '0x02': [
    'Open Canvas was created for the artists, the art lovers, the curious, and anyone willing to pick up a brush and explore.',
    'It was a space to create freely, experiment without judgment, and enjoy the process without worrying about getting everything right. No artistic experience required, just the willingness to show up, express yourself, and let your imagination take the lead.',
    "Because creativity isn't about being perfect. It's about giving yourself the freedom to create.",
  ],
  '0x03': [
    'Sometimes, you need to step away from your everyday routine to find your way back to yourself.',
    'Release and Unwind was a beach retreat designed to do just that: reconnect with nature, embrace stillness, have fun, try new things, and enjoy the freedom of being present. From creative activities to beachside moments, it was an invitation to slow down, let go, and experience life outside the usual routine.',
    'A reminder that rest can be an adventure, connection can happen anywhere, and sometimes, all you need is a little space to breathe.',
  ],
};
for (const edition of editions) edition.story = stories[edition.code];
