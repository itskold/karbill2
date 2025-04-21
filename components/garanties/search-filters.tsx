"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchFiltersProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  viewMode: string
  setViewMode: (value: string) => void
}

export function SearchFilters({
  searchQuery = "",
  setSearchQuery,
  typeFilter = "all",
  setTypeFilter,
  statusFilter = "all",
  setStatusFilter,
  viewMode,
  setViewMode,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        placeholder="Rechercher..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full md:w-auto"
      />
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Type de garantie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="extended">Étendue</SelectItem>
          <SelectItem value="premium">Premium</SelectItem>
          <SelectItem value="custom">Personnalisée</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="draft">Brouillon</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
