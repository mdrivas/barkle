"use client";

import React from "react";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const sampleData = [
  { location: "New York", projects: 8, tasks: 15, teamMembers: 12 },
  { location: "London", projects: 6, tasks: 10, teamMembers: 8 },
  { location: "Tokyo", projects: 5, tasks: 8, teamMembers: 7 },
  { location: "Sydney", projects: 3, tasks: 5, teamMembers: 4 },
  { location: "Berlin", projects: 2, tasks: 4, teamMembers: 3 },
];

export default function DashboardPage() {
  const totalProjects = sampleData.reduce(
    (sum, item) => sum + item.projects,
    0,
  );
  const totalTasks = sampleData.reduce((sum, item) => sum + item.tasks, 0);
  const totalTeamMembers = sampleData.reduce(
    (sum, item) => sum + item.teamMembers,
    0,
  );

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="mb-2 text-lg font-semibold">Total Projects</h3>
          <p className="text-3xl font-bold">{totalProjects}</p>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-lg font-semibold">Active Tasks</h3>
          <p className="text-3xl font-bold">{totalTasks}</p>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-lg font-semibold">Team Members</h3>
          <p className="text-3xl font-bold">{totalTeamMembers}</p>
        </Card>
      </div>

      <Card className="mb-8 p-4">
        <h3 className="mb-4 text-lg font-semibold">Location Overview</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Team Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleData.map((row) => (
              <TableRow key={row.location}>
                <TableCell>{row.location}</TableCell>
                <TableCell>{row.projects}</TableCell>
                <TableCell>{row.tasks}</TableCell>
                <TableCell>{row.teamMembers}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
