
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  button?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  showAddButton = false,
  addButtonText = "Add New",
  button,
  children,
}: PageHeaderProps) {
  const handleAdd = () => {
    toast.success(`Add new ${title.toLowerCase()} action triggered`);
  };

  return (
    <div className="flex justify-between items-center pb-6 border-b">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {children}
        {button}
        {showAddButton && (
          <Button onClick={handleAdd}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
