interface SearchFields {
  title: string;
  metadata: string;
  description: string;
}

interface SearchEntry<T> {
  item: T;
  fields: string[][];
}

const words = (value: string): string[] => value
  .normalize("NFKD")
  .replace(/\p{M}/gu, "")
  .toLowerCase()
  .replace(/[.'’]/g, "")
  .split(/[^\p{L}\p{N}]+/u)
  .filter(Boolean);

export const createSearchIndex = <T extends SearchFields>(items: readonly T[]): SearchEntry<T>[] => items.map((item) => ({
  item,
  fields: [item.title, item.metadata, item.description].map(words),
}));

const isSingleTypo = (query: string, word: string): boolean => {
  if (!/^\p{L}{5,}$/u.test(query) || !/^\p{L}{5,}$/u.test(word)) return false;
  if (Math.abs(query.length - word.length) > 1) return false;

  let index = 0;
  while (index < Math.min(query.length, word.length) && query[index] === word[index]) index++;

  if (query.length < word.length) return query.slice(index) === word.slice(index + 1);
  if (query.length > word.length) return query.slice(index + 1) === word.slice(index);

  return query.slice(index + 1) === word.slice(index + 1)
    || (query[index] === word[index + 1]
      && query[index + 1] === word[index]
      && query.slice(index + 2) === word.slice(index + 2));
};

export const searchIndex = <T>(entries: readonly SearchEntry<T>[], query: string): T[] => {
  const terms = [...new Set(words(query))];
  if (terms.length === 0) return entries.map(({ item }) => item);

  const matches: { item: T; score: number; typos: number; order: number }[] = [];

  entries.forEach(({ item, fields }, order) => {
    let score = 0;
    let typos = 0;

    for (const term of terms) {
      let best = 0;
      fields.forEach((field, fieldIndex) => {
        for (const word of field) {
          const quality = word === term ? 3 : word.startsWith(term) ? 2 : word.includes(term) ? 1 : 0;
          if (quality > 0) best = Math.max(best, quality * 10 + 3 - fieldIndex);
        }
      });

      if (best === 0) {
        const fieldIndex = fields.findIndex((field) => field.some((word) => isSingleTypo(term, word)));
        if (fieldIndex === -1) return;
        best = 3 - fieldIndex;
        typos++;
      }

      score += best;
    }

    matches.push({ item, score, typos, order });
  });

  // Literal matches always precede typo matches; ties keep the original date order.
  return matches
    .sort((a, b) => a.typos - b.typos || b.score - a.score || a.order - b.order)
    .map(({ item }) => item);
};
