import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function SSOCallback() {
  // This component handles the return from Google/OAuth
  return <AuthenticateWithRedirectCallback />;
}