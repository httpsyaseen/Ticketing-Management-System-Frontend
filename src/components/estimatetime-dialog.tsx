"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { updateTicketInSessionStorage } from "@/utils/helper";
import { Ticket } from "@/types/tickets";

type EstimateTimeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setTicket: (ticket: Ticket) => void;
  ticketId: string;
};

export function EstimateTimeDialog({
  open,
  onOpenChange,
  setTicket,
  ticketId,
}: EstimateTimeDialogProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const isFutureDate = date && hour !== "" && minute !== "";

const isBeforeToday = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset to midnight
  return d < today;
};
  const handleSet = async () => {
    if (!date) return;

    const fullDate = new Date(date);
    fullDate.setHours(Number(hour), Number(minute), 0, 0);

    if (fullDate > new Date()) {
      const payload = {
        estimatedResolutionTime: fullDate.toISOString(),
        priority: priority || "medium",
      };

      try {
        console.log("🔼 Sending to API:", payload); 
        const { data } = await api.patch(`/ticket/set-time/${ticketId}`, payload);
        toast.success("Estimated resolution time set successfully.");
        updateTicketInSessionStorage(data.data.ticket);
        setTicket(data.data.ticket);
      } catch (error) {
        toast.error("Failed to set estimated resolution time.");
        console.error("❌ Error setting estimated resolution time:", error);
      }

      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Estimated Resolution Time</DialogTitle>
          <DialogDescription>
            Please estimate how long it will take to resolve this ticket.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date Picker */}
          <div>
            <Label className="py-2">Pick a Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? date.toDateString() : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
               <Calendar
  mode="single"
  selected={date ?? undefined}
  onSelect={(d) => d && setDate(d)}
  disabled={isBeforeToday}
/>
              </PopoverContent>
            </Popover>
          </div>

          {/* Hour & Minute Select */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label className="py-2">Hour</Label>
              <Select onValueChange={setHour}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i).padStart(2, "0")}>
                      {String(i).padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/2">
              <Label className="py-2">Minute</Label>
              <Select onValueChange={setMinute}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent>
                  {["00", "15", "30", "45"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority Select */}
          <div>
            <Label className="py-2">Priority</Label>
            <Select onValueChange={setPriority}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isFutureDate}
            onClick={handleSet}
            className="bg-black hover:bg-black text-white"
          >
            <Clock className="h-4 w-4 mr-2" />
            Set Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
