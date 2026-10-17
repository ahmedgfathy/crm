export const MAX_IMPORT_CONTACTS = 50000;

function normalizeHeader(value) {
  return value.toLowerCase().replace(/^\uFEFF/, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isEmailHeader(header) {
  return /^(?:e mail|email)(?: \d+)? (?:value|address)$/.test(header)
    || ["email", "e mail", "email address", "e mail address"].includes(header);
}

function parseCsvRows(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delimiters = [",", ";", "\t"];
  let delimiter = ",";
  let bestCount = -1;
  for (const candidate of delimiters) {
    let count = 0;
    let quoted = false;
    for (let index = 0; index < firstLine.length; index += 1) {
      if (firstLine[index] === '"') {
        if (quoted && firstLine[index + 1] === '"') index += 1;
        else quoted = !quoted;
      } else if (!quoted && firstLine[index] === candidate) {
        count += 1;
      }
    }
    if (count > bestCount) {
      bestCount = count;
      delimiter = candidate;
    }
  }

  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("This CSV file has an unclosed quoted field.");
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function firstMatchingValue(values, headers, predicate) {
  for (let index = 0; index < headers.length; index += 1) {
    if (predicate(headers[index]) && values[index]?.trim()) return values[index].trim();
  }
  return "";
}

function csvContact(values, headers) {
  const get = (...names) => firstMatchingValue(values, headers, (header) => names.includes(header));
  const firstName = get("given name", "first name", "first");
  const middleName = get("additional name", "middle name");
  const lastName = get("family name", "last name", "surname");
  const name = get("name", "full name", "display name", "formatted name")
    || [firstName, middleName, lastName].filter(Boolean).join(" ");
  const emailValues = values.filter((_value, index) => isEmailHeader(headers[index]))
    .map((value) => value.trim()).filter(Boolean);
  const email = emailValues.find(isValidEmail) || "";
  const phone = firstMatchingValue(values, headers, (header) =>
    /(?:phone|telephone|mobile|fax|pager)/.test(header)
    && !/(?:type|label|country|extension)/.test(header));

  return {
    name,
    company: get("organization name", "company", "company name", "organization", "organisation"),
    email,
    invalidEmail: emailValues.length > 0 && !email,
    phone,
    status: "Lead",
    notes: get("notes", "note"),
  };
}

function parseCsv(text) {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error("This CSV file does not contain any contact rows.");
  const headers = rows[0].map(normalizeHeader);
  if (!headers.some((header) => ["name", "full name", "display name", "given name", "first name"].includes(header))) {
    throw new Error("Could not find a name column. Try a Google Contacts or Outlook contacts CSV export.");
  }

  const contacts = [];
  let skipped = 0;
  let invalidEmails = 0;
  for (const values of rows.slice(1)) {
    const { invalidEmail, ...contact } = csvContact(values, headers);
    if (!contact.name) {
      skipped += 1;
      continue;
    }
    if (invalidEmail) invalidEmails += 1;
    contacts.push(contact);
    if (contacts.length > MAX_IMPORT_CONTACTS) {
      throw new Error(`Imports are limited to ${MAX_IMPORT_CONTACTS.toLocaleString()} contacts per file.`);
    }
  }
  if (!contacts.length) throw new Error("No contacts with names were found in this CSV file.");
  return { contacts, skipped, invalidEmails };
}

function splitVCardValue(value, delimiter = ";") {
  const parts = [];
  let part = "";
  let escaped = false;
  for (const character of value) {
    if (escaped) {
      part += character;
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (character === delimiter) {
      parts.push(part);
      part = "";
    } else {
      part += character;
    }
  }
  if (escaped) part += "\\";
  parts.push(part);
  return parts;
}

function parseVCard(text) {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const cards = unfolded.split(/(?=BEGIN:VCARD\s*$)/im)
    .filter((card) => /BEGIN:VCARD/i.test(card));
  if (!cards.length) throw new Error("No vCard contacts were found in this file.");

  const contacts = cards.map((card) => {
    const properties = new Map();
    for (const line of card.split(/\r?\n/)) {
      const colon = line.indexOf(":");
      if (colon < 0) continue;
      const key = line.slice(0, colon).split(";")[0].split(".").pop().toUpperCase();
      if (!properties.has(key)) properties.set(key, []);
      properties.get(key).push(line.slice(colon + 1));
    }
    const value = (key) => (properties.get(key) || [])[0] || "";
    const formattedName = value("FN");
    const structuredName = splitVCardValue(value("N"));
    const name = formattedName || [
      structuredName[1],
      structuredName[2],
      structuredName[0],
      structuredName[3],
    ].map((part) => splitVCardValue(part, ",").join(",").replace(/\\([,;\\])/g, "$1"))
      .filter(Boolean).join(" ");
    const emailValues = (properties.get("EMAIL") || []).map((item) => item.trim()).filter(Boolean);
    const email = emailValues.find(isValidEmail) || "";
    const phone = (properties.get("TEL") || []).map((item) => item.trim()).find(Boolean) || "";
    const organization = value("ORG");
    const company = splitVCardValue(organization)[0] || "";
    const note = value("NOTE").replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
    return {
      name,
      company,
      email,
      invalidEmail: emailValues.length > 0 && !email,
      phone,
      status: "Lead",
      notes: note,
    };
  }).filter((contact) => contact.name.trim());

  if (!contacts.length) throw new Error("No vCards with a contact name were found in this file.");
  if (contacts.length > MAX_IMPORT_CONTACTS) {
    throw new Error(`Imports are limited to ${MAX_IMPORT_CONTACTS.toLocaleString()} contacts per file.`);
  }
  const invalidEmails = contacts.filter((contact) => contact.invalidEmail).length;
  return {
    contacts: contacts.map(({ invalidEmail: _invalidEmail, ...contact }) => contact),
    skipped: cards.length - contacts.length,
    invalidEmails,
  };
}

export function parseContactsFile(fileName, text) {
  const content = text.replace(/^\uFEFF/, "").trim();
  if (!content) throw new Error("This file is empty.");
  if (/\.vcf$/i.test(fileName) || /^BEGIN:VCARD/im.test(content)) return parseVCard(content);
  return parseCsv(content);
}
