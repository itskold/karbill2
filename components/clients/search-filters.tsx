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
  clientTypeFilter: string
  setClientTypeFilter: (type: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
}

export function SearchFilters({
  searchQuery,
  setSearchQuery,
  clientTypeFilter,
  setClientTypeFilter,
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
              placeholder="Rechercher un client..."
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
              <DropdownMenuLabel className="text-slate-700">Filtrer par type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setClientTypeFilter("all")}>
                {clientTypeFilter === "all" && <Check className="mr-2 h-4 w-4" />}
                <span className={clientTypeFilter === "all" ? "font-medium" : ""}>Tous les clients</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setClientTypeFilter("individual")}>
                {clientTypeFilter === "individual" && <Check className="mr-2 h-4 w-4" />}
                <span className={clientTypeFilter === "individual" ? "font-medium" : ""}>Particuliers</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setClientTypeFilter("company")}>
                {clientTypeFilter === "company" && <Check className="mr-2 h-4 w-4" />}
                <span className={clientTypeFilter === "company" ? "font-medium" : ""}>Entreprises</span>
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
                <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                <SelectItem value="purchases-desc">Achats (décroissant)</SelectItem>
                <SelectItem value="purchases-asc">Achats (croissant)</SelectItem>
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
