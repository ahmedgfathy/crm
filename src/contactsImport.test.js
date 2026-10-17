import test from "node:test";
import assert from "node:assert/strict";
import { parseContactsFile } from "./contactsImport.js";

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
