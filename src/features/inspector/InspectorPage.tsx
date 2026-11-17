import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { InspectionResult, PendingInspection, VehicleChecklist } from '@/types';
import { InspectionFormStep } from './InspectionFormStep';
import { InspectionResultStep } from './InspectionResultStep';
import { PendingQueueStep } from './PendingQueueStep';

type Step =
  | { kind: 'queue' }
  | { kind: 'fill'; pending: PendingInspection; checklist: VehicleChecklist }
  | { kind: 'done'; result: InspectionResult };

/** location.key cambia a ogni navigazione: il flusso riparte dalla coda. */
export function InspectorPage() {
  const location = useLocation();
  return <InspectorFlow key={location.key} />;
}

function InspectorFlow() {
  const [step, setStep] = useState<Step>({ kind: 'queue' });
  const backToQueue = () => setStep({ kind: 'queue' });

  switch (step.kind) {
    case 'queue':
      return (
        <PendingQueueStep
          onSelected={(pending, checklist) => setStep({ kind: 'fill', pending, checklist })}
        />
      );
    case 'fill':
      return (
        <InspectionFormStep
          pending={step.pending}
          checklist={step.checklist}
          onDone={(result) => setStep({ kind: 'done', result })}
          onChangeVehicle={backToQueue}
        />
      );
    case 'done':
      return <InspectionResultStep result={step.result} onNew={backToQueue} />;
  }
}
