"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  MessageSquare,
  Paperclip,
  Send,
  User,
  CalendarDays,
  FileText,
  ImageIcon,
  Info,
  ListChecks,
  Tag,
  UserCheck,
  Play,
  FlagTriangleRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Ticket } from "@/types/tickets";
import { useParams } from "next/navigation";
import ReferTicketDialog from "@/components/referdepartment-dialog";
import { ResolveTicketDialog } from "@/components/resolveticket-dialog";
import { EstimateTimeDialog } from "@/components/estimatetime-dialog";

import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { getStatusBadge } from "@/components/helper-components";
import { Timer } from "@/components/timer";
import { formatTime } from "@/utils/helper";
import { StatusTimeline } from "@/components/status-timeline";
import { ImageViewerDialog } from "@/components/image-viewer-dialog";
import { CloseTicketDialog } from "@/components/close-ticket-dialog";
import showError from "@/components/send-error";

export default function TicketingDetailPage() {
  const params = useParams();
  const [ticket, setTicket] = useState<Ticket>({} as Ticket);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showEstimateDialog, setShowEstimateDialog] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    async function getTicket() {
      try {
        const { data } = await api.get(`/ticket/get-ticket/${params.id}`);
        setTicket(data.data.ticket);
      } catch (err) {
        showError(err);
      } finally {
        setIsLoading(false);
      }
    }
    getTicket();
  }, [params.id]);

  const handleStartProgress = () => {
    setShowEstimateDialog(true);
  };

  const handleAddComment = async () => {
    try {
      if (!newComment.trim()) return;

      const { data } = await api.patch(`/ticket/add-comment/${ticket._id}`, {
        comment: newComment,
      });

      // Make sure we're using the complete updated ticket with populated comments
      setTicket(data.data.ticket);
      setNewComment("");
      toast.success("Comment added successfully.");
    } catch (error) {
      toast.error("Failed to add comment. Please try again.");
      console.error("Error adding comment:", error);
    }
  };

  if (isLoading) {
    return <>Loading....</>;
  }

  return (
    <div className="min-h-screen p-5 bg-gray-50 font-sans flex flex-col px-8">
      <header className="mt-5 flex justify-between items-center w-full rounded-xl border border-gray-300 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-row gap-2 items-center">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {ticket?.title}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {ticket.createdBy._id === user?._id &&
            ticket?.status === "resolved" && (
              <CloseTicketDialog ticket={ticket} setTicket={setTicket} />
            )}
          {ticket.createdBy?._id !== user?._id && (
            <div className="flex gap-2">
              {ticket.status !== "resolved" && (
                <ReferTicketDialog ticket={ticket} setTicket={setTicket} />
              )}
              {ticket?.status === "open" &&
                ticket?.assignedTo?._id === user?.assignedTo?._id && (
                  <Button
                    onClick={handleStartProgress}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Accept Ticket
                  </Button>
                )}
              {ticket?.status === "in-progress" && (
                <Button
                  onClick={() => setShowResolveDialog(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6 md:py-4  w-full">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border border-gray-200 shadow-lg bg-white overflow-hidden transition-all duration-200 hover:shadow-xl 500 pt-0">
            <CardHeader className="bg-white h-1 px-4">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-green-600" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 py-4 px-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-700" strokeWidth={2.5} />
                <span>
                  Created by:{" "}
                  <span className="font-medium text-gray-900">
                    {ticket?.createdBy?.assignedTo?.name}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays
                  className="w-4 h-4 text-green-700"
                  strokeWidth={2.5}
                />
                <span>
                  Created At:{" "}
                  <span className="font-medium text-gray-900">
                    {formatTime(new Date(ticket?.createdAt || "").getTime())}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FlagTriangleRight
                  className="w-4 h-4 text-green-700"
                  strokeWidth={2.5}
                />
                <span>Status:</span>
                {getStatusBadge(ticket?.status)}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-700" strokeWidth={2.5} />
                <span>
                  Priority:{" "}
                  <span className="px-3 py-1 rounded-full text-xs font-medium border">
                    {ticket.priority}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck
                  className="w-4 h-4 text-green-700"
                  strokeWidth={2.5}
                />
                <span>
                  Assigned To:{" "}
                  <span className="font-medium text-gray-900">
                    {ticket?.assignedTo?.name}
                  </span>
                </span>
              </div>
              {ticket.status !== "resolved" && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="h-4 w-4 text-green-700" />
                  <span>Remaining Time:</span>
                  {ticket?.estimatedResolutionTime ? (
                    <Timer
                      estimatedResolutionTime={ticket?.estimatedResolutionTime}
                      status={ticket?.status}
                    />
                  ) : (
                    <span className="font-bold  italic">Opened</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 shadow-lg bg-white overflow-hidden transition-all duration-200 hover:shadow-xl pt-1 gap-0.5 500">
            <CardHeader className="bg-white py-2 px-4">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-4">
              <p className="text-gray-700 leading-relaxed text-sm">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {ticket?.images?.length > 0 && (
            <Card className="rounded-xl border border-gray-200 shadow-lg bg-white overflow-hidden transition-all duration-200 hover:shadow-xl p-1 gap-1 500">
              <CardHeader className="bg-white py-2 px-4">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-green-600" />
                  Attachments
                  <span className="text-sm font-normal text-gray-500">
                    ({ticket.images.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ticket?.images?.map((image, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:shadow-md transition-all duration-200"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                        width={200}
                        height={150}
                        priority={false}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1.5 space-y-6">
          <Card className="rounded-xl border border-gray-200 shadow-lg bg-white overflow-hidden transition-all duration-200 hover:shadow-xl p-1 gap-1">
            <CardHeader className="bg-white px-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-green-600" />
                Status History
              </CardTitle>
            </CardHeader>
            <div className="px-4">
              <StatusTimeline ticket={ticket} />
            </div>
          </Card>

          <Card className="rounded-xl border border-gray-200 shadow-lg bg-white overflow-hidden transition-all duration-200 hover:shadow-xl gap-1">
            <CardHeader className="bg-white py-2 px-4">
              <CardTitle className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Comments ({ticket?.comments?.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between px-4 py-4">
              <div className="space-y-3 max-h-[300px] overflow-y-auto font-light pr-2 mr-2 mb-4">
                {ticket?.comments?.length === 0 && (
                  <p className="text-gray-500 text-center py-4 font-light text-sm">
                    No Comments yet. Be the first to add one!
                  </p>
                )}
                {ticket?.comments?.map((comment) => (
                  <div
                    key={comment?._id}
                    className="flex items-start gap-2 mb-3"
                  >
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarImage
                        src={comment?.commentedBy?.name || "/placeholder.svg"}
                        alt={comment?.commentedBy?.name}
                      />
                      <AvatarFallback className="text-xs bg-green-500 text-white">
                        {comment?.commentedBy?.name
                          ?.split(" ")
                          .map((n) => n?.[0])
                          .join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-white border rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment?.commentedBy?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(new Date(comment?.createdAt).getTime())}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {comment?.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-3 bg-gray-200" />

              {ticket.status === "open" ? (
                <div className="py-2 px-2 text-sm text-gray-600">
                  Accept the Ticket to add Comments
                </div>
              ) : (
                ticket.status !== "resolved" &&
                ticket.status !== "closed" && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-20 text-sm"
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
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ImageViewerDialog
        src={selectedImage}
        alt="Attachment Preview"
        isOpen={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />

      <EstimateTimeDialog
        open={showEstimateDialog}
        onOpenChange={setShowEstimateDialog}
        setTicket={setTicket}
        ticketId={ticket._id}
      />

      <ResolveTicketDialog
        open={showResolveDialog}
        setOpen={setShowResolveDialog}
        setTicket={setTicket}
        ticketId={ticket._id}
      />
    </div>
  );
}
