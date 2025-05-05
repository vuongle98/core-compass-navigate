import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { RichTextEditorProps } from "@/types/Blog";
import BlogService from "@/services/BlogService";

import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Trash2,
} from "lucide-react";

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue = "",
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  minHeight = "200px",
  className = "",
  allowImageUpload = true,
  onImageUpload,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string = "") => {
    if (readOnly) return;
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const formatBold = () => execCommand("bold");
  const formatItalic = () => execCommand("italic");
  const formatUnderline = () => execCommand("underline");

  const alignLeft = () => execCommand("justifyLeft");
  const alignCenter = () => execCommand("justifyCenter");
  const alignRight = () => execCommand("justifyRight");

  const insertUnorderedList = () => execCommand("insertUnorderedList");
  const insertOrderedList = () => execCommand("insertOrderedList");

  const formatH1 = () => execCommand("formatBlock", "<h1>");
  const formatH2 = () => execCommand("formatBlock", "<h2>");
  const formatH3 = () => execCommand("formatBlock", "<h3>");

  const formatQuote = () => execCommand("formatBlock", "<blockquote>");
  const insertCode = () => {
    execCommand("formatBlock", "<pre>");
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const pre = range.commonAncestorContainer;
      // Fix: Check if the node is an Element before accessing classList
      if (pre instanceof Element && pre.nodeName === "PRE") {
        pre.classList.add(
          "language-javascript",
          "p-4",
          "bg-muted",
          "rounded-md"
        );
      }
    }
  };

  const undo = () => execCommand("undo");
  const redo = () => execCommand("redo");

  const insertLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const clearFormatting = () => execCommand("removeFormat");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Uploading...",
        description: "Please wait while the image is being uploaded.",
      });

      let result;
      if (onImageUpload) {
        result = await onImageUpload(file);
      } else {
        result = await BlogService.uploadImage(file);
      }

      if (result.success && result.data && result.data.url) {
        execCommand("insertImage", result.data.url);

        const images = editorRef.current?.querySelectorAll("img");
        const lastImage = images?.[images.length - 1];

        if (lastImage) {
          lastImage.className = "max-w-full h-auto rounded-md my-2";
          lastImage.style.maxHeight = "400px";
          lastImage.alt = file.name.split(".")[0] || "blog image";
        }

        toast({
          title: "Upload complete",
          description: "Image has been added to your content.",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload failed",
        description:
          "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerImageUpload = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  const ToolbarButton = ({
    icon: Icon,
    onClick,
    tooltip,
    isActive = false,
  }: {
    icon: React.ElementType;
    onClick: () => void;
    tooltip: string;
    isActive?: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
              "h-8 w-8 p-0 rounded-md",
              isActive && "bg-accent text-accent-foreground"
            )}
            disabled={readOnly}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div
      className={cn(
        "border rounded-md flex flex-col",
        isFocused ? "ring-1 ring-ring" : "",
        readOnly ? "bg-muted" : "",
        className
      )}
    >
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
          <div className="flex gap-1 mr-1 border-r pr-1">
            <ToolbarButton icon={Bold} onClick={formatBold} tooltip="Bold" />
            <ToolbarButton
              icon={Italic}
              onClick={formatItalic}
              tooltip="Italic"
            />
            <ToolbarButton
              icon={Underline}
              onClick={formatUnderline}
              tooltip="Underline"
            />
          </div>

          <div className="flex gap-1 mr-1 border-r pr-1">
            <ToolbarButton
              icon={AlignLeft}
              onClick={alignLeft}
              tooltip="Align Left"
            />
            <ToolbarButton
              icon={AlignCenter}
              onClick={alignCenter}
              tooltip="Align Center"
            />
            <ToolbarButton
              icon={AlignRight}
              onClick={alignRight}
              tooltip="Align Right"
            />
          </div>

          <div className="flex gap-1 mr-1 border-r pr-1">
            <ToolbarButton
              icon={Heading1}
              onClick={formatH1}
              tooltip="Heading 1"
            />
            <ToolbarButton
              icon={Heading2}
              onClick={formatH2}
              tooltip="Heading 2"
            />
            <ToolbarButton
              icon={Heading3}
              onClick={formatH3}
              tooltip="Heading 3"
            />
          </div>

          <div className="flex gap-1 mr-1 border-r pr-1">
            <ToolbarButton
              icon={List}
              onClick={insertUnorderedList}
              tooltip="Bullet List"
            />
            <ToolbarButton
              icon={ListOrdered}
              onClick={insertOrderedList}
              tooltip="Number List"
            />
          </div>

          <div className="flex gap-1 mr-1 border-r pr-1">
            <ToolbarButton icon={Quote} onClick={formatQuote} tooltip="Quote" />
            <ToolbarButton
              icon={Code}
              onClick={insertCode}
              tooltip="Code Block"
            />
            <ToolbarButton
              icon={LinkIcon}
              onClick={insertLink}
              tooltip="Insert Link"
            />
            {allowImageUpload && (
              <ToolbarButton
                icon={ImageIcon}
                onClick={triggerImageUpload}
                tooltip="Insert Image"
              />
            )}
          </div>

          <div className="flex gap-1">
            <ToolbarButton icon={Undo} onClick={undo} tooltip="Undo" />
            <ToolbarButton icon={Redo} onClick={redo} tooltip="Redo" />
            <ToolbarButton
              icon={Trash2}
              onClick={clearFormatting}
              tooltip="Clear Formatting"
            />
          </div>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "flex-1 p-3 overflow-auto outline-none",
          "prose prose-sm max-w-none",
          "focus:outline-none",
          readOnly ? "cursor-default" : ""
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {!readOnly && (
        <div className="border-t p-2 text-xs text-muted-foreground flex justify-between items-center">
          <div>Rich Text Editor</div>
          <div className="text-right">
            <kbd className="px-1 py-0.5 rounded bg-muted">Tab</kbd> to indent
            &nbsp;•&nbsp;
            <kbd className="px-1 py-0.5 rounded bg-muted">Shift+Tab</kbd> to
            outdent
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
