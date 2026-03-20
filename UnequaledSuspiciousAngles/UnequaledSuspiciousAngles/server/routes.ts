import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/contacts", async (_req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.get("/api/contacts/:id", async (req, res) => {
    const contact = await storage.getContact(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    res.json(contact);
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    const updated = await storage.updateContact(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Contact not found" });
    res.json(updated);
  });

  app.post("/api/contacts", async (req, res) => {
    const contact = await storage.createContact(req.body);
    res.status(201).json(contact);
  });

  app.get("/api/companies", async (_req, res) => {
    const companies = await storage.getCompanies();
    res.json(companies);
  });

  app.get("/api/companies/:id", async (req, res) => {
    const company = await storage.getCompany(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  });

  app.get("/api/deals", async (_req, res) => {
    const deals = await storage.getDeals();
    res.json(deals);
  });

  app.get("/api/deals/:id", async (req, res) => {
    const deal = await storage.getDeal(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  });

  app.patch("/api/deals/:id", async (req, res) => {
    const updated = await storage.updateDeal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Deal not found" });
    res.json(updated);
  });

  app.post("/api/deals", async (req, res) => {
    const deal = await storage.createDeal(req.body);
    res.status(201).json(deal);
  });

  return httpServer;
}
