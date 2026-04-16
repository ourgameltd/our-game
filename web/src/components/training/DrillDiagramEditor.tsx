import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Circle,
  Copy,
  Goal,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  RectangleHorizontal,
  MoveRight,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import type { DrillDiagramConfigDto, DrillDiagramFrameDto } from '@/api/client';
import DrillDiagramRenderer from '@/components/training/DrillDiagramRenderer';

type Tool = 'select' | 'player' | 'cone' | 'ball' | 'goal' | 'line' | 'arrow';
type Point = { x: number; y: number };
type ObjectResizeCorner = 'nw' | 'ne' | 'se' | 'sw';
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
  size?: number;
  rotation?: number;
  text?: string;
  label?: string;
  caption?: string;
  color?: string;
  strokeWidth?: number;
  lineStyle?: 'solid' | 'dashed';
};

type DrillDiagramEditorProps = {
  value?: DrillDiagramConfigDto;
  onChange: (config?: DrillDiagramConfigDto) => void;
  disabled?: boolean;
};

type DiagramFrame = {
  id: string;
  name?: string;
  pitch?: Record<string, unknown>;
  objects: DiagramObject[];
};

const ADD_TOOLS = ['player', 'cone', 'ball', 'goal', 'line', 'arrow'] as const;

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
const OBJECT_HANDLE_HIT_RADIUS = 1.6;
const OBJECT_ROTATE_HIT_RADIUS = 1.7;
const PLAYER_MIN_RADIUS = 0.8;
const PLAYER_MAX_RADIUS = 4;
const BALL_MIN_RADIUS = 0.5;
const BALL_MAX_RADIUS = 3;
const CONE_MIN_WIDTH = 1.2;
const CONE_MAX_WIDTH = 8;
const CONE_MIN_HEIGHT = 1.2;
const CONE_MAX_HEIGHT = 8;
const SELECTION_PADDING = 1.2;
const HANDLE_RADIUS = 0.8;
const ROTATE_HANDLE_OFFSET = 5;

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

