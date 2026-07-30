import type { Metadata } from "next";

import { RegistrationWizard } from "@/components/registration-wizard/wizard";

export const metadata: Metadata = {
  title: "Associe-se | Inova Cumaú",
};

export default function AssocieSePage() {
  return <RegistrationWizard />;
}
