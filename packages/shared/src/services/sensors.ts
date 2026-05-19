import type { SensorReading, Tank } from '../types/domain';

export interface SensorAlert {
  level: 'info' | 'warning' | 'critical';
  code: string;
  message: string;
  tankId: string;
}

export function evaluateSensorReading(reading: SensorReading, tank?: Tank): SensorAlert[] {
  const alerts: SensorAlert[] = [];
  const { temperatureC, ph, pressureBar, volumeLiters } = reading.metrics;

  const minTemperature = tank?.temperatureMinC ?? 2;
  const maxTemperature = tank?.temperatureMaxC ?? 28;

  if (temperatureC !== undefined && (temperatureC < minTemperature || temperatureC > maxTemperature)) {
    alerts.push({
      level: temperatureC > maxTemperature + 7 || temperatureC < minTemperature - 7 ? 'critical' : 'warning',
      code: 'temperature_out_of_range',
      message: 'Temperature hors consigne cuve',
      tankId: reading.tankId
    });
  }

  if (ph !== undefined && (ph < 2.8 || ph > 4.3)) {
    alerts.push({
      level: 'warning',
      code: 'ph_out_of_range',
      message: 'pH hors plage attendue',
      tankId: reading.tankId
    });
  }

  if (pressureBar !== undefined && pressureBar > 2.4) {
    alerts.push({
      level: pressureBar > 3 ? 'critical' : 'warning',
      code: 'pressure_high',
      message: 'Pression cuve elevee',
      tankId: reading.tankId
    });
  }

  if (tank && volumeLiters !== undefined && volumeLiters > tank.capacityLiters) {
    alerts.push({
      level: 'critical',
      code: 'capacity_exceeded',
      message: 'Volume capteur superieur a la capacite cuve',
      tankId: reading.tankId
    });
  }

  return alerts;
}
