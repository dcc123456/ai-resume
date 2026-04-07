// resume-ai/server/src/services/keywordService.js
function computeKeywordMatchRate(resumeText, jdHardSkills) {
  if (!jdHardSkills || jdHardSkills.length === 0) return 0;
  const lowerText = resumeText.toLowerCase();
  let matched = 0;
  for (const keyword of jdHardSkills) {
    if (lowerText.includes(keyword.toLowerCase())) matched++;
  }
  return Math.floor((matched / jdHardSkills.length) * 100);
}

function getMissingKeywords(resumeText, jdHardSkills) {
  if (!jdHardSkills || jdHardSkills.length === 0) return [];
  const lowerText = resumeText.toLowerCase();
  return jdHardSkills.filter((keyword) => !lowerText.includes(keyword.toLowerCase()));
}

module.exports = { computeKeywordMatchRate, getMissingKeywords };
