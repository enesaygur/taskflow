import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Organization } from "../types/organization";
import { Link } from "react-router-dom";

function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const fetchOrganizations = async () => {
    const res = await api.get(`/organizations`);
    setOrganizations(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/organizations", { name });
    setName("");
    fetchOrganizations();
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Organizations</h1>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Organization name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded">
          Create
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {organizations.map((org) => (
          <li key={org.id}>
            <Link to={`/organizations/${org.id}/projects`}>
              {org.name}{" "}
              <span className="text-sm text-gray-500">({org.myRole})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Organizations;
