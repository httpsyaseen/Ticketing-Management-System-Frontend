"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import * as Accordion from "@radix-ui/react-accordion";
import {
  Cross2Icon,
  PlusIcon,
  Pencil2Icon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PersonIcon,
  LockClosedIcon,
  EnvelopeClosedIcon,
  GlobeIcon,
  CheckIcon,
  MixerHorizontalIcon,
  AvatarIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useTicket } from "@/context/ticket-context";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  assignedToType: "Department" | "Market";
  assignedTo: {
    _id: string;
    name: string;
  };
  active: boolean;
}

interface Department {
  _id: string;
  name: string;
}

interface Market {
  _id: string;
  name: string;
}

export default function UserManagementSystem() {
  const { user } = useAuth();
  const { departments, markets, setDepartments, setMarkets } = useTicket();
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState<"user" | "edit" | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deptName, setDeptName] = useState("");
  const [marketName, setMarketName] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [assignedToType, setAssignedToType] = useState<"Department" | "Market">(
    "Department"
  );
  const [assignedTo, setAssignedTo] = useState("");
  const [accordionValue, setAccordionValue] = useState<string[]>(["users"]);
  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [creatingNewEntity, setCreatingNewEntity] = useState<
    "department" | "market" | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const usersRes = await api.get("/users/getallusers");
        setUsers(usersRes.data.data.users);

        // Fetch departments
        const deptsRes = await api.get("/get-all-departments");
        setDepartments(deptsRes.data.data);

        // Fetch markets
        const marketsRes = await api.get("/get-all-markets");
        setMarkets(marketsRes.data.data);
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "superadmin") {
      fetchData();
    }
  }, [user, setDepartments, setMarkets]);

  const handleCreateDepartment = async () => {
    if (!deptName) {
      toast.error("Department name is required");
      return;
    }

    try {
      const { data } = await api.post("department/create-department", {
        name: deptName,
      });
      setDepartments([...departments, data.data]);
      setDeptName("");
      setCreatingNewEntity(null);
      toast.success("Department created successfully!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to create department";
      toast.error(message);
    }
  };

  const handleCreateMarket = async () => {
    if (!marketName) {
      toast.error("Market name is required");
      return;
    }

    try {
      const { data } = await api.post("market/create-market", {
        name: marketName,
      });
      setMarkets([...markets, data.data]);
      setMarketName("");
      setCreatingNewEntity(null);
      toast.success("Market created successfully!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to create market";
      toast.error(message);
    }
  };

  const handleCreateUser = async () => {
    if (!userName || !userEmail || !userPassword || !assignedTo) {
      toast.error("All fields are required");
      return;
    }

    try {
      setFormSubmitting(true);
      const { data } = await api.post("/users/createuser", {
        name: userName,
        email: userEmail,
        password: userPassword,
        role:
          assignedToType === "Department" ? "department_admin" : "market_admin",
        assignedToType,
        assignedTo,
      });

      setUsers([...users, data.data.user]);
      resetUserForm();
      setOpenDialog(null);
      toast.success("User created successfully!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create user";
      toast.error(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser || !userName || !userEmail || !assignedTo) {
      toast.error("All fields are required");
      return;
    }

    try {
      setFormSubmitting(true);
      const { data } = await api.patch(`/users/updateuser/${editUser._id}`, {
        name: userName,
        email: userEmail,
        role:
          assignedToType === "Department" ? "department_admin" : "market_admin",
        password: userPassword || undefined,
        assignedToType,
        assignedTo,
      });

      setUsers(users.map((u) => (u._id === editUser._id ? data.data.user : u)));
      resetUserForm();
      setOpenDialog(null);
      toast.success("User updated successfully!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update user";
      toast.error(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (deleteConfirm === userId) {
      try {
        await api.patch(`/users/deleteuser/${userId}`);
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, active: false } : user
          )
        );
        toast.success("User deactivated successfully!");
        setDeleteConfirm(null);
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Failed to deactivate user";
        toast.error(message);
      } finally {
        if (deleteTimeoutRef.current) {
          clearTimeout(deleteTimeoutRef.current);
        }
      }
    } else {
      setDeleteConfirm(userId);

      // Set timeout to reset delete confirmation
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
      deleteTimeoutRef.current = setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  const resetUserForm = () => {
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setAssignedToType("Department");
    setAssignedTo("");
    setEditUser(null);
    setShowPassword(false);
    setFormSubmitting(false);
    setCreatingNewEntity(null);
    setSearchTerm("");
  };

  const openEditDialog = (user: User) => {
    setEditUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setAssignedToType(user.assignedToType);
    setAssignedTo(user.assignedTo._id);
    setOpenDialog("edit");
  };

  // Filter departments and markets based on search term
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments;
    return departments.filter((dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  const filteredMarkets = useMemo(() => {
    if (!searchTerm) return markets;
    return markets.filter((market) =>
      market.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [markets, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-indigo-100">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-4">
            <LockClosedIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Only superadmins can
            manage users.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mb-10"
      >
        <motion.h1
          className="text-3xl font-bold mb-2 text-center text-gray-800"
          variants={fadeIn}
        >
          User Management System
        </motion.h1>
        <motion.p
          className="text-gray-600 text-center max-w-2xl mx-auto"
          variants={fadeIn}
        >
          Manage departments, markets, and user accounts across your
          organization
        </motion.p>
      </motion.div>

      {/* Action Button */}
      <motion.div
        className="mb-8 flex justify-center"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeIn}>
          <Dialog.Root
            open={openDialog === "user" || openDialog === "edit"}
            onOpenChange={(open) => !open && setOpenDialog(null)}
          >
            <Dialog.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-8 rounded-xl shadow-md flex items-center justify-center gap-2"
                onClick={() => {
                  resetUserForm();
                  setOpenDialog("user");
                }}
              >
                <PlusIcon />
                Create User
              </motion.button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="bg-black/60 fixed inset-0 backdrop-blur-sm" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-gray-800">
                      {openDialog === "edit"
                        ? "Edit User Profile"
                        : "Create New User"}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-gray-500">
                      {openDialog === "edit"
                        ? "Update user details and permissions"
                        : "Add a new member to your organization"}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-colors">
                      <Cross2Icon className="w-6 h-6" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                      <AvatarIcon className="w-5 h-5 mr-2 text-blue-500" />
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2 text-gray-700"
                          htmlFor="userName"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            id="userName"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Johnathan Smith"
                          />
                          <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium mb-2 text-gray-700"
                          htmlFor="userEmail"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="john.smith@company.com"
                          />
                          <EnvelopeClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label
                          className="block text-sm font-medium mb-2 text-gray-700"
                          htmlFor="userPassword"
                        >
                          Password
                          {openDialog === "edit" && (
                            <span className="text-xs text-gray-500 ml-2 font-normal">
                              (leave blank to keep current)
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <input
                            id="userPassword"
                            type={showPassword ? "text" : "password"}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            placeholder="••••••••"
                          />
                          <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                        {openDialog !== "edit" && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>• Minimum 8 characters</p>
                            <p>• Include uppercase and lowercase letters</p>
                            <p>• Include at least one number</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assignment Section */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                      <MixerHorizontalIcon className="w-5 h-5 mr-2 text-indigo-500" />
                      Role & Assignment
                    </h3>

                    <div className="space-y-5">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Assignment Type
                          </label>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center ${
                                assignedToType === "Department"
                                  ? "border-indigo-500 bg-indigo-50 shadow-inner"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setAssignedToType("Department")}
                            >
                              <div className="w-4 h-4 mr-2 text-indigo-600" />
                              <span>Department</span>
                            </button>

                            <button
                              type="button"
                              className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center ${
                                assignedToType === "Market"
                                  ? "border-teal-500 bg-teal-50 shadow-inner"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setAssignedToType("Market")}
                            >
                              <GlobeIcon className="w-4 h-4 mr-2 text-teal-600" />
                              <span>Market</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Assign To
                            <span className="text-xs text-gray-500 ml-2 font-normal">
                              (
                              {assignedToType === "Department"
                                ? "Department Admin"
                                : "Market Admin"}
                              )
                            </span>
                          </label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Select.Root
                                value={assignedTo}
                                onValueChange={setAssignedTo}
                              >
                                <Select.Trigger className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white">
                                  <Select.Value
                                    placeholder={`Select ${assignedToType}`}
                                  />
                                  <Select.Icon>
                                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                  </Select.Icon>
                                </Select.Trigger>

                                <Select.Content className="z-50 bg-white rounded-lg shadow-lg border border-gray-200 mt-1 max-h-60 overflow-y-auto">
                                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                    <div className="relative">
                                      <input
                                        type="text"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={`Search ${assignedToType.toLowerCase()}s...`}
                                        value={searchTerm}
                                        onChange={(e) =>
                                          setSearchTerm(e.target.value)
                                        }
                                      />
                                      <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                  </div>
                                  <Select.Viewport className="p-1">
                                    {assignedToType === "Department" ? (
                                      filteredDepartments.length > 0 ? (
                                        filteredDepartments.map((dept) => (
                                          <Select.Item
                                            key={dept._id}
                                            value={dept._id}
                                            className="px-3 py-2 rounded-md flex items-center hover:bg-indigo-50 cursor-pointer outline-none text-gray-700"
                                          >
                                            <Select.ItemText>
                                              {dept.name}
                                            </Select.ItemText>
                                          </Select.Item>
                                        ))
                                      ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                          No departments found
                                        </div>
                                      )
                                    ) : filteredMarkets.length > 0 ? (
                                      filteredMarkets.map((market) => (
                                        <Select.Item
                                          key={market._id}
                                          value={market._id}
                                          className="px-3 py-2 rounded-md flex items-center hover:bg-teal-50 cursor-pointer outline-none text-gray-700"
                                        >
                                          <Select.ItemText>
                                            {market.name}
                                          </Select.ItemText>
                                        </Select.Item>
                                      ))
                                    ) : (
                                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                        No markets found
                                      </div>
                                    )}
                                  </Select.Viewport>
                                </Select.Content>
                              </Select.Root>
                              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                {assignedToType === "Department" ? (
                                  <div className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <GlobeIcon className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
                              onClick={() =>
                                setCreatingNewEntity(
                                  assignedToType.toLowerCase() as
                                    | "department"
                                    | "market"
                                )
                              }
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Create New Department/Market Form */}
                      {creatingNewEntity && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mt-4"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-800">
                                Create New{" "}
                                {creatingNewEntity.charAt(0).toUpperCase() +
                                  creatingNewEntity.slice(1)}
                              </h4>
                              <button
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => setCreatingNewEntity(null)}
                              >
                                <Cross2Icon className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={
                                  creatingNewEntity === "department"
                                    ? deptName
                                    : marketName
                                }
                                onChange={(e) =>
                                  creatingNewEntity === "department"
                                    ? setDeptName(e.target.value)
                                    : setMarketName(e.target.value)
                                }
                                placeholder={`Enter ${creatingNewEntity} name`}
                              />
                              <button
                                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                onClick={
                                  creatingNewEntity === "department"
                                    ? handleCreateDepartment
                                    : handleCreateMarket
                                }
                              >
                                Create
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Dialog.Close asChild>
                    <button className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    disabled={formSubmitting}
                    className={`px-5 py-2.5 font-medium rounded-lg transition-colors flex items-center ${
                      formSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : openDialog === "edit"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                    onClick={
                      openDialog === "edit"
                        ? handleUpdateUser
                        : handleCreateUser
                    }
                  >
                    {formSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : openDialog === "edit" ? (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </motion.div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
        variants={fadeIn}
      >
        <Accordion.Root
          type="multiple"
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          <Accordion.Item value="users" className="border-b border-gray-200">
            <Accordion.Header>
              <Accordion.Trigger className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                  <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {users.filter((u) => u.active).length} active
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-3">
                    {users.length} total users
                  </span>
                  {accordionValue.includes("users") ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
              <div className="px-6 pb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assignment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {users?.map((user) => (
                          <motion.tr
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <PersonIcon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
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
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {user.assignedTo?.name}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {user.assignedToType.toLowerCase()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {user.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
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
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                    <PersonIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 font-medium text-gray-900">
                      No users found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new user
                    </p>
                  </div>
                )}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </motion.div>
    </div>
  );
}
