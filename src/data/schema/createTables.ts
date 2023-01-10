/**
 * Create D1 tables & indexes
 */

import { Env } from '../../bindings'
import { Util } from '../../util'

const CREATE_TABLES_SQL = `
DROP TABLE IF EXISTS Users;
CREATE TABLE Users(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  tel TEXT,
  role TEXT NOT NULL, -- admin,member
  isValid INTEGER NOT NULL, -- 0=not, 1=yes
  meta TEXT -- JSON: { state(pending,frozen),lastConfirmTime,emailConfirmResendCnt,emailChangeConfirmCode,newEmailAddress }
);

DROP TABLE IF EXISTS Estates;
CREATE TABLE Estates(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  website TEXT,
  contact TEXT, -- JSON: {name:{en},tel,email}
  langEntries TEXT,
  timezone TEXT NOT NULL,
  timezoneMeta TEXT,
  currency TEXT,
  subscriptionStatus TEXT,
  tenantApp TEXT, -- JSON: {estateImageApp,unitQrcodeSheetDspt:{en}}
  onlinePayments TEXT, -- JSON {stripePubKey,stripeSecKey}

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Units;
CREATE TABLE Units(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL, -- res,car,shp
  block TEXT NOT NULL,
  floor TEXT NOT NULL,
  number TEXT NOT NULL,

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Subscriptions;
CREATE TABLE Subscriptions(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  currentStatus TEXT NOT NULL,
  notify TEXT, -- JSON: {trial:{expired,soon1,soon2}, active:{expired,soon1,soon2}}
  usageDeadline TEXT,
  trialPeriod TEXT, -- JSON: {code,name,date,price,usageIncluded:{value,unit}}

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Amenities;
CREATE TABLE Amenities(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL, -- JSON: {en...}
  details TEXT, -- JSON: {en,...}
  photo TEXT,
  status TEXT NOT NULL, -- open,maintain,removed
  fee REAL,
  currency TEXT NOT NULL,
  availableDays TEXT NOT NULL, -- JSON: {mon,tue,wed,thu,fri,sat,sun}
  bookingTimeBasic TEXT NOT NULL, -- time,section
  timeBased TEXT, -- JSON: timeOpen,timeClose,timeMinimum,timeMaximum,timeIncrement
  sectionBased TEXT, --- JSON: [{name,begin,end}]
  bookingAdvanceDays INTEGER,
  autoCancelHours INTEGER,
  contact TEXT, -- JSON: whatsapp,tel,email
  isRepetitiveBooking INTEGER,

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Folders;
CREATE TABLE Folders(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL, -- JSON: {en}
  isPublic INTEGER NOT NULL,
  status TEXT NOT NULL, -- active,deleted

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Notices;
CREATE TABLE Notices(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  title TEXT NOT NULL, -- JSON: {en}
  issueDate TEXT NOT NULL, -- YYYY-MM-DD
  audiences TEXT, -- JSON: {residence:{owner,tenant,occupant,agent},carpark...,shop...}
  folderId TEXT NOT NULL,
  isNotifySent INTEGER NOT NULL,
  pdf TEXT,

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Marketplaces;
CREATE TABLE Marketplaces(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  title TEXT NOT NULL, -- JSON: {en}
  dateStart TEXT,
  dateEnd TEXT,
  isHidden INTEGER NOT NULL,
  audiences TEXT NOT NULL, -- JSON: {residence:{owner,tenant,occupant,agent},carpark...,shop...}
  adImage TEXT,
  commerceUrl TEXT,

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Tenants;
CREATE TABLE Tenants(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  status INTEGER NOT NULL, -- 0=pending, 1=active, 2=suspended
  fcmDeviceToken TEXT, -- Firebase messaging device token
  lastSignin TEXT,
  recType INTEGER NOT NULL, -- 0=human,1=system,2=demo
  meta TEXT NOT NULL, -- JSON: {emailChangeConfirmCode,...}

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS TenantUnits;
CREATE TABLE TenantUnits(
  tenantId TEXT NOT NULL,
  unitId TEXT NOT NULL,
  role TEXT NOT NULL, -- owner,tenant,occupant,agent

  PRIMARY KEY(tenantId, UnitId),
  FOREIGN KEY(tenantId) REFERENCES Tenants(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY(unitId) REFERENCES Units(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS TenantAmenityBookings;
CREATE TABLE TenantAmenityBookings(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  amenityId TEXT NOT NULL,
  bookingNo INTEGER NOT NULL,
  bookingTimeBasic TEXT NOT NULL, -- time,section copy from Amenities
  date TEXT NOT NULL,
  status TEXT NOT NULL, -- pending,expired,ready
  totalFee REAL,
  currency TEXT, -- copy from Amanities
  isPaid INTEGER,
  autoCancelTime TEXT,
  timeSlots TEXT, -- [{name,from,to,fee,section}]

  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY(tenantId) REFERENCES Tenants(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY(amenityId) REFERENCES Amenities(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Loops;
CREATE TABLE Loops(
  id TEXT NOT NULL UNIQUE PRIMARY KEY,
  dateCreated TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  type TEXT NOT NULL, -- notice,marketplace,amenBkg
  title TEXT NOT NULL, -- JSON: {en...}
  url TEXT,
  meta TEXT, -- JSON:
    -- senderName: ''
    -- titleId: tenantRequestAccess,newAdWithImage,newAmenityBooking,managementNotice,managementReceipt,amenityBkgConfirmed,amenityBkgCancelled
    -- noticeId,marketplaceId,tenAmenBkgId
    -- when titleId == newAmenityBooking: amenityId,amenityName,photo,fee,date,bookingId,bookingNo,status(pending|confirmed|cancelled),slots[timeBegin&timeEnd],payBefore
    -- when titleId == amenityBkgConfirmed: amenityId,amenityName,photo,totalFee,date,bookingId,bookingNo,status(pending|confirmed|cancelled),slots[timeBegin&timeEnd],isPaid
    -- when titleId == amenityBkgCancelled: amenityId,amenityName,photo,totalFee,date,bookingId,bookingNo,status(pending|confirmed|cancelled),slots[timeBegin&timeEnd,payBefore
    -- when titleId == mgrmtNotice: audiences(residence,carpark,shop,owner,tenant,occupant,agent),noticeId,title,issueDate
    -- when titleId == newAdWithImage: audiences(residence,carpark,shop,owner,tenant,occupant,agent),adId,title,postDate
    -- when titleId == reqAccess: <TODO>
    -- when titleId == mgrmReceipt: unit,unitType,month,paidRec

  FOREIGN KEY(tenantId) REFERENCES Tenants(id) ON DELETE CASCADE ON UPDATE NO ACTION
);
`

