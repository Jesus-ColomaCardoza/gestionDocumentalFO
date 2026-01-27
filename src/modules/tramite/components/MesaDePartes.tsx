import { Button } from "primereact/button";
import { useState, useEffect, useRef } from "react";
import UseTramite from "../hooks/UseTramite";
import { TramiteEntity } from "../interfaces/TramiteInterface";
import { Toast } from "primereact/toast";
import { emptyTramite } from "../utils/Constants";
import { DropdownChangeEvent } from "primereact/dropdown";
import { useTheme } from "../../../ThemeContext";
import UseTipoDocumento from "../../tipo-documento/hooks/UseTipoDocumento";
import { TipoDocumentoEntity } from "../../tipo-documento/interfaces/TipoDocumentoInterface";
import { UsuarioEntity } from "../../usuario/interfaces/UsuarioInterface";
import UseUsuario from "../../usuario/hooks/UseUsuario";
import { AreaEntity } from "../../area/interfaces/AreaInterface";
import UseArea from "../../area/hooks/UseArea";
import { FileManagerEntity } from "../../file-manager/interfaces/FileMangerInterface";
import UseFileManager from "../../file-manager/hooks/UseFileManger";
import { useAuth } from "../../auth/context/AuthContext";
import { MAX_FILE_SIZE } from "../../utils/Constants";

import { MovimientoEntity } from "../../movimiento/interfaces/MovimientoInterface";
import { emptyMovimiento } from "../../movimiento/utils/Constants";
import { InputSwitchChangeEvent } from "primereact/inputswitch";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import UseFile from "../../file/hooks/UseFile";
import UseAnexo from "../../anexo/hooks/UseAnexo";
import { useNavigate, useParams } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { formatDate } from "../../utils/Methods";

