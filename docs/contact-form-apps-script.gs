/**
 * Spaces contact form -> Google Sheet.
 *
 * Setup (once):
 * 1. Create a Google Sheet for enquiries (in the Spaces Google account). Extensions > Apps Script. Paste this file.
 * 2. Optional: set NOTIFY_EMAIL below to get an email for every new enquiry.
 * 3. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy and authorise.
 * 4. Copy the Web app URL (ends in /exec) and set it as VITE_FORM_ENDPOINT in Vercel (Production), then redeploy the site.
 *    After editing this script later: Deploy > Manage deployments > Edit > Version: New version (the URL stays the same).
 *
 * The site sends: name, email, phone, area, type, stay, message, website (honeypot), page.
 */
const SHEET_NAME = 'Enquiries';
const NOTIFY_EMAIL = ''; // e.g. 'team@spaces-pt.com'; leave empty for no email
const HEADERS = ['Received', 'Name', 'Email', 'Phone', 'Area', 'Apartment', 'Interested in', 'Message', 'Page'];

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot: real people never see the "website" field. Pretend success so bots learn nothing.
  if (p.website) return json_({ ok: true });

  const v = (k, max) => clean_(p[k], max || 300);
  const row = [new Date(), v('name'), v('email'), v('phone'), v('area'), v('type'), v('stay'), v('message', 2000), v('page')];

  // Same rules as the site: a name and at least one way to reply.
  if (!row[1] || (!row[2] && !row[3])) return json_({ ok: false, error: 'missing_fields' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) {
    const body = HEADERS.slice(1).map((h, i) => h + ': ' + (row[i + 1] || '-')).join('\n');
    MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: 'New website enquiry: ' + row[1], body: body, replyTo: row[2] || undefined });
  }
  return json_({ ok: true });
}

// Trim, cap length, and neutralise spreadsheet formulas (a value starting with = + - @ would otherwise run as a formula).
function clean_(value, max) {
  const s = String(value == null ? '' : value).trim().slice(0, max);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
