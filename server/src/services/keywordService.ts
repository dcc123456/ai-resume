// src/services/keywordService.ts
export function computeKeywordMatchRate(resumeText: string, jdHardSkills: string[]): number {
  if (!jdHardSkills || jdHardSkills.length === 0) return 0;
  const lowerText = resumeText.toLowerCase();
  let matched = 0;
  for (const keyword of jdHardSkills) {
    if (lowerText.includes(keyword.toLowerCase())) matched++;
  }
  return Math.floor((matched / jdHardSkills.length) * 100);
}

export function getMissingKeywords(resumeText: string, jdHardSkills: string[]): string[] {
  if (!jdHardSkills || jdHardSkills.length === 0) return [];
  const lowerText = resumeText.toLowerCase();
  return jdHardSkills.filter((keyword) => !lowerText.includes(keyword.toLowerCase()));
}
