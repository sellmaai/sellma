"use client";

import { useQuery } from "convex/react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";

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

  const checkNameUniqueness = useQuery(
    api.userAudiences.checkNameUniqueness,
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
      if (checkNameUniqueness) {
        setNameError(null);
      } else {
        setNameError("An audience with this name already exists");
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

    await onSave(name.trim(), description.trim());
    onOpenChange(false);
  };

  const isValid = name.trim() && !nameError && !isCheckingName;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
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
                className={nameError ? "border-red-500" : ""}
                disabled={isSaving}
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter audience name"
                value={name}
              />
              {isCheckingName && (
                <div className="-translate-y-1/2 absolute top-1/2 right-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                </div>
              )}
              {!isCheckingName &&
                name.trim() &&
                checkNameUniqueness === true && (
                  <div className="-translate-y-1/2 absolute top-1/2 right-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )}
            </div>
            {nameError && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {nameError}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              disabled={isSaving}
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter audience description (optional)"
              rows={3}
              value={description}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={!isValid || isSaving} onClick={handleSave}>
            {isSaving ? "Saving..." : "Save Audience"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
