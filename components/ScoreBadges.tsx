interface ScoreBadgesProps {
  healthScore: number;
  complianceScore: number;
  category: string;
}

function getHealthColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-error";
}

function getHealthLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function getComplianceColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-error";
}

export function ScoreBadges({ healthScore, complianceScore, category }: ScoreBadgesProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-badge bg-white/[0.04] border border-border">
        <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: healthScore >= 80 ? "#34D399" : healthScore >= 60 ? "#FBBF24" : "#F87171" }} />
        <span className={`text-[11px] font-medium ${getHealthColor(healthScore)}`}>
          Health: {healthScore}
        </span>
        <span className="text-[10px] text-text-muted">
          ({getHealthLabel(healthScore)})
        </span>
      </div>

      <div className="flex items-center gap-1.5 px-2 py-1 rounded-badge bg-white/[0.04] border border-border">
        <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-[11px] font-medium ${getComplianceColor(complianceScore)}`}>
          Compliance: {complianceScore}%
        </span>
      </div>

      {category && category !== "other" && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-badge bg-accent/10 border border-accent/20">
          <span className="text-[11px] font-medium text-accent-text">
            {category}
          </span>
        </div>
      )}
    </div>
  );
}