const getPitchModeFromFrame = (frame?: DiagramFrame): PitchMode => {
  const rawMode = frame?.pitch?.mode;
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

const parseFrameObjects = (source: Record<string, unknown>[]): DiagramObject[] => {
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
        size: toNumber(obj.size, 2.1),
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

const parseFrames = (value?: DrillDiagramConfigDto): DiagramFrame[] => {
  const sourceFrames = value?.frames ?? [];
  if (sourceFrames.length === 0) {
    return [
      {
        id: 'frame-1',
        pitch: { mode: 'half' },
        objects: [],
      },
    ];
  }

  return sourceFrames.map((frame, index) => {
    const typedFrame = frame as DrillDiagramFrameDto;
    const framePitch = (typedFrame.pitch as Record<string, unknown> | undefined) ?? {};
    const pitchMode = framePitch.mode === 'full' ? 'full' : 'half';
    return {
      id: typedFrame.id || `frame-${index + 1}`,
      name: typedFrame.name,
      pitch: {
        ...framePitch,
        mode: pitchMode,
      },
      objects: clampObjectsToWorkspace(parseFrameObjects((typedFrame.objects ?? []) as Record<string, unknown>[]), pitchMode),
    };
  });
};

const toConfig = (frames: DiagramFrame[], base?: DrillDiagramConfigDto): DrillDiagramConfigDto => {
  const nextFrames = frames.length > 0
    ? frames
    : [
        {
          id: 'frame-1',
          pitch: { mode: 'half' },
          objects: [],
        },
      ];

  return {
    schemaVersion: base?.schemaVersion ?? 1,
    meta: base?.meta,
    frames: nextFrames.map((frame, index) => {
      const baseFrame = base?.frames?.[index];
      const basePitch = (baseFrame?.pitch as Record<string, unknown> | undefined) ?? {};
      return {
        id: frame.id,
        name: frame.name,
        pitch: {
          ...basePitch,
          ...(frame.pitch ?? {}),
          mode: getPitchModeFromFrame(frame),
        },
        objects: frame.objects.map((obj) => ({ ...obj })),
      };
    }),
  };
};

export default function DrillDiagramEditor({ value, onChange, disabled = false }: DrillDiagramEditorProps) {
  const [tool, setTool] = useState<Tool>('select');
  const [isAddToolDialOpen, setIsAddToolDialOpen] = useState(false);
  const [frames, setFrames] = useState<DiagramFrame[]>(parseFrames(value));
  const [activeFrameId, setActiveFrameId] = useState<string>(parseFrames(value)[0]?.id ?? 'frame-1');
  const [isEditingFrameInstructions, setIsEditingFrameInstructions] = useState(false);
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed'>('solid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [lineStart, setLineStart] = useState<Point | null>(null);
  const [addedObjectHistory, setAddedObjectHistory] = useState<string[]>([]);

  const overlayRef = useRef<SVGSVGElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; pointer: Point } | null>(null);
  const lineEndpointRef = useRef<{ id: string; endpoint: 'start' | 'end' } | null>(null);
  const objectResizeRef = useRef<
    | {
        mode: 'resize';
        id: string;
        type: 'player' | 'cone' | 'ball' | 'goal';
        center: Point;
        rotation: number;
        oppositeLocal: Point;
      }
    | {
        mode: 'rotate';
        id: string;
        center: Point;
        startPointerAngle: number;
        startRotation: number;
      }
    | null
  >(null);

  useEffect(() => {
    const parsedFrames = parseFrames(value);
    setFrames(parsedFrames);
    setActiveFrameId((current) => {
      if (parsedFrames.some((frame) => frame.id === current)) {
        return current;
      }
      return parsedFrames[0]?.id ?? 'frame-1';
    });
    setAddedObjectHistory([]);
  }, [value]);

  const activeFrame = useMemo(
    () => frames.find((frame) => frame.id === activeFrameId) ?? frames[0],
    [activeFrameId, frames]
  );
  const pitchMode = getPitchModeFromFrame(activeFrame);
  const objects = activeFrame?.objects ?? [];

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    if (!objects.some((obj) => obj.id === selectedId)) {
      setSelectedId(null);
    }
  }, [objects, selectedId]);

  useEffect(() => {
    setLineStart(null);
    setSelectedId(null);
    setAddedObjectHistory([]);
    setIsEditingFrameInstructions(false);
  }, [activeFrameId]);

  const workspaceHeight = useMemo(() => getWorkspaceHeightForPitchMode(pitchMode), [pitchMode]);

  const currentConfig = useMemo(() => toConfig(frames, value), [frames, value]);
  const activeFrameConfig = useMemo<DrillDiagramConfigDto>(() => {
    if (!activeFrame) {
      return currentConfig;
    }

    return {
      schemaVersion: currentConfig.schemaVersion,
      meta: currentConfig.meta,
      frames: [
        {
          id: activeFrame.id,
          name: activeFrame.name,
          pitch: activeFrame.pitch,
          objects: activeFrame.objects.map((obj) => ({ ...obj })),
        },
      ],
    };
  }, [activeFrame, currentConfig]);

  const selectedObject = selectedId ? objects.find((obj) => obj.id === selectedId) : undefined;
  const activeFrameInstructions = useMemo(() => {
    const raw = activeFrame?.pitch?.instructionsText;
    return typeof raw === 'string' ? raw : '';
  }, [activeFrame]);
  const selectedCaptionTarget =
    selectedObject && selectedObject.type !== 'line' && selectedObject.type !== 'arrow' ? selectedObject : undefined;
  const selectedPlayer = selectedObject?.type === 'player' ? selectedObject : undefined;

  const commitFrames = (nextFrames: DiagramFrame[]) => {
    const ensuredFrames = nextFrames.length > 0 ? nextFrames : parseFrames(undefined);
    setFrames(ensuredFrames);
    onChange(toConfig(ensuredFrames, value));
  };

  const updateActiveFrame = (updater: (frame: DiagramFrame) => DiagramFrame) => {
    if (!activeFrame) {
      return;
    }

    const nextFrames = frames.map((frame) => (frame.id === activeFrame.id ? updater(frame) : frame));
    commitFrames(nextFrames);
  };

  const updateObjects = (next: DiagramObject[]) => {
    const clamped = clampObjectsToWorkspace(next, pitchMode);
    updateActiveFrame((frame) => ({
      ...frame,
      objects: clamped,
    }));
  };

  const updatePitchMode = (nextMode: PitchMode) => {
    const clamped = clampObjectsToWorkspace(objects, nextMode);
    updateActiveFrame((frame) => ({
      ...frame,
      pitch: {
        ...(frame.pitch ?? {}),
        mode: nextMode,
      },
      objects: clamped,
    }));
  };

  const updateActiveFrameInstructions = (nextText: string) => {
    updateActiveFrame((frame) => ({
      ...frame,
      pitch: {
        ...(frame.pitch ?? {}),
        instructionsText: nextText,
      },
    }));
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

  const getObjectBounds = (object: DiagramObject): { x: number; y: number; width: number; height: number; rotation: number } | null => {
    const centerX = object.x ?? 0;
    const centerY = object.y ?? 0;

    if (object.type === 'player') {
      const radius = clamp(object.size ?? 1.5, PLAYER_MIN_RADIUS, PLAYER_MAX_RADIUS);
      return {
        x: centerX - radius,
        y: centerY - radius,
        width: radius * 2,
        height: radius * 2,
        rotation: object.rotation ?? 0,
      };
    }

    if (object.type === 'ball') {
      const radius = clamp(object.size ?? 1.0, BALL_MIN_RADIUS, BALL_MAX_RADIUS);
      return {
        x: centerX - radius,
        y: centerY - radius,
        width: radius * 2,
        height: radius * 2,
        rotation: object.rotation ?? 0,
      };
    }

    if (object.type === 'cone') {
      const width = clamp(object.width ?? 2.0, CONE_MIN_WIDTH, CONE_MAX_WIDTH);
      const height = clamp(object.height ?? 2.0, CONE_MIN_HEIGHT, CONE_MAX_HEIGHT);
      return {
        x: centerX - width / 2,
        y: centerY - height / 2,
        width,
        height,
        rotation: object.rotation ?? 0,
      };
    }

    if (object.type === 'goal') {
      const width = clamp(object.width ?? 14, GOAL_MIN_WIDTH, GOAL_MAX_WIDTH);
      const height = clamp(object.height ?? 5, GOAL_MIN_HEIGHT, GOAL_MAX_HEIGHT);
      return {
        x: centerX - width / 2,
        y: centerY - height / 2,
        width,
        height,
        rotation: object.rotation ?? 0,
      };
    }

    return null;
  };

  const getSelectionBounds = (object: DiagramObject): { x: number; y: number; width: number; height: number; rotation: number; center: Point } | null => {
    const bounds = getObjectBounds(object);
    if (!bounds) return null;

    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };

    return {
      x: bounds.x - SELECTION_PADDING,
      y: bounds.y - SELECTION_PADDING,
      width: bounds.width + SELECTION_PADDING * 2,
      height: bounds.height + SELECTION_PADDING * 2,
      rotation: bounds.rotation,
      center,
    };
  };

  const getObjectTransformAnchors = (object: DiagramObject) => {
    const selection = getSelectionBounds(object);
    if (!selection) return null;

    const center = selection.center;
    const rotation = selection.rotation;
    const width = selection.width;
    const height = selection.height;

    const cornersLocal: Record<ObjectResizeCorner, Point> = {
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

    const rotateHandleWorld = localToWorld({ x: 0, y: -height / 2 - ROTATE_HANDLE_OFFSET }, center, rotation);
    const topMiddleWorld = localToWorld({ x: 0, y: -height / 2 }, center, rotation);

    return {
      center,
      rotation,
      cornersLocal,
      cornersWorld,
      rotateHandleWorld,
      topMiddleWorld,
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

    if (selectedObject && (selectedObject.type === 'line' || selectedObject.type === 'arrow')) {
      const LINE_ENDPOINT_HIT = 2.0;
      const sx = selectedObject.x ?? 0;
      const sy = selectedObject.y ?? 0;
      const ex = selectedObject.x2 ?? sx;
      const ey = selectedObject.y2 ?? sy;
      if (Math.hypot(point.x - sx, point.y - sy) <= LINE_ENDPOINT_HIT) {
        lineEndpointRef.current = { id: selectedObject.id, endpoint: 'start' };
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }
      if (Math.hypot(point.x - ex, point.y - ey) <= LINE_ENDPOINT_HIT) {
        lineEndpointRef.current = { id: selectedObject.id, endpoint: 'end' };
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }
    }

    if (selectedObject && (selectedObject.type === 'player' || selectedObject.type === 'cone' || selectedObject.type === 'ball' || selectedObject.type === 'goal')) {
      const anchors = getObjectTransformAnchors(selectedObject);
      if (anchors) {
        const rotateDistance = Math.hypot(point.x - anchors.rotateHandleWorld.x, point.y - anchors.rotateHandleWorld.y);
        if (rotateDistance <= OBJECT_ROTATE_HIT_RADIUS) {
          objectResizeRef.current = {
            mode: 'rotate',
            id: selectedObject.id,
            center: anchors.center,
            startPointerAngle: Math.atan2(point.y - anchors.center.y, point.x - anchors.center.x),
            startRotation: anchors.rotation,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }

        const opposite: Record<ObjectResizeCorner, ObjectResizeCorner> = {
          nw: 'se',
          ne: 'sw',
          se: 'nw',
          sw: 'ne',
        };
        const corners: ObjectResizeCorner[] = ['nw', 'ne', 'se', 'sw'];
        for (const corner of corners) {
          const handle = anchors.cornersWorld[corner];
          const distance = Math.hypot(point.x - handle.x, point.y - handle.y);
          if (distance <= OBJECT_HANDLE_HIT_RADIUS) {
            objectResizeRef.current = {
              mode: 'resize',
              id: selectedObject.id,
              type: selectedObject.type,
              center: anchors.center,
              rotation: anchors.rotation,
              oppositeLocal: anchors.cornersLocal[opposite[corner]],
            };
            event.currentTarget.setPointerCapture(event.pointerId);
            return;
          }
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
        color: '#4b5563',
        strokeWidth: 0.1,
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
      label: undefined,
      size: tool === 'player' ? 1.5 : tool === 'ball' ? 1.0 : undefined,
      width: tool === 'cone' ? 2.0 : tool === 'goal' ? 14 : undefined,
      height: tool === 'cone' ? 2.0 : tool === 'goal' ? 5 : undefined,
      rotation: 0,
    };

    updateObjects([...objects, newObject]);
    setAddedObjectHistory((prev) => [...prev, newObject.id]);
    setSelectedId(null);
  };

  const onCanvasPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return;

    const point = pointFromPointer(event);

    if (lineEndpointRef.current) {
      const ep = lineEndpointRef.current;
      updateObjects(
        objects.map((obj) => {
          if (obj.id !== ep.id) return obj;
          return ep.endpoint === 'start'
            ? { ...obj, x: point.x, y: point.y }
            : { ...obj, x2: point.x, y2: point.y };
        })
      );
      return;
    }

    if (objectResizeRef.current) {
      const transform = objectResizeRef.current;

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

      if (transform.type === 'cone' || transform.type === 'goal') {
        const minWidth = transform.type === 'goal' ? GOAL_MIN_WIDTH : CONE_MIN_WIDTH;
        const maxWidth = transform.type === 'goal' ? GOAL_MAX_WIDTH : CONE_MAX_WIDTH;
        const minHeight = transform.type === 'goal' ? GOAL_MIN_HEIGHT : CONE_MIN_HEIGHT;
        const maxHeight = transform.type === 'goal' ? GOAL_MAX_HEIGHT : CONE_MAX_HEIGHT;

        const frameWidth = clamp(Math.abs(draggedLocal.x - transform.oppositeLocal.x), minWidth + SELECTION_PADDING * 2, maxWidth + SELECTION_PADDING * 2);
        const frameHeight = clamp(Math.abs(draggedLocal.y - transform.oppositeLocal.y), minHeight + SELECTION_PADDING * 2, maxHeight + SELECTION_PADDING * 2);
        const width = clamp(frameWidth - SELECTION_PADDING * 2, minWidth, maxWidth);
        const height = clamp(frameHeight - SELECTION_PADDING * 2, minHeight, maxHeight);

        const signedDraggedLocal = {
          x: transform.oppositeLocal.x + (draggedLocal.x >= transform.oppositeLocal.x ? frameWidth : -frameWidth),
          y: transform.oppositeLocal.y + (draggedLocal.y >= transform.oppositeLocal.y ? frameHeight : -frameHeight),
        };
        const centerLocal = {
          x: (transform.oppositeLocal.x + signedDraggedLocal.x) / 2,
          y: (transform.oppositeLocal.y + signedDraggedLocal.y) / 2,
        };
        const centerWorld = localToWorld(centerLocal, transform.center, transform.rotation);

        const center = {
          x: clamp(centerWorld.x, 0, WORKSPACE_WIDTH),
          y: clamp(centerWorld.y, 0, workspaceHeight),
        };

        updateObjects(
          objects.map((obj) =>
            obj.id === transform.id
              ? {
                  ...obj,
                  x: center.x,
                  y: center.y,
                  width,
                  height,
                }
              : obj
          )
        );
        return;
      }

      const minDiameter = transform.type === 'player' ? PLAYER_MIN_RADIUS * 2 : BALL_MIN_RADIUS * 2;
      const maxDiameter = transform.type === 'player' ? PLAYER_MAX_RADIUS * 2 : BALL_MAX_RADIUS * 2;
      const frameDiameter = clamp(
        Math.max(Math.abs(draggedLocal.x - transform.oppositeLocal.x), Math.abs(draggedLocal.y - transform.oppositeLocal.y)),
        minDiameter + SELECTION_PADDING * 2,
        maxDiameter + SELECTION_PADDING * 2
      );
      const diameter = clamp(frameDiameter - SELECTION_PADDING * 2, minDiameter, maxDiameter);

      const signedDraggedLocal = {
        x: transform.oppositeLocal.x + (draggedLocal.x >= transform.oppositeLocal.x ? frameDiameter : -frameDiameter),
        y: transform.oppositeLocal.y + (draggedLocal.y >= transform.oppositeLocal.y ? frameDiameter : -frameDiameter),
      };
      const centerLocal = {
        x: (transform.oppositeLocal.x + signedDraggedLocal.x) / 2,
        y: (transform.oppositeLocal.y + signedDraggedLocal.y) / 2,
      };
      const centerWorld = localToWorld(centerLocal, transform.center, transform.rotation);

      const center = {
        x: clamp(centerWorld.x, 0, WORKSPACE_WIDTH),
        y: clamp(centerWorld.y, 0, workspaceHeight),
      };

      updateObjects(
        objects.map((obj) =>
          obj.id === transform.id
            ? {
                ...obj,
                x: center.x,
                y: center.y,
                size: diameter / 2,
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
    if ((dragRef.current || objectResizeRef.current || lineEndpointRef.current) && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    lineEndpointRef.current = null;
    objectResizeRef.current = null;
  };

  const deleteSelected = () => {
    if (disabled || !selectedId) return;
    updateObjects(objects.filter((object) => object.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (disabled || !selectedObject) return;
    const newId = createId();
    const offset = 3;
    const clone: DiagramObject = {
      ...selectedObject,
      id: newId,
      x: (selectedObject.x ?? 0) + offset,
      y: (selectedObject.y ?? 0) + offset,
      x2: selectedObject.x2 !== undefined ? selectedObject.x2 + offset : undefined,
      y2: selectedObject.y2 !== undefined ? selectedObject.y2 + offset : undefined,
    };
    updateObjects([...objects, clone]);
    setAddedObjectHistory((prev) => [...prev, newId]);
    setSelectedId(newId);
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

  const addFrame = () => {
    if (disabled || !activeFrame) return;

    const newFrame: DiagramFrame = {
      id: createId(),
      pitch: {
        ...(activeFrame.pitch ?? {}),
        mode: pitchMode,
      },
      objects: [],
    };

    const nextFrames = [...frames, newFrame];
    commitFrames(nextFrames);
    setActiveFrameId(newFrame.id);
  };

  const duplicateFrame = (frameId?: string) => {
    if (disabled) return;

    const sourceFrame = frameId ? frames.find((frame) => frame.id === frameId) : activeFrame;
    if (!sourceFrame) return;

    const clone: DiagramFrame = {
      id: createId(),
      pitch: { ...(sourceFrame.pitch ?? {}) },
      objects: sourceFrame.objects.map((obj) => ({ ...obj, id: createId() })),
    };

    const nextFrames = [...frames, clone];
    commitFrames(nextFrames);
    setActiveFrameId(clone.id);
  };

  const deleteFrame = (frameId?: string) => {
    if (disabled || frames.length <= 1) return;

    const targetFrameId = frameId ?? activeFrame?.id;
    if (!targetFrameId) return;

    const frameToDelete = frames.find((frame) => frame.id === targetFrameId);
    if (!frameToDelete) return;

    const index = frames.findIndex((frame) => frame.id === frameToDelete.id);
    const nextFrames = frames.filter((frame) => frame.id !== frameToDelete.id);
    const fallback = nextFrames[Math.min(index, nextFrames.length - 1)];
    commitFrames(nextFrames);

    if (activeFrame?.id === frameToDelete.id) {
      setActiveFrameId(fallback.id);
    }
  };

  const getFramePreviewConfig = (frame: DiagramFrame): DrillDiagramConfigDto => ({
    schemaVersion: currentConfig.schemaVersion,
    meta: currentConfig.meta,
    frames: [
      {
        id: frame.id,
        name: frame.name,
        pitch: frame.pitch,
        objects: frame.objects.map((obj) => ({ ...obj })),
      },
    ],
  });

  const renderFrameRail = () => (
    <div className="w-full space-y-2">
      {frames.map((frame, index) => {
        const isActive = frame.id === activeFrame?.id;
        return (
          <div
            key={frame.id}
            onClick={() => {
              setActiveFrameId(frame.id);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveFrameId(frame.id);
              }
            }}
            role="button"
            tabIndex={0}
            className="w-full text-left cursor-pointer"
            aria-label={`Select slide ${index + 1}`}
          >
            <div
              className={`relative overflow-hidden rounded ${
                isActive
                  ? 'ring-2 ring-primary-600 dark:ring-primary-500'
                  : 'ring-1 ring-gray-300 dark:ring-gray-600'
              }`}
            >
              <div className="absolute left-1 top-1 z-10 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-900/90 dark:text-gray-200">
                Slide {index + 1}
              </div>
              <div className="absolute right-1 top-1 z-10 flex gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    duplicateFrame(frame.id);
                  }}
                  disabled={disabled}
                  className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-gray-700 shadow hover:bg-white disabled:opacity-60 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-800"
                  title="Duplicate slide"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteFrame(frame.id);
                  }}
                  disabled={disabled || frames.length <= 1}
                  className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-red-600 shadow hover:bg-white disabled:opacity-60 dark:bg-gray-800/90 dark:text-red-300 dark:hover:bg-gray-800"
                  title="Delete slide"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <DrillDiagramRenderer drillDiagramConfig={getFramePreviewConfig(frame)} className="border-0" forceSquare />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addFrame}
        disabled={disabled}
        className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        + Frame
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pitch size:</span>
        <button
          type="button"
          onClick={() => updatePitchMode('half')}
          disabled={disabled}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            pitchMode === 'half'
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Half
        </button>
        <button
          type="button"
          onClick={() => updatePitchMode('full')}
          disabled={disabled}
          className={`px-3 py-1 text-xs rounded-md border transition-colors ${
            pitchMode === 'full'
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Full
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2" />
      </div>

      {editModalOpen && selectedObject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditModalOpen(false)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Edit {selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)}
              </h3>
              <button type="button" onClick={() => setEditModalOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedCaptionTarget && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Text underneath</label>
                  <input
                    type="text"
                    value={selectedCaptionTarget.caption ?? ''}
                    onChange={(event) => {
                      updateObjects(
                        objects.map((obj) =>
                          obj.id === selectedCaptionTarget.id ? { ...obj, caption: event.target.value } : obj
                        )
                      );
                    }}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Player 1"
                  />
                </div>
              )}

              {selectedPlayer && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Colour</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '#1d4ed8', label: 'Blue' },
                      { value: '#dc2626', label: 'Red' },
                      { value: '#16a34a', label: 'Green' },
                      { value: '#f59e0b', label: 'Amber' },
                      { value: '#7c3aed', label: 'Purple' },
                      { value: '#ec4899', label: 'Pink' },
                      { value: '#111827', label: 'Black' },
                      { value: '#ffffff', label: 'White' },
                    ].map((swatch) => (
                      <button
                        key={swatch.value}
                        type="button"
                        title={swatch.label}
                        onClick={() => {
                          updateObjects(
                            objects.map((obj) =>
                              obj.id === selectedPlayer.id ? { ...obj, color: swatch.value } : obj
                            )
                          );
                        }}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${
                          selectedPlayer.color === swatch.value
                            ? 'border-primary-500 scale-110'
                            : 'border-gray-300 dark:border-gray-500 hover:scale-105'
                        }`}
                        style={{ backgroundColor: swatch.value }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {canSetSelectedLineStyle && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">Line style</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLineStyle('solid');
                        setSelectedLineStyle('solid');
                      }}
                      className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                        (selectedObject as DiagramObject).lineStyle === 'solid'
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
                        setSelectedLineStyle('dashed');
                      }}
                      className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                        (selectedObject as DiagramObject).lineStyle === 'dashed'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Dashed
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,12fr)_minmax(0,5fr)_minmax(0,3fr)]">
        <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800/60">
          <div ref={previewRef} className="relative">
        <DrillDiagramRenderer drillDiagramConfig={activeFrameConfig} className="border border-gray-300 dark:border-gray-600" />
        <div className="absolute left-2 top-2 z-20 h-9 w-9 overflow-visible">
          <SpeedDial
            ariaLabel="Add drill item"
            direction="down"
            icon={<SpeedDialIcon icon={<Plus className="h-4 w-4" strokeWidth={1.6} />} openIcon={<X className="h-4 w-4" strokeWidth={1.6} />} />}
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
              zIndex: 20,
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
                  icon={<Icon className="h-4 w-4" strokeWidth={1.6} />}
                  tooltipTitle={`Add ${TOOL_CONFIG[toolName].label}`}
                  tooltipPlacement="right"
                  tooltipOpen
                  onClick={() => {
                    const OFFSET_STEP = 6;
                    const DEFAULT_X = WORKSPACE_WIDTH / 2;
                    const DEFAULT_Y = workspaceHeight / 2;

                    const count = addedObjectHistory.filter((id) => objects.some((o) => o.id === id)).length;

                    let baseX = DEFAULT_X;
                    let baseY = DEFAULT_Y;

                    const lastAddedId = [...addedObjectHistory].reverse().find((id) => objects.some((o) => o.id === id));
                    const lastAdded = lastAddedId ? objects.find((o) => o.id === lastAddedId) : undefined;
                    if (lastAdded) {
                      baseX = lastAdded.x ?? DEFAULT_X;
                      baseY = lastAdded.y ?? DEFAULT_Y;
                    }

                    const offsetX = OFFSET_STEP * ((count % 5) + 1);
                    const offsetY = OFFSET_STEP * (Math.floor(count / 5) + 1);
                    let placeX = baseX + offsetX;
                    let placeY = baseY + offsetY;

                    if (placeX > WORKSPACE_WIDTH - 5) {
                      placeX = baseX - offsetX;
                    }
                    if (placeY > workspaceHeight - 5) {
                      placeY = baseY - offsetY;
                    }

                    placeX = clamp(placeX, 0, WORKSPACE_WIDTH);
                    placeY = clamp(placeY, 0, workspaceHeight);

                    const newId = createId();

                    if (toolName === 'line' || toolName === 'arrow') {
                      const lineLength = 15;
                      const newObject: DiagramObject = {
                        id: newId,
                        type: toolName,
                        x: placeX,
                        y: placeY,
                        x2: clamp(placeX + lineLength, 0, WORKSPACE_WIDTH),
                        y2: placeY,
                        color: '#4b5563',
                        strokeWidth: 0.1,
                        lineStyle,
                      };
                      updateObjects([...objects, newObject]);
                    } else {
                      const newObject: DiagramObject = {
                        id: newId,
                        type: toolName,
                        x: placeX,
                        y: placeY,
                        color: toolName === 'player' ? '#1d4ed8' : toolName === 'cone' ? '#f59e0b' : toolName === 'ball' ? '#111827' : '#ffffff',
                        size: toolName === 'player' ? 1.5 : toolName === 'ball' ? 1.0 : undefined,
                        width: toolName === 'cone' ? 2.0 : toolName === 'goal' ? 14 : undefined,
                        height: toolName === 'cone' ? 2.0 : toolName === 'goal' ? 5 : undefined,
                        rotation: 0,
                      };
                      updateObjects([...objects, newObject]);
                    }

                    setAddedObjectHistory((prev) => [...prev, newId]);
                    setSelectedId(newId);
                    setTool('select');
                    setLineStart(null);
                  }}
                />
              );
            })}
          </SpeedDial>
        </div>
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
                  <line x1={object.x ?? 0} y1={object.y ?? 0} x2={object.x2 ?? 0} y2={object.y2 ?? 0} stroke="#2563eb" strokeWidth={0.2} strokeOpacity={0.5} />
                  <circle cx={object.x ?? 0} cy={object.y ?? 0} r={HANDLE_RADIUS} fill="#ffffff" stroke="#2563eb" strokeWidth={0.32} />
                  <circle cx={object.x2 ?? 0} cy={object.y2 ?? 0} r={HANDLE_RADIUS} fill="#ffffff" stroke="#2563eb" strokeWidth={0.32} />
                </g>
              );
            }

            if (object.type === 'player' || object.type === 'cone' || object.type === 'ball' || object.type === 'goal') {
              const selectionBounds = getSelectionBounds(object);

              if (selectionBounds) {
                return (
                  <g key={`selected-${object.id}`} transform={`rotate(${selectionBounds.rotation} ${selectionBounds.center.x} ${selectionBounds.center.y})`}>
                    <rect
                      x={selectionBounds.center.x - selectionBounds.width / 2}
                      y={selectionBounds.center.y - selectionBounds.height / 2}
                      width={selectionBounds.width}
                      height={selectionBounds.height}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth={0.32}
                      strokeOpacity={0.9}
                    />
                    <line
                      x1={selectionBounds.center.x}
                      y1={selectionBounds.center.y - selectionBounds.height / 2}
                      x2={selectionBounds.center.x}
                      y2={selectionBounds.center.y - selectionBounds.height / 2 - ROTATE_HANDLE_OFFSET}
                      stroke="#2563eb"
                      strokeWidth={0.3}
                    />
                    <circle
                      cx={selectionBounds.center.x}
                      cy={selectionBounds.center.y - selectionBounds.height / 2 - ROTATE_HANDLE_OFFSET}
                      r={HANDLE_RADIUS}
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth={0.32}
                    />
                    <circle cx={selectionBounds.center.x - selectionBounds.width / 2} cy={selectionBounds.center.y - selectionBounds.height / 2} r={HANDLE_RADIUS} fill="#ffffff" stroke="#2563eb" strokeWidth={0.32} />
                    <circle cx={selectionBounds.center.x + selectionBounds.width / 2} cy={selectionBounds.center.y - selectionBounds.height / 2} r={HANDLE_RADIUS} fill="#ffffff" stroke="#2563eb" strokeWidth={0.32} />
                    <circle cx={selectionBounds.center.x + selectionBounds.width / 2} cy={selectionBounds.center.y + selectionBounds.height / 2} r={HANDLE_RADIUS} fill="#ffffff" stroke="#2563eb" strokeWidth={0.32} />
                    <circle cx={selectionBounds.center.x - selectionBounds.width / 2} cy={selectionBounds.center.y + selectionBounds.height / 2} r={HANDLE_RADIUS} fill="#ffffff" stroke="#2563eb" strokeWidth={0.32} />
                  </g>
                );
              }
            }

            return <circle key={`selected-${object.id}`} cx={object.x ?? 0} cy={object.y ?? 0} r={2.1} fill="none" stroke="#ef4444" strokeWidth={0.6} />;
          })}

          {lineStart && (tool === 'line' || tool === 'arrow') && <circle cx={lineStart.x} cy={lineStart.y} r={0.9} fill="#ffffff" />}
        </svg>

        {selectedObject && !disabled && (() => {
          const bounds = getSelectionBounds(selectedObject);
          const objX = selectedObject.x ?? 0;
          const bottomY = bounds ? bounds.center.y + bounds.height / 2 : (selectedObject.y ?? 0);
          const pctX = (objX / WORKSPACE_WIDTH) * 100;
          const pctY = (bottomY / workspaceHeight) * 100;
          const hasEditOptions = selectedCaptionTarget || selectedPlayer || canSetSelectedLineStyle;

          return (
            <div
              className="absolute flex gap-1 pointer-events-auto"
              style={{
                left: `${pctX}%`,
                top: `${pctY}%`,
                transform: 'translate(-50%, 25%)',
                zIndex: 10,
              }}
            >
              {hasEditOptions && (
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/95 shadow hover:bg-white dark:bg-gray-700/95 dark:hover:bg-gray-700"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                </button>
              )}
              <button
                type="button"
                onClick={duplicateSelected}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/95 shadow hover:bg-white dark:bg-gray-700/95 dark:hover:bg-gray-700"
                title="Duplicate"
              >
                <Copy className="h-4 w-4 text-gray-700 dark:text-gray-200" />
              </button>
              <button
                type="button"
                onClick={deleteSelected}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white/95 shadow hover:bg-red-50 dark:bg-gray-700/95 dark:hover:bg-red-900/40"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          );
        })()}
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {tool === 'select' && 'Select and drag objects to reposition them. You can place items around the pitch workspace.'}
            {(tool === 'line' || tool === 'arrow') && (lineStart ? 'Click end point to complete the line/arrow.' : 'Click start point to begin a line/arrow.')}
            {tool !== 'select' && tool !== 'line' && tool !== 'arrow' && `Click on the pitch to place a ${tool}.`}
          </p>
        </div>

        <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Diagram Instructions</h4>
            <button
              type="button"
              onClick={() => setIsEditingFrameInstructions((prev) => !prev)}
              disabled={disabled}
              className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              title={isEditingFrameInstructions ? 'Done editing instructions' : 'Edit frame instructions'}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 space-y-3 text-xs text-gray-600 dark:text-gray-300">
            {isEditingFrameInstructions ? (
              <textarea
                value={activeFrameInstructions}
                onChange={(event) => updateActiveFrameInstructions(event.target.value)}
                placeholder="Add instructions for this frame..."
                rows={9}
                disabled={disabled}
                className="w-full rounded-md border border-gray-300 bg-white p-2 text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            ) : activeFrameInstructions.trim() ? (
              <p className="whitespace-pre-wrap">{activeFrameInstructions}</p>
            ) : (
              <p className="italic text-gray-500 dark:text-gray-400">No description added.</p>
            )}
            <p>Current frame: <span className="font-semibold">{frames.findIndex((frame) => frame.id === activeFrame?.id) + 1}</span> of <span className="font-semibold">{frames.length}</span>.</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800/60">
          {renderFrameRail()}
        </div>
      </div>
    </div>
  );
}
