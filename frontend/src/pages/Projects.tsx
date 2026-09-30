import { Link, useParams } from "react-router-dom";
import type { Project } from "../types/project";
import React, { useEffect, useState } from "react";
import api from "../api/axios";

function Projects() {
  const { organizationId } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const fetchProjects = async () => {
    const res = await api.get(`/organizations/${organizationId}/projects`);
    setProjects(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [organizationId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/organizations/${organizationId}/projects`, { name });
    setName("");
    fetchProjects();
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Link to="/" className="text-sm text-gray-500">
        ← Organizasyonlar
      </Link>
      <h1 className="text-2xl font-bold mb-4 mt-2">Projects</h1>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />

        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Create
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              to={`/organizations/${organizationId}/projects/${project.id}`}
              className="block border p-3 rounded hover:bg-gray-50"
            >
              {project.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Projects;
