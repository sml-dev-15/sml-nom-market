"use client";

import { useRef } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import StaggeredMenu, {
  type StaggeredMenuRef,
} from "@/components/ui/StaggeredMenu/StaggeredMenu";
import { FEATURES } from "./nav-tabs";
import type { NavTabId } from "./nav-tabs";

type MobileNavMenuProps = {
  activeTab: NavTabId | null;
  onTabChange: (tabId: NavTabId) => void;
  onGoHome: () => void;
};

export function MobileNavMenu({
  onTabChange,
  onGoHome,
}: MobileNavMenuProps) {
  const menuRef = useRef<StaggeredMenuRef>(null);

  const menuItems = [
    {
      label: "Home",
      ariaLabel: "Go to home page",
      link: "/",
      onClick: onGoHome,
    },
    ...FEATURES.map((feature) => ({
      label: feature.shortLabel,
      ariaLabel: `Open ${feature.shortLabel}`,
      link: `/#${feature.id}`,
      onClick: () => onTabChange(feature.id),
    })),
  ];

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-foreground/80 hover:text-foreground"
        aria-label="Open navigation menu"
        aria-expanded={menuRef.current?.isOpen ?? false}
        onClick={() => menuRef.current?.toggleMenu()}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <StaggeredMenu
        ref={menuRef}
        hideHeader
        isFixed
        position="right"
        items={menuItems}
        displaySocials={false}
        displayItemNumbering
        colors={["#2a2520", "#c8872e", "#5c4a32"]}
        accentColor="#c8872e"
        menuButtonColor="currentColor"
        openMenuButtonColor="currentColor"
        changeMenuColorOnOpen={false}
        closeOnClickAway
      />
    </>
  );
}
