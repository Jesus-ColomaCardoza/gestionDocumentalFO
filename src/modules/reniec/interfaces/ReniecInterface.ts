import { Message } from "../../utils/Interfaces";



export interface ReniecBuscarDni {
  Dni: string;
}

export interface ReniecBuscarRuc {
  Ruc: string;
}

export interface ReniecBuscarDniOut {
  message: Message;
  registro?: {
    first_name: string,
    first_last_name: string,
    second_last_name: string,
    document_number: string,
    full_name: string,
    origen: string
  };
}

export interface ReniecBuscarRucOut {
  message: Message;
  registro?: {
    razon_social: string,
    numero_documento: string,
    origen: string
  };
}
