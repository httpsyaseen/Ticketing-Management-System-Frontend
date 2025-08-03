import { Ticket } from "@/types/tickets";

function formatDateTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setTicketsToSessionStorage(tickets: Ticket[]) {
  sessionStorage.setItem("tickets", JSON.stringify(tickets));
}

function updateTicketInSessionStorage(ticket: Ticket) {
  const tickets = JSON.parse(sessionStorage.getItem("tickets") || "[]");

  const index = tickets.findIndex((t: Ticket) => t._id === ticket._id);
  if (index !== -1) {
    tickets[index] = ticket;
    sessionStorage.setItem("tickets", JSON.stringify(tickets));
  }
}

function getTicketsFromSessionStorage(): Ticket[] {
  const cached = sessionStorage.getItem("tickets");
  return cached ? JSON.parse(cached) : [];
}

function addTicketToSessionStorage(ticket: Ticket) {
  const tickets = getTicketsFromSessionStorage();
  tickets.push(ticket);
  sessionStorage.setItem("tickets", JSON.stringify(tickets));
}

function getTicketByIdFromSessionStorage(ticketId: string): Ticket | undefined {
  const tickets = getTicketsFromSessionStorage();
  return tickets.find((ticket) => ticket._id === ticketId);
}

function setViewTicket(t: Ticket) {
  const ticket = JSON.stringify(t);
  sessionStorage.setItem("viewTicket", ticket);
  return;
}

function getViewTicket(): Ticket | null {
  const t = sessionStorage.getItem("viewTicket");
  return t ? JSON.parse(t) : null;
}

export {
  formatDateTime,
  setTicketsToSessionStorage,
  updateTicketInSessionStorage,
  getTicketsFromSessionStorage,
  getTicketByIdFromSessionStorage,
  addTicketToSessionStorage,
  setViewTicket,
  getViewTicket,
};
