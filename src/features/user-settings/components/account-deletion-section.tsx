"use client";

import { Button } from "@/components/ui/button";
import { DeleteAccountModal } from "@/components/ui/delete-account-modal";
import { useState } from "react";

export function AccountDeletionSection() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <div className="p-6 w-full">
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          退会する
        </Button>
      </div>
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
