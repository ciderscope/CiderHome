import alertSchema from '../../../packages/shared/schemas/alert.schema.json';
import alertRuleSchema from '../../../packages/shared/schemas/alert-rule.schema.json';
import analysisSchema from '../../../packages/shared/schemas/analysis.schema.json';
import auditLogSchema from '../../../packages/shared/schemas/audit-log.schema.json';
import bottlingBatchSchema from '../../../packages/shared/schemas/bottling-batch.schema.json';
import documentAttachmentSchema from '../../../packages/shared/schemas/document-attachment.schema.json';
import harvestReceiptSchema from '../../../packages/shared/schemas/harvest-receipt.schema.json';
import inputSchema from '../../../packages/shared/schemas/input.schema.json';
import lotSchema from '../../../packages/shared/schemas/lot.schema.json';
import operationSchema from '../../../packages/shared/schemas/operation.schema.json';
import sensorReadingSchema from '../../../packages/shared/schemas/sensor-reading.schema.json';
import siteSchema from '../../../packages/shared/schemas/site.schema.json';
import stockItemSchema from '../../../packages/shared/schemas/stock-item.schema.json';
import stockMovementSchema from '../../../packages/shared/schemas/stock-movement.schema.json';
import subLotSampleSchema from '../../../packages/shared/schemas/sub-lot-sample.schema.json';
import tankSchema from '../../../packages/shared/schemas/tank.schema.json';
import transferOrderSchema from '../../../packages/shared/schemas/transfer-order.schema.json';
import userProfileSchema from '../../../packages/shared/schemas/user-profile.schema.json';
import workOrderSchema from '../../../packages/shared/schemas/work-order.schema.json';

export const entitySchemas = {
  alerts: alertSchema,
  alert_rules: alertRuleSchema,
  analyses: analysisSchema,
  audit_logs: auditLogSchema,
  bottling_batches: bottlingBatchSchema,
  document_attachments: documentAttachmentSchema,
  harvest_receipts: harvestReceiptSchema,
  inputs: inputSchema,
  lots: lotSchema,
  operations: operationSchema,
  sensor_readings: sensorReadingSchema,
  sites: siteSchema,
  stock_items: stockItemSchema,
  stock_movements: stockMovementSchema,
  sub_lot_samples: subLotSampleSchema,
  tanks: tankSchema,
  transfer_orders: transferOrderSchema,
  user_profiles: userProfileSchema,
  work_orders: workOrderSchema
} as const;
