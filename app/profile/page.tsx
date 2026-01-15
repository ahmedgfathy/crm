import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = {
    name: "Super Admin",
    email: "owner@contaboo.com",
    mobile: session.mobile,
    role: "Owner",
    timezone: "Africa/Cairo",
  };

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-2">
        <p className="pill text-xs">Profile</p>
        <p className="muted text-sm">Update your contact, timezone, and notifications.</p>
      </div>

      <ProfileClient data={profile} />
    </DashboardShell>
  );
}
