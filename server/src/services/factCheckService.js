// resume-ai/server/src/services/factCheckService.js
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');
}

function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

const MAX_EDIT_DISTANCE = 3;

function factCheck(generated, base) {
  const report = { company_diff: [], title_diff: [], date_diff: [], hasIssues: false };
  const genExps = generated.work_experiences || [];
  const baseExps = base.work_experiences || [];
  for (let i = 0; i < genExps.length; i++) {
    const genExp = genExps[i];
    const baseExp = baseExps[i];
    if (!baseExp) continue;
    if (levenshteinDistance(normalizeString(genExp.company), normalizeString(baseExp.company)) > MAX_EDIT_DISTANCE) {
      report.company_diff.push({ index: i, generated: genExp.company, base: baseExp.company });
    }
    if (levenshteinDistance(normalizeString(genExp.title), normalizeString(baseExp.title)) > MAX_EDIT_DISTANCE) {
      report.title_diff.push({ index: i, generated: genExp.title, base: baseExp.title });
    }
    const normalizeDate = (d) => (d || '').replace(/\s/g, '').replace(/年|月/g, '-').replace(/日/g, '');
    const genStart = normalizeDate(genExp.start_date), baseStart = normalizeDate(baseExp.start_date);
    const genEnd = normalizeDate(genExp.end_date), baseEnd = normalizeDate(baseExp.end_date);
    if (genStart !== baseStart || genEnd !== baseEnd) {
      report.date_diff.push({ index: i, generated: { start: genExp.start_date, end: genExp.end_date }, base: { start: baseExp.start_date, end: baseExp.end_date } });
    }
  }
  report.hasIssues = report.company_diff.length > 0 || report.title_diff.length > 0 || report.date_diff.length > 0;
  return report;
}

module.exports = { factCheck, normalizeString, levenshteinDistance };
