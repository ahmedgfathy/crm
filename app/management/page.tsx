import { redirect } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { getSession } from "../../lib/auth";
import ManagementClient, { ManagementData } from "./ManagementClient";

export default async function ManagementPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data: ManagementData = {
    headcount: 18,
    newJoiners: 3,
    openRoles: 2,
    onboarding: [
      { title: "Account + devices", owner: "IT", due: "Day 1", status: "Done", pillar: "Systems" },
      { title: "Security + compliance", owner: "IT", due: "Day 2", status: "In progress", pillar: "Process" },
      { title: "Benefits & payroll", owner: "HR", due: "Day 3", status: "In progress", pillar: "People" },
      { title: "Product walkthrough", owner: "PM", due: "Week 1", status: "Not started", pillar: "Process" },
      { title: "Shadow customer calls", owner: "Sales", due: "Week 2", status: "Not started", pillar: "People" },
      { title: "First OKRs drafted", owner: "Manager", due: "Week 3", status: "Not started", pillar: "Process" },
      { title: "Ship first improvement", owner: "Manager", due: "Week 4", status: "Not started", pillar: "Systems" },
    ],
    roles: [
      {
        name: "Sales Manager",
        reportsTo: "VP Revenue",
        goals: [
          "Ramp reps to quota by week 6",
          "Implement weekly pipeline reviews",
          "Maintain hygiene: stage, notes, next steps",
        ],
      },
      {
        name: "Operations Manager",
        reportsTo: "COO",
        goals: [
          "Codify SOPs for onboarding and procurement",
          "Own approvals matrix (spend, hiring, access)",
          "Publish weekly metrics: cycle time, SLA, incidents",
        ],
      },
      {
        name: "People Manager",
        reportsTo: "COO",
        goals: [
          "Run onboarding ceremonies and buddy program",
          "Close open roles and keep hiring board fresh",
          "Ensure policies are acknowledged and stored",
        ],
      },
    ],
    policies: [
      { title: "PTO & leave", summary: "Standard accrual, public holidays mirrored, emergency leave allowed." },
      { title: "Security & devices", summary: "MFA required, encrypted devices, quarterly access reviews." },
      { title: "Spending & approvals", summary: "Pre-approve over 10k EGP, receipts within 48h, monthly audits." },
      { title: "Communications", summary: "Decisions in writing, meeting notes shared within 24h." },
    ],
  };

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center gap-2">
        <p className="pill text-xs">Management</p>
        <p className="muted text-sm">Onboarding, roles, policies, and manager rhythm.</p>
      </div>

      <ManagementClient data={data} />
    </DashboardShell>
  );
}
