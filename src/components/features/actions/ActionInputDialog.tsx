import React, { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/shared/form/FormField";
import { useActionForm } from "./hooks/useActionForm";
import { useStore } from "@/store/useStore";
import { categoryIcons, categoryLabels } from "@/entities/action/constants";
import { ActionCategory } from "@/entities/action/types";
import { ko } from "date-fns/locale";

interface ActionInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialText?: string;
  initialDate?: Date;
}

export default function ActionInputDialog({
  open,
  onOpenChange,
  initialText = "",
  initialDate
}: ActionInputDialogProps) {
  const { primarySelectedDate, addAction } = useStore();
  const { title, setTitle, category, setCategory, resetForm, isValid } =
    useActionForm(initialText);

  const date = initialDate || primarySelectedDate || new Date();

  const categoryOptions = useMemo(
    () =>
      Object.entries(categoryLabels).map(([value, label]) => ({
        value: value as ActionCategory,
        label
      })),
    []
  );

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [onOpenChange, resetForm]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    addAction({
      date,
      title: title.trim(),
      category
    });

    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="행동 추가">
      <form className="space-y-4 py-2" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>{format(date, "yyyy년 M월 d일 (EEEE)", { locale: ko })}</span>
        </div>

        <FormField label="내용" htmlFor="action-title">
          <Input
            id="action-title"
            placeholder="예: 스타벅스 결제, 영화 예매"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </FormField>

        <FormField label="카테고리">
          <div className="grid gap-2 sm:grid-cols-2">
            {categoryOptions.map((option) => {
              const Icon = categoryIcons[option.value];
              const isSelected = category === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-background/60 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} type="button">
            취소
          </Button>
          <Button type="submit" disabled={!isValid}>
            추가하기
          </Button>
        </div>
      </form>
    </Modal>
  );
}
