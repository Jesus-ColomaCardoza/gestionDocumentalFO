import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState, useEffect, useRef } from "react";
import UseTramite from "../hooks/UseTramite";
import { TramiteEntity } from "../interfaces/TramiteInterface";
import { Toast } from "primereact/toast";
import { DropdownChangeEvent } from "primereact/dropdown";
import { useTheme } from "../../../ThemeContext";
import UseTipoDocumento from "../../tipo-documento/hooks/UseTipoDocumento";
import { TipoDocumentoEntity } from "../../tipo-documento/interfaces/TipoDocumentoInterface";
import { UsuarioEntity } from "../../usuario/interfaces/UsuarioInterface";
import UseUsuario from "../../usuario/hooks/UseUsuario";
import { AreaEntity } from "../../area/interfaces/AreaInterface";
import UseArea from "../../area/hooks/UseArea";
import FileManagerModal from "../../file-manager/components/FileMangerModal";
import { FileManagerEntity } from "../../file-manager/interfaces/FileMangerInterface";
import UseFileManager from "../../file-manager/hooks/UseFileManger";
import { useAuth } from "../../auth/context/AuthContext";
import { TreeNode } from "primereact/treenode";
import TramiteDestinosModal from "./TramiteDestinosModal";
import {
  MovimientoEntity,
  MovimientoNode,
  MovimientoSeguimientoEntity,
} from "../../movimiento/interfaces/MovimientoInterface";
import { emptyMovimiento } from "../../movimiento/utils/Constants";
import { InputSwitchChangeEvent } from "primereact/inputswitch";
import UseFile from "../../file/hooks/UseFile";
import UseAnexo from "../../anexo/hooks/UseAnexo";
import { useNavigate, useParams } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { Calendar } from "primereact/calendar";
import UseMovimiento from "../../movimiento/hooks/UseMovimiento";

