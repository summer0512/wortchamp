import { ReactNode } from "react";

type Props = { children: ReactNode };

// AdSense remains disabled. Runtime scripts mount inside the localized body.
export default function RootLayout({ children }: Props) {
  return <>{children}</>;
}
