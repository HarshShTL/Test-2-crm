export interface Contact {
  id: string;
  name: string;
  company: string;
  companyId: string;
  email: string;
  emailVerification: string;
  phone: string;
  contactOwner: string;
  leadStatus: string;
  investmentStrategy: string;
  capitalType: string;
  dbSource: string;
  relationship: string;
  relationshipStrength: string;
  region: string;
  assetClass: string;
  ownership: string;
  institutional: string;
  familyOffice: string;
  retail: string;
  indirect: string;
  trepCapitalType: string;
  trepDealPriorOutreach: string;
  nextSteps: string;
  lastActivityDate: string;
  message: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  fundType: string;
  typicalCheckSize: number | null;
  preferredCapitalTypes: string;
  assetClass: string;
  industry: string;
}

export interface Deal {
  id: string;
  name: string;
  amount: number | null;
  closeDate: string;
  dealOwner: string;
  createDate: string;
  stage: string;
  assetClass: string;
  location: string;
  dueDiligenceStatus: string;
  expectedInvestmentAmount: number | null;
  overdue?: boolean;
  contactIds: string[];
  attachments: string[];
}

export type UpdateContactPayload = Partial<Omit<Contact, "id">>;
export type UpdateDealPayload = Partial<Omit<Deal, "id">>;

export const SCHEMA = {
  contacts: {
    asset_class: { type: "enumeration", label: "Asset Class", options: ["Residential - For Rent","Residential - For Sale","Retail","Office","Industrial/Storage","Hotel","Healthcare/Senior","Land","Datacenter","Other"] },
    capital_type: { type: "enumeration", label: "Capital Type", multiSelect: true, options: ["Senior Debt","GP Equity","LP - Large","LP - Mid","Subordinated Debt/Pref Equity","Senior Debt - TX Banks","LP - Small"] },
    database_source: { type: "enumeration", label: "Database Source", options: ["TREP","KH"] },
    email_verification: { type: "enumeration", label: "Email Verification", options: ["valid","accept_all_unverifiable","invalid","unknown"] },
    family_office: { type: "enumeration", label: "Family Office", options: ["Family Office - Single","Family Office - Multi"] },
    indirect: { type: "enumeration", label: "Indirect", options: ["Pension Fund","Foundation","Endowment","RIA"] },
    institutional: { type: "enumeration", label: "Institutional", options: ["Fund Manager/Allocator","Sovereign Wealth","Life Company"] },
    investment_strategy: { type: "enumeration", label: "Investment Strategy", options: ["Development","Acquisition"] },
    region: { type: "enumeration", label: "Region", multiSelect: true, options: ["Mid-West","Northeast","Southeast","Southwest","West","International"] },
    relationship: { type: "enumeration", label: "Relationship", options: ["J - No Relationship","A - Very Well","B - Warm","H - Call","X - Going Concern","Y - Lender","W - Sponsor","Z - Existing"] },
    relationship_strength: { type: "enumeration", label: "Relationship Strength", options: ["Weak","Moderate","Strong"] },
    retail: { type: "enumeration", label: "Retail", options: ["HNW","Emerging","HNW (TX)","UHNW"] },
    ownership: { type: "enumeration", label: "Ownership", options: ["Direct Owner"] },
    hs_lead_status: { type: "enumeration", label: "Lead Status", options: ["Need to Call","Left VM","Sent Email","Had Call","Tag to Deal","Hold off for now"] },
    trep_capital_type__prior_outreach: { type: "enumeration", label: "TREP Capital Type, Prior Outreach", options: ["Programmatic Equity - TLHC IRF Income","Equity - Daytona","Equity - Healthcare","Equity - Wood River Valley Syndication","Transaction Prospects - Mountain West","Equity - TPP","Debt - Healthcare","Debt - Mountain West Banks","Debt - PAM Aiken"] },
    trep_deal__prior_outreach: { type: "enumeration", label: "TREP Deal, Prior Outreach", multiSelect: true, options: ["Tomoka Gate","Carpenter","Rivana","Magdalena","NNN Medical","MicroBay","1600 SoCO","SoCo Hotel","Clear Sky","PAM Aiken","PAM Dover","TMC Pref","Rivana Recap","SunGate Recap"] },
    next_steps: { type: "string", label: "Next Steps" },
    message: { type: "string", label: "Message" },
    last_interaction_date: { type: "datetime", label: "Last Interaction Date" },
    name: { type: "string", label: "Name" },
    company: { type: "string", label: "Company Name" },
    email: { type: "string", label: "Email" },
    phone: { type: "string", label: "Phone Number" },
    contactOwner: { type: "enumeration", label: "Contact Owner", options: ["Kyle Henrickson","Harsh Sharma","Bill Roesch","Henry Wee","No owner"] },
    lastActivityDate: { type: "datetime", label: "Last Activity Date" },
  },
  deals: {
    asset_class: { type: "enumeration", label: "Asset Class", options: ["Residential - For Rent","Residential - For Sale","Retail","Office","Industrial/Storage","Hotel","Healthcare/Senior","Land","Datacenter","Other"] },
    dealstage: { type: "enumeration", label: "Deal Stage", options: ["Overviews","Deal Review","LOI Sent","Sourcing","Closed","On Hold","Pass"] },
    due_diligence_status: { type: "enumeration", label: "Due Diligence Status", options: ["Not started","In progress","Completed"] },
    location: { type: "string", label: "Location" },
    amount: { type: "number", label: "Amount" },
    expected_investment_amount: { type: "number", label: "Expected Investment Amount" },
    expected_close_date: { type: "date", label: "Expected Close Date" },
    dealname: { type: "string", label: "Deal Name" },
    hubspot_owner_id: { type: "enumeration", label: "Deal Owner", options: ["Kyle Henrickson","Harsh Sharma","Bill Roesch","Henry Wee"] },
  },
  companies: {
    asset_class: { type: "enumeration", label: "Asset Class", options: ["Residential - For Rent","Residential - For Sale","Retail","Office","Industrial/Storage","Hotel","Healthcare/Senior","Land","Datacenter","Other"] },
    fund_type: { type: "enumeration", label: "Fund Type", options: ["Private Equity","Hedge Fund","Real Estate Investment Trust","Family Office"] },
    preferred_capital_types: { type: "enumeration", label: "Preferred Capital Types", options: ["Debt","Equity","Mezzanine"] },
    typical_check_size: { type: "number", label: "Typical Check Size" },
    last_preference_update_date: { type: "datetime", label: "Last Preference Update Date" },
    industry: { type: "enumeration", label: "Industry", options: ["Capital Markets","Commercial Real Estate","Financial Services","Investment Banking","Investment Management","Real Estate","Venture Capital & Private Equity"] },
  },
};

