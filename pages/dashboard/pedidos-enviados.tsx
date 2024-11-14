'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Pedido {
  iD: number
  numeroOrden: string
  fecha: string
  pedido: string
  combo: string
  algoMasExtra: string
  nombre: string
  telefono: string
  direccionEnvio: string
  referenciaOcomentario: string
  efectivoTarjeta: string
  estado: string
}

const columns: ColumnDef<Pedido>[] = [
  {
    accessorKey: "iD",
    header: "ID",
  },
  {
    accessorKey: "numeroOrden",
    header: "Número de Orden",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    accessorKey: "pedido",
    header: "Pedido",
  },
  {
    accessorKey: "combo",
    header: "Combo",
  },
  {
    accessorKey: "algoMasExtra",
    header: "Algo Más Extra",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
  },
  {
    accessorKey: "direccionEnvio",
    header: "Dirección de Envío",
  },
  {
    accessorKey: "referenciaOcomentario",
    header: "Referencia o Comentario",
  },
  {
    accessorKey: "efectivoTarjeta",
    header: "Efectivo/Tarjeta",
  },
  {
    accessorKey: "estado",
    header: "Estado",
  },
]

interface PedidosEnviadosProps {
  Dashboard: () => void
  authToken: string 
}

export default function Component({ Dashboard }: PedidosEnviadosProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [data, setData] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      try {
        const response = await fetch('/api/check-auth', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          setIsAuthenticated(true)
          fetchPedidos(token)
        } else {
          throw new Error('Not authenticated')
        }
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/')
      }
    }

    checkAuth()
  }, [router])

  const fetchPedidos = async (token: string) => {
    try {
      const response = await fetch('/api/enviados', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const pedidos = await response.json()
      setData(pedidos)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pedidos enviados:', error)
      setLoading(false)
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
  })

  if (!isAuthenticated) {
    return null // or a loading indicator
  }

  if (loading) {
    return <Card className="w-full"><CardContent className="p-6">Cargando pedidos enviados...</CardContent></Card>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Pedidos Enviados</span>
          <Button onClick={Dashboard} variant="outline">
            Volver al Dashboard
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center py-4">
            <Input
              placeholder="Filtrar pedidos..."
              value={(table.getColumn("telefono")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("telefono")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columnas <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No se encontraron pedidos enviados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}