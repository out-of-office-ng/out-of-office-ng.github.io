// Confirmed history shared by the homepage and trail. Images are venue
// references, not documentation of the events. --codex
import { locationPhotos } from './locationPhotos.js';

export const editions = [
  { code: '0x01', title: 'The Post-NYSC Hangout', location: 'Tarkwa Bay Beach', date: '11 April 2025', dateTime: '2025-04-11', note: 'Where we first exhaled.', word: 'Exhale.', tone: '#dce7df', image: locationPhotos[0].src },
  { code: '0x02', title: 'Open Canvas', location: 'Jaekel House Garden', date: '30 May 2025', dateTime: '2025-05-30', note: 'An open mind. A little room to create.', word: 'Create.', tone: '#e8d7ca', image: locationPhotos[2].src },
  { code: '0x03', title: 'Release and Unwind', location: 'Tarkwa Bay Beach', date: '15 August 2026', dateTime: '2026-08-15', note: 'A little time away from the Lagos palava.', word: 'Unwind.', tone: '#d5e2e1', image: locationPhotos[1].src },
];
