import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState, useEffect, useRef } from "react";
import UseTramite from "../hooks/UseTramite";
import {
  TramiteEntity,
  TramiteExternoRecibir,
} from "../interfaces/TramiteInterface";
import { Toast } from "primereact/toast";
import { emptyTramiteExternoRecibir } from "../utils/Constants";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useTheme } from "../../../ThemeContext";
import UseTipoDocumento from "../../tipo-documento/hooks/UseTipoDocumento";
import { TipoDocumentoEntity } from "../../tipo-documento/interfaces/TipoDocumentoInterface";
import { UsuarioEntity } from "../../usuario/interfaces/UsuarioInterface";
import UseUsuario from "../../usuario/hooks/UseUsuario";
import { AreaEntity } from "../../area/interfaces/AreaInterface";
import UseArea from "../../area/hooks/UseArea";
import { Tooltip } from "primereact/tooltip";
import { useAuth } from "../../auth/context/AuthContext";
import { MAX_FILE_SIZE } from "../../utils/Constants";
import { formatFileSize } from "../../utils/Methods";
import { MovimientoEntity } from "../../movimiento/interfaces/MovimientoInterface";
import { emptyMovimiento } from "../../movimiento/utils/Constants";
import { InputSwitchChangeEvent } from "primereact/inputswitch";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";
import UseFile from "../../file/hooks/UseFile";
import { AnexoEntity } from "../../anexo/interfaces/AnexoInterface";
import { useNavigate } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { Checkbox } from "primereact/checkbox";
import TyCModal from "./TyCModal";
import UseTipoIdentificacion from "../../tipo-identificacion/hooks/UseTipoIdentificacion";
import { TipoIdentificacionEntity } from "../../tipo-identificacion/interfaces/TipoIdentificacionInterface";
import UseReniec from "../../reniec/hooks/UseReniec";