const MesaDePartes = () => {
  // custom hooks
  const { themePrimeFlex } = useTheme();

  const authContext = useAuth();

  const userAuth = authContext?.userAuth;

  const params = useParams();

  const { findOne } = UseTramite();

  const navigate = useNavigate();

  //useRefs
  const toast = useRef<Toast>(null);

  const loadFilesRef = useRef<HTMLInputElement>(null);

  const anexosRef = useRef<HTMLInputElement>(null);

  //useStates

  const [loading, setLoading] = useState<boolean>(true);

  const [tramite, setTramite] = useState<TramiteEntity>(emptyTramite);

  //functions
  const findOneTramite = async () => {
    setLoading(true);

    const tramite = await findOne(params.id?.toString() || "0");

    console.log(tramite);

    setLoading(false);

    if (tramite?.message.msgId == 0 && tramite.registro) {
      setTramite(tramite.registro);
    }
  };

  //useEffects
  useEffect(() => {
    if (params?.id) {
      findOneTramite();
    }
  }, []);

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "0",
        width: "50%",
        margin: "2rem auto",
      }}
    >
      <Toast ref={toast} position={"bottom-right"} />

      <Toolbar
        style={{
          margin: "0",
          padding: "0",
          marginBottom: ".5em",
          border: "none",
        }}
        start={
          <label className="block text-2xl font-medium mb-3">
            Mesa de partes virtual
          </label>
        }
      />

      <div
        id="tramite_detalle"
        className="flex flex-column gap-1 justify-content-between mb-2 border-solid border-1 border-gray-500 border-round-md"
      >
        <div className="flex flex-row gap-3 justify-content-start align-items-center py-3 px-4 border-bottom-1 border-gray-500">
          <div>
            <i
              className="pi pi-check-circle text-xl"
              style={{
                color: "#4a4",
              }}
            ></i>
          </div>
          <div>
            <label className="block text-900 font-medium mb-1">
              Registro exitoso
            </label>
            <span className="text-xs">
              Tu documento ha sido registrado y enviado a mesa de partes
            </span>
          </div>
        </div>

        <div className="flex flex-row py-1 px-4" style={{ gap: "1rem" }}>
          <div
            style={{
              width: "100%",
            }}
          >
            <label className="block text-900 text-sm font-medium mb-2">
              CÓDIGO ÚNICO DE TRÁMITE
            </label>
            <span className="block text-900 text-xs mb-2">
              {tramite?.IdTramite.toString().padStart(8, "0")}
            </span>
          </div>
        </div>

        <div className="flex flex-row py-1 px-4" style={{ gap: "1rem" }}>
          <div
            style={{
              width: "100%",
            }}
          >
            <label className="block text-900 text-sm font-medium mb-2">
              FECHA DE REGISTRO
            </label>
            <span className="block text-900 text-xs mb-2">
              {tramite?.CreadoEl
                ? formatDate(new Date(tramite?.CreadoEl))
                : "--:--:--"}
            </span>
          </div>
        </div>

        <div className="flex flex-row py-1 px-4" style={{ gap: "1rem" }}>
          <div
            style={{
              width: "100%",
            }}
          >
            <label className="block text-900 text-sm font-medium mb-2">
              REMITENTE
            </label>
            <span className="block text-900 text-xs mb-2">
              {tramite.Remitente.Nombres +
                " " +
                tramite.Remitente.ApellidoPaterno +
                " " +
                tramite.Remitente.ApellidoMaterno}
            </span>
          </div>
        </div>

        <div className="flex flex-row justify-content-end p-2 border-top-1 border-gray-500 ">
          <Button
            type="button"
            severity="warning"
            onClick={() => {
              const ventanaImpresion = window.open("", "_blank");

              if (ventanaImpresion) {
                // 1. Crear la estructura básica
                ventanaImpresion.document.title = "Imprimir";

                // 2. Inyectar el contenido en el cuerpo del nuevo documento
                ventanaImpresion.document.body.innerHTML = `<!DOCTYPE html>
                  <html lang="es">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Registro Exitoso</title>
                      <!-- Enlace a un icono de éxito, por ejemplo, Font Awesome CDN -->
                      <link rel="stylesheet" href="https://cdnjs.cloudflare.com">
                  </head>
                  <body style="font-family: sans-serif; background-color: #eef1f4; display: flex; justify-content: center; align-items: center; height: 100vh; margin: auto;">
                      <div class="card-container" style="margin: auto; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px; overflow: hidden;">
                          <div class="card-header" style="display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #eee;">
                              <!-- Icono de éxito (usando Font Awesome) -->
                              <i class="fas fa-check-circle success-icon" style="color: #4CAF50; font-size: 30px; margin-right: 15px;"></i>
                              <div class="header-text" style="display: flex; flex-direction: column;">
                                  <h1 style="font-size: 18px; margin: 0; color: #333;">Registro exitoso</h1>
                                  <p style="font-size: 14px; color: #666; margin: 5px 0 0;">Tu documento ha sido registrado y enviado a mesa de partes</p>
                              </div>
                          </div>
                          
                          <div class="card-body" style="padding: 20px;">
                              <div class="detail-item" style="display: flex; flex-direction: column; margin-bottom: 15px;">
                                  <span class="label" style="font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 4px; font-weight: 500;">CÓDIGO ÚNICO DE TRÁMITE</span>
                                  <span class="value" style="font-size: 16px; color: #333; font-weight: bold;">${tramite?.IdTramite?.toString().padStart(8, "0")}</span>
                              </div>
                              <div class="detail-item" style="display: flex; flex-direction: column; margin-bottom: 15px;">
                                  <span class="label" style="font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 4px; font-weight: 500;">FECHA DE REGISTRO</span>
                                  <span class="value" style="font-size: 16px; color: #333; font-weight: bold;">${
                                    tramite?.CreadoEl
                                      ? formatDate(new Date(tramite?.CreadoEl))
                                      : "--:--:--"
                                  }</span>
                              </div>
                              <div class="detail-item" style="display: flex; flex-direction: column; margin-bottom: 0;">
                                  <span class="label" style="font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 4px; font-weight: 500;">REMITENTE</span>
                                  <span class="value" style="font-size: 16px; color: #333; font-weight: bold;">${tramite?.Remitente?.Nombres + " " + tramite?.Remitente?.ApellidoPaterno + " " + tramite?.Remitente?.ApellidoMaterno}</span>
                              </div>
                          </div>
                      </div>
                  </body>
                  </html>
                  `;

                // 4. Imprimir y cerrar
                ventanaImpresion.print();
              }
            }}
            size="small"
            style={{
              padding: "0",
              width: "9rem",
              height: "2.5rem",
              margin: "0",
              color: "#fff",
            }}
          >
            <span className="flex justify-content-between gap-2 align-items-center m-auto text-white">
              <i className="pi pi-print text-sm"></i>
              <span>Imprimir</span>
            </span>
          </Button>
        </div>
      </div>

      <div
        className="flex flex-row gap-3 justify-content-start align-items-center p-3 border-bottom-1 border-gray-500"
        style={{
          background: "rgba(102, 167, 197, 1)",
          color: "#fff",
        }}
      >
        <div>
          <i className="pi pi-info-circle text-xl"></i>
        </div>
        <div>
          <span className="text-xs">
            Conserve el código único de trámite para una consulta posterior del
            seguimiento de su trámite{" "}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MesaDePartes;
