import type { DrillDiagramConfigDto } from '@/api/client';

type DrillDiagramRendererProps = {
  drillDiagramConfig?: DrillDiagramConfigDto;
  className?: string;
};

type DiagramObject = Record<string, unknown>;

const WORKSPACE_WIDTH = 120;
const FULL_WORKSPACE_HEIGHT = 160;
const HALF_WORKSPACE_HEIGHT = 83;
const PITCH_WIDTH = 100;
const REAL_PITCH_WIDTH_METERS = 68;
const REAL_PITCH_LENGTH_METERS = 105;
const HALF_REAL_PITCH_LENGTH_METERS = REAL_PITCH_LENGTH_METERS / 2;
const CENTER_CIRCLE_RADIUS_METERS = 9.15;
const PENALTY_AREA_DEPTH_METERS = 16.5;
const PENALTY_AREA_WIDTH_METERS = 40.32;
const GOAL_AREA_DEPTH_METERS = 5.5;
const GOAL_AREA_WIDTH_METERS = 18.32;
const PENALTY_SPOT_DISTANCE_METERS = 11;
const PITCH_SCALE = PITCH_WIDTH / REAL_PITCH_WIDTH_METERS;
const FULL_PITCH_HEIGHT = REAL_PITCH_LENGTH_METERS * PITCH_SCALE;
const HALF_PITCH_HEIGHT = HALF_REAL_PITCH_LENGTH_METERS * PITCH_SCALE;
const CENTER_CIRCLE_RADIUS = CENTER_CIRCLE_RADIUS_METERS * PITCH_SCALE;
const PENALTY_AREA_DEPTH = PENALTY_AREA_DEPTH_METERS * PITCH_SCALE;
const PENALTY_AREA_WIDTH = PENALTY_AREA_WIDTH_METERS * PITCH_SCALE;
const GOAL_AREA_DEPTH = GOAL_AREA_DEPTH_METERS * PITCH_SCALE;
const GOAL_AREA_WIDTH = GOAL_AREA_WIDTH_METERS * PITCH_SCALE;
const PENALTY_SPOT_DISTANCE = PENALTY_SPOT_DISTANCE_METERS * PITCH_SCALE;
const PENALTY_SPOT_RADIUS = 0.35 * PITCH_SCALE;
const PITCH_OFFSET_X = 10;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const pickNumber = (obj: DiagramObject, keys: string[], fallback: number): number => {
  for (const key of keys) {
    const raw = obj[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return raw;
    }

    if (typeof raw === 'string') {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
};

const pickString = (obj: DiagramObject, keys: string[], fallback = ''): string => {
  for (const key of keys) {
    const raw = obj[key];
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim();
    }
  }

  return fallback;
};

const getObjectType = (obj: DiagramObject): string =>
  pickString(obj, ['type', 'kind', 'objectType', 'shape'], 'marker').toLowerCase();

const objectKey = (obj: DiagramObject, index: number): string =>
  pickString(obj, ['id', 'key', 'name'], `object-${index}`);

const renderDiagramObject = (obj: DiagramObject, index: number, workspaceHeight: number) => {
  const type = getObjectType(obj);
  const x = clamp(pickNumber(obj, ['x', 'cx', 'left'], 50), 0, WORKSPACE_WIDTH);
  const y = clamp(pickNumber(obj, ['y', 'cy', 'top'], 70), 0, workspaceHeight);
  const color = pickString(obj, ['color', 'fill', 'stroke'], '#ffffff');
  const label = pickString(obj, ['label', 'text', 'name', 'number'], '');
  const caption = pickString(obj, ['caption', 'subtitle', 'bottomText'], '');
  const key = objectKey(obj, index);

  if (type === 'line' || type === 'arrow') {
    const x2 = clamp(pickNumber(obj, ['x2', 'toX', 'endX'], x), 0, WORKSPACE_WIDTH);
    const y2 = clamp(pickNumber(obj, ['y2', 'toY', 'endY'], y), 0, workspaceHeight);
    const strokeWidth = clamp(pickNumber(obj, ['strokeWidth', 'width'], 0.8), 0.3, 2.5);
    const lineStyle = pickString(obj, ['lineStyle', 'strokeStyle'], 'solid').toLowerCase();

    return (
      <line
        key={key}
        x1={x}
        y1={y}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={lineStyle === 'dashed' ? '2.5 2' : undefined}
        markerEnd={type === 'arrow' ? 'url(#drill-arrow-head)' : undefined}
      />
    );
  }

  if (type === 'text') {
    return (
      <text key={key} x={x} y={y} fill={color} fontSize={3} textAnchor="middle" dominantBaseline="middle">
        {label || 'Note'}
      </text>
    );
  }

  if (type === 'goal') {
    const width = clamp(pickNumber(obj, ['width', 'w'], 14), 6, 30);
    const height = clamp(pickNumber(obj, ['height', 'h'], 5), 3, 20);
    const rotation = clamp(pickNumber(obj, ['rotation', 'angle'], 0), -180, 180);
    const postColor = pickString(obj, ['postColor', 'stroke'], '#ffffff');

    return (
      <g key={key} transform={`rotate(${rotation} ${x} ${y})`}>
        <rect
          x={x - width / 2}
          y={y - height / 2}
          width={width}
          height={height}
          fill="none"
          stroke={postColor}
          strokeWidth={0.7}
        />
        <line x1={x - width / 2} y1={y} x2={x + width / 2} y2={y} stroke={postColor} strokeOpacity={0.65} strokeWidth={0.35} />
        <line x1={x} y1={y - height / 2} x2={x} y2={y + height / 2} stroke={postColor} strokeOpacity={0.65} strokeWidth={0.35} />
        {caption ? (
          <text x={x} y={y + height / 2 + 3.2} fill="#ffffff" fontSize={2.2} textAnchor="middle" dominantBaseline="middle">
            {caption.slice(0, 24)}
          </text>
        ) : null}
      </g>
    );
  }

  if (type === 'cone') {
    return (
      <g key={key}>
        <polygon
          points={`${x},${y - 2.4} ${x - 2.2},${y + 1.8} ${x + 2.2},${y + 1.8}`}
          fill={color}
          opacity={0.95}
        />
        {caption ? (
          <text x={x} y={y + 5.2} fill="#ffffff" fontSize={2.2} textAnchor="middle" dominantBaseline="middle">
            {caption.slice(0, 24)}
          </text>
        ) : null}
      </g>
    );
  }

  if (type === 'ball') {
    return (
      <g key={key}>
        <circle cx={x} cy={y} r={1.4} fill="#111827" stroke="#ffffff" strokeWidth={0.45} />
        {caption ? (
          <text x={x} y={y + 4.8} fill="#ffffff" fontSize={2.2} textAnchor="middle" dominantBaseline="middle">
            {caption.slice(0, 24)}
          </text>
        ) : null}
      </g>
    );
  }

  const r = clamp(pickNumber(obj, ['radius', 'r', 'size'], 2.1), 1.2, 4.5);
  return (
    <g key={key}>
      <circle cx={x} cy={y} r={r} fill={color} stroke="#0f172a" strokeWidth={0.45} />
      {label ? (
        <text x={x} y={y + 0.1} fill="#ffffff" fontSize={2.2} textAnchor="middle" dominantBaseline="middle">
          {label.slice(0, 3)}
        </text>
      ) : null}
      {caption ? (
        <text x={x} y={y + r + 3.2} fill="#ffffff" fontSize={2.2} textAnchor="middle" dominantBaseline="middle">
          {caption.slice(0, 24)}
        </text>
      ) : null}
    </g>
  );
};

export default function DrillDiagramRenderer({
  drillDiagramConfig,
  className = '',
}: DrillDiagramRendererProps) {
  const frame = drillDiagramConfig?.frames?.[0];
  const objects = (frame?.objects ?? []) as DiagramObject[];
  const pitch = (frame?.pitch as Record<string, unknown> | undefined) ?? {};
  const pitchMode = pitch.mode === 'full' ? 'full' : 'half';
  const pitchHeight = pitchMode === 'full' ? FULL_PITCH_HEIGHT : HALF_PITCH_HEIGHT;
  const workspaceHeight = pitchMode === 'full' ? FULL_WORKSPACE_HEIGHT : HALF_WORKSPACE_HEIGHT;
  const pitchX = PITCH_OFFSET_X;
  const pitchY = (workspaceHeight - pitchHeight) / 2;
  const pitchBottomY = pitchY + pitchHeight;
  const pitchCenterX = pitchX + PITCH_WIDTH / 2;
  const penaltyAreaX = pitchX + (PITCH_WIDTH - PENALTY_AREA_WIDTH) / 2;
  const goalAreaX = pitchX + (PITCH_WIDTH - GOAL_AREA_WIDTH) / 2;
  const topPenaltySpotY = pitchY + PENALTY_SPOT_DISTANCE;
  const bottomPenaltySpotY = pitchBottomY - PENALTY_SPOT_DISTANCE;
  const penaltyArcDy = PENALTY_AREA_DEPTH - PENALTY_SPOT_DISTANCE;
  const penaltyArcHalfWidth = Math.sqrt(Math.max(0, CENTER_CIRCLE_RADIUS * CENTER_CIRCLE_RADIUS - penaltyArcDy * penaltyArcDy));
  const topPenaltyArcY = pitchY + PENALTY_AREA_DEPTH;
  const bottomPenaltyArcY = pitchBottomY - PENALTY_AREA_DEPTH;

  return (
    <div className={`relative w-full overflow-hidden rounded-md bg-linear-to-b from-green-500 to-green-600 ${className}`} style={{ paddingBottom: `${(workspaceHeight / WORKSPACE_WIDTH) * 100}%` }}>
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${WORKSPACE_WIDTH} ${workspaceHeight}`} preserveAspectRatio="none">
        <defs>
          <marker id="drill-arrow-head" viewBox="0 0 10 10" refX="7.6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
          </marker>
        </defs>

        <rect x={pitchX} y={pitchY} width={PITCH_WIDTH} height={pitchHeight} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />

        {pitchMode === 'full' ? (
          <>
            <line x1={pitchX} y1={pitchY + pitchHeight / 2} x2={pitchX + PITCH_WIDTH} y2={pitchY + pitchHeight / 2} stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <circle cx={pitchX + PITCH_WIDTH / 2} cy={pitchY + pitchHeight / 2} r={CENTER_CIRCLE_RADIUS} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <rect x={penaltyAreaX} y={pitchY} width={PENALTY_AREA_WIDTH} height={PENALTY_AREA_DEPTH} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <rect x={penaltyAreaX} y={pitchBottomY - PENALTY_AREA_DEPTH} width={PENALTY_AREA_WIDTH} height={PENALTY_AREA_DEPTH} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <rect x={goalAreaX} y={pitchY} width={GOAL_AREA_WIDTH} height={GOAL_AREA_DEPTH} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <rect x={goalAreaX} y={pitchBottomY - GOAL_AREA_DEPTH} width={GOAL_AREA_WIDTH} height={GOAL_AREA_DEPTH} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <circle cx={pitchCenterX} cy={topPenaltySpotY} r={PENALTY_SPOT_RADIUS} fill="#ffffff" opacity="0.85" />
            <circle cx={pitchCenterX} cy={bottomPenaltySpotY} r={PENALTY_SPOT_RADIUS} fill="#ffffff" opacity="0.85" />
            <path
              d={`M ${pitchCenterX - penaltyArcHalfWidth} ${topPenaltyArcY} A ${CENTER_CIRCLE_RADIUS} ${CENTER_CIRCLE_RADIUS} 0 0 0 ${pitchCenterX + penaltyArcHalfWidth} ${topPenaltyArcY}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.35"
              opacity="0.85"
            />
            <path
              d={`M ${pitchCenterX - penaltyArcHalfWidth} ${bottomPenaltyArcY} A ${CENTER_CIRCLE_RADIUS} ${CENTER_CIRCLE_RADIUS} 0 0 1 ${pitchCenterX + penaltyArcHalfWidth} ${bottomPenaltyArcY}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.35"
              opacity="0.85"
            />
          </>
        ) : (
          <>
            <line x1={pitchX} y1={pitchBottomY} x2={pitchX + PITCH_WIDTH} y2={pitchBottomY} stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <circle cx={pitchX + PITCH_WIDTH / 2} cy={pitchBottomY} r={CENTER_CIRCLE_RADIUS} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <rect x={penaltyAreaX} y={pitchY} width={PENALTY_AREA_WIDTH} height={PENALTY_AREA_DEPTH} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <rect x={goalAreaX} y={pitchY} width={GOAL_AREA_WIDTH} height={GOAL_AREA_DEPTH} fill="none" stroke="#ffffff" strokeWidth="0.35" opacity="0.85" />
            <circle cx={pitchCenterX} cy={topPenaltySpotY} r={PENALTY_SPOT_RADIUS} fill="#ffffff" opacity="0.85" />
            <path
              d={`M ${pitchCenterX - penaltyArcHalfWidth} ${topPenaltyArcY} A ${CENTER_CIRCLE_RADIUS} ${CENTER_CIRCLE_RADIUS} 0 0 0 ${pitchCenterX + penaltyArcHalfWidth} ${topPenaltyArcY}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.35"
              opacity="0.85"
            />
          </>
        )}

        {objects.map((obj, index) => renderDiagramObject(obj, index, workspaceHeight))}
      </svg>

      {objects.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white/85">
          No diagram objects
        </div>
      ) : null}
    </div>
  );
}
