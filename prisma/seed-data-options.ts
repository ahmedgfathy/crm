import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dataOptions = [
  // Property types
  { category: "property_type", key: "apartment", labelEn: "Apartment", labelAr: "شقة", sortOrder: 1 },
  { category: "property_type", key: "villa", labelEn: "Villa", labelAr: "فيلا", sortOrder: 2 },
  { category: "property_type", key: "townhouse", labelEn: "Townhouse", labelAr: "تاون هاوس", sortOrder: 3 },
  { category: "property_type", key: "office", labelEn: "Office", labelAr: "مكتب", sortOrder: 4 },
  { category: "property_type", key: "retail", labelEn: "Retail", labelAr: "تجاري", sortOrder: 5 },
  { category: "property_type", key: "land", labelEn: "Land", labelAr: "أرض", sortOrder: 6 },
  { category: "property_type", key: "warehouse", labelEn: "Warehouse", labelAr: "مخزن", sortOrder: 7 },

  // Property status
  { category: "property_status", key: "available", labelEn: "Available", labelAr: "متاح", sortOrder: 1 },
  { category: "property_status", key: "under_contract", labelEn: "Under Contract", labelAr: "قيد التعاقد", sortOrder: 2 },
  { category: "property_status", key: "sold", labelEn: "Sold", labelAr: "مباع", sortOrder: 3 },
  { category: "property_status", key: "rented", labelEn: "Rented", labelAr: "مؤجر", sortOrder: 4 },

  // Lead status
  { category: "lead_status", key: "new", labelEn: "New", labelAr: "جديد", sortOrder: 1 },
  { category: "lead_status", key: "contacted", labelEn: "Contacted", labelAr: "تم التواصل", sortOrder: 2 },
  { category: "lead_status", key: "qualified", labelEn: "Qualified", labelAr: "مؤهل", sortOrder: 3 },
  { category: "lead_status", key: "unqualified", labelEn: "Unqualified", labelAr: "غير مؤهل", sortOrder: 4 },
  { category: "lead_status", key: "converted", labelEn: "Converted", labelAr: "تم التحويل", sortOrder: 5 },
  { category: "lead_status", key: "lost", labelEn: "Lost", labelAr: "مفقود", sortOrder: 6 },

  // Lead source
  { category: "lead_source", key: "website", labelEn: "Website", labelAr: "الموقع الإلكتروني", sortOrder: 1 },
  { category: "lead_source", key: "referral", labelEn: "Referral", labelAr: "إحالة", sortOrder: 2 },
  { category: "lead_source", key: "social_media", labelEn: "Social Media", labelAr: "وسائل التواصل", sortOrder: 3 },
  { category: "lead_source", key: "phone", labelEn: "Phone", labelAr: "هاتف", sortOrder: 4 },
  { category: "lead_source", key: "email", labelEn: "Email", labelAr: "بريد إلكتروني", sortOrder: 5 },
  { category: "lead_source", key: "walk_in", labelEn: "Walk-in", labelAr: "زيارة مباشرة", sortOrder: 6 },
  { category: "lead_source", key: "advertisement", labelEn: "Advertisement", labelAr: "إعلان", sortOrder: 7 },

  // Lead stage
  { category: "lead_stage", key: "prospect", labelEn: "Prospect", labelAr: "محتمل", sortOrder: 1 },
  { category: "lead_stage", key: "engaged", labelEn: "Engaged", labelAr: "مهتم", sortOrder: 2 },
  { category: "lead_stage", key: "qualified", labelEn: "Qualified", labelAr: "مؤهل", sortOrder: 3 },
  { category: "lead_stage", key: "proposal", labelEn: "Proposal", labelAr: "عرض", sortOrder: 4 },
  { category: "lead_stage", key: "negotiation", labelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5 },

  // Opportunity stage
  { category: "opportunity_stage", key: "qualified", labelEn: "Qualified", labelAr: "مؤهل", sortOrder: 1 },
  { category: "opportunity_stage", key: "proposal", labelEn: "Proposal", labelAr: "عرض", sortOrder: 2 },
  { category: "opportunity_stage", key: "negotiation", labelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 3 },
  { category: "opportunity_stage", key: "closed_won", labelEn: "Closed Won", labelAr: "تم الفوز", sortOrder: 4 },
  { category: "opportunity_stage", key: "closed_lost", labelEn: "Closed Lost", labelAr: "تم الخسارة", sortOrder: 5 },

  // Opportunity status
  { category: "opportunity_status", key: "open", labelEn: "Open", labelAr: "مفتوح", sortOrder: 1 },
  { category: "opportunity_status", key: "in_progress", labelEn: "In Progress", labelAr: "قيد التنفيذ", sortOrder: 2 },
  { category: "opportunity_status", key: "won", labelEn: "Won", labelAr: "فاز", sortOrder: 3 },
  { category: "opportunity_status", key: "lost", labelEn: "Lost", labelAr: "خسر", sortOrder: 4 },
  { category: "opportunity_status", key: "cancelled", labelEn: "Cancelled", labelAr: "ملغى", sortOrder: 5 },

  // Primary project status
  { category: "project_status", key: "planned", labelEn: "Planned", labelAr: "مخطط", sortOrder: 1 },
  { category: "project_status", key: "under_construction", labelEn: "Under Construction", labelAr: "تحت الإنشاء", sortOrder: 2 },
  { category: "project_status", key: "completed", labelEn: "Completed", labelAr: "مكتمل", sortOrder: 3 },
  { category: "project_status", key: "delivered", labelEn: "Delivered", labelAr: "تم التسليم", sortOrder: 4 },
  { category: "project_status", key: "on_hold", labelEn: "On Hold", labelAr: "معلق", sortOrder: 5 },

  // Primary unit type
  { category: "unit_type", key: "apartment", labelEn: "Apartment", labelAr: "شقة", sortOrder: 1 },
  { category: "unit_type", key: "villa", labelEn: "Villa", labelAr: "فيلا", sortOrder: 2 },
  { category: "unit_type", key: "townhouse", labelEn: "Townhouse", labelAr: "تاون هاوس", sortOrder: 3 },
  { category: "unit_type", key: "penthouse", labelEn: "Penthouse", labelAr: "بنتهاوس", sortOrder: 4 },
  { category: "unit_type", key: "duplex", labelEn: "Duplex", labelAr: "دوبلكس", sortOrder: 5 },
  { category: "unit_type", key: "studio", labelEn: "Studio", labelAr: "استوديو", sortOrder: 6 },

  // Primary unit status (reuse property_status)
  { category: "unit_status", key: "available", labelEn: "Available", labelAr: "متاح", sortOrder: 1 },
  { category: "unit_status", key: "reserved", labelEn: "Reserved", labelAr: "محجوز", sortOrder: 2 },
  { category: "unit_status", key: "sold", labelEn: "Sold", labelAr: "مباع", sortOrder: 3 },
  { category: "unit_status", key: "delivered", labelEn: "Delivered", labelAr: "تم التسليم", sortOrder: 4 },
];

async function main() {
  console.log("Seeding data options...");

  for (const option of dataOptions) {
    await prisma.dataOption.upsert({
      where: { category_key: { category: option.category, key: option.key } },
      update: {
        labelEn: option.labelEn,
        labelAr: option.labelAr,
        sortOrder: option.sortOrder,
      },
      create: option,
    });
  }

  console.log(`Seeded ${dataOptions.length} data options!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
