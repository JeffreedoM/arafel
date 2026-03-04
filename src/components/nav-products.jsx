"use client";

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";

export function NavProducts({ items }) {
  const { isMobile } = useSidebar();
  const location = useLocation();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Products</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.url); // or === if exact match
          return (
            <Link key={item.title} to={item.url}>
              <SidebarMenuButton
                tooltip={item.title}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  isActive
                    ? "bg-primary hover:bg-primary text-white hover:text-white"
                    : ""
                }`}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </Link>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
