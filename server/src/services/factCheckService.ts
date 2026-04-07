// src/services/factCheckService.ts
interface WorkExperience {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  responsibilities?: string[];
}

interface FactCheckDiff {
  index: number;
  generated: string;
  base: string;
}

interface DateDiff {
  index: number;
  generated: { start: string; end: string };
  base: { start: string; end: string };
}

export interface FactCheckReport {
  company_diff: FactCheckDiff[];
  title_diff: FactCheckDiff[];
  date_diff: DateDiff[];
  hasIssues: boolean;
}

interface ResumeData {
  work_experiences?: WorkExperience[];
  [key: string]: any;
}

export function normalizeString(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
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

export function factCheck(generated: ResumeData, base: ResumeData): FactCheckReport {
  const report: FactCheckReport = { company_diff: [], title_diff: [], date_diff: [], hasIssues: false };
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
    const normalizeDate = (d: string) => (d || '').replace(/\s/g, '').replace(/年|月/g, '-').replace(/日/g, '');
    if (normalizeDate(genExp.start_date) !== normalizeDate(baseExp.start_date) || normalizeDate(genExp.end_date) !== normalizeDate(baseExp.end_date)) {
      report.date_diff.push({ index: i, generated: { start: genExp.start_date, end: genExp.end_date }, base: { start: baseExp.start_date, end: baseExp.end_date } });
    }
  }
  report.hasIssues = report.company_diff.length > 0 || report.title_diff.length > 0 || report.date_diff.length > 0;
  return report;
}
