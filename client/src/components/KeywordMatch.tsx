import { Badge } from './ui/badge';

interface KeywordMatchProps {
  matchRate: number;
  missingKeywords?: string[];
  totalKeywords?: number;
}

export default function KeywordMatch({ matchRate, missingKeywords, totalKeywords }: KeywordMatchProps) {
  const getColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (rate >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 ${getColor(matchRate)}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">关键词匹配度</span>
          <span className="text-2xl font-bold">{matchRate}%</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${matchRate >= 70 ? 'bg-green-500' : matchRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${matchRate}%` }} />
        </div>
        <p className="text-xs mt-1">共 {totalKeywords} 个关键词，匹配 {totalKeywords! - (missingKeywords?.length || 0)} 个</p>
      </div>
      {missingKeywords && missingKeywords.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">缺失关键词（建议在简历中补充）：</p>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw, i) => (<Badge key={i} variant="outline" className="text-red-500 border-red-200 bg-red-50">{kw}</Badge>))}
          </div>
        </div>
      )}
    </div>
  );
}
