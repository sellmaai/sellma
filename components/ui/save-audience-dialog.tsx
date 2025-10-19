"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";

interface SaveAudienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string) => Promise<void>;
  isSaving?: boolean;
}

export function SaveAudienceDialog({
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: SaveAudienceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  const checkNameUniqueness = useQuery(api.userAudiences.checkNameUniqueness, 
    name.trim() ? { name: name.trim() } : "skip"
  );

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setNameError(null);
    }
  }, [open]);

  // Check name uniqueness with debounce
  useEffect(() => {
    if (!name.trim()) {
      setNameError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsCheckingName(true);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsCheckingName(false);
    };
  }, [name]);

  useEffect(() => {
    if (isCheckingName && checkNameUniqueness !== undefined) {
      setIsCheckingName(false);
      if (!checkNameUniqueness) {
        setNameError("An audience with this name already exists");
      } else {
        setNameError(null);
      }
    }
  }, [checkNameUniqueness, isCheckingName]);

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    if (nameError) {
      return;
    }

    try {
      await onSave(name.trim(), description.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save audience:", error);
    }
  };

  const isValid = name.trim() && !nameError && !isCheckingName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Audience</DialogTitle>
          <DialogDescription>
            Give your audience a name and description to save it for future use.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <div className="relative">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter audience name"
                className={nameError ? "border-red-500" : ""}
                disabled={isSaving}
              />
              {isCheckingName && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                </div>
              )}
              {!isCheckingName && name.trim() && checkNameUniqueness === true && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
            {nameError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {nameError}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter audience description (optional)"
              rows={3}
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
          >
            {isSaving ? "Saving..." : "Save Audience"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
