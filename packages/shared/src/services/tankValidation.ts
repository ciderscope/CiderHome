import type { Tank } from '../types/domain';

export interface TankValidationIssue {
  field: keyof Tank | 'temperatureSetpoint';
  message: string;
}

export function validateTankBusinessRules(tank: Tank): TankValidationIssue[] {
  const issues: TankValidationIssue[] = [];
  const usefulCapacity = tank.usefulCapacityLiters ?? tank.capacityLiters;

  if (tank.capacityLiters <= 0) {
    issues.push({ field: 'capacityLiters', message: 'La capacite nominale doit etre positive' });
  }

  if (usefulCapacity <= 0 || usefulCapacity > tank.capacityLiters) {
    issues.push({ field: 'usefulCapacityLiters', message: 'La capacite utile doit rester inferieure ou egale a la capacite nominale' });
  }

  if (tank.currentVolumeLiters < 0 || tank.currentVolumeLiters > usefulCapacity) {
    issues.push({ field: 'currentVolumeLiters', message: 'Le volume courant doit rester dans la capacite utile' });
  }

  if (
    tank.temperatureMinC !== undefined &&
    tank.temperatureMaxC !== undefined &&
    tank.temperatureMinC > tank.temperatureMaxC
  ) {
    issues.push({ field: 'temperatureSetpoint', message: 'La consigne basse doit etre inferieure a la consigne haute' });
  }

  if (tank.state === 'vide' && tank.currentVolumeLiters > 0) {
    issues.push({ field: 'state', message: 'Une cuve indiquee vide ne peut pas contenir un volume positif' });
  }

  return issues;
}

export function assertTankBusinessRules(tank: Tank): void {
  const issues = validateTankBusinessRules(tank);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => issue.message).join('; '));
  }
}
