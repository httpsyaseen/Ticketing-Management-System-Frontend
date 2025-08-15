"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Ticket,
  Department,
  GetTicketsByDateAndTypeRequest,
} from "@/types/tickets";

type Market = {
  _id: string;
  name: string;
};

export type ApiResponse<T> = {
  status: string;
  results?: number;
  data: T;
};

type TicketContextType = {
  departments: Department[];
  markets: Market[];
  myTickets: Ticket[];
  assignTickets: Ticket[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  setMyTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setAssignTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  addTicket: (ticket: Ticket) => void;
  viewTicket: Ticket;
  setViewTicket: React.Dispatch<React.SetStateAction<Ticket>>;
  fetchTicketsByDateAndType: (params: GetTicketsByDateAndTypeRequest) => Promise<void>;
    getTicketsByDateAndType: (params: GetTicketsByDateAndTypeRequest) => Promise<{ status: string; results: number; data: { tickets: Ticket[] } }>;

};

const TicketContext = createContext<TicketContextType>({} as TicketContextType);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assignTickets, setAssignTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [viewTicket, setViewTicket] = useState<Ticket>({} as Ticket);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/department/get-all-departments");
        const marketsRes = await api.get("/market/get-all-markets");
        setDepartments(res?.data?.data?.departments || []);
        setMarkets(marketsRes?.data?.data?.markets || []);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error?.response?.data?.message || "Failed to fetch departments"
          );
        }
      }
    };

    fetchDepartments();
  }, []);

  const getTicketsByDateAndType = async (
    params: GetTicketsByDateAndTypeRequest
  ): Promise<{ status: string; results: number; data: { tickets: Ticket[] } }> => {
    const response = await api.post("/ticket/get-tickets", params);
    console.log(response?.data)
    return response.data;
  };

  const fetchTicketsByDateAndType = async (
    params: GetTicketsByDateAndTypeRequest
  ) => {
    try {
          console.log(params)

      const res = await getTicketsByDateAndType(params);
      const tickets = res?.data?.tickets ?? [];

      if (params.ticketType === "created") {
        setMyTickets(tickets);
      } else if (params.ticketType === "assigned") {
        setAssignTickets(tickets);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error?.response?.data?.message || "Failed to fetch tickets");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const addTicket = (ticket: Ticket) => {
    setMyTickets((prev) => [ticket, ...prev]);
    setAssignTickets((prev) => [ticket, ...prev]);
  };

  return (
    <TicketContext.Provider
      value={{
        departments,
        markets,
        myTickets,
        assignTickets,
        setDepartments,
        setMyTickets,
        setAssignTickets,
        addTicket,
        viewTicket,
        setViewTicket,
        fetchTicketsByDateAndType,
        getTicketsByDateAndType,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
