"use client";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { TicketIcon, ImagePlusIcon, XIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { useTicket } from "@/context/ticket-context";
import { SearchableSelect } from "./ui/searchable-select";
import { useEffect } from "react";

export function CreateTicketDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [assignedToType, setAssignedToType] = useState<
    "Department" | "Market" | ""
  >("Department");
  const [assignedTo, setAssignedTo] = useState<string>("");

  const { user } = useAuth();
  const { departments, addTicket, markets } = useTicket();

  useEffect(() => {
    if (user?.assignedToType === "Market") {
      setAssignedToType("Department");
      setAssignedTo("");
    }
  }, [user?.assignedToType]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 2 - images.length);
      setImages((prevImages) => [...prevImages, ...newFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !description || !assignedToType || !assignedTo) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("assignedToType", assignedToType);
      formData.append("assignedTo", assignedTo);
      images.forEach((image) => {
        formData.append("images", image);
      });

      console.log(formData);

      const { data } = await api.post(`/ticket/create-ticket`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      addTicket(data.data.ticket);
      toast.success("Ticket created successfully!");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setTitle("");
      setDescription("");
      setAssignedToType("");
      setAssignedTo("");
      setImages([]);
      setIsOpen(false);
    }
  };

  // Determine which list to display in the dynamic dropdown
  const assignedToList =
    assignedToType === "Department"
      ? departments
      : assignedToType === "Market"
      ? markets
      : [];
  const assignedToLabel =
    assignedToType === "Department"
      ? "Department"
      : assignedToType === "Market"
      ? "Market"
      : "Select Type First";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
          <TicketIcon className="mr-2 h-5 w-5" /> Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
          <DialogTitle className="text-3xl font-extrabold flex items-center gap-3 text-gray-900 dark:text-gray-50">
            <TicketIcon className="h-8 w-8 text-primary" /> Create Ticket
          </DialogTitle>
          <DialogDescription className="text-md text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details below to create a new support ticket. We&#39;re
            here to help!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-6">
          {/* Horizontal fields: Title and Type */}
          <div className="grid gap-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your issue"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50  transition-colors"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Type dropdown */}
            <div className="grid gap-2">
              <Label
                htmlFor="assignedToType"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Assign To Type
              </Label>
              <Select
                onValueChange={(value: "Department" | "Market") => {
                  setAssignedToType(value);
                  setAssignedTo("");
                }}
                value={assignedToType}
                required
                disabled={user?.assignedToType === "Market"}
              >
                <SelectTrigger
                  id="assignedToType"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg">
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Market">Market</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Assigned To dropdown (searchable) */}
            <div className="grid gap-2">
              <Label
                htmlFor="assignedTo"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {assignedToLabel}
              </Label>
              <SearchableSelect
                items={assignedToList}
                value={assignedTo}
                onValueChange={setAssignedTo}
                placeholder={`Select a ${assignedToType || "type"}...`}
                disabled={!assignedToType}
              />
            </div>
          </div>

          {/* Dynamic Assigned To dropdown with search */}

          <div className="grid gap-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed explanation of your problem or request"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 min-h-[80px] focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-y"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="images"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Images (Optional)
            </Label>
            <div className="flex flex-col gap-3">
              <label
                htmlFor="images"
                className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                  <ImagePlusIcon className="h-5 w-5 mb-0.5" />
                  <span className="text-xs font-medium">
                    Upload up to 2 images
                  </span>
                </div>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                  disabled={images.length >= 2}
                />
              </label>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((file, index) => (
                    <div
                      key={index}
                      className="relative flex items-center gap-2 p-2 pr-8 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    >
                      <span>{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500 hover:text-red-500"
                      >
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="submit"
              className="w-full bg-green-500 sm:w-auto px-6 py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Create Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
