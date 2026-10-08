import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { Organization } from "../types/organization";
import api from "../api/axios";

type BillingOrganization = Pick<Organization, "id" | "name" | "plan">;

function Billing() {
  const { organizationId } = useParams();
  const [searchParams] = useSearchParams();
  const [organization, setOrganization] = useState<BillingOrganization | null>(
    null,
  );
  const [error, setError] = useState("");

  const fetchOrganization = async () => {
    const res = await api.get(`/organizations/${organizationId}`);
    setOrganization(res.data);
  };

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const handleUpgrade = async (plan: "PRO" | "ENTERPRISE") => {
    setError("");
    try {
      const res = await api.post(
        `/organizations/${organizationId}/billing/checkout`,
        { plan },
      );
      window.location.href = res.data.url;
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not start checkout");
    }
  };

  const handleManage = async () => {
    setError("");
    try {
      const res = await api.post(
        `/organizations/${organizationId}/billing/portal`,
      );
      window.location.href = res.data.url;
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not open billing portal");
    }
  };
  if (!organization) return <div className="p-6 text-muted">Loading…</div>;
  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Link
        to={`/organizations/${organizationId}/settings`}
        className="text-sm text-muted hover:text-ink"
      >
        ← Organization Settings
      </Link>
      <h1 className="text-2xl font-bold mb-2">Billing</h1>

      {searchParams.get("success") && (
        <p className="text-accent text-sm mb-4">
          Subscription updated — it may take a few seconds to reflect here.
        </p>
      )}

      <p className="text-muted mb-6">
        Current plan:{" "}
        <span className="text-ink font-medium">{organization.plan}</span>
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex flex-col gap-3">
        {organization.plan === "FREE" ? (
          <>
            <button
              onClick={() => handleUpgrade("PRO")}
              className="border border-line rounded px-4 py-3 text-left hover:bg-column hover:cursor-pointer"
            >
              <span className="font-medium">Upgrade to Pro</span>
              <span className="block text-sm text-muted">
                $15/month, up to 15 members
              </span>
            </button>
            <button
              onClick={() => handleUpgrade("ENTERPRISE")}
              className="border border-line rounded px-4 py-3 text-left hover:bg-column hover:cursor-pointer"
            >
              <span className="font-medium">Upgrade to Enterprise</span>
              <span className="block text-sm text-muted">
                $50/month, unlimited members
              </span>
            </button>
          </>
        ) : (
          <button
            onClick={handleManage}
            className="border border-line rounded px-4 py-3 text-left hover:bg-column hover:cursor-pointer"
          >
            <span className="font-medium">Manage subscription</span>
            <span className="block text-sm text-muted">
              Change plan, update card, or cancel
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Billing;
