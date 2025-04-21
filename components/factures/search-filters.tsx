"use client"

import { Search, Filter, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
}

export function SearchFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: SearchFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Rechercher une facture..."
              className="pl-9 border-slate-300 focus-visible:ring-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-slate-300 text-slate-700">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel className="text-slate-700">Filtrer par statut</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                {statusFilter === "all" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "all" ? "font-medium" : ""}>Tous les statuts</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("paid")}>
                {statusFilter === "paid" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "paid" ? "font-medium" : ""}>Payées</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("sent")}>
                {statusFilter === "sent" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "sent" ? "font-medium" : ""}>Envoyées</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                {statusFilter === "draft" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "draft" ? "font-medium" : ""}>Brouillons</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>
                {statusFilter === "overdue" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "overdue" ? "font-medium" : ""}>En retard</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] border-slate-300 text-slate-700">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Trier par</SelectLabel>
                <SelectItem value="newest">Plus récentes</SelectItem>
                <SelectItem value="oldest">Plus anciennes</SelectItem>
                <SelectItem value="amount-asc">Montant croissant</SelectItem>
                <SelectItem value="amount-desc">Montant décroissant</SelectItem>
                <SelectItem value="due-date">Date d'échéance</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
