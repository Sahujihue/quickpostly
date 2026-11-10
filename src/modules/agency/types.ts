export interface AgencyClient {
  id: string;
  agencyWorkspaceId: string;
  clientName: string;
  contactEmail: string;
  assignedWorkspaceId: string;
  whiteLabelDomain?: string;
  approvalRequired: boolean;
  notes?: string;
}

export interface WhiteLabelConfig {
  customDomain: string;
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  emailSenderName: string;
  emailSenderAddress: string;
}
