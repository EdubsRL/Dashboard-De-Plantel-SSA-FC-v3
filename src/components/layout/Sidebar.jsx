import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  LayoutGrid,
  Layers,
  FileText,
  Menu,
  X,
  Plus,
  Pencil,
  Settings,
} from 'lucide-react'
import { useState } from 'react'

import { usePlantels } from '../../context/PlantelsContext'
import CreatePlantelModal from '../plantel/CreatePlantelModal'

const links = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/plantel',
    label: 'Plantel',
    icon: Users,
  },
  {
    to: '/escalacao',
    label: 'Escalação',
    icon: LayoutGrid,
  },
  {
    to: '/profundidade',
    label: 'Profundidade',
    icon: Layers,
  },
  {
    to: '/relatorios',
    label: 'Relatórios',
    icon: FileText,
  },
]

function SidebarContent({
  onNavigate,
  onCreate,
  onManage,
}) {
  const {
    plantels,
    selectedPlantel,
    setSelectedPlantel,
  } = usePlantels()

  const handleSelectPlantel = (event) => {
    const plantelId =
      event.target.value

    const plantel =
      plantels.find(
        (item) =>
          item.id === plantelId
      ) || null

    setSelectedPlantel(plantel)
  }

  return (
    <div className="flex h-full flex-col">

      {/* =====================================================
          MARCA
      ===================================================== */}

      <div className="brand-block">
        <img
          src="/ssa-fc-logo.png"
          alt="SSA FC"
          className="brand-logo"
        />

        <div>
          <h1>
            Dashboard de Plantel
          </h1>

          <p>
            Coordenação Técnica
          </p>
        </div>
      </div>

      {/* =====================================================
          SELETOR DE PLANTEL
      ===================================================== */}

      <div className="plantel-selector">

        <div className="flex items-center justify-between gap-2">

          <p>
            Plantel atual
          </p>

          {selectedPlantel && (
            <button
              type="button"
              onClick={() =>
                onManage(
                  selectedPlantel
                )
              }
              className="
                w-8 h-8
                flex items-center justify-center
                rounded-lg
                text-gray-400
                hover:text-white
                hover:bg-graphite-700
                transition
              "
              title="Gerenciar plantel"
              aria-label="Gerenciar plantel"
            >
              <Settings
                size={16}
              />
            </button>
          )}

        </div>

        <div className="flex gap-2 mt-2">

          <select
            value={
              selectedPlantel?.id ||
              ''
            }
            onChange={
              handleSelectPlantel
            }
            aria-label="Selecionar plantel"
            className="min-w-0 flex-1"
          >
            {!plantels.length && (
              <option value="">
                Nenhum plantel
              </option>
            )}

            {plantels.map(
              (plantel) => (
                <option
                  key={plantel.id}
                  value={plantel.id}
                >
                  {plantel.name}
                </option>
              )
            )}
          </select>

          {selectedPlantel && (
            <button
              type="button"
              onClick={() =>
                onManage(
                  selectedPlantel
                )
              }
              className="
                shrink-0
                px-3
                rounded-lg
                border border-graphite-700
                bg-graphite-900
                text-gray-300
                hover:bg-graphite-700
                hover:text-white
                transition
              "
              title="Editar plantel"
              aria-label="Editar plantel"
            >
              <Pencil
                size={16}
              />
            </button>
          )}

        </div>

        {selectedPlantel && (
          <p className="text-[10px] text-gray-500 mt-2">
            {selectedPlantel.category}
            {' · '}
            {selectedPlantel.season}
          </p>
        )}

      </div>

      {/* =====================================================
          NAVEGAÇÃO
      ===================================================== */}

      <nav className="sidebar-nav">

        {links.map(
          ({
            to,
            label,
            icon: Icon,
          }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={
                onNavigate
              }
              className={({
                isActive,
              }) =>
                `sidebar-link ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
            >
              <Icon size={18} />

              <span>
                {label}
              </span>
            </NavLink>
          )
        )}

        {/* NOVO PLANTEL */}

        <button
          type="button"
          onClick={onCreate}
          className="sidebar-create"
        >
          <Plus size={18} />

          <span>
            Criar novo plantel
          </span>
        </button>

      </nav>

      {/* =====================================================
          RODAPÉ
      ===================================================== */}

      <div className="sidebar-footer">

        <span className="status-dot" />

        <div>
          <strong>
            Sistema online
          </strong>

          <small>
            Acesso sem login
          </small>
        </div>

      </div>

    </div>
  )
}

export default function Sidebar() {
  const [open, setOpen] =
    useState(false)

  const [
    plantelModal,
    setPlantelModal,
  ] = useState(null)

  const openCreate = () => {
    setPlantelModal('create')
    setOpen(false)
  }

  const openManage = (
    plantel
  ) => {
    if (!plantel?.id) {
      return
    }

    setPlantelModal(plantel)
    setOpen(false)
  }

  const closeModal = () => {
    setPlantelModal(null)
  }

  return (
    <>
      {/* =====================================================
          MODAL DE PLANTEL
      ===================================================== */}

      {plantelModal && (
        <CreatePlantelModal
          initialPlantel={
            plantelModal === 'create'
              ? null
              : plantelModal
          }
          onClose={
            closeModal
          }
        />
      )}

      {/* =====================================================
          BOTÃO MENU MOBILE
      ===================================================== */}

      <button
        type="button"
        className="mobile-menu-button"
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
        aria-label={
          open
            ? 'Fechar menu'
            : 'Abrir menu'
        }
      >
        {open ? (
          <X size={20} />
        ) : (
          <Menu size={20} />
        )}
      </button>

      {/* =====================================================
          SIDEBAR MOBILE
      ===================================================== */}

      {open && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() =>
            setOpen(false)
          }
        >
          <aside
            className="mobile-sidebar"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <SidebarContent
              onNavigate={() =>
                setOpen(false)
              }
              onCreate={
                openCreate
              }
              onManage={
                openManage
              }
            />
          </aside>
        </div>
      )}

      {/* =====================================================
          SIDEBAR DESKTOP
      ===================================================== */}

      <aside className="desktop-sidebar">

        <SidebarContent
          onNavigate={() => {}}
          onCreate={
            openCreate
          }
          onManage={
            openManage
          }
        />

      </aside>
    </>
  )
}