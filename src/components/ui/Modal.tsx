"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Підтвердити",
  cancelText = "Скасувати",
  variant = "primary",
  isLoading = false,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-n-bg/80 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-n-surface border border-n-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-n-text">{title}</h3>
            <p className="text-sm text-n-muted leading-relaxed">{description}</p>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button 
              variant="ghost" 
              onClick={onClose} 
              disabled={isLoading}
              className="sm:w-auto"
            >
              {cancelText}
            </Button>
            <Button 
              variant={variant === "danger" ? "primary" : "primary"} 
              className={cn(
                variant === "danger" && "bg-red-500 hover:bg-red-600 border-none",
                "sm:w-auto"
              )}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Обробка..." : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
