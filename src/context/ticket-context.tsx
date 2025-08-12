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
  viewTicket: Ticket;
  myTickets: Ticket[];
  assignTickets: Ticket[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  setViewTicket: React.Dispatch<React.SetStateAction<Ticket>>;
  setMyTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setAssignTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  updateTicket: (ticket: Ticket) => void;
  addTicket: (ticket: Ticket) => void;
  getTicketById: (id: string) => Ticket | undefined;
};

type Market = {
  _id: string;
  name: string;
};

const TicketContext = createContext<TicketContextType>({} as TicketContextType);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assignTickets, setAssignTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [viewTicket, setViewTicket] = useState<Ticket>({} as Ticket);
  const [markets, setMarkets] = useState<Market[]>([]);
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
  setMyTickets((prev) => Array.isArray(prev) ? [...prev, ticket] : [ticket]);
};

  const getTicketById = (id: string) => {
    return myTickets.find((ticket) => ticket._id === id);
  };

  const updateTicket = (updated: Ticket) => {
    setMyTickets((prev) =>
      prev.map((ticket) => (ticket._id === updated._id ? updated : ticket))
    );
    if (viewTicket && viewTicket._id === updated._id) {
      setViewTicket(updated);
    }
  };

  return (
    <TicketContext.Provider
      value={{
        departments,
        viewTicket,
        myTickets,
        assignTickets,
        setDepartments,
        setViewTicket,
        setMyTickets,
        setAssignTickets,
        getTicketById,
        updateTicket,
        addTicket,
        markets,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
