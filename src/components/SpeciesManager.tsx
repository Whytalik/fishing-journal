"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { addSpecies, deleteSpecies } from "@/app/actions/speciesActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

interface Species {
  id: string;
  name: string;
  userId: string | null;
}

interface SpeciesManagerProps {
  initialSpecies: Species[];
}

export default function SpeciesManager({ initialSpecies }: SpeciesManagerProps) {
  const [species, setSpecies] = useState(initialSpecies);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  
  // Modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    startTransition(async () => {
      const result = await addSpecies(newName);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Додано: ${newName}`);
        setNewName("");
        setSpecies([...species, { id: Math.random().toString(), name: newName, userId: 'current' }]);
      }
    });
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    const { id, name } = deleteModal;
    setDeleteModal(prev => ({ ...prev, isOpen: false }));

    startTransition(async () => {
      const result = await deleteSpecies(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Видалено: ${name}`);
        setSpecies(species.filter(s => s.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="flex-1">
          <Input 
            placeholder="Додати новий вид риби..." 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isPending}
          />
        </div>
        <Button type="submit" disabled={isPending || !newName.trim()}>
          Додати
        </Button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {species.map((s) => (
          <div 
            key={s.id} 
            className="flex items-center justify-between p-3 bg-n-surface border border-n-border rounded-lg group hover:border-n-accent/50 transition-colors"
          >
            <Link href={`/species/${s.id}`} className="flex-1 min-w-0">
              <span className="text-sm font-medium text-n-text hover:text-n-accent transition-colors block truncate">{s.name}</span>
            </Link>
            {s.userId ? (
              <button 
                onClick={() => openDeleteModal(s.id, s.name)}
                className="text-n-subtle hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                title="Delete"
              >
                ✕
              </button>
            ) : (
              <span className="text-[10px] text-n-subtle px-1.5 py-0.5 bg-n-hover rounded uppercase ml-2 flex-shrink-0">Стандарт</span>
            )}
          </div>
        ))}
      </div>

      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title="Видалити вид"
        description={`Ви впевнені, що хочете видалити "${deleteModal.name}"? Цю дію неможливо буде скасувати.`}
        confirmText="Видалити"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
}
