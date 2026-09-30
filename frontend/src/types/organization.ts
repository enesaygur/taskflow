export interface Organization {
  id: string;
  name: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  myRole: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
}
