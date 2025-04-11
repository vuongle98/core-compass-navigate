
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface PageHeaderProps {
  title: string;
  description?: string;
  showAddButton?: boolean;
  addButtonText?: string;
}

export function PageHeader({
  title,
  description,
  showAddButton = true,
  addButtonText = "Add New",
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
      {showAddButton && (
        <Button onClick={handleAdd}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
}
