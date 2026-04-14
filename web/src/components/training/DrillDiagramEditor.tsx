import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Circle,
  Download,
  Eraser,
  Goal,
  Minus,
  MousePointer2,
  Plus,
  RectangleHorizontal,
  MoveRight,
  Trash2,
  Undo2,
  UserRound,
  X,
} from 'lucide-react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import type { DrillDiagramConfigDto } from '@/api/client';
import DrillDiagramRenderer from '@/components/training/DrillDiagramRenderer';

type Tool = 'select' | 'player' | 'cone' | 'ball' | 'goal' | 'line' | 'arrow';
type Point = { x: number; y: number };
type GoalResizeCorner = 'nw' | 'ne' | 'se' | 'sw';
type PitchMode = 'half' | 'full';

type DiagramObject = {
  id: string;
  type: 'player' | 'cone' | 'ball' | 'text' | 'goal' | 'line' | 'arrow';
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  label?: string;
  caption?: string;
  color?: string;
  lineStyle?: 'solid' | 'dashed';
};

type DrillDiagramEditorProps = {
  value?: DrillDiagramConfigDto;
  onChange: (config?: DrillDiagramConfigDto) => void;
  disabled?: boolean;
};

const ADD_TOOLS: Tool[] = ['player', 'cone', 'ball', 'goal', 'line', 'arrow'];

const TOOL_CONFIG: Record<Tool, { label: string; icon: typeof MousePointer2 }> = {
  select: { label: 'Select', icon: MousePointer2 },
  player: { label: 'Player', icon: UserRound },
  cone: { label: 'Cone', icon: Goal },
  ball: { label: 'Ball', icon: Circle },
  goal: { label: 'Goal', icon: RectangleHorizontal },
  line: { label: 'Line', icon: Minus },
  arrow: { label: 'Arrow', icon: MoveRight },
};

const WORKSPACE_WIDTH = 120;
const FULL_WORKSPACE_HEIGHT = 176;
const HALF_WORKSPACE_HEIGHT = 99;
const GOAL_MIN_WIDTH = 6;
const GOAL_MAX_WIDTH = 30;
const GOAL_MIN_HEIGHT = 3;
const GOAL_MAX_HEIGHT = 20;
const GOAL_ROTATE_HANDLE_OFFSET = 4.5;
const GOAL_HANDLE_HIT_RADIUS = 1.7;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const localToWorld = (local: Point, center: Point, rotation: number): Point => {
  const theta = toRadians(rotation);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: center.x + local.x * cos - local.y * sin,
    y: center.y + local.x * sin + local.y * cos,
  };
};

const worldToLocal = (world: Point, center: Point, rotation: number): Point => {
  const theta = toRadians(-rotation);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const dx = world.x - center.x;
  const dy = world.y - center.y;
  return {
    x: dx * cos - dy * sin,
    y: dx * sin + dy * cos,
  };
};

const normalizeRotation = (value: number): number => {
  const normalized = ((value + 180) % 360 + 360) % 360 - 180;
  return normalized === -180 ? 180 : normalized;
};

const getPitchModeFromConfig = (value?: DrillDiagramConfigDto): PitchMode => {
  const rawMode = (value?.frames?.[0]?.pitch as Record<string, unknown> | undefined)?.mode;
  return rawMode === 'full' ? 'full' : 'half';
};

const getWorkspaceHeightForPitchMode = (pitchMode: PitchMode): number =>
  pitchMode === 'full' ? FULL_WORKSPACE_HEIGHT : HALF_WORKSPACE_HEIGHT;

const clampObjectToWorkspace = (obj: DiagramObject, workspaceHeight: number): DiagramObject => {
  const clamped = {
    ...obj,
    x: obj.x !== undefined ? clamp(obj.x, 0, WORKSPACE_WIDTH) : obj.x,
    y: obj.y !== undefined ? clamp(obj.y, 0, workspaceHeight) : obj.y,
    x2: obj.x2 !== undefined ? clamp(obj.x2, 0, WORKSPACE_WIDTH) : obj.x2,
    y2: obj.y2 !== undefined ? clamp(obj.y2, 0, workspaceHeight) : obj.y2,
  };

  return clamped;
};

