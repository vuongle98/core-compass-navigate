import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BotCommand } from "@/types/Bot";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BotCommandsProps {
  commands?: BotCommand[];
  isLoading: boolean;
  botId: number;
  handleEdit: (
    botId: number,
    command: string,
    data: Partial<BotCommand>
  ) => void;
  handleCreate: (botId: number, data: Partial<BotCommand>) => void;
}

export function BotCommands({
  commands,
  isLoading,
  botId,
  handleEdit,
  handleCreate,
}: BotCommandsProps) {
  const [editingCommandId, setEditingCommandId] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<{
    command?: string;
    description?: string;
    handlerMethod?: string;
    responseTemplate?: string;
  }>({});
  const [newCommand, setNewCommand] = useState<{
    command: string;
    description: string;
    handlerMethod: string;
    responseTemplate: string;
  }>({
    command: "",
    description: "",
    handlerMethod: "",
    responseTemplate: "",
  });
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);

  const handleToggleCreateForm = () => {
    setIsCreateFormVisible((prev) => !prev);
  };

  const handleEditClick = (commandId: number, field: string, value: string) => {
    const command = commands?.find((c) => c.id === commandId);
    setEditingCommandId(commandId);
    setEditedValues({
      command: command?.command || "",
      description: command?.description || "",
      handlerMethod: command?.handlerMethod || "",
      responseTemplate: command?.responseTemplate || "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const { value } = e.target;
    setEditedValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewCommandChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const { value } = e.target;
    setNewCommand((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (commandName: string) => {
    // Merge previous values with edited values
    const updatedValues = {
      command: editedValues.command,
      description: editedValues.description,
      handlerMethod: editedValues.handlerMethod,
      responseTemplate: editedValues.responseTemplate,
    };

    handleEdit(botId, commandName, updatedValues);

    // Save the updated values (e.g., send to API)
    console.log("Saving command:", commandName, updatedValues);
    setEditingCommandId(null);
    setEditedValues({});
  };

  const handleSaveNewCommand = () => {
    // Save the new command (e.g., send to API)
    console.log("Creating new command:", newCommand);

    handleCreate(botId, newCommand);

    setNewCommand({
      command: "",
      description: "",
      handlerMethod: "",
      responseTemplate: "",
    });
    setIsCreateFormVisible(false);
  };

  const handleCancel = () => {
    setEditingCommandId(null);
    setEditedValues({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commands</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold"></h3>
          <Button
            onClick={handleToggleCreateForm}
            variant={isCreateFormVisible ? "destructive" : "default"}
            size="sm"
          >
            {isCreateFormVisible ? "Hide Create Form" : "Show Create Form"}
          </Button>
        </div>
        {isCreateFormVisible && (
          <div className="mb-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold mb-2">Create New Command</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Command"
                value={newCommand.command}
                onChange={(e) => handleNewCommandChange(e, "command")}
              />
              <Input
                placeholder="Description"
                value={newCommand.description}
                onChange={(e) => handleNewCommandChange(e, "description")}
              />
              <Input
                placeholder="Handler Method"
                value={newCommand.handlerMethod}
                onChange={(e) => handleNewCommandChange(e, "handlerMethod")}
              />
              <Input
                placeholder="Response Template"
                value={newCommand.responseTemplate}
                onChange={(e) => handleNewCommandChange(e, "responseTemplate")}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleToggleCreateForm}
                size="sm"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNewCommand} size="sm">
                Create Command
              </Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : commands && commands.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Handler method</TableHead>
                  <TableHead>Response template</TableHead>
                  <TableHead>Created at</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commands.map((command) => (
                  <TableRow key={command.id}>
                    <TableCell>{command.id}</TableCell>
                    <TableCell>
                      {editingCommandId === command.id ? (
                        <Input
                          type="text"
                          value={editedValues.command || ""}
                          onChange={(e) => handleInputChange(e, "command")}
                        />
                      ) : (
                        <div
                          className="max-w-xs truncate cursor-pointer"
                          onClick={() =>
                            handleEditClick(
                              command.id,
                              "command",
                              command.command || ""
                            )
                          }
                        >
                          {command.command}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCommandId === command.id ? (
                        <Input
                          type="text"
                          value={editedValues.description || ""}
                          onChange={(e) => handleInputChange(e, "description")}
                        />
                      ) : (
                        <div
                          className="max-w-xs truncate cursor-pointer"
                          onClick={() =>
                            handleEditClick(
                              command.id,
                              "description",
                              command.description || ""
                            )
                          }
                        >
                          {command.description?.length > 10
                            ? command.description.slice(0, 10) + "…"
                            : command.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCommandId === command.id ? (
                        <Input
                          type="text"
                          value={editedValues.handlerMethod || ""}
                          onChange={(e) =>
                            handleInputChange(e, "handlerMethod")
                          }
                        />
                      ) : (
                        <div
                          className="max-w-xs truncate cursor-pointer"
                          onClick={() =>
                            handleEditClick(
                              command.id,
                              "handlerMethod",
                              command.handlerMethod || ""
                            )
                          }
                        >
                          {command.handlerMethod}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCommandId === command.id ? (
                        <Input
                          type="text"
                          value={editedValues.responseTemplate || ""}
                          onChange={(e) =>
                            handleInputChange(e, "responseTemplate")
                          }
                        />
                      ) : (
                        <div
                          className="max-w-xs truncate cursor-pointer"
                          onClick={() =>
                            handleEditClick(
                              command.id,
                              "responseTemplate",
                              command.responseTemplate || ""
                            )
                          }
                        >
                          {command.responseTemplate?.length > 10
                            ? command.responseTemplate.slice(0, 10) + "…"
                            : command.responseTemplate}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {command.createdAt
                        ? new Date(command.createdAt).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {editingCommandId === command.id ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSave(command.command)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleEditClick(
                                command.id,
                                "command",
                                command.command || ""
                              )
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log("delete");
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No scheduled messages available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
