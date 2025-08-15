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
import { Ticket, Department } from "@/types/tickets";

type TicketContextType = {
  departments: Department[];
  markets: Market[];
  myTickets: Ticket[];
  assignTickets: Ticket[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  setMarkets: React.Dispatch<React.SetStateAction<Market[]>>;
  setMyTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setAssignTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  addTicket?: (ticket: Ticket) => void;
  viewTicket?: Ticket;
  setViewTicket?: React.Dispatch<React.SetStateAction<Ticket>>;
};

type Market = {
  _id: string;
  name: string;
  currentReport?: string;
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
        setDepartments(res?.data?.data?.departments);
        setMarkets(marketsRes?.data?.data?.markets);
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

  const addTicket = (ticket: Ticket) => {
    setMyTickets((prev) => [ticket, ...prev]);
    setAssignTickets((prev) => [ticket, ...prev]);
  };

  return (
    <TicketContext.Provider
      value={{
        departments,
        myTickets,
        assignTickets,
        setDepartments,
        setMyTickets,
        setAssignTickets,
        markets,
        addTicket,
        viewTicket,
        setViewTicket,
        setMarkets,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
