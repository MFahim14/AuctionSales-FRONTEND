"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@/compat/router";
import { listUsers } from "../../api/users";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Input } from "../../components/Input";
import { Pill } from "../../components/Pill";
import { Spinner } from "../../components/Spinner";
import { Table, type Column } from "../../components/Table";
import { InviteUserModal } from "../../features/users/InviteUserModal";
import { UserEditModal } from "../../features/users/UserEditModal";
import { paths } from "../../routes/paths";
import type { PublicUser } from "../../types/api";
import { UserCards } from "./UserCards";

export function UserListPage() {
  const users = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const inviteOpen = location.pathname === paths.adminInvite;
  const editUserId = inviteOpen ? undefined : userId;
  const rows = useMemo(() => {
    const all = users.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return all;
    }
    return all.filter(
      (user) =>
        user.email?.toLowerCase().includes(q) ||
        user.name?.toLowerCase().includes(q) ||
        user.phoneNumber?.toLowerCase().includes(q),
    );
  }, [users.data, query]);

  const columns: Array<Column<PublicUser>> = [
    { key: "email", header: "Email", cell: (row) => row.email },
    { key: "name", header: "Name", cell: (row) => row.name || "—" },
    { key: "phoneNumber", header: "Phone", cell: (row) => row.phoneNumber || "—" },
    { key: "role", header: "Role", cell: (row) => row.role },
    {
      key: "active",
      header: "Active",
      cell: (row) => (row.isActive ? <Pill tone="success">Yes</Pill> : <Pill tone="danger">No</Pill>),
    },
    { key: "cap", header: "Cap", className: "tabular", cell: (row) => `${row.activeWatchlistCount ?? 0} / ${row.watchlistCap}` },
  ];

  function closeOverlay() {
    navigate(paths.adminUsers);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">Users</h1>
        <Button onClick={() => navigate(paths.adminInvite)}>Invite</Button>
      </div>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search email or name"
        aria-label="Search users"
      />
      {users.isLoading ? <Spinner /> : null}
      {users.error ? (
        <Card>
          <p className="text-sm text-danger">{users.error.message}</p>
          <Button className="mt-3" variant="secondary" onClick={() => void users.refetch()}>
            Retry
          </Button>
        </Card>
      ) : null}
      {!users.isLoading && rows.length === 0 ? <EmptyState>No users match.</EmptyState> : null}
      {rows.length > 0 ? (
        <>
          <div className="lg:hidden">
            <UserCards rows={rows} onOpen={(row) => navigate(paths.adminUser(row.userId))} />
          </div>
          <div className="hidden min-w-0 lg:block">
            <Table
              columns={columns}
              rows={rows}
              rowKey={(row) => row.userId}
              onRowClick={(row) => navigate(paths.adminUser(row.userId))}
            />
          </div>
        </>
      ) : null}
      <InviteUserModal open={inviteOpen} onClose={closeOverlay} />
      {editUserId ? <UserEditModal userId={editUserId} onClose={closeOverlay} /> : null}
    </div>
  );
}
