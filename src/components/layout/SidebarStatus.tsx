import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks';

export function SidebarStatus() {
  const online = useOnlineStatus();
  const Icon = online ? Wifi : WifiOff;
  return (
    <div className="sb-status sb-only" role="status">
      <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
      {online ? 'Online' : 'Offline · le modifiche restano sul dispositivo'}
    </div>
  );
}
