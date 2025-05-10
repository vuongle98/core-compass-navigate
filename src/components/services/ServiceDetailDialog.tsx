
import { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ServiceStatusBadge } from './ServiceStatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Service, ServiceStatus } from '@/types/Service';
import ServiceManagementService from '@/services/ServiceManagementService';
import { toast } from 'sonner';
import { Play, Square, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceDetailDialogProps {
  serviceId: number | string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

export function ServiceDetailDialog({ 
  serviceId, 
  isOpen, 
  onClose,
  onStatusChange
}: ServiceDetailDialogProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    if (serviceId && isOpen) {
      loadServiceDetails();
    }
  }, [serviceId, isOpen]);
  
  const loadServiceDetails = async () => {
    if (!serviceId) return;
    
    setLoading(true);
    try {
      const response = await ServiceManagementService.getServiceById(serviceId);
      if (response.success) {
        setService(response.data);
      } else {
        toast.error('Failed to load service details');
      }
    } catch (error) {
      console.error('Error loading service details:', error);
      toast.error('An error occurred while loading service details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (status: ServiceStatus) => {
    if (!service) return;
    
    setUpdating(true);
    try {
      const response = await ServiceManagementService.updateServiceStatus(service.id, status);
      if (response.success) {
        setService(response.data);
        toast.success(`Service ${status === 'running' ? 'started' : 'stopped'} successfully`);
        onStatusChange();
      } else {
        toast.error(`Failed to ${status === 'running' ? 'start' : 'stop'} service`);
      }
    } catch (error) {
      console.error(`Error ${status === 'running' ? 'starting' : 'stopping'} service:`, error);
      toast.error('An error occurred while updating service status');
    } finally {
      setUpdating(false);
    }
  };
  
  if (!serviceId || !isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : service ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {service.name}
                <ServiceStatusBadge status={service.status} />
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Service Type</h3>
                      <p className="mt-1 capitalize">{service.type}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Version</h3>
                      <p className="mt-1">{service.version}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                      <p className="mt-1">{new Date(service.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                      <p className="mt-1">{new Date(service.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="mt-1">{service.description}</p>
                  </div>
                  
                  {service.resourceUsage && (
                    <>
                      <Separator />
                      <h3 className="text-sm font-medium">Resource Usage</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm font-medium">CPU</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-lg font-semibold">
                              {service.resourceUsage.cpu}%
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm font-medium">Memory</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-lg font-semibold">
                              {service.resourceUsage.memory} MB
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm font-medium">Disk</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-lg font-semibold">
                              {service.resourceUsage.disk} MB
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                  
                  {service.tags && service.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {service.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="config">
                <div className="rounded-md border bg-muted/50 p-4">
                  <pre className="text-sm">
                    {service.config ? JSON.stringify(service.config, null, 2) : 'No configuration available'}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="logs">
                <div className="h-[300px] overflow-y-auto rounded-md border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Service logs are not available in this demo.</p>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <div className="flex gap-2">
                {service.status !== 'running' && (
                  <Button
                    onClick={() => handleStatusChange('running')}
                    disabled={updating}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Service
                  </Button>
                )}
                
                {service.status === 'running' && (
                  <Button
                    onClick={() => handleStatusChange('stopped')}
                    disabled={updating}
                    className="gap-2"
                    variant="outline"
                  >
                    <Square className="h-4 w-4" />
                    Stop Service
                  </Button>
                )}
              </div>
              
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            Service not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
