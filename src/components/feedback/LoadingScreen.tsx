import { Loader } from 'lucide-react';

interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({ label = 'Caricamento…' }: LoadingScreenProps) {
  return (
    <div className="loading" role="status">
      <Loader size={18} aria-hidden="true" />
      {label}
    </div>
  );
}
