-- Run with:
-- wrangler d1 execute EstateMan_dev --file ./dbIndexes.sql

CREATE INDEX idx_users_email on Users (email);
CREATE INDEX idx_estates_userid on Estates (userId);
CREATE INDEX idx_units_userid on Units (userId);
CREATE INDEX idx_subscriptions_userid on Subscriptions (userId);
CREATE INDEX idx_amenities_userid on Amenities (userId);
CREATE INDEX idx_folders_userid on Folders (userId);
CREATE INDEX idx_notices_userid on Notices (userId);
CREATE INDEX idx_marketplaces_userid on Marketplaces (userId);
CREATE INDEX idx_tenants_userid on Tenants (userId);
CREATE INDEX idx_tenants_unitid on Tenants (unitId);
CREATE INDEX idx_tenants_phone on Tenants (phone);
CREATE INDEX idx_tenants_email on Tenants (email);
CREATE INDEX idx_tenamenbkgs_userid on TenantAmenityBookings (userId);
CREATE INDEX idx_tenamenbkgs_tenantid on TenantAmenityBookings (tenantId);
CREATE INDEX idx_tenamenbkgs_amenityid on TenantAmenityBookings (amenityId);
CREATE INDEX idx_tenamenbkgs_date on TenantAmenityBookings (date);
CREATE INDEX idx_loops_userid on Loops (userId);
CREATE INDEX idx_loops_tenantid on Loops (tenantId);
