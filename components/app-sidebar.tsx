"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import {
  Command,
  LifeBuoy,
  Send,
  FileText,
  Car,
  ClipboardList,
  Users,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { userSchema, userService } from "@/components/users/user.schema";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import Image from "next/image";

type UserType = z.infer<typeof userSchema>;

// Déplacer les données de navigation en dehors du composant
const navMainData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: FileText,
  },
  {
    title: "Facturation",
    url: "/dashboard/factures",
    icon: FileText,
    isActive: true,
    items: [
      {
        title: "+ Facture de vente",
        url: "/dashboard/factures/add",
      },
      {
        title: "ProForma",
        url: "/dashboard/factures/proforma",
      },
      {
        title: "Acompte",
        url: "/dashboard/factures/acompte",
      },
      {
        title: "Garanties",
        url: "/dashboard/factures/garanties",
      },
    ],
  },
  {
    title: "Véhicules",
    url: "/dashboard/vehicules",
    icon: Car,
    isActive: true,
    items: [
      {
        title: "+ Véhicule",
        url: "/dashboard/vehicules/add",
      },
    ],
  },
  {
    title: "Ordres",
    url: "/dashboard/ordres",
    icon: ClipboardList,
    isActive: true,
    items: [
      {
        title: "+ Réparations",
        url: "/dashboard/ordres/add",
      },
      {
        title: "+ Employé",
        url: "/dashboard/ordres/add/employe",
      },
    ],
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    icon: Users,
    isActive: true,
    items: [
      {
        title: "+ Client",
        url: "/dashboard/clients/add",
      },
    ],
  },
];

const navSecondaryData = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "#",
    icon: Send,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) return;
      try {
        // Utilisez la méthode appropriée pour récupérer les données utilisateur complètes
        const userDoc = await userService.getUser(authUser.uid);
        setUserData(userDoc);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données utilisateur:",
          error
        );
      }
    };

    fetchUserData();
  }, [authUser]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    width={50}
                    height={50}
                    src="/favicon-16x16.png"
                    alt="Logo Karbill"
                  />
                </div>
                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="font-semibold">Karbill</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
        <NavSecondary items={navSecondaryData} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
    </Sidebar>
  );
}
