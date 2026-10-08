import { Link, useParams } from "react-router-dom";
import type { Member } from "../types/member";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function OrganizationSettings() {
  const { organizationId } = useParams();
  const { userId } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/organizations/${organizationId}/members`);
      setMembers(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const myMembership = members.find((m) => m.userId === userId);
  const canInvite =
    myMembership?.role === "OWNER" || myMembership?.role === "ADMIN";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess(false);

    try {
      await api.post(`/organizations/${organizationId}/invites`, {
        email,
        role,
      });
      setEmail("");
      setInviteSuccess(true);

      setTimeout(() => {
        setInviteSuccess(false);
      }, 3000);
    } catch (err: any) {
      setInviteError(err.response?.data?.error || "Invite not sent");
    }
  };
  if (loading) return <div className="p-6 text-muted">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Link
        to={`/organizations/${organizationId}/projects`}
        className="text-sm text-muted hover:text-ink"
      >
        ← Projects
      </Link>

      <h1 className="text-2xl font-bold mb-6">Organization Settings </h1>
      <Link
        to={`/organizations/${organizationId}/billing`}
        className="text-sm text-accent"
      >
        Billing →
      </Link>
      <h2 className="font-semibold mb-3">Members</h2>

      <ul className="flex flex-col gap-2 mb-8">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between border border-line rounded px-3 py-2"
          >
            <span className="text-sm">{m.user.email}</span>
            <span className="text-xs text-muted">{m.role}</span>
          </li>
        ))}
      </ul>

      {canInvite && (
        <>
          <h2 className="font-semibold mb-3">Invite a member</h2>
          {inviteError && (
            <p className="text-sm text-red-600 mb-2">{inviteError}</p>
          )}
          {inviteSuccess && (
            <p className="text-sm text-accent mb-2">Invite sent.</p>
          )}

          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-line rounded px-2 py-1.5 text-sm flex-1"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
              className="border border-line rounded px-2 py-1.5 text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-accent text-white text-sm px-3 rounded"
            >
              Invite
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default OrganizationSettings;
