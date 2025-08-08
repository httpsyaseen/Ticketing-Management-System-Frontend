"use client";

import * as React from "react";
import {
  Send,
  Clock,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  Play,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getStatusBadge } from "@/components/helper-components";
import { formatDateTime } from "@/utils/helper";
import { useRouter } from "next/navigation";
import { Ticket } from "@/types/tickets";
import Image from "next/image";
import api from "@/lib/api";
import { updateTicketInSessionStorage } from "@/utils/helper";
import { EstimateTimeDialog } from "@/components/estimatetime-dialog";
import { ResolveTicketDialog } from "@/components/resolveticket-dialog";
import ReferTicketDialog from "@/components/referdepartment-dialog";
import toast from "react-hot-toast";
import { useTicket } from "@/context/ticket-context";

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const { viewTicket } = useTicket();
  const {ticket, setTicket} = useTicket()
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    setTicket(viewTicket);
    if (!viewTicket || !viewTicket._id) {
      router.replace("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, [viewTicket, router]);
console.log(viewTicket)
  const [newComment, setNewComment] = React.useState("");
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [showResolveDialog, setShowResolveDialog] = React.useState(false);
  const [showEstimateDialog, setShowEstimateDialog] = React.useState(false);
  const [remainingTime, setRemainingTime] = React.useState(0);
  const [showReferDialog, setShowReferDialog] = React.useState(false);

  // Timer effect for in-progress tickets - countdown remaining time
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (ticket?.estimatedResolutionTime) {
      const updateRemaining = () => {
        const now = new Date();
        const estimated = new Date(ticket.estimatedResolutionTime as string);
        const diff = Math.floor((estimated.getTime() - now.getTime()) / 1000);
        setRemainingTime(diff > 0 ? diff : 0);
      };

      updateRemaining(); // initial call
      interval = setInterval(updateRemaining, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [ticket?.estimatedResolutionTime]);

  const handleStartProgress = () => {
    setShowEstimateDialog(true);
  };

  const handleAddComment = async () => {
    try {
      if (!newComment.trim()) return;

      const response = await api.patch(`/ticket/add-comment/${ticket._id}`, {
        comment: newComment,
      });

      const updatedTicket = response.data.data;

      setTicket(updatedTicket.ticket);
      setNewComment("");
      updateTicketInSessionStorage(updatedTicket.ticket);
      toast.success("Comment added successfully.");
    } catch (error) {
      toast.error("Failed to add comment. Please try again.");
      console.error("Error adding comment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading ticket details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 mx-12">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        {ticket.status !== "resolved" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-black text-white"
              onClick={() => setShowReferDialog(true)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Refer Ticket
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {ticket?.status === "open" && (
            <Button
              onClick={handleStartProgress}
              className="bg-black hover:bg-black text-white cursor-pointer"
            >
              <Play className="h-4 w-4 mr-2" />
              Accept Ticket
            </Button>
          )}
          {ticket?.status === "in-progress" && (
            <Button
              onClick={() => setShowResolveDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{ticket?.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Created by:{" "}
                      <strong>{ticket?.createdBy?.assignedTo?.name}</strong>
                    </span>
                    <span>
                      Created At: {formatDateTime(ticket?.createdAt || "")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(ticket?.status || "")}
                  {ticket?.estimatedResolutionTime && (
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                        remainingTime <= 300
                          ? "bg-red-50"
                          : remainingTime <= 900
                          ? "bg-yellow-50"
                          : "bg-blue-50"
                      }`}
                    >
                      <Clock
                        className={`h-4 w-4 ${
                          remainingTime <= 300
                            ? "text-red-600"
                            : remainingTime <= 900
                            ? "text-yellow-600"
                            : "text-blue-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-mono ${
                          remainingTime <= 300
                            ? "text-red-700"
                            : remainingTime <= 900
                            ? "text-yellow-700"
                            : "text-blue-700"
                        }`}
                      >
                        {remainingTime > 0
                          ? `${formatTime(remainingTime)} left`
                          : "Overdue"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Description</Label>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {ticket?.description}
                </p>
              </div>

              {ticket.images.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Attachments</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ticket?.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-32 object-cover"
                          width={200}
                          height={600}
                          priority={false}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comments Section - moved to right */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({ticket?.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {ticket.comments.map((comment:any) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {comment.commentedBy.name.charAt(0) || "Y"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {comment.commentedBy.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {ticket.status === "open" ? (
                <div className="space-y-2">
                  <div>Accept the Ticket to add Comments</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-20"
                  />
                  <Button
                    onClick={handleAddComment}
                    size="sm"
                    className="w-full"
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-full ">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Full size preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                width={800}
                height={1400}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EstimateTimeDialog
        open={showEstimateDialog}
        onOpenChange={setShowEstimateDialog}
        setTicket={setTicket}
        ticketId={ticket._id}
      />

      {/* Resolve Dialog */}
      <ResolveTicketDialog
        open={showResolveDialog}
        setOpen={setShowResolveDialog}
        setTicket={setTicket}
        ticketId={ticket._id}
      />

      {/* Refer Ticket Dialog */}
      <ReferTicketDialog
        showReferDialog={showReferDialog}
        setShowReferDialog={setShowReferDialog}
        ticket={ticket}
        setTicket={setTicket}
      />
    </div>
  );
}