const TramiteRecibidoExterno = () => {
  // custom hooks
  const { themePrimeFlex } = useTheme();

  const authContext = useAuth();

  const userAuth = authContext?.userAuth;

  const { recibirExterno2 } = UseTramite();

  const { buscarDni, buscarRuc } = UseReniec();

  const { create: createFile, remove: removeFile } = UseFile();

  const { findAll: findAllTipoDocumento } = UseTipoDocumento();

  const { findAll: findAllTipoIdentificacion } = UseTipoIdentificacion();

  const { findAll: findAllRemitentes } = UseUsuario();

  const { findAll: findAllAreas } = UseArea();

  const navigate = useNavigate();

  //useRefs
  const toast = useRef<Toast>(null);

  const loadFilesRef = useRef<HTMLInputElement>(null);

  const anexosRef = useRef<HTMLInputElement>(null);

  //useStates
  const [typePerson, setTypePerson] = useState(0);

  const [submitted, setSubmitted] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  const [loadingDni, setLoadingDni] = useState<boolean>(false);

  const [loadingRuc, setLoadingRuc] = useState<boolean>(false);

  const [loadingTramiteRecibidoExterno, setLoadingTramiteRecibidoExterno] =
    useState<boolean>(false);

  // const [tramite, setTramite] = useState<TramiteEntity>(emptyTramite);

  const [TramiteExternoRecibir, setTramiteExternoRecibir] =
    useState<TramiteExternoRecibir>(emptyTramiteExternoRecibir);

  const [movimiento, setMovimiento] =
    useState<MovimientoEntity>(emptyMovimiento);

  const [tramiteErrors, setTramiteErrors] = useState<any>({});

  const [tramiteDestinosErrors, setTramiteDestinosErrors] = useState<any>({});

  const [tramites, setTramites] = useState<TramiteEntity[]>([]);

  const [tiposDocumento, setTiposDocumento] = useState<
    Pick<TipoDocumentoEntity, "IdTipoDocumento" | "Descripcion">[]
  >([]);

  const [tiposIdentificacion, setTiposIdentificacion] = useState<
    Pick<TipoIdentificacionEntity, "IdTipoIdentificacion" | "Descripcion">[]
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

  // const [selectedDigitalFiles, setSelectedDigitalFiles] = useState<
  //   FileManagerEntity[]
  // >([]);

  const [selectedDigitalFiles, setSelectedDigitalFiles] = useState<
    { id: string; file: File }[]
  >([]);

  const [selectedTramiteDestinos, setSelectedTramiteDestinos] = useState<
    MovimientoEntity[]
  >([]);

  const [selectedLoadFiles, setSelectedLoadFiles] = useState<File[]>([]);

  const [selectedAnexos, setSelectedAnexos] = useState<
    { id: string; file: File }[]
  >([]);

  const [tyCModal, setTyCModal] = useState<boolean>(true);

  //functions
  const recibirTramiteExterno2 = async () => {
    setSubmitted(true);
    if (
      TramiteExternoRecibir.Asunto.trim() &&
      TramiteExternoRecibir.IdTipoDocumento != 0 &&
      TramiteExternoRecibir.CodigoReferenciaDoc.trim() &&
      TramiteExternoRecibir.Folios != 0 &&
      TramiteExternoRecibir.IdTipoIdentificacion != 0 &&
      TramiteExternoRecibir.NroIdentificacion.trim() &&
      TramiteExternoRecibir.Nombres.trim() &&
      TramiteExternoRecibir.ApellidoPaterno.trim() &&
      TramiteExternoRecibir.ApellidoPaterno.trim()
    ) {
      setLoadingTramiteRecibidoExterno(true);

      //1 we create digital physical files
      let arrayDfUpload: {
        Id?: number;
        UrlBase?: string;
        Url?: string;
        Nombre?: string;
        Size?: number;
        Formato?: string;
        Titulo: string;
      }[] = [];

      const uploadDigitalFilesResults = await Promise.all(
        Array.from(selectedDigitalFiles).map(async (df) => {
          const formData = new FormData();

          formData.append("file", df.file);

          const dfUpload = await createFile(formData);

          if (dfUpload?.message?.msgId === 0) {
            const data = {
              Titulo: dfUpload.registro?.parseoriginalname!,
              Formato: dfUpload.registro?.mimetype,
              Nombre: dfUpload.registro?.filename,
              Url: dfUpload.registro?.url!,
              Size: dfUpload.registro?.size,
              UrlBase: dfUpload.registro?.path!,
            };

            arrayDfUpload.push(data);

            return {
              success: true,
              data: data,
            };
          } else {
            return {
              success: false,
              error: dfUpload?.message?.msgTxt || "Error desconocido",
            };
          }
        })
      );

      // const successfulUploads = uploadDigital FilesResults
      //   .filter((r) => r.success)
      //   .map((r) => r.data);

      const failedDigitalFilesUploads = uploadDigitalFilesResults.filter(
        (r) => !r.success
      );

      if (failedDigitalFilesUploads.length > 0) {
        toast.current?.show({
          severity: "error",
          detail: "No se pudieron cargar todos los archivos digitales.",
          life: 3000,
        });
        return;
      }

      //2 we create anexos physical files
      let arrayAnexosUpload: AnexoEntity[] = [];

      const uploadResults = await Promise.all(
        Array.from(selectedAnexos).map(async (anexo) => {
          const formData = new FormData();

          formData.append("file", anexo.file);

          const anexoUpload = await createFile(formData);

          if (anexoUpload?.message?.msgId === 0) {
            const data = {
              Titulo: anexoUpload.registro?.parseoriginalname!,
              FormatoAnexo: anexoUpload.registro?.mimetype,
              NombreAnexo: anexoUpload.registro?.filename,
              UrlAnexo: anexoUpload.registro?.url!,
              SizeAnexo: anexoUpload.registro?.size,
              UrlBase: anexoUpload.registro?.path,
              IdTramite: 0,
              Activo: true,
            };

            arrayAnexosUpload.push(data);

            return {
              success: true,
              data: data,
            };
          } else {
            return {
              success: false,
              error: anexoUpload?.message?.msgTxt || "Error desconocido",
            };
          }
        })
      );

      // const successfulUploads = uploadResults
      //   .filter((r) => r.success)
      //   .map((r) => r.data);

      const failedUploads = uploadResults.filter((r) => !r.success);

      if (failedUploads.length > 0) {
        toast.current?.show({
          severity: "error",
          detail: "No se pudieron cargar todos los anexos.",
          life: 3000,
        });
        return;
      }

      //2 we create tramiteEmitidoCreate
      let tramiteCreateEmitido = await recibirExterno2({
        //data documento
        CodigoReferenciaDoc: TramiteExternoRecibir.CodigoReferenciaDoc,
        Asunto: TramiteExternoRecibir.Asunto,
        Observaciones: TramiteExternoRecibir.Observaciones,
        Folios: TramiteExternoRecibir.Folios,
        IdTipoDocumento: TramiteExternoRecibir.IdTipoDocumento,

        //data tramite
        FechaInicio: new Date().toISOString(),
        IdTipoTramite: TramiteExternoRecibir.IdTipoTramite || 2, // IdTipoTramite - Externo - 2
        IdAreaEmision: TramiteExternoRecibir.IdAreaEmision || 30,
        IdEstado: TramiteExternoRecibir.IdEstado || 12, // IdTipoTramite - Pendiente - 12
        IdRemitente: TramiteExternoRecibir.IdRemitente,
        Activo: TramiteExternoRecibir.Activo,

        //others
        // DigitalFiles: selectedDigitalFiles,
        DigitalFiles: arrayDfUpload,
        TramiteDestinos: [
          {
            IdAreaDestino: TramiteExternoRecibir.IdAreaEmision || 30, // area mesa de partes - 30
            FirmaDigital: true,
            NombreResponsable: {
              NombreCompleto:
                TramiteExternoRecibir.Remitente?.Nombres +
                " " +
                TramiteExternoRecibir.Remitente?.ApellidoPaterno +
                " " +
                TramiteExternoRecibir.Remitente?.ApellidoMaterno,
            },
          },
        ],
        Anexos: arrayAnexosUpload,

        //data usuario exteno
        Nombres: TramiteExternoRecibir.Nombres,
        ApellidoPaterno: TramiteExternoRecibir.ApellidoPaterno,
        ApellidoMaterno: TramiteExternoRecibir.ApellidoMaterno,
        Email: TramiteExternoRecibir.Email,
        Celular: TramiteExternoRecibir.Celular,
        Direccion: TramiteExternoRecibir.Direccion,
        RazonSocial: TramiteExternoRecibir.RazonSocial,
        IdTipoIdentificacion: TramiteExternoRecibir.RazonSocial != "" ? 2 : 1, // IdTipoIdentificacion 1: DNI - 2: RUC
        NroIdentificacion:
          TramiteExternoRecibir.RazonSocial != ""
            ? TramiteExternoRecibir.RUC || ""
            : TramiteExternoRecibir.NroIdentificacion,
        IdTipoUsuario: TramiteExternoRecibir.RazonSocial != "" ? 1 : 2, // IdTipoUsuario - 1: juridica - 2: natural
        IdRol: "USER_EXTERNO", //Usuario Externo o Ciudadano
      });

      setLoadingTramiteRecibidoExterno(false);

      if (
        tramiteCreateEmitido?.message.msgId == 0 &&
        tramiteCreateEmitido.registro
      ) {
        setTramites([...tramites, tramiteCreateEmitido.registro]);

        
        setSelectedAnexos([]);
        
        toast.current?.show({
          severity: "success",
          detail: `${tramiteCreateEmitido.message.msgTxt}`,
          life: 3000,
        });

        console.log(tramiteCreateEmitido.registro);
        
        navigate("/mesa_de_partes/" + tramiteCreateEmitido.registro.TramiteEmitido.IdTramite);

      } else if (tramiteCreateEmitido?.message.msgId == 1) {
        toast.current?.show({
          severity: "error",
          detail: `${tramiteCreateEmitido.message.msgTxt}`,
          life: 3000,
        });
      }

      // setFileManagerDialog(false);
      // setTramiteEmitidoCreate(emptyTramite);
    }
  };

  // actions CRUD - Esquema TipoIdentificacion (create, read, update, remove) -> (create, findAll-findOne, update, remove)
  const findAllTipoIdentificacionCombox = async () => {
    setLoading(true);
    const tiposIdentificacionFindAll = await findAllTipoIdentificacion();
    setLoading(false);

    if (
      tiposIdentificacionFindAll?.message.msgId == 0 &&
      tiposIdentificacionFindAll.registro
    ) {
      setTiposIdentificacion(
        Array.isArray(tiposIdentificacionFindAll.registro)
          ? tiposIdentificacionFindAll.registro?.map((af) => {
              return {
                IdTipoIdentificacion: af.IdTipoIdentificacion,
                Descripcion: af.Descripcion,
              };
            })
          : []
      );
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
          : []
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
          : []
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
          : []
      );
    }
  };

  const onBuscarDni = async () => {
    setLoadingDni(true);

    let dni = await buscarDni({
      Dni: TramiteExternoRecibir.NroIdentificacion || "",
    });

    if (dni?.message.msgId == 0 && dni.registro) {
      setTramiteExternoRecibir((prev) => ({
        ...prev,
        NroIdentificacion: dni.registro?.document_number || "",
        Nombres: dni.registro?.first_name || "",
        ApellidoPaterno: dni.registro?.first_last_name || "",
        ApellidoMaterno: dni.registro?.second_last_name || "",
        IdTipoIdentificacion: 1,
        TipoIdentificacion: {
          IdTipoIdentificacion: 1,
          Descripcion: "DNI",
        },
      }));

      toast.current?.show({
        severity: "success",
        detail: `${dni.message.msgTxt}`,
        life: 3000,
      });
    } else if (dni?.message.msgId == 1) {
      toast.current?.show({
        severity: "error",
        detail: `${dni.message.msgTxt}`,
        life: 3000,
      });
    }

    setLoadingDni(false);
  };

  const onBuscarRuc = async () => {
    setLoadingRuc(true);

    let ruc = await buscarRuc({
      Ruc: TramiteExternoRecibir.RUC || "",
    });

    if (ruc?.message.msgId == 0 && ruc.registro) {
      setTramiteExternoRecibir((prev) => ({
        ...prev,
        NroIdentificacion: ruc.registro?.numero_documento || "",
        RazonSocial: ruc.registro?.razon_social || "",
        IdTipoIdentificacion: 2,
        TipoIdentificacion: {
          IdTipoIdentificacion: 2,
          Descripcion: "RUC",
        },
      }));

      toast.current?.show({
        severity: "success",
        detail: `${ruc.message.msgTxt}`,
        life: 3000,
      });
    } else if (ruc?.message.msgId == 1) {
      toast.current?.show({
        severity: "error",
        detail: `${ruc.message.msgTxt}`,
        life: 3000,
      });
    }

    setLoadingRuc(false);
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

  const onChangeLoadFiles = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      // setLoadingDocumentoCreateOrUpdate(true);

      // we validate if there is some file exceeds the limit size
      const invalidFiles = Array.from(files).filter(
        (file) => file.size > MAX_FILE_SIZE
      );

      if (invalidFiles.length > 0) {
        toast.current?.show({
          severity: "warn",
          detail: `El archivo "${invalidFiles[0].name}" supera el límite de 2MB.`,
          life: 3000,
        });

        // clear input file
        if (loadFilesRef.current) {
          loadFilesRef.current.value = "";
        }

        return;
      }

      setSelectedDigitalFiles((prev) => [
        ...prev,
        ...Array.from(files).map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          file: file,
        })),
      ]);
    }
  };

  const onChangeAnexos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      // setLoadingDocumentoCreateOrUpdate(true);

      // we validate if there is some file exceeds the limit size
      const invalidFiles = Array.from(files).filter(
        (file) => file.size > MAX_FILE_SIZE
      );

      if (invalidFiles.length > 0) {
        toast.current?.show({
          severity: "warn",
          detail: `El archivo "${invalidFiles[0].name}" supera el límite de 2MB.`,
          life: 3000,
        });

        // clear input file
        if (anexosRef.current) {
          anexosRef.current.value = "";
        }

        return;
      }

      setSelectedAnexos((prev) => [
        ...prev,
        ...Array.from(files).map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          file: file,
        })),
      ]);
    }
  };

  // onChanges
  const onInputTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const val = (e.target && e.target.value) || "";

    setTramiteExternoRecibir((prev) => ({
      ...prev,
      [name]: val,
    }));

    setTramiteErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const onInputNumberChange = (e: InputNumberChangeEvent, name: string) => {
    const val = e.value ?? null;

    setTramiteExternoRecibir((prev) => ({
      ...prev,
      [name]: val,
    }));

    setTramiteErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const onInputTextAreaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    name: string
  ) => {
    const val = (e.target && e.target.value) || "";
    let _tramite = { ...TramiteExternoRecibir };

    // @ts-ignore
    _tramite[name] = val;

    setTramiteExternoRecibir(_tramite);

    setTramiteErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const onDropdownChange = (
    e: DropdownChangeEvent,
    nameObj: string,
    nameFK: string,
    nameTagFK?: string
  ) => {
    const val = (e.target && e.target.value) || "";

    let _tramite: any = { ...TramiteExternoRecibir };

    _tramite[nameTagFK ? nameTagFK : nameFK] = val[nameFK];
    _tramite[nameObj] = { ...val };

    setTramiteExternoRecibir(_tramite);

    setTramiteErrors((prev: any) => ({
      ...prev,
      [nameTagFK ? nameTagFK : nameFK]: undefined,
    }));
  };

  const onDropdownChangeMovimiento = (
    e: DropdownChangeEvent,
    nameObj: string,
    nameFK: string,
    nameTagFK?: string
  ) => {
    const val = (e.target && e.target.value) || "";

    let _movimiento: any = { ...movimiento };

    _movimiento[nameTagFK ? nameTagFK : nameFK] = val[nameFK];

    if (nameObj !== "") {
      _movimiento[nameObj] = { ...val };
    }

    setMovimiento(_movimiento);
  };

  const onDropdownChangeX = (
    //onchangegeneral of text , to do: number
    e: DropdownChangeEvent,
    state: any,
    setState: React.Dispatch<React.SetStateAction<any>>,
    nameObj: string,
    nameFK: string,
    nameTagFK?: string
  ) => {
    const val = (e.target && e.target.value) || "";

    let _state: any = { ...state };

    _state[nameTagFK ? nameTagFK : nameFK] = val[nameFK];

    if (nameObj !== "") {
      _state[nameObj] = { ...val };
    }

    setState(_state);
  };

  const onSwitchChange = (e: InputSwitchChangeEvent, name: string) => {
    let _movimiento: any = { ...movimiento };
    _movimiento[name] = e.value;
    setMovimiento(_movimiento);
  };

  const validateForm = () => {
    let fieldErrors: any = {};

    if (!TramiteExternoRecibir.Asunto.trim()) {
      fieldErrors.Asunto = "Asunto es obligatorio.";
    }

    if (TramiteExternoRecibir.IdTipoDocumento == 0) {
      fieldErrors.IdTipoDocumento = "Tipo de documento es obligatorio.";
    }

    if (!TramiteExternoRecibir.CodigoReferenciaDoc.trim()) {
      fieldErrors.CodigoReferenciaDoc = "Codigo de referencia es obligatoria.";
    }

    // if (TramiteExternoRecibir.IdRemitente == 0) {
    //   fieldErrors.IdRemitente = "Destinatario / Responsable de área es obligatorio.";
    // }

    if (TramiteExternoRecibir.Folios == 0) {
      fieldErrors.Folios = "Folios es obligatorio.";
    }

    // if (TramiteExternoRecibir.IdAreaEmision == 0) {
    //   fieldErrors.IdAreaEmision = "Área de emición es obligatoria.";
    // }

    // if (TramiteExternoRecibir.IdAreaEmision == 0) {
    //   fieldErrors.IdAreaEmision = "Área de destino es obligatoria.";
    // }

    if (TramiteExternoRecibir.IdTipoIdentificacion == 0) {
      fieldErrors.IdTipoIdentificacion =
        "Tipo de identificacion es obligatorio.";
    }

    if (!TramiteExternoRecibir.NroIdentificacion.trim()) {
      fieldErrors.NroIdentificacion = "Nro de identificacion es obligatoria.";
    }

    if (!TramiteExternoRecibir.Nombres.trim()) {
      fieldErrors.Nombres = "Nombres es obligatorio.";
    }

    if (!TramiteExternoRecibir.ApellidoPaterno.trim()) {
      fieldErrors.ApellidoPaterno = "Apellido paterno es obligatorio.";
    }

    if (!TramiteExternoRecibir.ApellidoMaterno.trim()) {
      fieldErrors.ApellidoMaterno = "Apellido materno es obligatorio.";
    }

    setTramiteErrors(fieldErrors);

    console.log(Object.keys(fieldErrors));

    return Object.keys(fieldErrors).length === 0;
  };
  //useEffects
  useEffect(() => {
    findAllTipoDocumentoCombox();
    findAllRemitenteCombox();
    findAllAreaCombox();
    findAllTipoIdentificacionCombox();
  }, []);

  return (
    <div
      className="card"
      style={{
        padding: "0",
        margin: "auto",
        width: "70%",
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
          <div className="flex flex-column border-1 border-gray-500 border-round-md">
            <div className="flex flex-row justify-content-between align-items-center py-3 px-4 border-bottom-1 border-gray-500">
              <label className="block text-900 font-medium">
                Envío de documentos
              </label>
            </div>
            <span className="text-sm py-2 px-4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni
              fugiat aliquam beatae non voluptatibus similique sequi itaque
              soluta rem! Sed sit veniam laudantium incidunt architecto,
              voluptas et mollitia fuga accusantium?
            </span>
          </div>
        }
      />

      <div className="flex flex-column justify-content-between mb-3 border-solid border-1 border-gray-500 border-round-md">
        <div className="flex flex-column gap-1">
          <div className="flex flex-row justify-content-between align-items-center py-3 px-4 border-bottom-1 border-gray-500">
            <label className="block text-900 font-medium">
              Datos del solicitante
            </label>
          </div>

          <div
            className="flex flex-row align-items-center py-2 px-4"
            style={{ gap: "1rem" }}
          >
            <label
              htmlFor="TipoDocumento"
              className="block text-900 text-sm font-medium mb-2"
            >
              Tipo de persona
            </label>
            <div
              className="flex flex-row flex-wrap justify-content-end align-items-center"
              style={{
                gap: "1rem",
              }}
            >
              <div className="d-flex align-items-center">
                <div className="p-inputgroup">
                  <select
                    value={typePerson}
                    onChange={(e) => {
                      setTypePerson(+e.target.value);
                    }}
                    className="p-inputgroup-addon text-sm"
                    style={{
                      height: "2.5rem",
                      color: "#000",
                      background: "#eee",
                    }}
                  >
                    <option value={0}>Persona Natural</option>
                    <option value={1}>Persona Jurídica</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {typePerson === 1 && (
            <div className="flex flex-row px-4" style={{ gap: "1rem" }}>
              <div
                style={{
                  width: "35%",
                }}
              >
                <label
                  htmlFor="RUC"
                  className="block text-900 text-sm font-medium mb-2"
                >
                  RUC
                </label>
                <div className="flex flex-column mb-3 gap-1">
                  <div className="flex align-items-center">
                    <InputText
                      id="RUC"
                      value={TramiteExternoRecibir.RUC}
                      onChange={(e) => {
                        onInputTextChange(e, "RUC");
                      }}
                      type="text"
                      className="p-inputtext-sm"
                      style={{
                        width: "90%",
                      }}
                    />
                    <Button
                      loading={loadingRuc}
                      icon="pi pi-search"
                      className="ml-2 text-white"
                      severity="secondary"
                      onClick={onBuscarRuc}
                      style={{
                        width: "2.5em",
                        height: "2em",
                      }}
                    ></Button>
                  </div>
                  {tramiteErrors.RUC && (
                    <small className="p-error">{tramiteErrors.RUC}</small>
                  )}
                </div>
              </div>

              <div
                style={{
                  width: "65%",
                }}
              >
                <label
                  htmlFor="RazonSocial"
                  className="block text-900 text-sm font-medium mb-2"
                >
                  Razón social
                </label>
                <div className="flex flex-column mb-3 gap-1">
                  <div className="p-inputgroup">
                    <InputText
                      id="RazonSocial"
                      value={TramiteExternoRecibir.RazonSocial}
                      onChange={(e) => {
                        onInputTextChange(e, "RazonSocial");
                      }}
                      type="text"
                      className="p-inputtext-sm "
                    />
                  </div>
                  {tramiteErrors.RazonSocial && (
                    <small className="p-error">
                      {tramiteErrors.RazonSocial}
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-row px-4" style={{ gap: "1rem" }}>
            <div
              style={{
                width: "50%",
              }}
            >
              <label
                htmlFor="IdTipoIdentificacion"
                className="block text-900 text-sm font-medium mb-2"
              >
                Tipo de identificación
              </label>
              <div className="flex flex-column mb-3 gap-1">
                <div className="p-inputgroup">
                  <Dropdown
                    value={TramiteExternoRecibir.TipoIdentificacion}
                    onChange={(e) => {
                      onDropdownChange(
                        e,
                        "TipoIdentificacion",
                        "IdTipoIdentificacion",
                      );
                    }}
                    options={tiposIdentificacion}
                    optionLabel="Descripcion"
                    filter
                    placeholder="Seleccionar..."
                    className="w-full flex flex-row align-items-center p-inputtext-sm"
                    showClear
                    style={{
                      paddingTop: "1.2rem",
                      paddingBottom: "1.2rem",
                      width: "16rem",
                      height: "2rem",
                    }}
                  />
                </div>
                {tramiteErrors.IdTipoIdentificacion && (
                  <small className="p-error">
                    {tramiteErrors.IdTipoIdentificacion}
                  </small>
                )}
              </div>
            </div>

            <div
              style={{
                width: "50%",
              }}
            >
              <label
                htmlFor="NroIdentificacion"
                className="block text-900 text-sm font-medium mb-2"
              >
                Número de documento
              </label>
              <div className="flex flex-column mb-3 gap-1">
                <div className="flex align-items-center">
                  <InputText
                    id="NroIdentificacion"
                    value={TramiteExternoRecibir.NroIdentificacion}
                    onChange={(e) => {
                      onInputTextChange(e, "NroIdentificacion");
                    }}
                    type="text"
                    className="p-inputtext-sm"
                    style={{
                      width: "90%",
                    }}
                  />
                  <Button
                    loading={loadingDni}
                    icon="pi pi-search"
                    className="ml-2 text-white"
                    severity="secondary"
                    onClick={onBuscarDni}
                    style={{
                      width: "2.5em",
                      height: "2em",
                    }}
                  ></Button>
                </div>
                {tramiteErrors.NroIdentificacion && (
                  <small className="p-error">
                    {tramiteErrors.NroIdentificacion}
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row px-4" style={{ gap: "1rem" }}>
            <div
              style={{
                width: "32%",
              }}
            >
              <label
                htmlFor="Nombres"
                className="block text-900 text-sm font-medium mb-2"
              >
                Nombres
              </label>
              <div className="flex flex-column mb-3 gap-1">
                <div className="p-inputgroup">
                  <InputText
                    id="Nombres"
                    value={TramiteExternoRecibir.Nombres}
                    onChange={(e) => {
                      onInputTextChange(e, "Nombres");
                    }}
                    type="text"
                    className="p-inputtext-sm "
                  />
                </div>
                {tramiteErrors.Nombres && (
                  <small className="p-error">{tramiteErrors.Nombres}</small>
                )}
              </div>
            </div>

            <div
              style={{
                width: "32%",
              }}
            >
              <label
                htmlFor="ApellidoPaterno"
                className="block text-900 text-sm font-medium mb-2"
              >
                Apellido paterno
              </label>
              <div className="flex flex-column mb-3 gap-1">
                <div className="p-inputgroup">
                  <InputText
                    id="ApellidoPaterno"
                    value={TramiteExternoRecibir.ApellidoPaterno}
                    onChange={(e) => {
                      onInputTextChange(e, "ApellidoPaterno");
                    }}
                    type="text"
                    className="p-inputtext-sm "
                  />
                </div>
                {tramiteErrors.ApellidoPaterno && (
                  <small className="p-error">
                    {tramiteErrors.ApellidoPaterno}
                  </small>
                )}
              </div>
            </div>

            <div
              style={{
                width: "32%",
              }}
            >
              <label
                htmlFor="ApellidoMaterno"
                className="block text-900 text-sm font-medium mb-2"
              >
                Apellido materno
              </label>
              <div className="flex flex-column mb-3 gap-1">
                <div className="p-inputgroup">
                  <InputText
                    id="ApellidoMaterno"
                    value={TramiteExternoRecibir.ApellidoMaterno}
                    onChange={(e) => {
                      onInputTextChange(e, "ApellidoMaterno");
                    }}
                    type="text"
                    className="p-inputtext-sm "
                  />
                </div>
                {tramiteErrors.ApellidoMaterno && (
                  <small className="p-error">
                    {tramiteErrors.ApellidoMaterno}
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row px-4" style={{ gap: "1rem" }}>
            <div
              style={{
                width: "50%",
              }}
            >
              <label
                htmlFor="Email"
                className="block text-900 text-sm font-medium mb-2"
              >
                Correo electrónico
              </label>
              <div className="flex flex-column mb-3 gap-1">
                <div className="p-inputgroup">
                  <InputText
                    id="Email"
                    value={TramiteExternoRecibir.Email}
                    onChange={(e) => {
                      onInputTextChange(e, "Email");
                    }}
                    type="text"
                    className="p-inputtext-sm "
                  />
                </div>
                {tramiteErrors.Email && (
                  <small className="p-error">{tramiteErrors.Email}</small>
                )}
              </div>
            </div>

            <div
              style={{
                width: "50%",
              }}
            >
              <label
                htmlFor="Celular"
                className="block text-900 text-sm font-medium mb-2"
              >
                Teléfono
              </label>
              <div className="flex flex-column mb-3 gap-1">
                <div className="p-inputgroup">
                  <InputText
                    id="Celular"
                    value={TramiteExternoRecibir.Celular}
                    onChange={(e) => {
                      onInputTextChange(e, "Celular");
                    }}
                    type="text"
                    className="p-inputtext-sm "
                  />
                </div>
                {tramiteErrors.Celular && (
                  <small className="p-error">{tramiteErrors.Celular}</small>
                )}
              </div>
            </div>

            <div
              style={{
                width: "50%",
              }}
            >
              <label
                htmlFor="Direccion"
                className="block text-900 text-sm font-medium mb-2"
              >
                Dirección
              </label>
              <div className="flex flex-column mb-3 gap-1">
                <div className="p-inputgroup">
                  <InputText
                    id="Direccion"
                    value={TramiteExternoRecibir.Direccion}
                    onChange={(e) => {
                      onInputTextChange(e, "Direccion");
                    }}
                    type="text"
                    className="p-inputtext-sm "
                  />
                </div>
                {tramiteErrors.Direccion && (
                  <small className="p-error">{tramiteErrors.Direccion}</small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-column justify-content-between mb-3 border-solid border-1 border-gray-500 border-round-md">
        <div className="flex flex-column gap-1"></div>
        <div className="flex flex-row justify-content-between align-items-center py-3 px-4 border-bottom-1 border-gray-500">
          <label className="block text-900 font-medium">
            Datos del documento
          </label>
        </div>

        <div className="flex flex-row py-2 px-4" style={{ gap: "1rem" }}>
          <div
            style={{
              width: "100%",
            }}
          >
            <div className="flex flex-row justify-content-between align-items-center">
              <label className="block text-900 text-sm font-medium">
                Archivo digital
              </label>

              <div
                className="flex flex-row flex-wrap justify-content-end align-items-center"
                style={{
                  gap: "1rem",
                }}
              >
                {/* <Button
                    type="button"
                    onClick={showFileManagerDialog}
                    size="small"
                    severity="secondary"
                    style={{
                      padding: "0",
                      width: "9rem",
                      height: "2.5rem",
                      margin: "0",
                      color: "#fff",
                    }}
                  >
                    <span className="flex justify-content-between gap-2 align-items-center m-auto text-white">
                      <i className="pi pi-file-import text-sm"></i>
                      <span>Buscar archivo</span>
                    </span>
                  </Button> */}

                <Button
                  type="button"
                  onClick={() => {
                    loadFilesRef.current?.click();
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
                    <i className="pi pi-file-plus text-sm"></i>
                    <span>Cargar archivo</span>
                  </span>
                </Button>
                <input
                  ref={loadFilesRef}
                  type="file"
                  accept="application/pdf"
                  onChange={onChangeLoadFiles}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div
              className="mt-3 mb-1 border-round-md"
              style={{
                backgroundColor:
                  themePrimeFlex === "dark" ? "#111827" : "#ffffffde",
                border:
                  themePrimeFlex === "dark"
                    ? "1px solid #424b57"
                    : "1px solid #d1d5db",
                minHeight: "3rem",
              }}
            >
              {selectedDigitalFiles.map((df) => {
                return (
                  <div
                    key={df.id}
                    className="flex flex-row justify-content-between p-2"
                    style={{
                      gap: "1rem",
                      borderBottom:
                        themePrimeFlex === "dark"
                          ? "1px solid #424b57"
                          : "1px solid #d1d5db",
                    }}
                  >
                    <div className="flex flex-row gap-2">
                      <div className="flex align-items-center justify-content-center pr-2">
                        <i
                          className="pi pi-file-pdf"
                          style={{ color: "#559", fontSize: "1.5rem" }}
                        ></i>
                      </div>
                      <div className="flex flex-column gap-2">
                        <a
                          className="hover:underline hover:text-blue-300 text-xs"
                          style={{
                            textDecoration: "none",
                            color: "var(--text-color)",
                          }}
                          href={`${URL.createObjectURL(df.file)}`}
                          target="_blank"
                        >
                          {df.file.name}
                        </a>
                        <span className="flex flex-row gap-2  m-0">
                          {/* <span className="text-sm">
                            {df.Estado.Descripcion}
                          </span>
                          <span className="text-sm">-</span> */}
                          <span className="text-sm">
                            {formatFileSize(df.file.size || 0)}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex align-items-center justify-content-center pr-1">
                      {/* <Tooltip target=".icon-bolt" />
                      <i
                        className="pi pi-bolt m-1 icon-bolt"
                        style={{ color: "#559", fontSize: "1rem" }}
                        data-pr-tooltip="Firmar"
                        onClick={() => {
                          // code about signature a document
                        }}
                      ></i> */}
                      <i
                        className="pi pi-trash m-1"
                        style={{ color: "#559", fontSize: "1rem" }}
                        onClick={() => {
                          setSelectedDigitalFiles((prev) => {
                            return prev.filter((p) => p.id != df.id);
                          });
                        }}
                      ></i>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-content-start align-items-center mb-2">
              <span className="text-xs m-0">
                Selecciona el documento principal del trámite, debe estar en
                formato PDF
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row px-4" style={{ gap: "1rem" }}>
          <div
            style={{
              width: "40%",
            }}
          >
            <label
              htmlFor="TipoDocumento"
              className="block text-900 text-sm font-medium mb-2"
            >
              Tipo de documento
            </label>
            <div className="flex flex-column mb-3 gap-1">
              <div className="p-inputgroup">
                <Dropdown
                  value={TramiteExternoRecibir.TipoDocumento}
                  onChange={(e) => {
                    onDropdownChange(e, "TipoDocumento", "IdTipoDocumento");
                  }}
                  options={tiposDocumento}
                  optionLabel="Descripcion"
                  filter
                  placeholder="Seleccionar..."
                  className="w-full flex flex-row align-items-center p-inputtext-sm"
                  showClear
                  style={{
                    paddingTop: "1.2rem",
                    paddingBottom: "1.2rem",
                    width: "16rem",
                    height: "2rem",
                  }}
                />
              </div>
              {tramiteErrors.IdTipoDocumento && (
                <small className="p-error">
                  {tramiteErrors.IdTipoDocumento}
                </small>
              )}
            </div>
          </div>

          <div
            style={{
              width: "40%",
            }}
          >
            <label
              htmlFor="CodigoReferenciaDoc"
              className="block text-900 text-sm font-medium mb-2"
            >
              Nº de referencia
            </label>
            <div className="flex flex-column mb-3 gap-1">
              <div className="p-inputgroup">
                <InputText
                  id="CodigoReferenciaDoc"
                  value={TramiteExternoRecibir.CodigoReferenciaDoc}
                  onChange={(e) => {
                    onInputTextChange(e, "CodigoReferenciaDoc");
                  }}
                  type="text"
                  className="p-inputtext-sm "
                />
              </div>
              {tramiteErrors.CodigoReferenciaDoc && (
                <small className="p-error">
                  {tramiteErrors.CodigoReferenciaDoc}
                </small>
              )}
            </div>
          </div>

          <div
            style={{
              width: "20%",
            }}
          >
            <label
              htmlFor="Folios"
              className="block text-900 text-sm font-medium mb-2"
            >
              Folios
            </label>
            <div className="flex flex-column mb-3 gap-1">
              <div className="p-inputgroup">
                <InputNumber
                  id="Folios"
                  value={TramiteExternoRecibir.Folios}
                  onChange={(e) => {
                    onInputNumberChange(e, "Folios");
                  }}
                  type="text"
                  placeholder="Folios"
                  className="p-inputtext-sm "
                />
              </div>
              {tramiteErrors.Folios && (
                <small className="p-error">{tramiteErrors.Folios}</small>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row px-4" style={{ gap: "1rem" }}>
          <div
            style={{
              width: "100%",
            }}
          >
            <label
              htmlFor="Asunto"
              className="block text-900 text-sm font-medium mb-2"
            >
              Asunto
            </label>
            <div className="flex flex-column mb-3 gap-1">
              <div className="p-inputgroup">
                <InputTextarea
                  id="Asunto"
                  value={TramiteExternoRecibir.Asunto}
                  onChange={(e) => onInputTextAreaChange(e, "Asunto")}
                  autoFocus
                  rows={2}
                  // className={classNames({
                  //   "p-invalid": props.submitted && !props.documento.Asunto,
                  // })}
                />
              </div>
              {tramiteErrors.Asunto && (
                <small className="p-error">{tramiteErrors.Asunto}</small>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-column justify-content-between mb-3 border-solid border-1 border-gray-500 border-round-md">
        <div className="flex flex-column gap-1"></div>
        <div className="flex flex-row justify-content-between align-items-center py-2 px-4 pb-3 border-bottom-1 border-gray-500">
          <label
            htmlFor="ApellidoPaterno"
            className="block text-900 font-medium"
            style={{
              width: "30%",
            }}
          >
            Anexos
          </label>

          <Button
            type="button"
            onClick={() => {
              anexosRef.current?.click();
            }}
            size="small"
            severity="contrast"
            style={{
              padding: "0",
              width: "6.5rem",
              height: "2.5rem",
              margin: "0",
              color: "#000",
              background: "#eee",
              border: "none",
            }}
          >
            <span className="flex justify-content-between gap-2 align-items-center m-auto">
              <i className="pi pi-plus text-sm"></i>
              <span>Agregar</span>
            </span>
          </Button>
          <input
            ref={anexosRef}
            type="file"
            accept="application/pdf"
            onChange={onChangeAnexos}
            style={{ display: "none" }}
          />
        </div>

        <div className="py-2 px-4">
          <div
            className="border-round-md"
            style={{
              backgroundColor:
                themePrimeFlex === "dark" ? "#111827" : "#ffffffde",
              border:
                themePrimeFlex === "dark"
                  ? "1px solid #424b57"
                  : "1px solid #d1d5db",
              minHeight: "3rem",
            }}
          >
            {selectedAnexos.map((anexo) => {
              return (
                <div
                  key={anexo.id}
                  className="flex flex-row justify-content-between p-2"
                  style={{
                    gap: "1rem",
                    borderBottom:
                      themePrimeFlex === "dark"
                        ? "1px solid #424b57"
                        : "1px solid #d1d5db",
                  }}
                >
                  <div className="flex flex-row gap-2">
                    {/* icon */}
                    <div className="flex align-items-center justify-content-center pr-2">
                      <i
                        className="pi pi-file-pdf"
                        style={{ color: "#559", fontSize: "1.5rem" }}
                      ></i>
                    </div>
                    {/* descripcion */}
                    <div className="flex flex-column gap-2">
                      <a
                        className="hover:underline hover:text-blue-300 text-xs"
                        style={{
                          textDecoration: "none",
                          color: "var(--text-color)",
                        }}
                        href={`${URL.createObjectURL(anexo.file)}`}
                        // onClick={() => {
                        //   const url = URL.createObjectURL(anexo.file);
                        //   console.log(url);
                        // }}
                        target="_blank"
                      >
                        {anexo.file.name}
                      </a>
                      <span className="flex flex-row gap-2  m-0">
                        <span className="text-sm">
                          {anexo.file.type.split("/")[1].toUpperCase()}
                        </span>
                        <span className="text-sm">-</span>
                        <span className="text-sm">
                          {formatFileSize(anexo.file.size)}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* icon trash */}
                  <div className="flex align-items-center justify-content-center pr-1">
                    <Tooltip target=".icon-bolt" />

                    <i
                      className="pi pi-trash m-1"
                      style={{ color: "#559", fontSize: "1rem" }}
                      onClick={() => {
                        setSelectedAnexos((prev) => {
                          return prev.filter((p) => p.id != anexo.id);
                        });
                      }}
                    ></i>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-content-start align-items-center mb-2">
            <span className="text-xs m-0">
              Puede seleccionar multiples archivos que no excedan del tamaño
              máximo
            </span>
          </div>
        </div>

        {/* <div
          className="flex flex-column align-items-start px-4 py-2"
          style={{ width: "100%" }}
        >
          <div className="flex flex-columngap-1" style={{ width: "100%" }}>
            <div className="p-inputgroup">
              <InputText
                id="CodigoReferencia"
                value={''}
                onChange={(e) => {
                  onInputTextChange(e, "CodigoReferencia");
                }}
                type="text"
                className="p-inputtext-sm "
              />
            </div>
            {tramiteErrors.CodigoReferencia && (
              <small className="p-error">
                {tramiteErrors.CodigoReferencia}
              </small>
            )}
          </div>
          <span className="text-900 text-xs">
            Puede agregar un enlace de descarga de Google Drive, One Drive u
            otros
          </span>
        </div> */}
      </div>

      <div className="flex flex-column justify-content-between mb-3 border-solid border-1 border-gray-500 border-round-md">
        <div className="flex flex-column gap-1"></div>
        <div className="flex flex-row py-3 px-4" style={{ gap: "3rem" }}>
          <div
            style={{
              width: "50%",
            }}
          >
            <label
              htmlFor="TipoDocumento"
              className="block text-900 text-sm font-medium mb-2"
            >
              Legalidad
            </label>
            <div className="flex flex-column mb-3 gap-1">
              <div className="flex justify-content-between align-items-center gap-2">
                <label htmlFor="ingredient1" className="ml-2">
                  Declaro que los datos consigndos responden a la verdad
                </label>
                <Checkbox
                  inputId="ingredient1"
                  name="pizza"
                  value="Cheese"
                  // onChange={onIngredientsChange}
                  // checked={ingredients.includes("Cheese")}
                  checked={true}
                />
              </div>
              <div className="flex justify-content-between align-items-center gap-2">
                <label htmlFor="ingredient1" className="ml-2">
                  Acepto los términos y condiciones del servicio
                </label>
                <Checkbox
                  inputId="ingredient1"
                  name="pizza"
                  value="Cheese"
                  // onChange={onIngredientsChange}
                  // checked={ingredients.includes("Cheese")}
                  checked={true}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              width: "50%",
            }}
          >
            <label
              htmlFor="CodigoReferencia"
              className="block text-900 text-sm font-medium mb-2"
            >
              Validación
            </label>
            <div className="flex flex-column mb-3 gap-1">
              <div className="flex align-items-center"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row mt-5 pb-3 px-4" style={{ gap: "1rem" }}>
        <Button
          type="button"
          // onClick={findAllTramite}
          size="small"
          severity="contrast"
          style={{
            padding: "0",
            width: "50%",
            height: "2.5rem",
            margin: "0",
            color: "#000",
            background: "#eee",
            border: "none",
          }}
        >
          <span className="flex justify-content-between gap-2 align-items-center m-auto">
            {/* <i className="pi pi-plus text-sm"></i> */}
            <span>Cancelar</span>
          </span>
        </Button>

        <Button
          type="button"
          loading={loadingTramiteRecibidoExterno}
          onClick={() => {
            console.log(validateForm());

            if (validateForm()) {
              recibirTramiteExterno2();
            }
          }}
          size="small"
          style={{
            padding: "0",
            width: "50%",
            height: "2.5rem",
            margin: "0",
            color: "#000",
          }}
        >
          <span className="flex justify-content-between gap-2 align-items-center m-auto text-white">
            <i className="pi pi-send text-sm"></i>
            <span>Enviar</span>
          </span>
        </Button>
      </div>

      <TyCModal tyCModal={tyCModal} setTyCModal={setTyCModal} />
    </div>
  );
};

export default TramiteRecibidoExterno;
