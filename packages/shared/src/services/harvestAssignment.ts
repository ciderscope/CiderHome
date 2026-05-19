import type { HarvestReceipt, Tank } from '../types/domain';

export interface TankAssignmentProposal {
  tank: Tank;
  availableLiters: number;
  utilizationAfterAssignment: number;
}

export function estimateLiquidVolumeLiters(weightKg: number, yieldRate = 0.72): number {
  if (weightKg <= 0) {
    throw new Error('Le poids receptionne doit etre positif');
  }
  return Math.round(weightKg * yieldRate);
}

export function suggestTankForHarvest(tanks: Tank[], receipt: Pick<HarvestReceipt, 'weightKg'>): TankAssignmentProposal | null {
  const requiredVolume = estimateLiquidVolumeLiters(receipt.weightKg);

  const proposal = tanks
    .filter((tank) => tank.status === 'available' || tank.currentVolumeLiters === 0)
    .map((tank) => {
      const usefulCapacity = tank.usefulCapacityLiters ?? tank.capacityLiters;
      const availableLiters = usefulCapacity - tank.currentVolumeLiters;
      return {
        tank,
        availableLiters,
        utilizationAfterAssignment: (tank.currentVolumeLiters + requiredVolume) / usefulCapacity
      };
    })
    .filter((item) => item.availableLiters >= requiredVolume)
    .sort((a, b) => a.availableLiters - b.availableLiters)[0];

  return proposal ?? null;
}
