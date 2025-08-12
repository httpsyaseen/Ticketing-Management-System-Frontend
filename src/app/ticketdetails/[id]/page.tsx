"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, CheckCircle, MessageSquare, Paperclip, Send, Clock, User, CalendarDays, FileText, ImageIcon, Hash, Info, CalendarCheck, ChevronLeft, ListChecks, Tag, Users, UserCheck, Play, ExternalLink } from 'lucide-react'
import { useTicket } from "@/context/ticket-context"
import { useEffect, useState } from "react"
import { Ticket } from "@/types/tickets"
import { useRouter } from "next/navigation";
import ReferTicketDialog from "@/components/referdepartment-dialog"
import { ResolveTicketDialog } from "@/components/resolveticket-dialog"
import { EstimateTimeDialog } from "@/components/estimatetime-dialog"
import { updateTicketInSessionStorage } from "@/utils/helper"
import toast from "react-hot-toast"
import api from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { Dialog } from "@radix-ui/react-dialog"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"


export default function TicketingDetailPage() {
  const { viewTicket } = useTicket();
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket>({} as Ticket)
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showEstimateDialog, setShowEstimateDialog] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showReferDialog, setShowReferDialog] = useState(false);
  const {user} = useAuth()
  console.log(viewTicket)
  console.log(user)
  useEffect(() => {
    setTicket(viewTicket);
    if (!viewTicket || !viewTicket._id) {
      router.replace("/dashboard");
    }
    setIsLoading(false);

  }, [viewTicket, router])

  if(ticket?.status === "open"){
    
  }
// const EstimatedTimeNotViewCurrentUser = user?.assignedTo?._id === viewTicket?.assignedTo?._id

  // console.log(EstimatedTimeNotViewCurrentUser)

  const statusTimeline = [
    { id: 1, status: "Open", date: "2025-08-06T01:30:00Z", current: false },
    { id: 2, status: "In-Progress", date: "2025-08-06T01:34:00Z", current: true },
    { id: 3, status: "Resolved", date: null, current: false },
    { id: 4, status: "Closed", date: null, current: false },
  ]

