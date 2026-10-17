import test from "node:test";
import assert from "node:assert/strict";
import { MAX_IMPORT_CONTACTS, parseContactsFile } from "./contactsImport.js";

test("imports Google Contacts CSV columns and combines names", () => {
  const csv = [
    "Name,Given Name,Additional Name,Family Name,Organization Name,E-mail 1 - Value,Phone 1 - Value,Notes",
    ',Alex,Jamie,Morgan,Northstar,"alex@example.test","+1 555 0100","First line, second line"',
  ].join("\r\n");

  assert.deepEqual(parseContactsFile("google.csv", csv), {
    contacts: [{
      name: "Alex Jamie Morgan",
      company: "Northstar",
      email: "alex@example.test",
      phone: "+1 555 0100",
      status: "Lead",
      notes: "First line, second line",
    }],
    skipped: 0,
    invalidEmails: 0,
  });
});

test("imports Outlook CSV and selects the first populated email and phone", () => {
  const csv = [
    "First Name,Last Name,E-mail Address,E-mail 2 Address,Company,Business Phone,Mobile Phone",
    "Sam,Lee,,sam@example.test,Contoso,,+1 555 0101",
  ].join("\n");

  const result = parseContactsFile("outlook.csv", csv);
  assert.equal(result.contacts[0].name, "Sam Lee");
  assert.equal(result.contacts[0].email, "sam@example.test");
  assert.equal(result.contacts[0].phone, "+1 555 0101");
  assert.equal(result.contacts[0].company, "Contoso");
});

test("keeps a contact with an invalid email and reports the email for review", () => {
  const result = parseContactsFile(
    "google.csv",
    "First Name,Last Name,E-mail 1 - Value,E-mail 2 - Value\nAlex,Morgan,invalid-email,alex@example.test\nSam,Lee,not-an-email,",
  );
  assert.equal(result.contacts[0].email, "alex@example.test");
  assert.equal(result.contacts[1].email, "");
  assert.equal(result.invalidEmails, 1);
});

test("imports multiple vCards with folded lines and escaped notes", () => {
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Morgan;Alex;Jamie;;",
    "FN:Alex Jamie Morgan",
    "ORG:Northstar;Product",
    "EMAIL;TYPE=INTERNET:alex@example.test",
    "TEL;TYPE=CELL:+1 555 0100",
    "NOTE:First line\\nsecond line",
    "END:VCARD",
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Sam Lee",
    "EMAIL:sam@example.test",
    "END:VCARD",
  ].join("\r\n");

  const result = parseContactsFile("contacts.vcf", vcf);
  assert.equal(result.contacts.length, 2);
  assert.equal(result.contacts[0].name, "Alex Jamie Morgan");
  assert.equal(result.contacts[0].company, "Northstar");
  assert.equal(result.contacts[0].notes, "First line\nsecond line");
  assert.equal(result.contacts[1].name, "Sam Lee");
});

test("supports semicolon-delimited CSV and skips rows with no name", () => {
  const csv = "Full Name;Company;E-mail Address\n\"Lee, Sam\";Example;sam@example.test\n;Ignored;ignored@example.test";
  const result = parseContactsFile("contacts.csv", csv);
  assert.equal(result.contacts.length, 1);
  assert.equal(result.contacts[0].name, "Lee, Sam");
  assert.equal(result.skipped, 1);
});

test("reports files without a recognizable contact name column", () => {
  assert.throws(
    () => parseContactsFile("contacts.csv", "Random,Value\nx,y"),
    /Could not find a name column/,
  );
});

test("reports malformed quoted CSV fields", () => {
  assert.throws(
    () => parseContactsFile("contacts.csv", 'Name,Company\n"Alex,Northstar'),
    /unclosed quoted field/,
  );
});

test("imports more than 10,000 contacts from one file", () => {
  const csv = `Name\n${Array.from({ length: 10001 }, (_, index) => `Contact ${index + 1}`).join("\n")}`;
  const result = parseContactsFile("large-contacts.csv", csv);
  assert.equal(result.contacts.length, 10001);
  assert.equal(result.contacts[0].name, "Contact 1");
  assert.equal(result.contacts.at(-1).name, "Contact 10001");
});

test("preserves provider phone values longer than 80 characters", () => {
  const phone = `+${"1".repeat(100)}`;
  const result = parseContactsFile(
    "google.csv",
    `Name,Phone 1 - Value\nAlex Morgan,${phone}`,
  );
  assert.equal(result.contacts[0].phone, phone);
});

test("enforces the 50,000-contact per-file limit", () => {
  const csv = `Name\n${Array.from({ length: MAX_IMPORT_CONTACTS + 1 }, (_, index) => `Contact ${index + 1}`).join("\n")}`;
  assert.throws(
    () => parseContactsFile("too-many-contacts.csv", csv),
    /Imports are limited to 50,000 contacts per file/,
  );
});
