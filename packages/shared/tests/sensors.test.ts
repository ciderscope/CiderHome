import type { SensorReading, Tank } from '../src/types/domain';
import { evaluateSensorReading } from '../src/services/sensors';

describe('sensor rules', () => {
  it('detecte temperature et volume hors plage', () => {
    const tank: Tank = {
      id: '33333333-3333-4333-8333-333333333333',
      siteId: '11111111-1111-4111-8111-111111111111',
      code: 'C-01',
      name: 'Cuve C-01',
      capacityLiters: 1000,
      currentVolumeLiters: 900,
      status: 'occupied',
      material: 'inox',
      zone: 'Nord',
      position: { x: 0, y: 0 },
      sensors: ['temp-1'],
      createdAt: '2026-05-18T09:00:00.000Z',
      updatedAt: '2026-05-18T09:00:00.000Z'
    };
    const reading: SensorReading = {
      id: '77777777-7777-4777-8777-777777777777',
      siteId: tank.siteId,
      tankId: tank.id,
      sensorId: 'temp-1',
      measuredAt: '2026-05-18T09:00:00.000Z',
      metrics: { temperatureC: 36, volumeLiters: 1200 },
      createdAt: '2026-05-18T09:00:00.000Z',
      updatedAt: '2026-05-18T09:00:00.000Z'
    };

    expect(evaluateSensorReading(reading, tank).map((alert) => alert.code)).toEqual([
      'temperature_out_of_range',
      'capacity_exceeded'
    ]);
  });
});
