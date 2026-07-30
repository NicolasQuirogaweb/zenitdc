"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ClienteForm from "@/components/forms/ClienteForm";
import type { Cliente } from "@/types";
import type { ClienteFormData } from "@/lib/validations/clientes";

export default function EditarClientePage() {
  const [error, setError] = useState("");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

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

    router.push("/clientes");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Cliente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-slate-800">
          Editar Cliente
        </h1>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-alert">
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
