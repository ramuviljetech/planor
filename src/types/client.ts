export interface UserFormData {
  username: string;
  contact: string;
  email: string;
}

export interface ClientDataTypes {
  clientName: string;
  organizationNumber: string;
  industryType: string;
  address: string;
  websiteUrl: string;
  status: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  description: string;
  user: UserFormData[];
}
