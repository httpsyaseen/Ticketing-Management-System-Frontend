"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageViewerDialog } from "@/components/image-viewer-dialog"; // Import the new component
import { Department, Ticket } from "@/types/tickets";
import { formatDateTime, getViewTicket } from "@/utils/helper";

// Define types based on the provided dummy data
// type User = {
//   _id: string;
//   name: string;
//   assignedTo?: {
//     _id: string;
//     name: string;
//   };
// };

// type Comment = {
//   comment: string;
//   commentedBy: {
//     _id: string;
//     name: string;
//   };
//   _id: string;
//   createdAt: string;
// };

// // type Ticket = {
// //   _id: string;
// //   title: string;
// //   description: string;
// //   department: string; // Assuming this is an ID, could be mapped to a name
// //   priority: "Low" | "Medium" | "High";
// //   status: "Open" | "Closed" | "In Progress";
// //   createdBy: User;
// //   images: string[];
// //   createdAt: string;
// //   estimatedResolutionTime: string;
// //   comments: Comment[];
// //   updatedAt: string;
// // };

// // Dummy data for demonstration
// const dummyTicket: Ticket = {
//   _id: "688df2b6f306d9ae56a99673",
//   title: "CCTV",
//   description:
//     "The CCTV camera in the main lobby is not working. It shows a black screen and is unresponsive. Please investigate and fix the issue as soon as possible. This is a critical issue affecting security.",
//   department: "IT Support", // Placeholder for department ID
//   priority: "High",
//   status: "Open",
//   createdBy: {
//     _id: "688df294f306d9ae56a9966d",
//     name: "Yaseen user",
//     assignedTo: {
//       _id: "688354273098226ea918f24e",
//       name: "Mian Plaza",
//     },
//   },
//   images: [
//     "http://localhost:4000/tickets-assets/ticket-688df294f306d9ae56a9966d-1754133174412.png",
//     "/placeholder.svg?height=400&width=600",
//     "/placeholder.svg?height=400&width=600",
//   ],
//   createdAt: "2025-08-02T11:12:54.424Z",
//   estimatedResolutionTime: "2025-08-05T17:00:00.000Z",
//   comments: [
//     {
//       comment:
//         "Initial assessment complete. Looks like a power supply issue. Ordering replacement parts.",
//       commentedBy: {
//         _id: "688df294f306d9ae56a9966d",
//         name: "Yaseen Nazir",
//       },
//       _id: "688df2b6f306d9ae56a99674",
//       createdAt: "2025-08-02T11:12:54.430Z",
//     },
//     {
//       comment:
//         "Replacement part arrived. Scheduling installation for tomorrow morning. Will update once fixed.",
//       commentedBy: {
//         _id: "688df294f306d9ae56a9966d",
//         name: "Yaseen Nazir",
//       },
//       _id: "688df2b6f306d9ae56a99675",
//       createdAt: "2025-08-03T09:30:00.000Z",
//     },
//     {
//       comment:
//         "Installation complete. Camera is now fully functional. Closing ticket.",
//       commentedBy: {
//         _id: "688df294f306d9ae56a9966d",
//         name: "Mian Plaza",
//       },
//       _id: "688df2b6f306d9ae56a99676",
//       createdAt: "2025-08-04T14:00:00.000Z",
//     },
//   ],
//   updatedAt: "2025-08-04T14:00:00.000Z",
// };

// Helper to get badge variant based on priority
const getPriorityVariant = (priority: Ticket["priority"]) => {
  switch (priority) {
    case "Low":
      return "secondary"; // Light gray for low priority
    case "Medium":
      return "default"; // Primary green for medium
    case "High":
      return "destructive"; // Red for high
    default:
      return "default";
  }
};

// Helper to get badge variant based on status
const getStatusVariant = (status: Ticket["status"]) => {
  switch (status) {
    case "Open":
      return "default"; // Primary green
    case "In Progress":
      return "outline"; // Outline for in progress
    case "Closed":
      return "secondary"; // Secondary for closed
    default:
      return "default";
  }
};

export default function TicketDetailPage() {
  const [isCloseTicketDialogOpen, setIsCloseTicketDialogOpen] =
    React.useState(false);
  const [feedbackComment, setFeedbackComment] = React.useState("");
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [ticket, setTicket] = React.useState<Ticket>({} as Ticket);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const ticket = getViewTicket();
    console.log(ticket);
    setTicket(ticket || ({} as Ticket));
    setIsLoading(false);
  }, []);

  const handleCloseTicket = () => {
    // In a real application, you would send this data to your backend
    console.log("Closing ticket with feedback:", feedbackComment);
    // After successful API call, you might navigate away or update UI
    setIsCloseTicketDialogOpen(false);
    setFeedbackComment(""); // Clear feedback
    // For demonstration, you might update the dummyTicket status here
    // dummyTicket.status = "Closed";
  };

  const openImageModal = (src: string) => {
    setSelectedImage(src);
    setIsImageModalOpen(true);
  };

  if (isLoading) {
    return <div>Loading</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-6xl">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Ticket Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold">
                {ticket.title}
              </CardTitle>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-md font-medium bg-muted text-muted-foreground border">
                  <span>Status:</span>
                  <Badge variant={getStatusVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-md font-medium bg-muted text-muted-foreground border">
                  <span>Priority:</span>
                  <Badge variant={getPriorityVariant(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            </div>
            <CardDescription className="text-lg text-muted-foreground">
              Ticket ID: {ticket._id}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {ticket.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Department
                </p>
                <p className="text-base">
                  {(ticket.department as Department).name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created By
                </p>
                <p className="text-base">{ticket.createdBy.assignedTo.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <p className="text-base">
                  {format(new Date(ticket.createdAt), "PPP p")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Estimated Resolution
                </p>
                <p className="text-base">
                  {ticket.estimatedResolutionTime
                    ? formatDateTime(ticket.estimatedResolutionTime as string)
                    : "Not set Yet"}
                </p>
              </div>
            </div>

            {ticket.images && ticket.images.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Attachments</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ticket.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-md overflow-hidden border cursor-pointer group"
                        onClick={() => openImageModal(image)}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Ticket attachment ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium">
                            View
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {ticket.status !== "Closed" && (
              <Dialog
                open={isCloseTicketDialogOpen}
                onOpenChange={setIsCloseTicketDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">Close Ticket</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Close Ticket</DialogTitle>
                    <DialogDescription>
                      Provide a feedback comment before closing the ticket.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="feedback-comment">Feedback Comment</Label>
                      <Textarea
                        id="feedback-comment"
                        placeholder="Enter your feedback here..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCloseTicketDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCloseTicket}>
                      Confirm Close Ticket
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>

        {/* Comments Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.comments.length > 0 ? (
              ticket.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border rounded-lg p-4 bg-background shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar fallback or initials */}
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary uppercase">
                      {comment.commentedBy.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">
                          {comment.commentedBy.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(comment.createdAt),
                            "MMM dd, yyyy • HH:mm"
                          )}
                        </span>
                      </div>
                      <p className="text-sm mt-2 leading-relaxed text-muted-foreground">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No comments yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Viewer Dialog */}
      <ImageViewerDialog
        src={selectedImage || "/placeholder.svg"}
        alt="Full screen ticket attachment"
        isOpen={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
      />
    </div>
  );
}
