"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import Image from "next/image";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/use-toast";

import { userSchema } from "@/components/users/user.schema";
import { useAuth } from "@/hooks/use-auth";

// Définir le type d'utilisateur à partir du schéma Zod
type UserType = z.infer<typeof userSchema>;

// Fonction pour obtenir les initiales à partir du nom
const getInitials = (name: string = "") => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

export function NavUser({ user }: { user: UserType }) {
  const { isMobile } = useSidebar();
  const initials = getInitials(user.displayName);
  const { logout, user: authUser, subscription } = useAuth();
  const { toast } = useToast();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Gérer l'ouverture du portail client Stripe
  const handleStripePortal = async () => {
    if (!authUser || !subscription?.stripeCustomerId) {
      // Rediriger vers la page d'abonnement si pas d'abonnement Stripe
      window.location.href = "/dashboard/abonnement";
      return;
    }

    setIsLoadingPortal(true);

    try {
      const token = await authUser.getIdToken(true);
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Erreur lors de l'accès au portail client:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au portail de facturation",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#FD6502] data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.logo ? (
                  <AvatarImage
                    src={user.logo}
                    alt={user.displayName || "Utilisateur"}
                  />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {initials || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user.displayName}
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.logo ? (
                    <AvatarImage
                      src={user.logo}
                      alt={user.displayName || "Utilisateur"}
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {initials || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.displayName}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/abonnement" className="flex items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Abonnement et Plans</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account" className="flex items-center">
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  <span>Compte</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleStripePortal} disabled={isLoadingPortal}>
                <CreditCard className="mr-2 h-4 w-4" />
                {isLoadingPortal ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </>
                ) : (
                  <span>Facturation Stripe</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
