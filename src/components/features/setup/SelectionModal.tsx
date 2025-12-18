import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface SelectionOption {
  id: string;
  name: string;
  [key: string]: any;
}

interface SelectionModalProps<T extends SelectionOption> {
  open: boolean;
  onClose: () => void;
  onSelect: (items: T[]) => void;
  title: string;
  options: T[];
  displayKey?: keyof T;
  subtitleKey?: keyof T;
  initialSelectedIds?: string[];
}

export const SelectionModal = <T extends SelectionOption>({
  open,
  onClose,
  onSelect,
  title,
  options,
  displayKey = "name" as keyof T,
  subtitleKey,
  initialSelectedIds = []
}: SelectionModalProps<T>) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");

  // Initialize selected IDs when modal opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(initialSelectedIds));
    }
  }, [open, initialSelectedIds]);

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setError("");
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) {
      setError("최소 하나 이상을 선택해주세요");
      return;
    }

    const selectedItems = options.filter((item) =>
      selectedIds.has(item.id)
    );
    onSelect(selectedItems);
    setSelectedIds(new Set());
    setError("");
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <div className="space-y-4">
        {/* Options List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(option.id)}
                onChange={() => handleToggle(option.id)}
                className="w-4 h-4 rounded border-border"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">
                  {String(option[displayKey])}
                </div>
                {subtitleKey && (
                  <div className="text-sm text-muted-foreground">
                    {String(option[subtitleKey])}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
          >
            확인 ({selectedIds.size}개 선택)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
