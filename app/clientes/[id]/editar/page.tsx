"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ClienteForm from "@/components/forms/ClienteForm";
import { useToast } from "@/lib/hooks/useToast";
import type { Cliente } from "@/types";
import type { ClienteFormData } from "@/lib/validations/clientes";

export default function EditarClientePage() {
  const [error, setError] = useState("");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setCliente(data);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (data: ClienteFormData) => {
    setError("");
    const res = await fetch(`/api/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(typeof err.error === 'string' ? err.error : 'Error al actualizar cliente')
      return;
    }

    showToast("success", "Cliente actualizado correctamente");
    router.push("/clientes");
    router.refresh();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!cliente) {
    return <LoadingScreen mensaje="Cliente no encontrado" />;
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Editar Cliente</h1>
          <a href="/clientes" className="text-sm text-blue-light hover:underline">
            Volver
          </a>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">
            {error}
          </p>
        )}
        <ClienteForm
          defaultValues={cliente}
          onSubmit={handleSubmit}
          submitLabel="Guardar Cambios"
        />
      </div>
    </div>
  );
}
