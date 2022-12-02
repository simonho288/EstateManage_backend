-- Run with: wrangler d1 execute EstateMan --file ./createTables.sql

DROP TABLE IF EXISTS Users;
CREATE TABLE Users(
  id TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  tel TEXT,
  role TEXT NOT NULL,

  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS Estates;
CREATE TABLE Estates(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  contact TEXT, -- JSON: {name:{en},tel,email}
  langEntries TEXT,
  timezone TEXT NOT NULL,
  timezoneMeta TEXT,
  subscriptionStatus TEXT,
  tenantApp TEXT, -- JSON: {estateImageApp,unitQrcodeSheetDspt:{en}}
  onlinePayments TEXT, -- JSON {stripePubKey,stripeSecKey,currency}

  PRIMARY KEY(id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Units;
CREATE TABLE Units(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  type TEXT NOT NULL, -- res,car,shp
  block TEXT NOT NULL,
  floor TEXT NOT NULL,
  number TEXT NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Subscriptions;
CREATE TABLE Subscriptions(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  currentStatus TEXT NOT NULL,
  notify TEXT, -- JSON: {trial:{expired,soon1,soon2}, active:{expired,soon1,soon2}}
  usageDeadline TEXT,
  trialPeriod TEXT, -- JSON: {code,name,date,price,usageIncluded:{value,unit}}

  PRIMARY KEY (id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Amenities;
CREATE TABLE Amenities(
  id TEXT NOT NULL,
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
  bookingAdvanceDays TEXT,
  autoCancelHours INTEGER,
  contact TEXT, -- JSON: whatsapp,tel,email
  isRepetitiveBooking INTEGER,

  PRIMARY KEY (id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Folders;
CREATE TABLE Folders(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL, -- JSON: {en}
  isPublic INTEGER NOT NULL,
  status TEXT NOT NULL, -- active,deleted

  PRIMARY KEY (id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Notices;
CREATE TABLE Notices(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  title TEXT NOT NULL, -- JSON: {en}
  issueDate TEXT NOT NULL, -- YYYY-MM-DD
  audiences TEXT, -- JSON: {residence:{owner,tenant,occupant,agent},carpark...,shop...}
  folderId TEXT NOT NULL,
  isNotifySent INTEGER NOT NULL,
  pdf TEXT,

  PRIMARY KEY (id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Marketplaces;
CREATE TABLE Marketplaces(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  title TEXT NOT NULL, -- JSON: {en}
  dateStart TEXT,
  dateEnd TEXT,
  isExpired INTEGER NOT NULL,
  image TEXT,
  commerceUrl TEXT,
  audiences TEXT NOT NULL, -- JSON: {residence:{owner,tenant,occupant,agent},carpark...,shop...}

  PRIMARY KEY (id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Tenants;
CREATE TABLE Tenants(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status INTEGER NOT NULL, -- 1=active, 2=removed
  role TEXT NOT NULL, -- owner,tenant,occupant,agent
  -- unitId TEXT NOT NULL REFERENCES Units(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  unitId TEXT NOT NULL,
  fcmDeviceToken TEXT, -- Firebase messaging device token
  isApproveNotifySent INTEGER,
  lastSigned TEXT,
  recType INTEGER NOT NULL, -- 0=human,1=system,2=demo

  PRIMARY KEY (id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS TenantAmenityBookings;
CREATE TABLE TenantAmenityBookings(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  amenityId TEXT NOT NULL,
  title TEXT, -- JSON: {en...}
  bookingTimeBasic TEXT NOT NULL, -- time,section copy from Amenities
  date TEXT NOT NULL,
  status TEXT NOT NULL, -- pending,paid,expired
  totalFee REAL,
  currency TEXT, -- copy from Amanities
  isPaid INTEGER,
  autoCancelTime TEXT,
  timeSlots TEXT, -- [{name,from,to,fee,section}]

  PRIMARY KEY (id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE IF EXISTS Loops;
CREATE TABLE Loops(
  id TEXT NOT NULL,
  userId TEXT NOT NULL,
  dateCreated TEXT NOT NULL,
  type TEXT NOT NULL, -- notice,marketplace,amenBkg
  tenantId TEXT NOT NULL,
  title TEXT NOT NULL, -- JSON: {en...}
  url TEXT,
  meta TEXT, -- JSON: {noticeId,marketplaceId,tenAmenBkgId,...}

  PRIMARY KEY (id),
  FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);
