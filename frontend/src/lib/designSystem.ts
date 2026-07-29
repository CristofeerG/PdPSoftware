import type { ChangeEvent, ComponentType, ReactNode } from "react";

export interface DsOption {
  value: string | number;
  label: string;
}

export interface BadgeProps {
  children?: ReactNode;
  tone?: "free" | "occupied" | "reserved" | "warning" | "danger" | "neutral";
}

export interface ButtonProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "s" | "m" | "l";
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}

export interface CardProps {
  children?: ReactNode;
  padding?: string;
  style?: React.CSSProperties;
}

export interface IconButtonProps {
  icon?: ReactNode;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  size?: number;
}

export interface ModalProps {
  open: boolean;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: ReactNode;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export interface NumericStepperProps {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
}

export interface SelectProps {
  label?: string;
  value: string | number;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  options?: DsOption[];
}

export interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

export interface TabsProps {
  items?: DsOption[];
  active: string | number;
  onChange?: (value: string) => void;
}

export interface MenuItemRowProps {
  name: string;
  price: number;
  qty?: number;
  onQtyChange?: (qty: number) => void;
  note?: string;
}

export interface TableTileProps {
  number: number;
  status?: "free" | "occupied" | "reserved";
  total?: number | string;
  onClick?: () => void;
}

export interface NavItem {
  key: string;
  label: string;
  icon: string;
}

export interface AppShellDesktopProps {
  items: NavItem[];
  allowedKeys: string[];
  active: string;
  onNav: (key: string) => void;
  user: { name: string; roleLabel: string };
  onLogout: () => void;
  logoSrc: string;
  children?: ReactNode;
}

export type AppShellMobileProps = Omit<AppShellDesktopProps, "onLogout">;

interface DesignSystemNamespace {
  Badge: ComponentType<BadgeProps>;
  Button: ComponentType<ButtonProps>;
  Card: ComponentType<CardProps>;
  IconButton: ComponentType<IconButtonProps>;
  Modal: ComponentType<ModalProps>;
  Input: ComponentType<InputProps>;
  NumericStepper: ComponentType<NumericStepperProps>;
  Select: ComponentType<SelectProps>;
  Switch: ComponentType<SwitchProps>;
  Tabs: ComponentType<TabsProps>;
  MenuItemRow: ComponentType<MenuItemRowProps>;
  TableTile: ComponentType<TableTileProps>;
  AppShellDesktop: ComponentType<AppShellDesktopProps>;
  AppShellMobile: ComponentType<AppShellMobileProps>;
}

export function ds(): DesignSystemNamespace {
  return (window as unknown as { LaPosadaDelPalomoDesignSystem_aee67b: DesignSystemNamespace })
    .LaPosadaDelPalomoDesignSystem_aee67b;
}
