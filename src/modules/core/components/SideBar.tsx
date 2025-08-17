import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { Ripple } from "primereact/ripple";
import { StyleClass } from "primereact/styleclass";
import { Card } from "primereact/card";
import "./../styles/Dashboard.css";
import { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { useAuth } from "../../auth/context/AuthContext";

type SideBarProps = {
  visible?: boolean;
  setVisible: (value: boolean) => void;
};

const SideBar = (props: SideBarProps) => {
  const btnRef1 = useRef<any>(null);
  const btnRef2 = useRef<any>(null);
  const btnRef3 = useRef<any>(null);
  const btnRef4 = useRef<any>(null);

  const authContext = useAuth();
  const userAuth = authContext?.userAuth;

  return (
    <div
      style={{

        backgroundColor: "var(--surface-50)",

        borderRadius: "6px",
        position: "sticky",
        top: "5rem",
        // marginRight: ".5em",
        height: "calc(100vh - 6rem)",
        width: props.visible ? "20rem" : "0rem",
        margin: props.visible ? "1rem 0 1rem 1rem" : "0rem",
        transform: props.visible ? "translateX(0rem)" : "translateX(-20rem)",
        transition:
          ".5s transform ease-in-out,.5s width ease-in-out,.5s margin ease-in-out",
      }}
      className="flex flex-column scroll-container"
    >
      {/* Sidebar-header */}
      <div
        className="flex align-items-center justify-content-between pr-3 pl-3 pb-1"
        style={{
          position: "sticky",
          top: 10,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <span className="inline-flex align-items-center gap-2">
          {/* text logo */}
          <span className="font-semibold text-2xl text-primary">MDSMF</span>
        </span>

        {/* button close */}
        <span>
          <Button
            type="button"
            onClick={() => {
              props.setVisible(false);
            }}
            icon="pi pi-angle-double-left"
            outlined
            className="h-2rem w-2rem"
            style={{
              border: "none",
            }}
          ></Button>
        </span>
      </div>

      {/* Sidebar-body */}
      <div
        style={{
          padding: "0 .5rem 0 0rem",
          height: "calc(100vh - 12rem)",
          overflowY: "auto",
        }}
      >
        <ul className="list-none px-2">
          <li>
            <StyleClass
              nodeRef={btnRef1}
              selector="@next"
              enterFromClassName="hidden"
              enterActiveClassName="slidedown"
              leaveToClassName="hidden"
              leaveActiveClassName="slideup"
            >
              <div
                ref={btnRef1}
                className="p-ripple p-2 flex align-items-center justify-content-between cursor-pointer text-600 border-round hover:surface-100 transition-duration-150 transition-colors"
              >
                <span className="font-medium">Firma Digital</span>
                <i className="pi pi-chevron-down"></i>
                <Ripple />
              </div>
            </StyleClass>
            <ul className="list-none p-0 m-0 ml-2 overflow-hidden">
              <li>
                <Link
                  to={"../firma_digital/archivos_digitales"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-file mr-2"></i>
                  <span className="font-medium text-sm">
                    Archivos digitales
                  </span>
                  <Ripple />
                </Link>
              </li>
            </ul>
          </li>
        </ul>
        <ul className="list-none px-2 ">
          <li>
            <StyleClass
              nodeRef={btnRef2}
              selector="@next"
              enterFromClassName="hidden"
              enterActiveClassName="slidedown"
              leaveToClassName="hidden"
              leaveActiveClassName="slideup"
            >
              <div
                ref={btnRef2}
                className="p-ripple p-2 flex align-items-center justify-content-between cursor-pointer text-600 border-round hover:surface-100 transition-duration-150 transition-colors"
              >
                <span className="font-medium">Gestión de Trámites</span>
                <i className="pi pi-chevron-down"></i>
                <Ripple />
              </div>
            </StyleClass>
            <ul className="list-none p-0 m-0 ml-2 overflow-hidden">
              <li>
                <Link
                  to={"../tramite/pendiente"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-file-export mr-2"></i>
                  <span className="font-medium text-sm">Pendientes</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../tramite/recibido"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-book mr-2"></i>
                  <span className="font-medium text-sm">Recibidos</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <StyleClass
                  nodeRef={btnRef4}
                  selector="@next"
                  enterFromClassName="hidden"
                  enterActiveClassName="slidedown"
                  leaveToClassName="hidden"
                  leaveActiveClassName="slideup"
                >
                  <a
                    ref={btnRef4}
                    className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full"
                  >
                    <i className="pi pi-send mr-2"></i>
                    <span className="font-medium text-sm">Emitidos</span>
                    <i className="pi pi-chevron-down ml-auto mr-1"></i>
                    <Ripple />
                  </a>
                </StyleClass>
                <ul className="list-none py-0 pl-3 pr-0 m-0 hidden overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out">
                  <li>
                    <Link
                      to={"../tramite/emitido/nuevo"}
                      className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                    >
                      <i className="pi pi-circle text-sm mr-2"></i>
                      <span className="font-medium text-sm">Nuevo</span>
                      <Ripple />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={"../tramite/emitido"}
                      className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                    >
                      <i className="pi pi-circle text-sm mr-2"></i>
                      <span className="font-medium text-sm">Lista</span>
                      <Ripple />
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
        <ul className="list-none px-2 ">
          <li>
            <StyleClass
              nodeRef={btnRef3}
              selector="@next"
              enterFromClassName="hidden"
              enterActiveClassName="slidedown"
              leaveToClassName="hidden"
              leaveActiveClassName="slideup"
            >
              <div
                ref={btnRef3}
                className="p-ripple p-2 flex align-items-center justify-content-between cursor-pointer text-600 border-round hover:surface-100 transition-duration-150 transition-colors"
              >
                <span className="font-medium">Mantenimiento</span>
                <i className="pi pi-chevron-down"></i>
                <Ripple />
              </div>
            </StyleClass>
            <ul className="list-none p-0 m-0 ml-2 hidden overflow-hidden">
              {/* <ul className="list-none p-0 m-0  overflow-hidden"> */}
              <li>
                <Link
                  to={"../mantenimiento/usuario"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Usuario</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/empresa"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Empresa</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/constante"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Constante</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/area"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Area</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/cargo"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Cargo</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/estado"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Estado</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/esquema_estado"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Esquema Estado</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/rol"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Rol</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/tipo_documento"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Tipo Documento</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/tipo_usuario"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Tipo Usuario</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/tipo_tramite"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">Tipo Tramite</span>
                  <Ripple />
                </Link>
              </li>
              <li>
                <Link
                  to={"../mantenimiento/tipo_identificacion"}
                  className="p-ripple flex align-items-center cursor-pointer p-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors w-full custom"
                >
                  <i className="pi pi-table mr-2"></i>
                  <span className="font-medium text-sm">
                    Tipo Identificacion
                  </span>
                  <Ripple />
                </Link>
              </li>
            </ul>
          </li>
        </ul>
       
      </div>
      {/* Sidebar-footer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <div className="border-top-1 border-none surface-border" />
          <Avatar
            label={
              userAuth
                ? `${userAuth.Nombres.split(" ")[0][0].toUpperCase()}${userAuth.ApellidoPaterno.split(" ")[0][0].toUpperCase()}`
                : ""
            }
            image={userAuth?.UrlFotoPerfil ?? ""}
            shape="circle"
          />
          <span className="font-bold">
            {userAuth
              ? `${userAuth.Nombres.split(" ")[0]} ${userAuth.ApellidoPaterno.split(" ")[0]}`
              : ""}
          </span>
        </div>
    </div>
  );
};

export default SideBar;
