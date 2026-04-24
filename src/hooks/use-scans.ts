import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ScanInput } from "../../../shared/routes";
import { useToast } from "./use-toast";

export function useScans() {
  return useQuery({
    queryKey: [api.scans.list.path],
    queryFn: async () => {
      const res = await fetch(api.scans.list.path, { credentials: "include" });
      if (res.status === 401) return null; // Handle unauthorized gracefully
      if (!res.ok) throw new Error("Failed to fetch scans");
      return api.scans.list.responses[200].parse(await res.json());
    },
  });
}

export function useScan(id: number) {
  return useQuery({
    queryKey: [api.scans.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.scans.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 401) return null;
      if (res.status === 404) throw new Error("Scan not found");
      if (!res.ok) throw new Error("Failed to fetch scan details");
      return api.scans.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ScanInput) => {
      const validated = api.scans.create.input.parse(data);
      const res = await fetch(api.scans.create.path, {
        method: api.scans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to initiate scan");
      }

      return api.scans.create.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      toast({
        title: "Scan Complete",
        description: "Analysis finished successfully.",
        variant: "default",
        className: "border-primary text-primary bg-black",
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch statistics");
      return api.stats.get.responses[200].parse(await res.json());
    },
  });
}