const clampObjectsToWorkspace = (objects: DiagramObject[], pitchMode: PitchMode): DiagramObject[] => {
  const workspaceHeight = getWorkspaceHeightForPitchMode(pitchMode);
  return objects.map((obj) => clampObjectToWorkspace(obj, workspaceHeight));
};

const createId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `obj-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const toNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const toLineStyle = (value: unknown): 'solid' | 'dashed' =>
  typeof value === 'string' && value.toLowerCase() === 'dashed' ? 'dashed' : 'solid';

const parseObjects = (value?: DrillDiagramConfigDto): DiagramObject[] => {
  const source = value?.frames?.[0]?.objects ?? [];
  return source.reduce<DiagramObject[]>((acc, item, index) => {
      const obj = item as Record<string, unknown>;
      const type = typeof obj.type === 'string' ? obj.type.toLowerCase() : 'player';
      if (!['player', 'cone', 'ball', 'text', 'goal', 'line', 'arrow'].includes(type)) {
        return acc;
      }

      acc.push({
        id: typeof obj.id === 'string' && obj.id ? obj.id : `obj-${index + 1}`,
        type: type as DiagramObject['type'],
        x: toNumber(obj.x, 50),
        y: toNumber(obj.y, 70),
        x2: toNumber(obj.x2, 60),
        y2: toNumber(obj.y2, 70),
        width: toNumber(obj.width, 14),
        height: toNumber(obj.height, 5),
        rotation: toNumber(obj.rotation, 0),
        text: typeof obj.text === 'string' ? obj.text : undefined,
        label: typeof obj.label === 'string' ? obj.label : undefined,
        caption: typeof obj.caption === 'string' ? obj.caption : undefined,
        color: typeof obj.color === 'string' ? obj.color : undefined,
        lineStyle: toLineStyle(obj.lineStyle),
      });

      return acc;
    }, []);
};

const toConfig = (objects: DiagramObject[], pitchMode: PitchMode, base?: DrillDiagramConfigDto): DrillDiagramConfigDto => {
  const basePitch = (base?.frames?.[0]?.pitch as Record<string, unknown> | undefined) ?? {};

  return {
    schemaVersion: base?.schemaVersion ?? 1,
    meta: base?.meta,
    frames: [
      {
        id: base?.frames?.[0]?.id ?? 'frame-1',
        name: base?.frames?.[0]?.name,
        pitch: {
          ...basePitch,
          mode: pitchMode,
        },
        objects: objects.map((obj) => ({ ...obj })),
      },
    ],
  };
};

const downloadCanvasAsPng = (canvas: HTMLCanvasElement, fileName: string): void => {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = fileName;
  link.click();
};

async function renderSvgToCanvas(svg: SVGSVGElement): Promise<HTMLCanvasElement> {
  const xml = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to render SVG image'));
    img.src = url;
  });

  URL.revokeObjectURL(url);

  const viewBox = svg.viewBox.baseVal;
  const sourceWidth = viewBox?.width && Number.isFinite(viewBox.width) && viewBox.width > 0 ? viewBox.width : WORKSPACE_WIDTH;
  const sourceHeight = viewBox?.height && Number.isFinite(viewBox.height) && viewBox.height > 0 ? viewBox.height : FULL_WORKSPACE_HEIGHT;
  const aspectRatio = sourceHeight / sourceWidth;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = Math.max(1, Math.round(canvas.width * aspectRatio));
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to create canvas context');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas;
}

export default function DrillDiagramEditor({ value, onChange, disabled = false }: DrillDiagramEditorProps) {
  const [tool, setTool] = useState<Tool>('select');
  const [isAddToolDialOpen, setIsAddToolDialOpen] = useState(false);
  const initialPitchMode = getPitchModeFromConfig(value);
  const [pitchMode, setPitchMode] = useState<PitchMode>(initialPitchMode);
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed'>('solid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lineStart, setLineStart] = useState<Point | null>(null);
  const [objects, setObjects] = useState<DiagramObject[]>(clampObjectsToWorkspace(parseObjects(value), initialPitchMode));
  const [addedObjectHistory, setAddedObjectHistory] = useState<string[]>([]);

  const overlayRef = useRef<SVGSVGElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; pointer: Point } | null>(null);
  const goalTransformRef = useRef<
    | {
        mode: 'rotate';
        id: string;
        center: Point;
        startPointerAngle: number;
        startRotation: number;
      }
    | {
        mode: 'resize';
        id: string;
        center: Point;
        rotation: number;
        oppositeLocal: Point;
      }
    | null
  >(null);

  useEffect(() => {
    const nextPitchMode = getPitchModeFromConfig(value);
    setPitchMode(nextPitchMode);
    setObjects(clampObjectsToWorkspace(parseObjects(value), nextPitchMode));
    setAddedObjectHistory([]);
  }, [value]);

  const workspaceHeight = useMemo(() => getWorkspaceHeightForPitchMode(pitchMode), [pitchMode]);

  const currentConfig = useMemo(() => toConfig(objects, pitchMode, value), [objects, pitchMode, value]);
  const selectedObject = selectedId ? objects.find((obj) => obj.id === selectedId) : undefined;
  const selectedCaptionTarget =
    selectedObject && selectedObject.type !== 'line' && selectedObject.type !== 'arrow' ? selectedObject : undefined;
  const selectedGoal = selectedObject?.type === 'goal' ? selectedObject : undefined;

  const updateObjects = (next: DiagramObject[]) => {
    const clamped = clampObjectsToWorkspace(next, pitchMode);
    setObjects(clamped);
    onChange(toConfig(clamped, pitchMode, value));
  };

  const updatePitchMode = (nextMode: PitchMode) => {
    const clamped = clampObjectsToWorkspace(objects, nextMode);
    setPitchMode(nextMode);
    setObjects(clamped);
    onChange(toConfig(clamped, nextMode, value));
  };

  const pointFromPointer = (event: React.PointerEvent<SVGSVGElement>): Point => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return { x: 50, y: clamp(70, 0, workspaceHeight) };
    }

    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * WORKSPACE_WIDTH, 0, WORKSPACE_WIDTH),
      y: clamp(((event.clientY - rect.top) / rect.height) * workspaceHeight, 0, workspaceHeight),
    };
  };

  const getGoalTransformAnchors = (goal: DiagramObject) => {
    const center = { x: goal.x ?? 0, y: goal.y ?? 0 };
    const width = clamp(goal.width ?? 14, GOAL_MIN_WIDTH, GOAL_MAX_WIDTH);
    const height = clamp(goal.height ?? 5, GOAL_MIN_HEIGHT, GOAL_MAX_HEIGHT);
    const rotation = goal.rotation ?? 0;

    const cornersLocal: Record<GoalResizeCorner, Point> = {
      nw: { x: -width / 2, y: -height / 2 },
      ne: { x: width / 2, y: -height / 2 },
      se: { x: width / 2, y: height / 2 },
      sw: { x: -width / 2, y: height / 2 },
    };

    const cornersWorld = {
      nw: localToWorld(cornersLocal.nw, center, rotation),
      ne: localToWorld(cornersLocal.ne, center, rotation),
      se: localToWorld(cornersLocal.se, center, rotation),
      sw: localToWorld(cornersLocal.sw, center, rotation),
    };

    const rotateHandleLocal = { x: 0, y: -height / 2 - GOAL_ROTATE_HANDLE_OFFSET };
    const rotateHandleWorld = localToWorld(rotateHandleLocal, center, rotation);

    return {
      center,
      width,
      height,
      rotation,
      cornersLocal,
      cornersWorld,
      rotateHandleWorld,
    };
  };

  const findHitObjectId = (point: Point): string | null => {
    let best: { id: string; distance: number } | null = null;

    for (const object of objects) {
      if (object.type === 'line' || object.type === 'arrow') {
        const x1 = object.x ?? 0;
        const y1 = object.y ?? 0;
        const x2 = object.x2 ?? x1;
        const y2 = object.y2 ?? y1;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;
        const t = lengthSq === 0 ? 0 : clamp(((point.x - x1) * dx + (point.y - y1) * dy) / lengthSq, 0, 1);
        const px = x1 + t * dx;
        const py = y1 + t * dy;
        const distance = Math.hypot(point.x - px, point.y - py);
        if (distance < 4 && (!best || distance < best.distance)) {
          best = { id: object.id, distance };
        }
        continue;
      }

      const ox = object.x ?? 0;
      const oy = object.y ?? 0;
      if (object.type === 'goal') {
        const width = clamp(object.width ?? 14, 6, 30);
        const height = clamp(object.height ?? 5, 3, 20);
        const radius = Math.hypot(width / 2, height / 2) + 2;
        const distance = Math.hypot(point.x - ox, point.y - oy);
        if (distance < radius && (!best || distance < best.distance)) {
          best = { id: object.id, distance };
        }
        continue;
      }

      const distance = Math.hypot(point.x - ox, point.y - oy);
      if (distance < 5 && (!best || distance < best.distance)) {
        best = { id: object.id, distance };
      }
    }

    return best?.id ?? null;
  };

  const onCanvasPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return;

    const point = pointFromPointer(event);

    if (selectedGoal) {
      const anchors = getGoalTransformAnchors(selectedGoal);
      const rotateDistance = Math.hypot(point.x - anchors.rotateHandleWorld.x, point.y - anchors.rotateHandleWorld.y);

      if (rotateDistance <= GOAL_HANDLE_HIT_RADIUS) {
        goalTransformRef.current = {
          mode: 'rotate',
          id: selectedGoal.id,
          center: anchors.center,
          startPointerAngle: Math.atan2(point.y - anchors.center.y, point.x - anchors.center.x),
          startRotation: anchors.rotation,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }

      const corners: GoalResizeCorner[] = ['nw', 'ne', 'se', 'sw'];
      for (const corner of corners) {
        const cornerPoint = anchors.cornersWorld[corner];
        const cornerDistance = Math.hypot(point.x - cornerPoint.x, point.y - cornerPoint.y);
        if (cornerDistance <= GOAL_HANDLE_HIT_RADIUS) {
          const opposite: Record<GoalResizeCorner, GoalResizeCorner> = {
            nw: 'se',
            ne: 'sw',
            se: 'nw',
            sw: 'ne',
          };

          goalTransformRef.current = {
            mode: 'resize',
            id: selectedGoal.id,
            center: anchors.center,
            rotation: anchors.rotation,
            oppositeLocal: anchors.cornersLocal[opposite[corner]],
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }
      }
    }

    const targetId = findHitObjectId(point);

    if (targetId) {
      setSelectedId(targetId);

      if (tool !== 'line' && tool !== 'arrow') {
        dragRef.current = { id: targetId, pointer: point };
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      return;
    }

    if (tool === 'select') {
      setSelectedId(null);
      return;
    }

    if (tool === 'line' || tool === 'arrow') {
      if (!lineStart) {
        setLineStart(point);
        return;
      }

      const newObject: DiagramObject = {
        id: createId(),
        type: tool,
        x: lineStart.x,
        y: lineStart.y,
        x2: point.x,
        y2: point.y,
        color: '#ffffff',
        lineStyle,
      };

      updateObjects([...objects, newObject]);
      setAddedObjectHistory((prev) => [...prev, newObject.id]);
      setLineStart(null);
      setSelectedId(null);
      return;
    }

    const newObject: DiagramObject = {
      id: createId(),
      type: tool,
      x: point.x,
      y: point.y,
      color: tool === 'player' ? '#1d4ed8' : tool === 'cone' ? '#f59e0b' : tool === 'ball' ? '#111827' : '#ffffff',
      label: tool === 'player' ? 'P' : undefined,
      width: tool === 'goal' ? 14 : undefined,
      height: tool === 'goal' ? 5 : undefined,
      rotation: tool === 'goal' ? 0 : undefined,
    };

    updateObjects([...objects, newObject]);
    setAddedObjectHistory((prev) => [...prev, newObject.id]);
    setSelectedId(null);
  };

  const onCanvasPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return;

    const point = pointFromPointer(event);

    if (goalTransformRef.current) {
      const transform = goalTransformRef.current;

      if (transform.mode === 'rotate') {
        const currentAngle = Math.atan2(point.y - transform.center.y, point.x - transform.center.x);
        const delta = currentAngle - transform.startPointerAngle;
        const nextRotation = normalizeRotation(transform.startRotation + (delta * 180) / Math.PI);

        updateObjects(
          objects.map((obj) =>
            obj.id === transform.id
              ? {
                  ...obj,
                  rotation: nextRotation,
                }
              : obj
          )
        );
        return;
      }

      const draggedLocal = worldToLocal(point, transform.center, transform.rotation);
      const width = clamp(Math.abs(draggedLocal.x - transform.oppositeLocal.x), GOAL_MIN_WIDTH, GOAL_MAX_WIDTH);
      const height = clamp(Math.abs(draggedLocal.y - transform.oppositeLocal.y), GOAL_MIN_HEIGHT, GOAL_MAX_HEIGHT);

      const signedDraggedLocal = {
        x: transform.oppositeLocal.x + (draggedLocal.x >= transform.oppositeLocal.x ? width : -width),
        y: transform.oppositeLocal.y + (draggedLocal.y >= transform.oppositeLocal.y ? height : -height),
      };

      const centerLocal = {
        x: (transform.oppositeLocal.x + signedDraggedLocal.x) / 2,
        y: (transform.oppositeLocal.y + signedDraggedLocal.y) / 2,
      };
      const centerWorld = localToWorld(centerLocal, transform.center, transform.rotation);

      updateObjects(
        objects.map((obj) =>
          obj.id === transform.id
            ? {
                ...obj,
                x: clamp(centerWorld.x, 0, WORKSPACE_WIDTH),
                y: clamp(centerWorld.y, 0, workspaceHeight),
                width,
                height,
              }
            : obj
        )
      );
      return;
    }

    if (!dragRef.current) return;

    const dx = point.x - dragRef.current.pointer.x;
    const dy = point.y - dragRef.current.pointer.y;

    if (dx === 0 && dy === 0) return;

    updateObjects(
      objects.map((object) => {
        if (object.id !== dragRef.current?.id) return object;

        if (object.type === 'line' || object.type === 'arrow') {
          return {
            ...object,
            x: clamp((object.x ?? 0) + dx, 0, WORKSPACE_WIDTH),
            y: clamp((object.y ?? 0) + dy, 0, workspaceHeight),
            x2: clamp((object.x2 ?? 0) + dx, 0, WORKSPACE_WIDTH),
            y2: clamp((object.y2 ?? 0) + dy, 0, workspaceHeight),
          };
        }

        return {
          ...object,
          x: clamp((object.x ?? 0) + dx, 0, WORKSPACE_WIDTH),
          y: clamp((object.y ?? 0) + dy, 0, workspaceHeight),
        };
      })
    );

    dragRef.current = { ...dragRef.current, pointer: point };
  };

  const onCanvasPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if ((dragRef.current || goalTransformRef.current) && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    goalTransformRef.current = null;
  };

  const deleteSelected = () => {
    if (disabled || !selectedId) return;
    updateObjects(objects.filter((object) => object.id !== selectedId));
    setSelectedId(null);
  };

  const clearFrame = () => {
    if (disabled) return;
    updateObjects([]);
    setAddedObjectHistory([]);
    setLineStart(null);
    setSelectedId(null);
  };

  const undoLastAddition = () => {
    if (disabled || addedObjectHistory.length === 0) return;

    const nextHistory = [...addedObjectHistory];
    let idToRemove: string | undefined;

    while (nextHistory.length > 0 && !idToRemove) {
      const candidate = nextHistory.pop();
      if (candidate && objects.some((obj) => obj.id === candidate)) {
        idToRemove = candidate;
      }
    }

    if (!idToRemove) {
      setAddedObjectHistory([]);
      return;
    }

    updateObjects(objects.filter((obj) => obj.id !== idToRemove));
    setAddedObjectHistory(nextHistory);
    setSelectedId((current) => (current === idToRemove ? null : current));
  };

  const canSetSelectedLineStyle = selectedObject?.type === 'line' || selectedObject?.type === 'arrow';

  const setSelectedLineStyle = (nextStyle: 'solid' | 'dashed') => {
    if (!selectedId) return;

    updateObjects(
      objects.map((obj) => {
        if (obj.id !== selectedId) return obj;
        if (obj.type !== 'line' && obj.type !== 'arrow') return obj;
        return { ...obj, lineStyle: nextStyle };
      })
    );
  };

  const exportPng = async () => {
    const svg = previewRef.current?.querySelector('svg');
    if (!(svg instanceof SVGSVGElement)) return;

    const canvas = await renderSvgToCanvas(svg);
    downloadCanvasAsPng(canvas, 'drill-diagram.png');
  };

  return (
    <div className="space-y-3">
      <div className="relative flex flex-wrap items-center gap-1.5 overflow-visible">
        <div className="relative h-9 w-9 shrink-0 overflow-visible mr-1">
          <SpeedDial
            ariaLabel="Add drill item"
            direction="down"
            icon={<SpeedDialIcon icon={<Plus className="h-4 w-4" />} openIcon={<X className="h-4 w-4" />} />}
            FabProps={{
              size: 'small',
              color: 'primary',
              disabled,
            }}
            open={isAddToolDialOpen}
            onOpen={(_, reason) => {
              if (!disabled && reason === 'toggle') {
                setIsAddToolDialOpen(true);
              }
            }}
            onClose={(_, reason) => {
              if (reason === 'toggle') {
                setIsAddToolDialOpen(false);
              }
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 2147483647,
              transform: 'none',
              '& .MuiSpeedDial-actions': {
                gap: 0.5,
              },
              '& .MuiFab-root': {
                width: '34px',
                height: '34px',
                minHeight: '34px',
              },
              '& .MuiSpeedDialAction-staticTooltipLabel': {
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#111827',
                borderRadius: '0.375rem',
                padding: '0.2rem 0.45rem',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                whiteSpace: 'nowrap',
              },
            }}
          >
            {ADD_TOOLS.map((toolName) => {
              const Icon = TOOL_CONFIG[toolName].icon;

              return (
                <SpeedDialAction
                  key={toolName}
                  icon={<Icon className="h-4 w-4" />}
                  tooltipTitle={`Add ${TOOL_CONFIG[toolName].label}`}
                  tooltipPlacement="right"
                  tooltipOpen
                  onClick={() => {
                    setTool(toolName);
                    if (toolName !== 'line' && toolName !== 'arrow') {
                      setLineStart(null);
                    }
                  }}
                />
              );
            })}
          </SpeedDial>
        </div>

        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setTool('select');
            setLineStart(null);
          }}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
            tool === 'select'
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={disabled}
          title="Select and move"
        >
          <MousePointer2 className="h-4 w-4" aria-hidden="true" />
          <span>Select</span>
        </button>

        <button
          type="button"
          onClick={deleteSelected}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
          disabled={disabled || !selectedId}
          title="Delete selected"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span>Delete</span>
        </button>
        <button
          type="button"
          onClick={undoLastAddition}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
          disabled={disabled || addedObjectHistory.length === 0}
          title="Undo last add"
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
          <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={clearFrame}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
          disabled={disabled}
          title="Clear frame"
        >
          <Eraser className="h-4 w-4" aria-hidden="true" />
          <span>Clear</span>
        </button>
        <button
          type="button"
          onClick={exportPng}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Export as PNG"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Export PNG</span>
        </button>
      </div>

      {(tool === 'line' || tool === 'arrow' || canSetSelectedLineStyle) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Line style:</span>
          <button
            type="button"
            onClick={() => {
              setLineStyle('solid');
              if (canSetSelectedLineStyle) setSelectedLineStyle('solid');
            }}
            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
              lineStyle === 'solid'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Solid
          </button>
          <button
            type="button"
            onClick={() => {
              setLineStyle('dashed');
              if (canSetSelectedLineStyle) setSelectedLineStyle('dashed');
            }}
            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
              lineStyle === 'dashed'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Dashed
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        <div className="flex flex-col pt-1">
          <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Pitch size</span>
          <div className="flex h-12 items-center gap-4 rounded-md border border-gray-300 bg-white px-3 dark:border-gray-600 dark:bg-gray-700">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="radio"
                name="pitch-size"
                value="half"
                checked={pitchMode === 'half'}
                onChange={() => updatePitchMode('half')}
                disabled={disabled}
                className="h-4 w-4"
              />
              Half
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="radio"
                name="pitch-size"
                value="full"
                checked={pitchMode === 'full'}
                onChange={() => updatePitchMode('full')}
                disabled={disabled}
                className="h-4 w-4"
              />
              Full
            </label>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Text underneath item</label>
          <input
            type="text"
            value={selectedCaptionTarget?.caption ?? ''}
            onChange={(event) => {
              if (!selectedCaptionTarget) {
                return;
              }

              const nextCaption = event.target.value;
              updateObjects(
                objects.map((obj) =>
                  obj.id === selectedCaptionTarget.id
                    ? {
                        ...obj,
                        caption: nextCaption,
                      }
                    : obj
                )
              );
            }}
            className="h-12 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder={selectedCaptionTarget ? 'e.g. Player 1' : 'Select a player, cone, ball, or goal'}
            disabled={disabled || !selectedCaptionTarget}
          />
        </div>
      </div>

      <div ref={previewRef} className="relative mt-2">
        <DrillDiagramRenderer drillDiagramConfig={currentConfig} className="border border-gray-300 dark:border-gray-600" />
        <svg
          ref={overlayRef}
          className={`absolute inset-0 h-full w-full ${disabled ? 'pointer-events-none' : 'cursor-crosshair'}`}
          viewBox={`0 0 ${WORKSPACE_WIDTH} ${workspaceHeight}`}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerUp}
          onPointerCancel={onCanvasPointerUp}
        >
          <rect x={0} y={0} width={WORKSPACE_WIDTH} height={workspaceHeight} fill="transparent" />

          {objects.map((object) => {
            if (object.id !== selectedId) return null;

            if (object.type === 'line' || object.type === 'arrow') {
              return (
                <g key={`selected-${object.id}`}>
                  <circle cx={object.x ?? 0} cy={object.y ?? 0} r={0.9} fill="#ef4444" />
                  <circle cx={object.x2 ?? 0} cy={object.y2 ?? 0} r={0.9} fill="#ef4444" />
                </g>
              );
            }

            if (object.type === 'goal') {
              const width = clamp(object.width ?? 14, 6, 30);
              const height = clamp(object.height ?? 5, 3, 20);
              const x = object.x ?? 0;
              const y = object.y ?? 0;
              const rotation = object.rotation ?? 0;
              const rotateHandleY = y - height / 2 - GOAL_ROTATE_HANDLE_OFFSET;

              return (
                <g key={`selected-${object.id}`} transform={`rotate(${rotation} ${x} ${y})`}>
                  <rect
                    x={x - width / 2 - 0.8}
                    y={y - height / 2 - 0.8}
                    width={width + 1.6}
                    height={height + 1.6}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={0.6}
                  />
                  <line x1={x} y1={y - height / 2 - 0.8} x2={x} y2={rotateHandleY} stroke="#ef4444" strokeWidth={0.5} />
                  <circle cx={x - width / 2} cy={y - height / 2} r={0.9} fill="#ffffff" stroke="#ef4444" strokeWidth={0.4} />
                  <circle cx={x + width / 2} cy={y - height / 2} r={0.9} fill="#ffffff" stroke="#ef4444" strokeWidth={0.4} />
                  <circle cx={x + width / 2} cy={y + height / 2} r={0.9} fill="#ffffff" stroke="#ef4444" strokeWidth={0.4} />
                  <circle cx={x - width / 2} cy={y + height / 2} r={0.9} fill="#ffffff" stroke="#ef4444" strokeWidth={0.4} />
                  <circle cx={x} cy={rotateHandleY} r={1.3} fill="#ffffff" stroke="#ef4444" strokeWidth={0.5} />
                  <text x={x} y={rotateHandleY + 0.05} fill="#ef4444" fontSize={1.5} textAnchor="middle" dominantBaseline="middle">
                    ↻
                  </text>
                </g>
              );
            }

            return <circle key={`selected-${object.id}`} cx={object.x ?? 0} cy={object.y ?? 0} r={2.1} fill="none" stroke="#ef4444" strokeWidth={0.6} />;
          })}

          {lineStart && (tool === 'line' || tool === 'arrow') && <circle cx={lineStart.x} cy={lineStart.y} r={0.9} fill="#ffffff" />}
        </svg>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {tool === 'select' && 'Select and drag objects to reposition them. You can place items around the pitch workspace.'}
        {(tool === 'line' || tool === 'arrow') && (lineStart ? 'Click end point to complete the line/arrow.' : 'Click start point to begin a line/arrow.')}
        {tool !== 'select' && tool !== 'line' && tool !== 'arrow' && `Click on the pitch to place a ${tool}.`}
      </p>
    </div>
  );
}
