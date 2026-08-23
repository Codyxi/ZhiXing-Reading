import type { SBPACK } from '../types/sbpack';
import { wolfOfWallStreet } from './wolf-of-wall-street';
import { richDadPoorDad } from './rich-dad-poor-dad';
import { influence } from './influence';
import { askRightQuestions } from './ask-right-questions';
import { oneBookSalesPsychology } from './one-book-sales-psychology';
import { giveYouATeam } from './give-you-a-team';
import { humanWeakness } from './human-weakness';
import { buffettLetters } from './buffett-letters';

export const ALL_MOCK_SBPACKS: SBPACK[] = [
  richDadPoorDad,
  wolfOfWallStreet,
  influence,
  askRightQuestions,
  oneBookSalesPsychology,
  giveYouATeam,
  humanWeakness,
  buffettLetters,
];

export function getMockSBPACK(bookId: string): SBPACK | undefined {
  return ALL_MOCK_SBPACKS.find((b) => b.bookId === bookId);
}

export function getAllNodes() {
  return ALL_MOCK_SBPACKS.flatMap((b) =>
    b.nodes.map((n) => ({ ...n, bookId: b.bookId, bookTitle: b.bookTitle }))
  );
}

export function getAllEvidences() {
  return ALL_MOCK_SBPACKS.flatMap((b) => b.evidences);
}

export function getAllRelationships() {
  return ALL_MOCK_SBPACKS.flatMap((b) => b.relationships);
}

/** 统计数据 */
export function getStats() {
  const packs = ALL_MOCK_SBPACKS;
  const totalBooks = packs.length;
  const totalKnowledge = packs.reduce((sum, p) => sum + p.nodes.filter(n => n.type === 'knowledge').length, 0);
  const totalSkills = packs.reduce((sum, p) => sum + p.nodes.filter(n => n.type === 'skill').length, 0);
  const totalNodes = packs.reduce((sum, p) => sum + p.nodes.length, 0);
  const totalEvidences = packs.reduce((sum, p) => sum + p.evidences.length, 0);
  const totalRelationships = packs.reduce((sum, p) => sum + p.relationships.length, 0);
  return { totalBooks, totalKnowledge, totalSkills, totalNodes, totalEvidences, totalRelationships };
}
