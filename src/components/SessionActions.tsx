"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteSession } from "@/app/actions/sessionActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

interface SessionActionsProps {
  sessionId: string;
  isEditing: boolean;
}

export default function SessionActions({ sessionId, isEditing }: SessionActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const toggleEdit = () => {
    if (isEditing) {
      router.push(`/sessions/${sessionId}`);
    } else {
      router.push(`/sessions/${sessionId}?edit=true`);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(false);
    startTransition(async () => {
      const result = await deleteSession(sessionId);
      if (result.success) {
        toast.success("Сесію видалено");
        router.push("/sessions");
      } else {
        toast.error(result.error || "Не вдалося видалити сесію");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={isEditing ? "primary" : "ghost"} 
        size="sm" 
        className={`h-8 px-3 text-xs font-medium ${!isEditing ? 'border border-n-border' : ''}`}
        onClick={toggleEdit}
      >
        {isEditing ? "Завершити" : "Редагувати"}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-3 border border-n-border text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10"
        onClick={() => setIsDeleteModalOpen(true)}
      >
        Видалити
      </Button>

      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Видалити сесію"
        description="Ви впевнені, що хочете видалити цю сесію? Усі улови, фото та дані будуть безповоротно видалені."
        confirmText="Видалити"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
}
