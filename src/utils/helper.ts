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

function formatTime(timestamp: number) {
  const date = new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
}

function setCurrentTicket(t: Ticket) {
  const ticket = JSON.stringify(t);
  sessionStorage.setItem("currentTicket", ticket);
  return;
}

function getCurrentTicket(): Ticket | null {
  const t = sessionStorage.getItem("currentTicket");
  return t ? JSON.parse(t) : null;
}

export { formatDateTime, setCurrentTicket, getCurrentTicket, formatTime };
