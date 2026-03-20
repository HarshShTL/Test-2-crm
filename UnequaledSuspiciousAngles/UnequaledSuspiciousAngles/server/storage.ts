import { type Contact, type Company, type Deal, type UpdateContactPayload, type UpdateDealPayload } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  updateContact(id: string, data: UpdateContactPayload): Promise<Contact | undefined>;
  createContact(contact: Omit<Contact, "id">): Promise<Contact>;

  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;

  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  updateDeal(id: string, data: UpdateDealPayload): Promise<Deal | undefined>;
  createDeal(deal: Omit<Deal, "id">): Promise<Deal>;
}

const SEED_COMPANIES: Company[] = [
  { id: "co1", name: "CenterSquare Investment Management", domain: "centersquare.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Investment Management" },
  { id: "co2", name: "Tramview Capital Management", domain: "tramview.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Capital Markets" },
  { id: "co3", name: "Declaration Partners", domain: "declarationpartner.com", fundType: "Private Equity", typicalCheckSize: 5000000, preferredCapitalTypes: "Equity", assetClass: "", industry: "Venture Capital & Private Equity" },
  { id: "co4", name: "Argosy Real Estate Partners", domain: "argosyrep.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
  { id: "co5", name: "Gtis Partners", domain: "gtispartners.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
  { id: "co6", name: "Hig Realty Partners", domain: "higrealty.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
  { id: "co7", name: "Long Wharf Capital", domain: "longwharf.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Capital Markets" },
  { id: "co8", name: "Jefferson River Capital", domain: "jrivercapital.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Investment Management" },
  { id: "co13", name: "Walton Street Capital", domain: "waltonst.com", fundType: "Private Equity", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
  { id: "co14", name: "Quannah Partners", domain: "quannahpa.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
  { id: "co16", name: "Blue Vista Capital Management", domain: "bluevistallc.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Investment Management" },
  { id: "co18", name: "LLJ Ventures", domain: "lljventures.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Venture Capital & Private Equity" },
  { id: "co19", name: "Allstate", domain: "allstate.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Financial Services" },
  { id: "co21", name: "Appian Capital", domain: "appiancapital.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Capital Markets" },
  { id: "co22", name: "Promus Capital Management", domain: "promusca.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Investment Management" },
  { id: "co23", name: "Andell Holdings", domain: "andellinc.com", fundType: "Family Office", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Investment Management" },
  { id: "co24", name: "Ascentris", domain: "ascentris.co", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
  { id: "co32", name: "Schmier Property Group", domain: "schmierpropertygro.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
  { id: "co33", name: "IHP Inc", domain: "ihpinc.com", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
  { id: "co15", name: "Artemis Real Estate Partners", domain: "artemisrep.co", fundType: "", typicalCheckSize: null, preferredCapitalTypes: "", assetClass: "", industry: "Real Estate" },
];

const SEED_CONTACTS: Contact[] = [
  { id:"c1", name:"Beau Vande Walle", company:"Tramview Capital Management", companyId:"co2", email:"bvandewalle@tramview.co", emailVerification:"unknown", phone:"(920) 680-6427", contactOwner:"Kyle Henrickson", leadStatus:"Need to Call", investmentStrategy:"", capitalType:"LP - Small, LP - Mid", dbSource:"KH", relationship:"A - Very Well", relationshipStrength:"Strong", region:"Southwest, West", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"Tomoka Gate", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c2", name:"George Roux", company:"Declaration Partners", companyId:"co3", email:"groux@declarationpartner.com", emailVerification:"unknown", phone:"", contactOwner:"No owner", leadStatus:"", investmentStrategy:"", capitalType:"GP Equity, LP - Large", dbSource:"KH", relationship:"H - Call", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"Tomoka Gate", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c3", name:"Rick Firmine", company:"Argosy Real Estate Partners", companyId:"co4", email:"rfirmine@argosyrep.com", emailVerification:"valid", phone:"", contactOwner:"Kyle Henrickson", leadStatus:"Need to Call", investmentStrategy:"", capitalType:"LP - Mid", dbSource:"KH", relationship:"A - Very Well", relationshipStrength:"Moderate", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"Tomoka Gate, Carpenter", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c5", name:"Theodore Karatz", company:"Gtis Partners", companyId:"co5", email:"tkaratz@gtispartners.com", emailVerification:"valid", phone:"(310) 422-8686", contactOwner:"Kyle Henrickson", leadStatus:"Need to Call", investmentStrategy:"", capitalType:"", dbSource:"KH", relationship:"A - Very Well", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"Tomoka Gate", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c7", name:"Adam Belfer", company:"Hig Realty Partners", companyId:"co6", email:"abelfer@higrealty.com", emailVerification:"valid", phone:"", contactOwner:"Harsh Sharma", leadStatus:"", investmentStrategy:"", capitalType:"LP - Large, Subordinated Debt/Pref Equity", dbSource:"KH", relationship:"A - Very Well", relationshipStrength:"Strong", region:"Mid-West, Southeast", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"Tomoka Gate", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c8", name:"Solon Aposhian", company:"Long Wharf Capital", companyId:"co7", email:"solon.aposhian@longwharf.com", emailVerification:"unknown", phone:"(617) 250-7258", contactOwner:"No owner", leadStatus:"", investmentStrategy:"", capitalType:"", dbSource:"TREP", relationship:"", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"Fund Manager/Allocator", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"1600 SoCO, TMC Pref, SunGate Recap", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c9", name:"Drew Rifkin", company:"Jefferson River Capital", companyId:"co8", email:"drifkin@jrivercapital.com", emailVerification:"unknown", phone:"212-339-2006", contactOwner:"No owner", leadStatus:"", investmentStrategy:"", capitalType:"", dbSource:"TREP", relationship:"", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"Fund Manager/Allocator", familyOffice:"", retail:"HNW, Emerging", indirect:"", trepCapitalType:"Equity - TPP", trepDealPriorOutreach:"1600 SoCO, TMC Pref", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c10", name:"Jeff Reder", company:"CenterSquare Investment Management", companyId:"co1", email:"jreder@centersquare.com", emailVerification:"unknown", phone:"(949) 444-6119", contactOwner:"Kyle Henrickson", leadStatus:"Need to Call", investmentStrategy:"", capitalType:"LP - Large", dbSource:"KH", relationship:"A - Very Well", relationshipStrength:"Strong", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"NNN Medical", nextSteps:"", lastActivityDate:"Mar 17, 2026", message:"" },
  { id:"c11", name:"Robert Bloom", company:"Walton Street Capital", companyId:"co13", email:"bloomr@waltonst.com", emailVerification:"unknown", phone:"(312) 915-2803", contactOwner:"Kyle Henrickson", leadStatus:"Need to Call", investmentStrategy:"", capitalType:"", dbSource:"KH", relationship:"", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c15", name:"Tommy Norgaard", company:"LLJ Ventures", companyId:"co18", email:"tnorgaard@lljventures.com", emailVerification:"invalid", phone:"(619) 808-6476", contactOwner:"Kyle Henrickson", leadStatus:"Had Call", investmentStrategy:"", capitalType:"LP - Small", dbSource:"KH", relationship:"", relationshipStrength:"Weak", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"", nextSteps:"2 records", lastActivityDate:"Mar 9, 2026", message:"" },
  { id:"c16", name:"Chris Winnen", company:"Allstate", companyId:"co19", email:"chris.winnen@allstate.com", emailVerification:"accept_all_unverifiable", phone:"(773) 551-6262", contactOwner:"Kyle Henrickson", leadStatus:"Need to Call", investmentStrategy:"", capitalType:"LP - Large", dbSource:"KH", relationship:"", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c17", name:"Ryan McGrath", company:"Andell Holdings", companyId:"co23", email:"rmcgrath@andellinc.com", emailVerification:"valid", phone:"(310) 210-8359", contactOwner:"Kyle Henrickson", leadStatus:"Had Call", investmentStrategy:"", capitalType:"LP - Small", dbSource:"KH", relationship:"", relationshipStrength:"Moderate", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"", nextSteps:"KH spoke with Ryan. Just ...", lastActivityDate:"Mar 6, 2026", message:"" },
  { id:"c18", name:"Michael Tresley", company:"Promus Capital Management", companyId:"co22", email:"michael.tresley@promusca.com", emailVerification:"valid", phone:"(847) 373-3173", contactOwner:"Kyle Henrickson", leadStatus:"Need to Call", investmentStrategy:"Development", capitalType:"LP - Small", dbSource:"KH", relationship:"", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c19", name:"Jonathan Lotter", company:"Appian Capital", companyId:"co21", email:"jlotter@appiancapital.com", emailVerification:"", phone:"(415) 999-1440", contactOwner:"", leadStatus:"", investmentStrategy:"", capitalType:"", dbSource:"TREP", relationship:"", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"Fund Manager/Allocator", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"", nextSteps:"", lastActivityDate:"", message:"" },
  { id:"c20", name:"Peter Savoie", company:"Ascentris", companyId:"co24", email:"peter.savoie@ascentris.co", emailVerification:"valid", phone:"(303) 882-5109", contactOwner:"Kyle Henrickson", leadStatus:"Need to Call", investmentStrategy:"", capitalType:"LP - Large, LP - Mid", dbSource:"KH", relationship:"", relationshipStrength:"", region:"", assetClass:"", ownership:"", institutional:"", familyOffice:"", retail:"", indirect:"", trepCapitalType:"", trepDealPriorOutreach:"", nextSteps:"Ascentris (3/4/2026) - Star...", lastActivityDate:"Mar 6, 2026", message:"" },
];

const SEED_DEALS: Deal[] = [
  { id:"d1", name:"Firm Overview", amount:null, closeDate:"05/31/2026", dealOwner:"Kyle Henrickson", createDate:"05/17/2026", stage:"Overviews", assetClass:"", location:"", dueDiligenceStatus:"Not started", expectedInvestmentAmount:null, contactIds:["c18","c19","c10"], attachments:["Timberline-Overview-031626.pdf"] },
  { id:"d2", name:"Verticals Overview", amount:null, closeDate:"05/17/2026", dealOwner:"Kyle Henrickson", createDate:"05/17/2026", stage:"Overviews", assetClass:"", location:"", dueDiligenceStatus:"", expectedInvestmentAmount:null, contactIds:["c10","c8"], attachments:[] },
  { id:"d3", name:"Plaza - Reno", amount:10000000, closeDate:"05/31/2026", dealOwner:"Kyle Henrickson", createDate:"05/17/2026", stage:"Deal Review", assetClass:"Retail", location:"Reno, NV", dueDiligenceStatus:"Not started", expectedInvestmentAmount:null, contactIds:["c11","c5"], attachments:[] },
  { id:"d4", name:"Embassy Suites - Austin", amount:8000000, closeDate:"05/17/2026", dealOwner:"Kyle Henrickson", createDate:"03/16/2026", stage:"Deal Review", assetClass:"Hotel", location:"Austin, TX", dueDiligenceStatus:"In progress", expectedInvestmentAmount:null, overdue:true, contactIds:["c16","c20","c18","c7","c15"], attachments:[] },
  { id:"d5", name:"Hotel Magdalena", amount:21000000, closeDate:"05/31/2026", dealOwner:"Kyle Henrickson", createDate:"03/17/2026", stage:"LOI Sent", assetClass:"Hotel", location:"Austin, TX", dueDiligenceStatus:"", expectedInvestmentAmount:null, contactIds:["c10","c11"], attachments:[] },
  { id:"d6", name:"Carpenter - Recap", amount:20000000, closeDate:"05/31/2026", dealOwner:"Kyle Henrickson", createDate:"03/17/2026", stage:"On Hold", assetClass:"Industrial/Storage", location:"Columbus, OH", dueDiligenceStatus:"Completed", expectedInvestmentAmount:null, contactIds:["c8","c9"], attachments:[] },
];

export class MemStorage implements IStorage {
  private contacts: Map<string, Contact>;
  private companies: Map<string, Company>;
  private deals: Map<string, Deal>;

  constructor() {
    this.contacts = new Map(SEED_CONTACTS.map(c => [c.id, c]));
    this.companies = new Map(SEED_COMPANIES.map(c => [c.id, c]));
    this.deals = new Map(SEED_DEALS.map(d => [d.id, d]));
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async updateContact(id: string, data: UpdateContactPayload): Promise<Contact | undefined> {
    const existing = this.contacts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.contacts.set(id, updated);
    return updated;
  }

  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    const id = "c_" + randomUUID();
    const newContact: Contact = { ...contact, id };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async updateDeal(id: string, data: UpdateDealPayload): Promise<Deal | undefined> {
    const existing = this.deals.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.deals.set(id, updated);
    return updated;
  }

  async createDeal(deal: Omit<Deal, "id">): Promise<Deal> {
    const id = "d_" + randomUUID();
    const newDeal: Deal = { ...deal, id };
    this.deals.set(id, newDeal);
    return newDeal;
  }
}

export const storage = new MemStorage();