const CREATE_INDEXES_SQL = `
CREATE INDEX idx_users_email on Users (email);
CREATE INDEX idx_estates_userid on Estates (userId);
CREATE INDEX idx_units_userid on Units (userId);
CREATE INDEX idx_subscriptions_userid on Subscriptions (userId);
CREATE INDEX idx_amenities_userid on Amenities (userId);
CREATE INDEX idx_folders_userid on Folders (userId);
CREATE INDEX idx_notices_userid on Notices (userId);
CREATE INDEX idx_marketplaces_userid on Marketplaces (userId);
CREATE INDEX idx_tenants_userid on Tenants (userId);
CREATE INDEX idx_tenants_phone on Tenants (phone);
CREATE INDEX idx_tenants_email on Tenants (email);
CREATE INDEX idx_tenantunits_role on TenantUnits (role);
CREATE INDEX idx_tenamenbkgs_tenantid on TenantAmenityBookings (tenantId);
CREATE INDEX idx_tenamenbkgs_amenityid on TenantAmenityBookings (amenityId);
CREATE INDEX idx_tenamenbkgs_date on TenantAmenityBookings (date);
CREATE INDEX idx_tenamenbkgs_userid on TenantAmenityBookings (userId);
CREATE INDEX idx_tenamenbkgs_status on TenantAmenityBookings (status);
CREATE INDEX idx_loops_tenantid on Loops (tenantId);
`

export const createTables = async (env: Env) => {
  let sql: string
  let rst: D1Result

  try {
    // Create tables
    let tables = 0, indexes = 0
    let stmts = Util.makeWorkableSql(CREATE_TABLES_SQL)
    // console.log(stmts)
    for (let i = 0; i < stmts.length; ++i) {
      let stmt = stmts[i]
      rst = await env.DB.exec(stmt)
      if (stmt.startsWith('CREATE TABLE'))
        ++tables
    }

    // Create indexes
    stmts = Util.makeWorkableSql(CREATE_INDEXES_SQL)
    // console.log(stmts)
    for (let i = 0; i < stmts.length; ++i) {
      let stmt = stmts[i]
      rst = await env.DB.exec(stmt)
      if (stmt.startsWith('CREATE INDEX'))
        ++indexes
    }

    return {
      message: `${tables} tables & ${indexes} indexes created successfully`
    }
  } catch (ex) {
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return { error: (ex as Error).message }
  }
}