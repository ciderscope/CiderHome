import type { Role } from './rbac';

export type EntityId = string;
export type ISODateTime = string;

export interface SiteScopedEntity {
  id: EntityId;
  siteId: EntityId;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Site {
  id: EntityId;
  name: string;
  code: string;
  address?: string;
  active: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface UserProfile {
  id: EntityId;
  email: string;
  fullName: string;
  role: Role;
  defaultSiteId?: EntityId;
  siteIds: EntityId[];
  active: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type TankStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'blocked';
export type TankState = 'vide' | 'fermentation' | 'elevage' | 'nettoyage' | 'attente';
export type TankMaterial = 'inox' | 'beton' | 'bois' | 'fibre' | 'amphore' | 'autre';

export interface Tank extends SiteScopedEntity {
  code: string;
  name: string;
  capacityLiters: number;
  usefulCapacityLiters?: number;
  currentVolumeLiters: number;
  temperatureC?: number;
  temperatureMinC?: number;
  temperatureMaxC?: number;
  contentLotId?: EntityId;
  status: TankStatus;
  state?: TankState;
  material: TankMaterial;
  zone: string;
  position: {
    x: number;
    y: number;
  };
  sensors: string[];
  qrCode?: string;
}

export type LotStatus = 'planned' | 'in_progress' | 'maturing' | 'ready' | 'blocked' | 'closed';

export interface Lot extends SiteScopedEntity {
  code: string;
  productType: 'cidre' | 'jus' | 'poire' | 'vin' | 'vinaigre' | 'autre';
  variety?: string;
  harvestYear: number;
  status: LotStatus;
  volumeLiters: number;
  origin: string;
}

export type SubLotKind = 'sous_lot' | 'echantillon';

export interface SubLotSample extends SiteScopedEntity {
  lotId: EntityId;
  code: string;
  kind: SubLotKind;
  parentSubLotId?: EntityId;
  volumeLiters?: number;
  sampleSizeMl?: number;
  storageLocation?: string;
  status: 'active' | 'consumed' | 'archived';
}

export type OperationType =
  | 'reception'
  | 'remplissage'
  | 'vidange'
  | 'pressurage'
  | 'fermentation'
  | 'assemblage'
  | 'soutirage'
  | 'transfert'
  | 'debourbage'
  | 'collage'
  | 'filtration'
  | 'oxygenation'
  | 'ajout_produit'
  | 'prise_densite_temperature'
  | 'nettoyage'
  | 'conditionnement'
  | 'correction';

export type OperationStatus = 'draft' | 'assigned' | 'in_progress' | 'submitted' | 'validated' | 'rejected' | 'executed' | 'cancelled';

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
}

export interface Operation extends SiteScopedEntity {
  type: OperationType;
  status?: OperationStatus;
  lotId?: EntityId;
  subLotId?: EntityId;
  tankId?: EntityId;
  operatorId: EntityId;
  assigneeId?: EntityId;
  plannedAt?: ISODateTime;
  startedAt: ISODateTime;
  endedAt?: ISODateTime;
  validatedBy?: EntityId;
  validatedAt?: ISODateTime;
  volumeDeltaLiters?: number;
  checklist?: ChecklistItem[];
  notes?: string;
}

export interface Input extends SiteScopedEntity {
  name: string;
  category: 'levure' | 'enzyme' | 'sulfite' | 'nutriment' | 'nettoyant' | 'autre';
  supplier?: string;
  batchNumber?: string;
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'unite';
  lotId?: EntityId;
  operationId?: EntityId;
}

export interface Analysis extends SiteScopedEntity {
  lotId?: EntityId;
  subLotId?: EntityId;
  tankId?: EntityId;
  sampleCode: string;
  measuredAt: ISODateTime;
  analystId: EntityId;
  results: Record<string, number | string | boolean>;
  compliant: boolean;
  comments?: string;
}

export interface HarvestMaturity {
  sugarBrix?: number;
  ph?: number;
  acidityGl?: number;
  density?: number;
  sanitaryState?: 'excellent' | 'good' | 'watch' | 'blocked';
}

export interface HarvestReceipt extends SiteScopedEntity {
  lotId?: EntityId;
  receiptNumber: string;
  parcel: string;
  grapeVariety: string;
  supplier?: string;
  weightKg: number;
  maturity: HarvestMaturity;
  receivedAt: ISODateTime;
  assignedTankId?: EntityId;
  documentIds: EntityId[];
}

export interface DocumentAttachment extends SiteScopedEntity {
  entityType: 'harvest_receipt' | 'operation' | 'lot' | 'tank' | 'analysis' | 'report';
  entityId: EntityId;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes?: number;
  uploadedBy: EntityId;
}

export type WorkOrderStatus = 'draft' | 'assigned' | 'in_progress' | 'submitted' | 'validated' | 'rejected' | 'done';

export interface WorkOrder extends SiteScopedEntity {
  operationId?: EntityId;
  code: string;
  title: string;
  status: WorkOrderStatus;
  assigneeId?: EntityId;
  validatorId?: EntityId;
  dueAt?: ISODateTime;
  checklist: ChecklistItem[];
  requiredFields: string[];
  notes?: string;
}

export interface StockItem extends SiteScopedEntity {
  name: string;
  category: 'levure' | 'enzyme' | 'sulfite' | 'nutriment' | 'nettoyant' | 'bouchage' | 'autre';
  supplier?: string;
  batchNumber: string;
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'unite';
  minQuantity: number;
  expiryDate?: string;
  location: string;
}

export interface StockMovement extends SiteScopedEntity {
  stockItemId: EntityId;
  operationId?: EntityId;
  lotId?: EntityId;
  tankId?: EntityId;
  direction: 'in' | 'out' | 'adjustment';
  quantity: number;
  unit: StockItem['unit'];
  reason: string;
  movedAt: ISODateTime;
  actorId: EntityId;
}

export interface AlertRule extends SiteScopedEntity {
  name: string;
  scope: 'tank' | 'lot' | 'operation' | 'stock' | 'analysis';
  metric: string;
  comparator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq';
  threshold: number;
  enabled: boolean;
  channels: Array<'push' | 'email' | 'sms'>;
}

export interface Alert extends SiteScopedEntity {
  ruleId?: EntityId;
  entityType: AlertRule['scope'];
  entityId: EntityId;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  status: 'open' | 'acknowledged' | 'closed';
  triggeredAt: ISODateTime;
  acknowledgedBy?: EntityId;
  closedAt?: ISODateTime;
}

export interface BottlingBatch extends SiteScopedEntity {
  code: string;
  lotId: EntityId;
  volumeLiters: number;
  bottleCount: number;
  bottledAt?: ISODateTime;
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
}

export type TransferOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'executing'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface TransferOrder extends SiteScopedEntity {
  code: string;
  sourceTankId: EntityId;
  targetTankId: EntityId;
  lotId: EntityId;
  subLotId?: EntityId;
  requestedVolumeLiters: number;
  status: TransferOrderStatus;
  requestedBy: EntityId;
  approvedBy?: EntityId;
  executedBy?: EntityId;
  requestedAt: ISODateTime;
  approvedAt?: ISODateTime;
  executedAt?: ISODateTime;
  notes?: string;
}

export type TraceabilityDirection = 'upstream' | 'downstream';
export type TraceabilityEventType =
  | 'lot_created'
  | 'sub_lot_created'
  | 'operation_recorded'
  | 'input_applied'
  | 'analysis_recorded'
  | 'transfer_executed'
  | 'manual_adjustment';

export interface TraceabilityEvent extends SiteScopedEntity {
  type: TraceabilityEventType;
  lotId?: EntityId;
  subLotId?: EntityId;
  sourceEntityType?: string;
  sourceEntityId?: EntityId;
  targetEntityType?: string;
  targetEntityId?: EntityId;
  quantityLiters?: number;
  occurredAt: ISODateTime;
  actorId: EntityId;
  metadata?: Record<string, unknown>;
}

export interface SensorReading extends SiteScopedEntity {
  sensorId: string;
  tankId: EntityId;
  measuredAt: ISODateTime;
  metrics: {
    temperatureC?: number;
    density?: number;
    ph?: number;
    pressureBar?: number;
    volumeLiters?: number;
    co2Gpl?: number;
    humidityPercent?: number;
  };
  rawPayload?: Record<string, unknown>;
}

export interface AuditLog extends SiteScopedEntity {
  actorId: EntityId;
  action: string;
  entityType: string;
  entityId: EntityId;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  occurredAt: ISODateTime;
}

export interface OfflineSyncItem {
  id: EntityId;
  siteId: EntityId;
  entityType: string;
  entityId: EntityId;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  status: 'pending' | 'synced' | 'conflict' | 'failed';
  createdAt: ISODateTime;
  syncedAt?: ISODateTime;
  conflictReason?: string;
}
