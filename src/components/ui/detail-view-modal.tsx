
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  footerContent?: React.ReactNode;
}

export function DetailViewModal({
  isOpen,
  onClose,
  title,
  description,
  className,
  children,
  size = "md",
  showCloseButton = true,
  footerContent,
}: DetailViewModalProps) {
  const isMobile = useIsMobile();
  
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: isMobile ? "w-[calc(100%-1rem)] max-w-[calc(100%-1rem)]" : "max-w-screen-lg",
  };

  // Handle the modal closing properly
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className={cn(
          isMobile ? "w-[calc(100%-1rem)] mx-auto" : sizeClasses[size], 
          "max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden p-0", 
          className
        )}
      >
        <DialogHeader className="p-2 sm:p-3 md:p-4 bg-muted/30 border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-base font-medium">{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-1 text-xs sm:text-sm">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 p-2 sm:p-3 md:p-4">
          <div className="space-y-2 sm:space-y-3 md:space-y-4">{children}</div>
        </ScrollArea>
        {footerContent && (
          <div className="p-2 sm:p-3 md:p-4 border-t flex flex-col sm:flex-row sm:justify-end gap-2 bg-muted/20">
            {footerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
