"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/userType";
import { motion } from "framer-motion";
import { PersonIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

export const userColumns = (
  openEditDialog: (user: User) => void,
  handleDeleteUser: (id: string) => void,
  deleteConfirm: string | null
): ColumnDef<User>[] => [
  {
    accessorKey: "user",
    header: () => (
      <span className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        User
      </span>
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center px-6 py-4">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <PersonIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => (
      <span className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Role
      </span>
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span
          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.role === "superadmin"
              ? "bg-purple-100 text-purple-800"
              : user.role.includes("department")
              ? "bg-blue-100 text-blue-800"
              : "bg-teal-100 text-teal-800"
          }`}
        >
          {user.role === "superadmin"
            ? "Super Admin"
            : user.role.includes("department")
            ? "Department Admin"
            : "Market Admin"}
        </span>
      );
    },
  },
  {
    accessorKey: "assignment",
    header: () => (
      <span className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Assign
      </span>
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="px-6 py-4">
          <div className="text-sm text-gray-900">
            {user.assignedTo?.name ?? "-"}
          </div>
          <div className="text-sm text-gray-500 capitalize">
            {user.assignedToType?.toLowerCase()}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Status
      </span>
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span
          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.active ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <span className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </span>
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex space-x-2 px-6 py-4">
          <button
            className="p-2 rounded-md hover:bg-blue-100 text-blue-600 transition-colors"
            onClick={() => openEditDialog(user)}
          >
            <Pencil2Icon className="w-4 h-4" />
          </button>
          <button
            className={`p-2 rounded-md transition-colors ${
              deleteConfirm === user._id
                ? "bg-red-500 text-white"
                : "hover:bg-red-100 text-red-600"
            }`}
            onClick={() => handleDeleteUser(user._id)}
            disabled={!user.active}
          >
            {deleteConfirm === user._id ? (
              <span className="text-xs">Confirm</span>
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      );
    },
  },
];
