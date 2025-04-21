"use client"

import { Search, Filter, Check, LayoutGrid, List } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SearchFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
}

export function SearchFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
}: SearchFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Rechercher un véhicule..."
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
              <DropdownMenuItem onClick={() => setStatusFilter("available")}>
                {statusFilter === "available" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "available" ? "font-medium" : ""}>Disponibles</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("reserved")}>
                {statusFilter === "reserved" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "reserved" ? "font-medium" : ""}>Réservés</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("sold")}>
                {statusFilter === "sold" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "sold" ? "font-medium" : ""}>Vendus</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("maintenance")}>
                {statusFilter === "maintenance" && <Check className="mr-2 h-4 w-4" />}
                <span className={statusFilter === "maintenance" ? "font-medium" : ""}>En maintenance</span>
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
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="year-desc">Année (récent)</SelectItem>
                <SelectItem value="year-asc">Année (ancien)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="border border-slate-300 rounded-md p-1">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <TabsList className="grid w-full grid-cols-2 h-8 bg-slate-100">
                <TabsTrigger value="grid" className="px-2 data-[state=active]:bg-white">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-2 data-[state=active]:bg-white">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