export const PIPELINE_STAGES = ["Overviews","Deal Review","LOI Sent","Sourcing","Closed","On Hold","Pass"];

export const ALL_CONTACT_COLUMNS = [
  { key: "name", label: "NAME", default: true, locked: true, schemaKey: "name" },
  { key: "company", label: "COMPANY NAME", default: true, schemaKey: "company" },
  { key: "email", label: "EMAIL", default: true, schemaKey: "email" },
  { key: "emailVerification", label: "EMAIL VERIFICATION", default: true, schemaKey: "email_verification" },
  { key: "phone", label: "PHONE NUMBER", default: true, schemaKey: "phone" },
  { key: "contactOwner", label: "CONTACT OWNER", default: true, schemaKey: "contactOwner" },
  { key: "leadStatus", label: "LEAD STATUS", default: true, schemaKey: "hs_lead_status" },
  { key: "investmentStrategy", label: "INVESTMENT STRATEGY", default: true, schemaKey: "investment_strategy" },
  { key: "capitalType", label: "CAPITAL TYPE", default: true, schemaKey: "capital_type" },
  { key: "nextSteps", label: "NEXT STEPS", default: false, schemaKey: "next_steps" },
  { key: "lastActivityDate", label: "LAST ACTIVITY DATE", default: false, schemaKey: "lastActivityDate" },
  { key: "dbSource", label: "DATABASE SOURCE", default: false, schemaKey: "database_source" },
  { key: "relationship", label: "RELATIONSHIP", default: false, schemaKey: "relationship" },
  { key: "relationshipStrength", label: "RELATIONSHIP STRENGTH", default: false, schemaKey: "relationship_strength" },
  { key: "region", label: "REGION", default: false, schemaKey: "region" },
  { key: "assetClass", label: "ASSET CLASS", default: false, schemaKey: "asset_class" },
  { key: "institutional", label: "INSTITUTIONAL", default: false, schemaKey: "institutional" },
  { key: "familyOffice", label: "FAMILY OFFICE", default: false, schemaKey: "family_office" },
  { key: "retail", label: "RETAIL", default: false, schemaKey: "retail" },
  { key: "indirect", label: "INDIRECT", default: false, schemaKey: "indirect" },
  { key: "ownership", label: "OWNERSHIP", default: false, schemaKey: "ownership" },
  { key: "trepCapitalType", label: "TREP CAPITAL TYPE, PRIOR OUTREACH", default: false, schemaKey: "trep_capital_type__prior_outreach" },
  { key: "trepDealPriorOutreach", label: "TREP DEAL, PRIOR OUTREACH", default: false, schemaKey: "trep_deal__prior_outreach" },
  { key: "message", label: "MESSAGE", default: false, schemaKey: "message" },
];
