import { useCallback, useEffect, useState } from "react";
import { ActionCategory } from "@/entities/action/types";

export const useActionForm = (initialTitle = "") => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<ActionCategory>("shopping");

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const resetForm = useCallback(() => {
    setTitle("");
    setCategory("shopping");
  }, []);

  const isValid = title.trim().length > 0;

  return {
    title,
    setTitle,
    category,
    setCategory,
    resetForm,
    isValid
  };
};
