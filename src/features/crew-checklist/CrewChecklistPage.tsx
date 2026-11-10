import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { CertifiedChecklist, VehicleChecklist } from '@/types';
import { CertifiedStep } from './CertifiedStep';
import { ChecklistStep } from './ChecklistStep';
import { VehicleStep } from './VehicleStep';

type Step =
  | { kind: 'vehicle' }
  | { kind: 'fill'; checklist: VehicleChecklist }
  | { kind: 'done'; result: CertifiedChecklist };

/** location.key cambia a ogni navigazione: il flusso riparte da capo. */
export function CrewChecklistPage() {
  const location = useLocation();
  return <CrewChecklistFlow key={location.key} />;
}

function CrewChecklistFlow() {
  const [step, setStep] = useState<Step>({ kind: 'vehicle' });
  const restart = () => setStep({ kind: 'vehicle' });

  switch (step.kind) {
    case 'vehicle':
      return <VehicleStep onLoaded={(checklist) => setStep({ kind: 'fill', checklist })} />;
    case 'fill':
      return (
        <ChecklistStep
          checklist={step.checklist}
          onCertified={(result) => setStep({ kind: 'done', result })}
          onChangeVehicle={restart}
        />
      );
    case 'done':
      return <CertifiedStep result={step.result} onNew={restart} />;
  }
}
