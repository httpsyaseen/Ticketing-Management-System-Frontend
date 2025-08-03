// components/ReferTicketDialog.tsx
"use client";

import { useState, Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Ticket } from "@/types/tickets";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";
import { updateTicketInSessionStorage } from "@/utils/helper";

type ReferTicketDialogProps = {
  showReferDialog: boolean;
  setShowReferDialog: (open: boolean) => void;
  ticket: Ticket;
  setTicket: Dispatch<SetStateAction<Ticket>>;
};

export default function ReferTicketDialog({
  showReferDialog,
  setShowReferDialog,
  ticket,
  setTicket,
}: ReferTicketDialogProps) {
  const [referReason, setReferReason] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const { departments, user } = useAuth();

  const handleReferTicket = async () => {
    if (!referReason.trim() || !selectedDepartment) return;
    try {
      const { data } = await api.patch(
        `/ticket/refer-department/${ticket._id}`,
        {
          comment: referReason,
          departmentId: selectedDepartment,
        }
      );
      toast.success("Ticket referred successfully.");
      setTicket(data.data.ticket);
      updateTicketInSessionStorage(data.data.ticket);
    } catch (error) {
      toast.error("Failed to refer ticket. Please try again.");
      console.error("Error referring ticket:", error);
    } finally {
      setShowReferDialog(false);
    }
  };

  return (
    <Dialog open={showReferDialog} onOpenChange={setShowReferDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refer Ticket</DialogTitle>
          <DialogDescription>
            Please provide a reason for referring this ticket and select the
            department to send it to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="refer-reason" className="py-2">
              Reason for Referral
            </Label>
            <Textarea
              id="refer-reason"
              placeholder="Explain why this ticket needs to be referred..."
              value={referReason}
              onChange={(e) => setReferReason(e.target.value)}
              className="min-h-24"
            />
          </div>
          <div>
            <Label htmlFor="department" className="py-2">
              Department
            </Label>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => {
                  if (dept._id === user?.assignedTo?._id) return null;
                  return (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowReferDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReferTicket}
            disabled={!referReason.trim() || !selectedDepartment}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Refer Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
