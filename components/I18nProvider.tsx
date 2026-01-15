"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Locale = "en" | "ar";

type Dictionary = Record<string, string>;

type I18nContextValue = {
  locale: Locale;
  t: (key: string, fallback?: string) => string;
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = "ctb_locale";

const translations: Record<Locale, Dictionary> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.properties": "Properties",
    "nav.leads": "Leads",
    "nav.opportunity": "Opportunity",
    "nav.primary": "Primary",
    "nav.document": "Document",
    "nav.reports": "Reports",
    "nav.management": "Management",
    "nav.administration": "Administration",
    "action.translate": "Translate",
    "action.notifications": "Notifications",
    "action.mail": "Mail",
    "action.calendar": "Calendar",
    "action.logout": "Logout",
    "dashboard.pill": "Dashboard",
    "dashboard.title": "Welcome, Super Admin",
    "dashboard.subtitle": "You are signed in as {mobile}. RBAC via Prisma will wire here.",
    "dashboard.card.properties": "Properties",
    "dashboard.card.properties.desc": "Listings, pipelines, and billing.",
    "dashboard.card.leads": "Leads",
    "dashboard.card.leads.desc": "Capture, route, and qualify inbound.",
    "dashboard.card.project": "Project",
    "dashboard.card.project.desc": "Development and renovation workflows.",
    "dashboard.card.document": "Document",
    "dashboard.card.document.desc": "Contracts, approvals, and storage.",
    "dashboard.card.reports": "Reports",
    "dashboard.card.reports.desc": "Performance, commissions, and exports.",
    "dashboard.card.management": "Management",
    "dashboard.card.management.desc": "Admin, roles, and settings.",
    "reports.headline.leads": "Leads in pipeline",
    "reports.headline.leads.helper": "No budget captured",
    "reports.headline.properties": "Properties tracked",
    "reports.headline.properties.helper": "No pricing captured",
    "reports.headline.leadBudget": "Total lead budget",
    "reports.headline.leadBudget.helper": "Sum of all leads budget",
    "reports.headline.propertyValue": "Property value",
    "reports.headline.propertyValue.helper": "Sum of all asking prices",
    "reports.section.leadStatus": "Lead by status",
    "reports.section.leadCreation": "Lead creation",
    "reports.section.leadSources": "Lead sources",
    "reports.section.topBudgets": "Top budgets",
    "reports.section.totalBudget": "Total budget",
    "reports.section.averageBudget": "Average budget",
    "reports.section.propertyStatus": "Property status",
    "reports.section.propertyIntake": "Property intake",
    "reports.section.propertyMix": "Property mix",
    "reports.section.pricingCoverage": "Pricing coverage",
    "reports.section.totalAsk": "Total ask",
    "reports.section.averageAsk": "Average ask",
    "reports.section.highestType": "Highest type",
    "reports.section.openInventory": "Open inventory",
    "reports.helper.share": "Share",
    "reports.helper.lastMonths": "Last months",
    "reports.helper.noData": "No data yet.",

    "login.title": "Sign in",
    "login.subtitle": "Use your mobile number to access the dashboard.",
    "login.mobile": "Mobile number",
    "login.mobile.placeholder": "0100 277 8090",
    "login.password": "Password",
    "login.submit": "Sign in",
    "login.register": "Register",
    "login.forgot": "Forgot password?",
    "login.error.missing": "Please enter mobile and password.",
    "login.error.invalid": "Invalid credentials.",

    "profile.name": "Name",
    "profile.contact": "Contact",
    "profile.timezone": "Timezone",
    "profile.timezone.helper": "Calendar, reminders, and SLAs",
    "profile.profile": "Profile",
    "profile.profile.helper": "Personal details",
    "profile.fullName": "Full name",
    "profile.email": "Email",
    "profile.mobile": "Mobile",
    "profile.tz": "Timezone",
    "profile.save": "Save changes",
    "profile.security": "Security",
    "profile.security.helper": "Owner role",
    "profile.password": "Password",
    "profile.resetSoon": "Reset soon",
    "profile.mfa": "MFA",
    "profile.pending": "Pending",
    "profile.security.note": "Wire real actions when auth provider is ready.",
    "profile.notifications": "Notifications",
    "profile.notifications.helper": "Email & in-app",
    "profile.notifications.lead": "Lead assignment",
    "profile.notifications.document": "Document share",
    "profile.notifications.pipeline": "Pipeline change",
    "profile.notifications.billing": "Billing alerts",

    "properties.search.placeholder": "Search by title, description, region",
    "properties.filter.type.all": "All types",
    "properties.filter.status.all": "All status",
    "properties.type.apartment": "Apartment",
    "properties.type.villa": "Villa",
    "properties.type.townhouse": "Townhouse",
    "properties.type.office": "Office",
    "properties.type.retail": "Retail",
    "properties.type.land": "Land",
    "properties.type.warehouse": "Warehouse",
    "properties.status.available": "Available",
    "properties.status.underContract": "Under Contract",
    "properties.status.sold": "Sold",
    "properties.status.rented": "Rented",
    "properties.filter": "Filter",
    "properties.add": "Add new",
    "properties.empty": "No properties yet. Add your first one.",
    "properties.price.request": "Price on request",
    "properties.region.notset": "Region not set",
    "properties.drawer.title": "Add property",
    "properties.drawer.close": "Close",
    "properties.field.title": "Title *",
    "properties.field.type": "Type *",
    "properties.field.status": "Status",
    "properties.field.price": "Price",
    "properties.field.currency": "Currency",
    "properties.field.bedrooms": "Bedrooms",
    "properties.field.bathrooms": "Bathrooms",
    "properties.field.area": "Area",
    "properties.field.areaUnit": "Area unit",
    "properties.field.region": "Region",
    "properties.field.description": "Description",
    "properties.cancel": "Cancel",
    "properties.save": "Save property",
    "properties.discard.title": "Discard changes?",
    "properties.discard.body": "You have unsaved data. Are you sure you want to close the drawer?",
    "properties.discard.no": "No",
    "properties.discard.yes": "Yes",
  },
  ar: {
    "nav.dashboard": "لوحة التحكم",
    "nav.profile": "الملف الشخصي",
    "nav.properties": "العقارات",
    "nav.leads": "العملاء المحتملون",
    "nav.opportunity": "الفرص",
    "nav.primary": "الوحدات الرئيسية",
    "nav.document": "الوثائق",
    "nav.reports": "التقارير",
    "nav.management": "الإدارة",
    "nav.administration": "المدير العام",
    "action.translate": "ترجمة",
    "action.notifications": "التنبيهات",
    "action.mail": "البريد",
    "action.calendar": "التقويم",
    "action.logout": "تسجيل الخروج",
    "dashboard.pill": "لوحة التحكم",
    "dashboard.title": "مرحباً، المشرف العام",
    "dashboard.subtitle": "أنت مسجل كـ {mobile}. سيتم ربط صلاحيات RBAC لاحقاً.",
    "dashboard.card.properties": "العقارات",
    "dashboard.card.properties.desc": "القوائم، خطوط البيع، والفوترة.",
    "dashboard.card.leads": "العملاء المحتملون",
    "dashboard.card.leads.desc": "التقاط وتوجيه وتأهيل الطلبات الواردة.",
    "dashboard.card.project": "المشاريع",
    "dashboard.card.project.desc": "عمليات التطوير والتجديد.",
    "dashboard.card.document": "الوثائق",
    "dashboard.card.document.desc": "العقود، الموافقات، والتخزين.",
    "dashboard.card.reports": "التقارير",
    "dashboard.card.reports.desc": "الأداء والعمولات والتصدير.",
    "dashboard.card.management": "الإدارة",
    "dashboard.card.management.desc": "الصلاحيات والإعدادات.",
    "reports.headline.leads": "العملاء في المسار",
    "reports.headline.leads.helper": "لا توجد ميزانية مدخلة",
    "reports.headline.properties": "العقارات المتعقبة",
    "reports.headline.properties.helper": "لا توجد أسعار مدخلة",
    "reports.headline.leadBudget": "إجمالي ميزانية العملاء",
    "reports.headline.leadBudget.helper": "مجموع كل الميزانيات",
    "reports.headline.propertyValue": "قيمة العقارات",
    "reports.headline.propertyValue.helper": "مجموع أسعار الطلب",
    "reports.section.leadStatus": "حالة العملاء",
    "reports.section.leadCreation": "إنشاء العملاء",
    "reports.section.leadSources": "مصادر العملاء",
    "reports.section.topBudgets": "أعلى الميزانيات",
    "reports.section.totalBudget": "إجمالي الميزانية",
    "reports.section.averageBudget": "متوسط الميزانية",
    "reports.section.propertyStatus": "حالة العقار",
    "reports.section.propertyIntake": "تدفق العقارات",
    "reports.section.propertyMix": "مزيج العقارات",
    "reports.section.pricingCoverage": "تغطية الأسعار",
    "reports.section.totalAsk": "إجمالي السعر المطلوب",
    "reports.section.averageAsk": "متوسط السعر المطلوب",
    "reports.section.highestType": "أعلى فئة",
    "reports.section.openInventory": "المخزون المفتوح",
    "reports.helper.share": "النسبة",
    "reports.helper.lastMonths": "آخر الشهور",
    "reports.helper.noData": "لا توجد بيانات بعد",

    "login.title": "تسجيل الدخول",
    "login.subtitle": "استخدم رقم الموبايل للوصول إلى لوحة التحكم.",
    "login.mobile": "رقم الموبايل",
    "login.mobile.placeholder": "٠١٠٠ ٢٧٧ ٨٠٩٠",
    "login.password": "كلمة المرور",
    "login.submit": "دخول",
    "login.register": "تسجيل جديد",
    "login.forgot": "نسيت كلمة المرور؟",
    "login.error.missing": "من فضلك أدخل الموبايل وكلمة المرور.",
    "login.error.invalid": "بيانات الدخول غير صحيحة.",

    "profile.name": "الاسم",
    "profile.contact": "التواصل",
    "profile.timezone": "المنطقة الزمنية",
    "profile.timezone.helper": "التقويم والتنبيهات واتفاقيات الخدمة",
    "profile.profile": "الملف الشخصي",
    "profile.profile.helper": "البيانات الشخصية",
    "profile.fullName": "الاسم الكامل",
    "profile.email": "البريد الإلكتروني",
    "profile.mobile": "الموبايل",
    "profile.tz": "المنطقة الزمنية",
    "profile.save": "حفظ التغييرات",
    "profile.security": "الأمان",
    "profile.security.helper": "دور المالك",
    "profile.password": "كلمة المرور",
    "profile.resetSoon": "إعادة التعيين قريباً",
    "profile.mfa": "التحقق المتعدد",
    "profile.pending": "قيد الانتظار",
    "profile.security.note": "سيتم ربط الإجراءات عندما يتوفر مزود الهوية.",
    "profile.notifications": "الإشعارات",
    "profile.notifications.helper": "بريد وتطبيق",
    "profile.notifications.lead": "تعيين العملاء",
    "profile.notifications.document": "مشاركة الوثائق",
    "profile.notifications.pipeline": "تغيير المسار",
    "profile.notifications.billing": "تنبيهات الفوترة",

    "properties.search.placeholder": "ابحث بالعنوان أو الوصف أو المنطقة",
    "properties.filter.type.all": "كل الأنواع",
    "properties.filter.status.all": "كل الحالات",
    "properties.type.apartment": "شقة",
    "properties.type.villa": "فيلا",
    "properties.type.townhouse": "تاون هاوس",
    "properties.type.office": "مكتب",
    "properties.type.retail": "تجاري",
    "properties.type.land": "أرض",
    "properties.type.warehouse": "مخزن",
    "properties.status.available": "متاح",
    "properties.status.underContract": "قيد التعاقد",
    "properties.status.sold": "مباع",
    "properties.status.rented": "مؤجر",
    "properties.filter": "تصفية",
    "properties.add": "إضافة جديد",
    "properties.empty": "لا توجد عقارات بعد. أضف أول عقار.",
    "properties.price.request": "السعر عند الطلب",
    "properties.region.notset": "المنطقة غير محددة",
    "properties.drawer.title": "إضافة عقار",
    "properties.drawer.close": "إغلاق",
    "properties.field.title": "العنوان *",
    "properties.field.type": "النوع *",
    "properties.field.status": "الحالة",
    "properties.field.price": "السعر",
    "properties.field.currency": "العملة",
    "properties.field.bedrooms": "غرف النوم",
    "properties.field.bathrooms": "الحمامات",
    "properties.field.area": "المساحة",
    "properties.field.areaUnit": "وحدة المساحة",
    "properties.field.region": "المنطقة",
    "properties.field.description": "الوصف",
    "properties.cancel": "إلغاء",
    "properties.save": "حفظ العقار",
    "properties.discard.title": "إلغاء التغييرات؟",
    "properties.discard.body": "هناك بيانات غير محفوظة. هل تريد إغلاق النافذة؟",
    "properties.discard.no": "لا",
    "properties.discard.yes": "نعم",
  },
};

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: (key, fallback) => fallback ?? key,
  setLocale: () => undefined,
});

function applyLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  const dir = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
  document.documentElement.dataset.locale = locale;
  document.body.dir = dir;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as Locale | null;
    const next = stored === "ar" ? "ar" : "en";
    setLocale(next);
    applyLocale(next);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
    applyLocale(locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key: string, fallback?: string) => translations[locale][key] ?? fallback ?? key,
      setLocale,
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LocaleText({
  id,
  fallback,
  values,
  children,
}: {
  id: string;
  fallback?: string;
  values?: Record<string, string | number>;
  children?: React.ReactNode;
}) {
  const { t } = useI18n();
  const fallbackText = typeof children === "string" ? children : fallback;
  const text = t(id, fallbackText);
  if (!values) return <>{text}</>;
  const replaced = Object.entries(values).reduce((acc, [key, val]) => acc.replaceAll(`{${key}}`, String(val)), text);
  return <>{replaced}</>;
}

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const toggle = () => setLocale(locale === "en" ? "ar" : "en");
  const label = t("action.translate", locale === "en" ? "Translate" : "ترجمة");
  const icon = locale === "en" ? "🌐" : "🇸🇦";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm ${compact ? "" : "min-w-[48px]"}`}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