function formatTime(timestamp: number) {
  const date = new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",  // e.g., Aug
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true     // or false if you want 24-hour format
  };

  return date.toLocaleString("en-US", options);
}



  const calculateTimeLeft = (dueDateIso: string) => {
  if (!dueDateIso) return "00:00:00 left";

  const now = new Date();
  const dueDate = new Date(dueDateIso);
  const diffMs = dueDate.getTime() - now.getTime();

  if (diffMs < 0 ) return "Overdue";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')} left`;
};


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Badge   className=" text-neutral-dark-900 hover:bg-status-warning-600">In Progress</Badge>
      case "resolved":
        return <Badge className=" text-[#388E3C] hover:bg-status-success-600">Resolved</Badge>
      case "pending":
        return <Badge className="bg-brand-primary-300 text-brand-primary-900 hover:bg-brand-primary-400">Pending</Badge>
      case "open":
        return <Badge className=" text-neutral-dark-700">Open</Badge>
      default:
        return <Badge className=" text-neutral-dark-700">{status}</Badge>
    }
  }

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-neutral-dark-500" />
      case "pdf":
        return <FileText className="w-5 h-5 text-status-danger-500" />
      case "spreadsheet":
        return <FileText className="w-5 h-5 text-status-success-500" />
      default:
        return <Paperclip className="w-5 h-5 text-neutral-dark-500" />
    }
  }

  useEffect(() => {
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

  const now = new Date();
  const isOverdue =
    ticket?.estimatedResolutionTime &&
    new Date(ticket.estimatedResolutionTime) < now &&
    ticket?.status !== "resolved" &&
    ticket?.status !== "closed";

  const statusSteps = [
    { status: "open", time: ticket?.createdAt },
    ticket?.inProgressAt && { status: "in-progress", time: ticket?.inProgressAt },
    ticket?.resolvedAt && { status: "resolved", time: ticket.resolvedAt },
    ticket?.closedAt && { status: "closed", time: ticket.closedAt },
  ].filter(Boolean) as { status: string; time: string }[];


  if (isLoading) {
    return <>Loading....</>
  }

  return (
    <div className="min-h-screen p-5 bg-gradient-to-t from-gray-50 to-green-100 font-sans flex flex-col">
      {/* Header/Top Actions Module */}
      <header className="bg-white mt-5 justify-between bg-[#99d98c]  border border-[#E0E0E0] p-4 md:px-8 rounded-full shadow-md w-full flex items-center">
        <div className="flex items-center gap-4">

          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark-900">{ticket?.title}</h1>
            <div className="bg-yellow-100 text-yellow-700 mt-2 px-2 ml-4 border rounded-full">{getStatusBadge(ticket.status)}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">

            {ticket?.status !== 'resolved' &&<div className={`flex items-center gap-1 text-sm font-medium ${isOverdue ? 'text-status-danger-600' : 'text-neutral-dark-700'}`}>
              <Clock className="w-4 h-4" />
              <span>{ calculateTimeLeft(ticket?.estimatedResolutionTime ?? "")}</span>
            </div>}
          </div>
          <div className="flex gap-2">
            {ticket.status !== "resolved" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white hover:text-white"
                  onClick={() => setShowReferDialog(true)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Refer Ticket
                </Button>
              </div>
            )}
            { ticket?.status === "open"  && (
              <Button
                onClick={handleStartProgress}
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
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
      </header>

      {/* Main Content Area - Two Columns */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6  md:p-4 lg:max-w-8xl  w-full">
        {/* Left Column: Ticket Details (Overview, Description, Attachments, Status History) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Overview/Metadata Module */}
          <Card className="shadow-md border border-[#E0E0E0]  rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-neutral-dark-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-neutral-dark-600" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-dark-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-neutral-dark-500" />
                <span>Created by: <span className="font-medium text-neutral-dark-900">{ticket?.createdBy?.assignedTo?.name}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neutral-dark-500" />
<span>
  Created At:{" "}
  <span className="font-medium text-neutral-dark-900">
    {formatTime(new Date(ticket?.createdAt || "").getTime())}
  </span>
</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Status:</span>
                {getStatusBadge(ticket?.status)}

              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-neutral-dark-500" />
                <span>Priority: <span className="font-medium text-neutral-dark-900">{ticket.priority}</span></span>
              </div>
              {/* <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-dark-500" />
                <span>Department: <span className="font-medium text-neutral-dark-900">{ticket?.assignedTo?.name}</span></span>
              </div> */}
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-neutral-dark-500" />
                <span>Assigned To: <span className="font-medium text-neutral-dark-900">{ticket?.assignedTo?.name}</span></span>
              </div>
            </CardContent>
          </Card>

          {/* Description Module */}
          <Card className="shadow-md border border-[#E0E0E0] rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-neutral-dark-800">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-dark-700 leading-relaxed text-base">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Attachments Module */}
          {ticket?.images?.length > 0 && (
            <Card className="shadow-md border border-[#E0E0E0] rounded-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-neutral-dark-800 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-neutral-dark-600" />
                  Attachments ({ticket?.images?.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Comments/Activity Feed */}
        <div className="lg:col-span-1.5  space-y-6">
          {/* Status Timeline Module */}
          <Card className="shadow-md border border-neutral-warm-200 rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-neutral-warm-800 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#525252]" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {/* {ticket.status.map((step, index) => ( */}
              {statusSteps.map((step, index) => (
                <div key={step.status} className="flex gap-3">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${step.status === "open"
                          ? "bg-[#C62828]"
                          : step.status === "in-progress"
                            ? "bg-[#FFB300]"
                            : step.status === "resolved"
                              ? "bg-[#388E3C]"
                              : step.status === "closed"
                                ? "bg-[#0288D1]"
                                : "bg-gray-400"
                        }`}
                    />
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-px h-12 ${step.status === "open"
                            ? "bg-[#C62828]"
                            : step.status === "in-progress"
                              ? "bg-[#FFB300]"
                              : step.status === "resolved"
                                ? "bg-[#388E3C]"
                                : "bg-[#0288D1]"
                          }`}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div>
                    <p
                      className={`font-medium -mt-1 capitalize ${step.status === "open"
                          ? "text-[#C62828]"
                          : step.status === "in-progress"
                            ? "text-[#FFB300]"
                            : step.status === "resolved"
                              ? "text-[#388E3C]"
                              : step.status === "closed"
                                ? "text-[#0288D1]"
                                : ""
                        }`}
                    >
                      {step.status}
                    </p>
                    <p className="text-xs text-neutral-warm-500">
                      {formatTime(new Date(step.time).getTime())}
                    </p>
                  </div>
                </div>
              ))}

              {/* ))} */}
            </CardContent>

          </Card>

          {/* Comments/Activity Feed Module - Redesigned */}
          <Card className="shadow-md border border-neutral-warm-200 rounded-lg flex flex-col h-max">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-neutral-warm-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#525252]" />
                Comments ({ticket?.comments?.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 -mr-2 mb-4">
                {ticket?.comments?.length === 0 && (
                  <p className="text-[#525252] text-center py-4">No newComment yet. Be the first to add one!</p>
                )}
                {ticket?.comments?.map((comment) => (
                  <div key={comment?._id} className="flex items-start gap-3 p-3 bg-[#F0F0F0] rounded-lg border border-[#E0E0E0]">
                    <Avatar className="w-9 h-9 border border-[#E0E0E0] flex-shrink-0">
                      <AvatarImage src={comment?.commentedBy?.name || "/placeholder.svg"} alt={comment?.commentedBy?.name} />
                      <AvatarFallback>{comment?.commentedBy?.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid gap-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-[#262626] text-sm">{comment?.commentedBy?.name}</div>
                        <div className="text-xs text-[#525252]">{formatTime(new Date(comment?.createdAt).getTime())}
                        </div>
                      </div>
                      <p className="text-sm text-[#404040] leading-snug">{comment?.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4 bg-[#E0E0E0]" />

              {ticket.status === "open" ? (

                <div className="space-y-2">
                  <div>Accept the Ticket to add Comments</div>
                </div>
              ) : (

                ticket.status !== "resolved" &&
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
                    className="w-full bg-green-600"
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
  )
}

