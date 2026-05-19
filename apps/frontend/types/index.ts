export type {
  Alert,
  AlertRule,
  Analysis,
  AuditLog,
  BottlingBatch,
  DocumentAttachment,
  HarvestReceipt,
  Input,
  Lot,
  Operation,
  SensorReading,
  Site,
  StockItem,
  StockMovement,
  SubLotSample,
  Tank,
  TransferOrder,
  WorkOrder,
  UserProfile
} from "@cuverie/shared";

export type AppMode =
  | "dashboard"
  | "cuverie"
  | "reception"
  | "operations"
  | "lots"
  | "analyses"
  | "stocks"
  | "transferts"
  | "tracabilite"
  | "rapports"
  | "admin";
export type AuthScreen = "login" | "register" | "reset";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
