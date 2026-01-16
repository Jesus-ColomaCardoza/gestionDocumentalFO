import axios from "axios";
import { VITE_API_URL_GDS } from "../../utils/Constants";
import { RENIEC } from "../service/ReniecService";
import { Menssage } from "../../utils/menssage";
import {
  ReniecBuscarDni,
  ReniecBuscarDniOut,
  ReniecBuscarRuc,
  ReniecBuscarRucOut,
} from "../interfaces/ReniecInterface";

const UseReniec = () => {
  let message = new Menssage();

  const buscarDni = async (
    ReniecBuscarDni: ReniecBuscarDni
  ): Promise<ReniecBuscarDniOut | undefined> => {
    try {
      const dni = await axios.post<ReniecBuscarDniOut>(
        `${VITE_API_URL_GDS + RENIEC.BUSCAR_DNI}`,
        ReniecBuscarDni
      );
      return dni.data;
    } catch (error: any) {
      console.log(error);
      message.setMessage(1, "Error: Error interno en el servidor");
      return { message: message };
    }
  };

  const buscarRuc = async (
    ReniecBuscarRuc: ReniecBuscarRuc
  ): Promise<ReniecBuscarRucOut | undefined> => {
    try {
      const ruc = await axios.post<ReniecBuscarRucOut>(
        `${VITE_API_URL_GDS + RENIEC.BUSCAR_RUC}`,
        ReniecBuscarRuc
      );
      return ruc.data;
    } catch (error: any) {
      console.log(error);
      message.setMessage(1, "Error: Error interno en el servidor");
      return { message: message };
    }
  };

  return {
    buscarDni,
    buscarRuc,
  };
};

export default UseReniec;
