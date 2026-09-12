-- =============================================
-- SPRAT Seed Data — Migration 003
-- Populates taxonomy categories and subject classifications
-- from the SRS (FR-GSM 1, sections c and d)
-- =============================================

-- Taxonomy: Protection subcategories
INSERT INTO taxonomy_categories (parent_category, name) VALUES
  ('Protection', 'Notice/Awareness'),
  ('Protection', 'Choice/Consent'),
  ('Protection', 'Security/Integrity'),
  ('Protection', 'Access/Participation'),
  ('Protection', 'Enforcement/Redress')
ON CONFLICT (name) DO NOTHING;

-- Taxonomy: Vulnerability subcategories
INSERT INTO taxonomy_categories (parent_category, name) VALUES
  ('Vulnerability', 'Information Monitoring'),
  ('Vulnerability', 'Information Aggregation'),
  ('Vulnerability', 'Information Storage'),
  ('Vulnerability', 'Information Transfer'),
  ('Vulnerability', 'Information Collection'),
  ('Vulnerability', 'Information Personalization'),
  ('Vulnerability', 'Contact')
ON CONFLICT (name) DO NOTHING;

-- Subject classifications (from FR-GSM 1d and appendix)
INSERT INTO subject_classifications (name) VALUES
  ('Unclassified'),
  ('Business Aggregation'),
  ('Browsing Pattern/Site Usage'),
  ('CC Information'),
  ('Children'),
  ('Customer Information (CI)'),
  ('Contacting Customer'),
  ('Contact Institutions'),
  ('Cookies/Web bugs'),
  ('Customer System Information'),
  ('Customer Aggregation'),
  ('General Information'),
  ('General User Preference'),
  ('Identity Theft/Fraud'),
  ('Law (HIPAA, COPPA, GLBA)'),
  ('Liability/Responsibility'),
  ('OPT in/out preferences'),
  ('Personal Financial Information (PFI)'),
  ('Personal Health Information (PHI)'),
  ('Personally Identifiable Information (PII)'),
  ('PFI/PHI/PII Usage'),
  ('Policies/Procedures'),
  ('PP/ToU'),
  ('Security Access')
ON CONFLICT (name) DO NOTHING;
