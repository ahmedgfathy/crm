import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DashboardShell from "../../components/DashboardShell";
import { LocaleText } from "../../components/I18nProvider";
import { getSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import ProfileClient, { ProfileFormState } from "./ProfileClient";

async function saveProfileAction(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  "use server";
  const session = await getSession();
  if (!session) return { ok: false, message: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const mobile = (formData.get("mobile") as string)?.trim();
  const timezone = (formData.get("timezone") as string)?.trim() || "UTC";

  if (!email || !mobile) return { ok: false, message: "Email and mobile are required" };

  try {
    if (session.userId) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { name: name || null, email, mobile, timezone },
      });
    } else {
      await prisma.user.upsert({
        where: { mobile },
        update: { name: name || null, email, timezone },
        create: {
          name: name || "Owner",
          email,
          mobile,
          timezone,
          role: session.role || "owner",
          status: "ACTIVE",
        },
      });
    }
    revalidatePath("/profile");
    return { ok: true, message: "Profile saved" };
  } catch (err) {
    return { ok: false, message: "Failed to save" };
  }
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let user = session.userId
    ? await prisma.user.findUnique({ where: { id: session.userId } })
    : await prisma.user.findFirst({ where: { mobile: session.mobile } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Owner",
        email: "owner@contaboo.com",
        mobile: session.mobile,
        role: session.role || "owner",
        status: "ACTIVE",
        timezone: "Africa/Cairo",
      },
    });
  }

  const profile = {
    name: user.name || "Owner",
    email: user.email,
    mobile: user.mobile ?? session.mobile,
    role: user.role || "Owner",
    timezone: user.timezone || "Africa/Cairo",
  };

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="pill"><LocaleText id="nav.profile">Profile</LocaleText></p>
          <h1 className="text-3xl font-bold text-white"><LocaleText id="nav.profile">Profile</LocaleText></h1>
          <p className="muted text-sm">Single-company setup: IT admin manages users, roles, and permissions. Keep your contact, timezone, and notifications updated.</p>
        </div>

        <ProfileClient data={profile} saveProfileAction={saveProfileAction} />
      </div>
    </DashboardShell>
  );
}
