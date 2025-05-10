
import { cn } from '@/lib/utils';
import { ServiceStatus } from '@/types/Service';

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
  className?: string;
}

export const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({
  status,
  className,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusStyles(),
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
