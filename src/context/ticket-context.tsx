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
import { Ticket } from "@/types/tickets";

type Department = {
  _id: string;
  name: string;
};

type TicketContextType = {
  departments: Department[];
  tickets: Ticket[];
  myTickets: Ticket[];
  assignTickets: Ticket[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setMyTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setAssignTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
};

const TicketContext = createContext<TicketContextType>({} as TicketContextType);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assignTickets, setAssignTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/department/get-all-departments");
        setDepartments(res.data.data.departments);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error?.response?.data?.message || "Failed to fetch departments");
        }
      }
    };

    fetchDepartments();
  }, []);

  return (
    <TicketContext.Provider
      value={{
        departments,
        tickets,
        myTickets,
        assignTickets,
        setDepartments,
        setTickets,
        setMyTickets,
        setAssignTickets,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