const TramiteRecibidoAtendido = () => {
  // custom hooks
  const { themePrimeFlex } = useTheme();

  const authContext = useAuth();

  const userAuth = authContext?.userAuth;

  const { findAll: findAllTipoDocumento } = UseTipoDocumento();

  const { findAll: findAllRemitentes } = UseUsuario();

  const { findAll: findAllAreas } = UseArea();

  const navigate = useNavigate();

  const { findOneSeguimiento2 } = UseMovimiento();

  const params = useParams();

  //useRefs
  const toast = useRef<Toast>(null);

  const [moviminetoSeguimiento, setMoviminetoSeguimiento] =
    useState<MovimientoSeguimientoEntity>();

  //useStates
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  const [tramite, setTramite] = useState<{
    IdTramite: number;
    FechaInicio?: Date;
  }>({
    IdTramite: 0,
  });

  const [movimiento, setMovimiento] =
    useState<MovimientoEntity>(emptyMovimiento);

  const [tramiteErrors, setTramiteErrors] = useState<any>({});

  const [tramiteDestinosErrors, setTramiteDestinosErrors] = useState<any>({});

  const [tramites, setTramites] = useState<TramiteEntity[]>([]);

  const [tiposDocumento, setTiposDocumento] = useState<
    Pick<TipoDocumentoEntity, "IdTipoDocumento" | "Descripcion">[]
  >([]);

  const [remitentes, setRemitentes] = useState<
    Pick<
      UsuarioEntity,
      "IdUsuario" | "Nombres" | "ApellidoPaterno" | "ApellidoMaterno"
    >[]
  >([]);

  const [areas, setAreas] = useState<
    Pick<AreaEntity, "IdArea" | "Descripcion">[]
  >([]);

  const [fileManagerDialog, setFileManagerDialog] = useState<boolean>(false);

  const [tramiteDestinosDialog, setTramiteDestinosDialog] =
    useState<boolean>(false);

  const [selectedDigitalFiles, setSelectedDigitalFiles] = useState<
    FileManagerEntity[]
  >([]);

  const [selectedTramiteDestinos, setSelectedTramiteDestinos] = useState<
    MovimientoEntity[]
  >([]);

  //functions
  interface OrgNode extends TreeNode {
    data?: MovimientoNode;
    type?: string;
  }

  const [treeMovimientos, setTreeMovimientos] = useState<OrgNode[]>([]);

  function mapToOrgNodes(movimientos: MovimientoNode[]): OrgNode[] {
    return movimientos
      .filter((mov) => !!mov) // evita nulls directos
      .map((mov) => {
        const nodo: OrgNode = {
          key: mov.IdMovimiento?.toString() ?? crypto.randomUUID(),
          label: "movimiento",
          type: "movimiento",
          expanded: true,
          // className: "bg-indigo-500 text-white",
          className: "p-0",
          style: { borderRadius: "12px" },
          data: { ...mov },
          children: Array.isArray(mov.Children)
            ? mapToOrgNodes(mov.Children)
            : [],
        };

        return nodo;
      });
  }

  const findOneSeguimientoMovimiento = async () => {
    setLoading(true);

    const movimiento = await findOneSeguimiento2({
      IdTramite: Number(tramite.IdTramite || 0),
    });

    setLoading(false);

    if (movimiento?.message.msgId == 0 && movimiento.registro) {
      const roots = mapToOrgNodes(movimiento.registro.Seguimiento);

      const rootNode: OrgNode = {
        key: movimiento.registro.Tramite.IdTramite.toString(),
        label: "tramite",
        type: "tramite",
        expanded: true,
        className: "p-0",
        style: { borderRadius: "12px" },
        data: {
          Tramite: {
            IdTramite: movimiento.registro.Tramite.IdTramite,
            Area: movimiento.registro.Tramite.Area,
            FechaInicio: movimiento.registro.Tramite.FechaInicio,
            TipoTramite: movimiento.registro.Tramite.TipoTramite,
            Remitente: movimiento.registro.Tramite.Remitente,
          },
        },
        children: roots,
      };

      setTreeMovimientos([rootNode]);

      setMoviminetoSeguimiento(movimiento.registro);

      toast.current?.show({
        severity: "success",
        detail: `${movimiento.message.msgTxt}`,
        life: 3000,
      });

      setTimeout(() => {
        navigate(`/tramite/seguimiento/resultado/${tramite.IdTramite}`);
      }, 1000);
    } else {
      toast.current?.show({
        severity: "error",
        detail: `${movimiento?.message.msgTxt}`,
        life: 3000,
      });
    }
  };
  // actions CRUD - Esquema TipoDocumento (create, read, update, remove) -> (create, findAll-findOne, update, remove)
  const findAllTipoDocumentoCombox = async () => {
    setLoading(true);
    const tiposDocumentoFindAll = await findAllTipoDocumento();
    setLoading(false);

    if (
      tiposDocumentoFindAll?.message.msgId == 0 &&
      tiposDocumentoFindAll.registro
    ) {
      setTiposDocumento(
        Array.isArray(tiposDocumentoFindAll.registro)
          ? tiposDocumentoFindAll.registro?.map((af) => {
              return {
                IdTipoDocumento: af.IdTipoDocumento,
                Descripcion: af.Descripcion,
              };
            })
          : [],
      );
    }
  };

  // actions CRUD - Remitente (create, read, update, remove) -> (create, findAll-findOne, update, remove)
  const findAllRemitenteCombox = async () => {
    setLoading(true);
    const remitentesFindAll = await findAllRemitentes();
    setLoading(false);

    if (remitentesFindAll?.message.msgId == 0 && remitentesFindAll.registro) {
      setRemitentes(
        Array.isArray(remitentesFindAll.registro)
          ? remitentesFindAll.registro?.map((af) => {
              return {
                IdUsuario: af.IdUsuario,
                Nombres: af.Nombres,
                ApellidoPaterno: af.ApellidoPaterno,
                ApellidoMaterno: af.ApellidoMaterno,
                NombreCompleto: `${af.Nombres} ${af.ApellidoPaterno} ${af.ApellidoMaterno}`,
              };
            })
          : [],
      );
    }
  };

  // actions CRUD - Area (create, read, update, remove) -> (create, findAll-findOne, update, remove)
  const findAllAreaCombox = async () => {
    setLoading(true);
    const areasFindAll = await findAllAreas();
    setLoading(false);

    if (areasFindAll?.message.msgId == 0 && areasFindAll.registro) {
      setAreas(
        Array.isArray(areasFindAll.registro)
          ? areasFindAll.registro?.map((af) => {
              return {
                IdArea: af.IdArea,
                Descripcion: af.Descripcion,
              };
            })
          : [],
      );
    }
  };

  // templates to dialogs
  const hideFileManagerDialog = () => {
    setSubmitted(false);
    setFileManagerDialog(false);
  };

  const showFileManagerDialog = () => {
    setSubmitted(false);
    setFileManagerDialog(true);
  };

  const hideTramiteDestinosDialog = () => {
    setSubmitted(false);
    setTramiteDestinosErrors({});
    setMovimiento(emptyMovimiento);
    setTramiteDestinosDialog(false);
  };

  const showTramiteDestinosDialog = () => {
    setSubmitted(false);
    setTramiteDestinosDialog(true);
  };

  // onChanges
  const onInputTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ) => {
    const val = (e.target && e.target.value) || "";

    setTramite((prev) => ({
      ...prev,
      [name]: val,
    }));

    setTramiteErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const onDropdownChangeMovimiento = (
    e: DropdownChangeEvent,
    nameObj: string,
    nameFK: string,
    nameTagFK?: string,
  ) => {
    const val = (e.target && e.target.value) || "";

    let _movimiento: any = { ...movimiento };

    _movimiento[nameTagFK ? nameTagFK : nameFK] = val[nameFK];

    if (nameObj !== "") {
      _movimiento[nameObj] = { ...val };
    }

    setMovimiento(_movimiento);
  };

  const onSwitchChange = (e: InputSwitchChangeEvent, name: string) => {
    let _movimiento: any = { ...movimiento };
    _movimiento[name] = e.value;
    setMovimiento(_movimiento);
  };

  //useEffects
  useEffect(() => {
    findAllTipoDocumentoCombox();
    findAllRemitenteCombox();
    findAllAreaCombox();
    if (params?.id && params?.id2) {
      findOneSeguimientoMovimiento();
    }
  }, []);

  return (
    <div className="card p-0 m-auto">
      <Toast ref={toast} position={"bottom-right"} />

      <div
        className="flex flex-column flex-wrap justify-content-center"
        style={{ width: "60%", margin: "auto" }}
      >
        <div className="text-start mb-3">
          <h3 className="m-0 ">Consulta el estado de tu trámite</h3>
        </div>

        <div className="flex flex-row flex-wrap justify-content-center">
          <div
            className="flex flex-column flex-wrap gap-1 border-solid border-1 border-gray-500 border-round-md"
            style={{ width: "50%" }}
          >
            <div className="flex flex-column gap-3" style={{ height: "65vh" }}>
              <img
                style={{ height: "100%", width: "100%", objectFit: "contain" }}
                src={
                  "https://static.docsity.com/documents_first_pages/2020/12/02/7381653ecc56f884b0c9e1ccb5dae66c.png"
                }
                alt="Logo de sistema documental"
              />
            </div>
          </div>

          <div
            className="flex flex-column justify-content-between border-solid border-1 border-gray-500 border-round-md"
            style={{ width: "50%" }}
          >
            <div className="flex flex-column">
              <div className="flex flex-row align-items-center py-3 mb-3 px-4 border-bottom-1 border-gray-500">
                <label className="block text-900 font-medium">
                  Datos de trámite
                </label>
              </div>

              <div className="flex flex-column px-4">
                <label
                  htmlFor="IdTramite"
                  className="block text-900 text-sm font-medium mb-2"
                >
                  Código único de trámite
                </label>
                <div className="flex flex-column mb-3 gap-1">
                  <div className="p-inputgroup">
                    <InputText
                      id="IdTramite"
                      value={tramite.IdTramite + ""}
                      onChange={(e) => {
                        onInputTextChange(e, "IdTramite");
                      }}
                      type="text"
                      className="p-inputtext-sm "
                    />
                  </div>
                  {tramiteErrors.IdTramite && (
                    <small className="p-error">{tramiteErrors.IdTramite}</small>
                  )}
                </div>
              </div>

              <div className="flex flex-column px-4">
                <label
                  htmlFor="FechaInicio"
                  className="block text-900 text-sm font-medium mb-2"
                >
                  Fecha
                </label>
                <div className="flex flex-column mb-3 gap-1">
                  <div className="p-inputgroup">
                    <Calendar
                      value={tramite.FechaInicio}
                      onChange={(e) => {
                        setTramite((prev) => ({
                          ...prev,
                          FechaInicio: e.target.value ?? undefined,
                        }));
                      }}
                      dateFormat="dd/mm/yy"
                      placeholder="dd/mm/yyyy"
                      mask="99/99/9999"
                      // showIcon
                    />
                  </div>
                  {tramiteErrors.FechaInicio && (
                    <small className="p-error">
                      {tramiteErrors.FechaInicio}
                    </small>
                  )}
                </div>
              </div>

              <div className="flex flex-column px-4">
                <label
                  htmlFor="CodigoReferencia"
                  className="block text-900 text-sm font-medium mb-2"
                >
                  Validación
                </label>
                <div className="flex flex-column mb-3 gap-1"></div>
              </div>
            </div>

            <div className="flex flex-row py-3 px-4" style={{ gap: "1rem" }}>
              <Button
                type="button"
                onClick={() => {
                  // if (validateForm()) {
                  findOneSeguimientoMovimiento();
                  // }
                }}
                size="small"
                style={{
                  padding: "0",
                  width: "100%",
                  height: "2.5rem",
                  margin: "0",
                  color: "#000",
                }}
              >
                <span className="flex justify-content-between gap-2 align-items-center m-auto text-white">
                  <i className="pi pi-search text-sm"></i>
                  <span>Consultar</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FileManagerModal
        submitted={submitted}
        hideFileManagerDialog={hideFileManagerDialog}
        fileManagerDialog={fileManagerDialog}
        selectedDigitalFiles={selectedDigitalFiles}
        setSelectedDigitalFiles={setSelectedDigitalFiles}
      />

      <TramiteDestinosModal
        submitted={submitted}
        hideTramiteDestinosDialog={hideTramiteDestinosDialog}
        tramiteDestinosDialog={tramiteDestinosDialog}
        selectedTramiteDestinos={selectedTramiteDestinos}
        setSelectedTramiteDestinos={setSelectedTramiteDestinos}
        tramiteDestinosErrors={tramiteDestinosErrors}
        setTramiteDestinosErrors={setTramiteDestinosErrors}
        movimiento={movimiento}
        areas={areas}
        remitentes={remitentes}
        setMovimiento={setMovimiento}
        onInputTextChange={onInputTextChange}
        onDropdownChangeMovimiento={onDropdownChangeMovimiento}
        onSwitchChange={onSwitchChange}
      />
    </div>
  );
};

export default TramiteRecibidoAtendido;
