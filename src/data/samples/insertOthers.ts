/**
 * Insert sample data for the tables other than the units table
 */

import { Env } from '@/bindings'
// import { Env } from '../../bindings'
import moment from 'moment'
import { nanoid } from 'nanoid'
import getCurrentLine from 'get-current-line'

import { Util } from '../../util'

// Insert sample records include two important records:
// 1. Admin User: provides the email and password
// 2. A sample tenant: provides the phone no. and password
export const insertSampleOthers = async (
  env: Env,
  adminEmail: string,
  adminPwd: string,
) => {
  let stmts: string[]
  let pwdEnc: string
  let rst: D1Result
  let count = 0
  const userId = 'adminuserid123'
  const adminName = '<Estate Admin Name>'
  const adminPhone = '<Admin Phone no>'
  const tenantName = '<Tenant A>'
  const tenantPhone = '12223334444'
  const tenantEmail = 'simonho288@gmail.com'
  const tenantPwd = 'password'
  const date = new Date()
  const now = date.toISOString()
  const today = moment().format('YYYY-MM-DD')
  const date2 = new Date(date.getTime() + 48 * 60 * 60 * 1000)
  const date2day = `${date2.getFullYear()}-${date2.getMonth() + 1}-${date2.getDate()}`
  const date3 = new Date(date.getTime() + 168 * 60 * 60 * 1000) // amenity booking

  try {
    // Reset the Users table
    rst = await env.DB.exec('DELETE FROM Users')
    // pwdEnc = await Util.encryptString(adminPwd, env.USER_ENCRYPTION_KEY, 10001)
    pwdEnc = await Util.encryptString(adminPwd, env.USER_ENCRYPTION_KEY, Util.getRandomInt(101, 99999))
    stmts = Util.makeWorkableSql(`
INSERT INTO Users(id, dateCreated, name, language, email, password, tel, role, isValid, meta) VALUES(
    '${userId}',
    '${now}',
    '${adminName}',
    'en',
    '${adminEmail}',
    '${pwdEnc}',
    '${adminPhone}',
    'admin',
    1,
    '${JSON.stringify({ state: "ok", emailConfirmResendCnt: 0 })}'
  );
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Amenities table
    rst = await env.DB.exec('DELETE FROM Amenities')
    stmts = Util.makeWorkableSql(`
INSERT INTO Amenities(id, userId, dateCreated, name, details, photo, status, fee, currency, availableDays, bookingTimeBasic, timeBased, sectionBased, bookingAdvanceDays, autoCancelHours, contact, isRepetitiveBooking) VALUES(
    '34EflyDfS3vPWOle1fQzA',
    '${userId}',
    '${now}',
    '${JSON.stringify({ en: "Table Tennis" })}',
    '${JSON.stringify({ en: "<ul><li>For demo purpose only</li></ul>" })}',
    'https://f004.backblazeb2.com/file/vpms-hk/assets/sample_table_tennis.jpg',
    'open',
    30,
    'HKD',
    '${JSON.stringify({ mon: true, tue: true, wed: true, thu: false, fri: true, sat: true, sun: true })}',
    'time',
    '${JSON.stringify({ timeOpen: "09:00", timeClose: "20:00", timeMinimum: "30", timeMaximum: "60", timeIncrement: "30" })}',
    '${JSON.stringify([{ name: "Morning", begin: "08:00", end: "12:00" }, { name: "Afternoon", begin: "13:00", end: "16:00" }, { name: "Evening", begin: "17:00", end: "20:00" }])}',
    null,
    24,
    '${JSON.stringify({ email: { name: adminName, address: adminEmail }, whatsapp: { name: adminName, number: "111-222-3333" } })}',
    1);
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    stmts = Util.makeWorkableSql(`
INSERT INTO Amenities(id, userId, dateCreated, name, details, photo, status, fee, currency, availableDays, bookingTimeBasic, timeBased, sectionBased, bookingAdvanceDays, autoCancelHours, contact, isRepetitiveBooking) VALUES(
    'JO9nGmV2jjueUYU1V52LK',
    '${userId}',
    '${now}',
    '${JSON.stringify({ en: "Party Room" })}',
    '${JSON.stringify({ en: "<ul><li>For demo purpose only</li></ul>" })}',
    'https://f004.backblazeb2.com/file/vpms-hk/assets/sample_party_room.jpg',
    'open',
    10,
    'USD',
    '${JSON.stringify({ mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: true })}',
    'section',
    '${JSON.stringify({ timeOpen: "09:00", timeClose: "20:00", timeMinimum: "30", timeMaximum: "60", timeIncrement: "30" })}',
    '${JSON.stringify([{ name: "Morning", begin: "08:00", end: "12:00" }, { name: "Afternoon", begin: "13:00", end: "16:00" }, { name: "Evening", begin: "17:00", end: "20:00" }])}',
    null,
    null,
    '${JSON.stringify({ email: { name: adminName, address: adminEmail }, whatsapp: { name: adminName, number: "111-222-3333" } })}',
    0);
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Estates table
    rst = await env.DB.exec('DELETE FROM Estates')
    stmts = Util.makeWorkableSql(`
INSERT INTO Estates(id, userId, dateCreated, name, address, website, contact, langEntries, timezone, timezoneMeta, currency, subscriptionStatus, tenantApp, onlinePayments) VALUES(
    'aN2gsOUpMnzyC8CoxumSr',
    '${userId}',
    '${now}',
    '${JSON.stringify({ en: "Harbour View Garden Tower 3" })}',
    '${JSON.stringify({ en: "No.21 North Street, Kennedy Town, Hong Kong" })}',
    'https://www.example.com',
    '${JSON.stringify({ name: { en: adminName }, tel: adminPhone, email: adminEmail })}',
    'en',
    '8',
    '${JSON.stringify({ value: "China Standard Time", offset: 28800000, text: "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi" })}',
    'HKD',
    'trial',
    '${JSON.stringify({ estateImageApp: "https://f004.backblazeb2.com/file/vpms-hk/assets/tenantapp_default_estate_640x360.jpg", unitQrcodeSheetDspt: { en: "<u>Please scan this QR code to register</u>" } })}',
    '${JSON.stringify({ stripePublishableKey: null, stripeSecretKey: null })}');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Folders table
    rst = await env.DB.exec('DELETE FROM Folders')
    stmts = Util.makeWorkableSql(`
INSERT INTO Folders(id, userId, dateCreated, name, isPublic, status) VALUES(
    'wr37AwXnt1JJSQ3evcmUu',
    '${userId}',
    '${now}',
    '${JSON.stringify({ en: "Notices for residences" })}',
    1,
    'active');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Units table and insert 1 unit
    rst = await env.DB.exec('DELETE FROM Units')
    stmts = Util.makeWorkableSql(`
INSERT INTO Units(id, userId, type, block, floor, number) VALUES(
    'AprTvXkFWkxp6X765kfo3',
    '${userId}',
    'res', 'A', '1', '1');
INSERT INTO Units(id, userId, type, block, floor, number) VALUES(
      'wiJkuhpLS_rG0ZdT2TxjD',
      '${userId}',
      'car', 'A', 'B2', '1');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Tenants table
    rst = await env.DB.exec('DELETE FROM Tenants')
    pwdEnc = await Util.encryptString(tenantPwd, env.TENANT_ENCRYPTION_KEY, Util.getRandomInt(101, 99999))
    stmts = Util.makeWorkableSql(`
INSERT INTO Tenants(id, userId, dateCreated, name, password, phone, email, status, fcmDeviceToken, lastSignin, recType, meta) VALUES(
    '2dh71lyQgEC4dLJGm3T97',
    '${userId}',
    '${now}',
    '${tenantName}',
    '${pwdEnc}',
    '${tenantPhone}',
    '${tenantEmail}',
    1,
    null,
    null,
    0,
    '${JSON.stringify({})}');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      console.log('statement')
      console.log(stmts[i])
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Tenant Units table
    rst = await env.DB.exec('DELETE FROM TenantUnits')
    stmts = Util.makeWorkableSql(`
INSERT INTO TenantUnits(TenantId, UnitId, role) VALUES(
    '2dh71lyQgEC4dLJGm3T97',
    'AprTvXkFWkxp6X765kfo3',
    'owner');
INSERT INTO TenantUnits(TenantId, UnitId, role) VALUES(
      '2dh71lyQgEC4dLJGm3T97',
      'wiJkuhpLS_rG0ZdT2TxjD',
      'tenant');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the TenantAmenityBookings table
    rst = await env.DB.exec('DELETE FROM TenantAmenityBookings')
    stmts = Util.makeWorkableSql(`
INSERT INTO TenantAmenityBookings(id, userId, dateCreated, tenantId, amenityId, bookingNo, bookingTimeBasic, date, status, totalFee, currency, isPaid, autoCancelTime, timeSlots) VALUES(
    'bPua6f_M1zy6qRcy9GdPB',
    '${userId}',
    '${now}',
    '2dh71lyQgEC4dLJGm3T97',
    '34EflyDfS3vPWOle1fQzA',
    1,
    'time',
    '${today}',
    'pending',
    3,
    'HKD',
    0,
    null,
    '${JSON.stringify([{ name: null, from: "09:30", to: "10:00", fee: 3, section: null }])}');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Loops table
    // Ref: where titleId: flutter/utils.dart/constants()
    rst = await env.DB.exec('DELETE FROM Loops')
    stmts = Util.makeWorkableSql(`
INSERT INTO Loops(id, dateCreated, type, tenantId, title, url, meta) VALUES(
    'Ia3FqXFVBZ3330BFAUy8e',
    '${now}',
    'notice',
    '2dh71lyQgEC4dLJGm3T97',
    '${JSON.stringify({ en: "Notice: No water on <...>" })}',
    null,
    '${JSON.stringify({ senderName: '{"en":"senderName"}', titleId: 'mgrmtNotice', noticeId: 'mH4Aa9JMy99E7VTeqpXrU', audiences: '["residence","carpark"]', title: '{"en":"No water on <...>"}', issueDate: now })}');
INSERT INTO Loops(id, dateCreated, type, tenantId, title, url, meta) VALUES(
    '9xZHtfAEiM85BxZl5yIAT',
    '${now}',
    'marketplace',
    '2dh71lyQgEC4dLJGm3T97',
    '${JSON.stringify({ en: "Special Offer from 7-11 this week" })}',
    null,
    '${JSON.stringify({ senderName: '{"en":"senderName"}', titleId: 'newAdWithImage', audiences: '["residence","carpark"]', adId: 'b4K7av-Fy1m5juR0bvnb8', title: '{"en":"Special Offer from 7-11 this week"}', postDate: now })}');
INSERT INTO Loops(id, dateCreated, type, tenantId, title, url, meta) VALUES(
    'rrYBcxxyHRGJ9dRfHeBSD',
    '${now}',
    'amenBkg',
    '2dh71lyQgEC4dLJGm3T97',
    '${JSON.stringify({ en: "Reservation of Table Tennis on <TBD>" })}',
    null,
    '${JSON.stringify({ amenityId: '34EflyDfS3vPWOle1fQzA', senderName: '{"en":"senderName"}', titleId: 'newAmenityBooking', amenityName: '{"en":"Table Tennis"}', photo: 'https://f004.backblazeb2.com/file/vpms-hk/assets/sample_table_tennis.jpg', fee: 10, date: date3.toISOString(), bookingId: "bPua6f_M1zy6qRcy9GdPB", bookingNo: 1, status: 'pending', slots: [{ from: "09:00", to: "09:30" }], payBefore: date2.toISOString() })}');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Marketplaces table
    rst = await env.DB.exec('DELETE FROM Marketplaces')
    stmts = Util.makeWorkableSql(`
INSERT INTO Marketplaces(id, userId, dateCreated, title, dateStart, dateEnd, isHidden, adImage, commerceUrl, audiences) VALUES(
    'b4K7av-Fy1m5juR0bvnb8',
    '${userId}',
    '${now}',
    '${JSON.stringify({ en: "Special Offer from 7-11 this week" })}',
    '${today}',
    '${date2day}',
    0,
    'https://f004.backblazeb2.com/file/vpms-hk/assets/sample_marketplace_cht.jpg',
    null,
    '${JSON.stringify({ residence: { owner: true, tenant: true, occupant: false, agent: false }, carpark: null, shop: null })}');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    // Reset the Notices table
    rst = await env.DB.exec('DELETE FROM Notices')
    stmts = Util.makeWorkableSql(`
INSERT INTO Notices(id, userId, dateCreated, title, issueDate, audiences, folderId, isNotifySent, pdf) VALUES(
    'mH4Aa9JMy99E7VTeqpXrU',
    '${userId}',
    '${now}',
    '${JSON.stringify({ en: "No water on <...>" })}',
    '${today}',
    '${JSON.stringify({ residence: { owner: true, tenant: true, occupant: true, agent: true }, carpark: null, shop: null })}',
    'wr37AwXnt1JJSQ3evcmUu',
    0,
    'https://f004.backblazeb2.com/file/vpms-hk/directus/15f65053-5bb3-49d5-a81e-8ca3ea841a5b.pdf');
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }

    /*
    // Reset the Subscriptions table
    rst = await env.DB.exec('DELETE FROM Subscriptions')
    stmts = Util.makeWorkableSql(`
INSERT INTO Subscriptions(id, userId, dateCreated, currentStatus, notify, usageDeadline, trialPeriod) VALUES(
    'qC_C2seyC3eK7s3OItOe1',
    '${userId}',
    '${now}',
    'trial',
    '${JSON.stringify({ trial: { expired: true, soon1: true, soon2: true }, active: { expired: false, soon1: false, soon2: false } })}',
    1672560000000,
    '${JSON.stringify({ code: "trial", name: "Trial Period", date: 1672560000000, price: 0, usageIncluded: { value: 14, unit: "days" } })}'
  );
  `)
    for (let i = 0; i < stmts.length; ++i) {
      rst = await env.DB.exec(stmts[i])
      ++count
    }
    */

    return {
      success: true,
      message: `${count} records inserted`
    }
  } catch (ex) {
    Util.logException(ex)
    return { error: (ex as Error).message }
  }
}