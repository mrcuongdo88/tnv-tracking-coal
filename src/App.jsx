import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { supabase } from './lib/supabase'

export default function App() {

  const [applications, setApplications] =
    useState([])

  const [search, setSearch] =
    useState('')

  const [showModal, setShowModal] =
    useState(false)

  const [newApplication, setNewApplication] =
    useState({
      bank: '',
      fileType: '',
      amount: ''
    })

  useEffect(() => {

    fetchApplications()

  }, [])

  async function fetchApplications() {

    const { data, error } =
      await supabase
        .from('applications')
        .select()

    if (error) {

      console.log(error)

    } else {

      setApplications(data || [])
    }
  }

  async function addApplication() {

    if (
      !newApplication.bank ||
      !newApplication.fileType
    ) return

    const { error } =
      await supabase
        .from('applications')
        .insert([
          {
            bank:
              newApplication.bank,

            file_type:
              newApplication.fileType,

            amount:
              newApplication.amount,

            progress: 10,

            status:
              'Đã tiếp nhận'
          }
        ])

    if (!error) {

      fetchApplications()

      setNewApplication({
        bank: '',
        fileType: '',
        amount: ''
      })

      setShowModal(false)
    }
  }

  async function deleteApplication(id) {

    const { error } =
      await supabase
        .from('applications')
        .delete()
        .eq('id', id)

    if (!error) {

      fetchApplications()
    }
  }

  function exportToExcel() {

    const worksheet =
      XLSX.utils.json_to_sheet(applications)

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Applications'
    )

    const excelBuffer =
      XLSX.write(
        workbook,
        {
          bookType: 'xlsx',
          type: 'array'
        }
      )

    const fileData =
      new Blob(
        [excelBuffer],
        {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      )

    saveAs(
      fileData,
      'DanhSachHoSo.xlsx'
    )
  }

  const filteredApplications =
    applications.filter(item => {

      if (!search) return true

      return item.bank
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    })

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <h1 className="text-4xl font-bold text-slate-800">
              Dashboard Hồ Sơ Ngân Hàng
            </h1>

            <p className="text-slate-500 mt-2">
              CRM quản lý pipeline tín dụng doanh nghiệp
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-5 py-3 rounded-2xl"
            >
              Export Excel
            </button>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="bg-slate-800 text-white px-5 py-3 rounded-2xl"
            >
              + Thêm hồ sơ
            </button>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">

          <input
            type="text"
            placeholder="Tìm kiếm ngân hàng..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full px-4 py-3 rounded-2xl border border-slate-200"
          />

        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-6 py-4">
                    Ngân hàng
                  </th>

                  <th className="text-left px-6 py-4">
                    Hồ sơ
                  </th>

                  <th className="text-left px-6 py-4">
                    Giá trị
                  </th>

                  <th className="text-left px-6 py-4">
                    Hành động
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredApplications.map(item => (

                  <tr
                    key={item.id}
                    className="border-t border-slate-100"
                  >

                    <td className="px-6 py-5">
                      {item.bank}
                    </td>

                    <td className="px-6 py-5">
                      {item.file_type}
                    </td>

                    <td className="px-6 py-5">
                      {item.amount}
                    </td>

                    <td className="px-6 py-5">

                      <button
                        onClick={() =>
                          deleteApplication(item.id)
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-xl"
                      >
                        Xóa
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4">

            <h2 className="text-2xl font-bold">
              Thêm hồ sơ
            </h2>

            <input
              type="text"
              placeholder="Ngân hàng"
              value={newApplication.bank}
              onChange={(e) =>
                setNewApplication({
                  ...newApplication,
                  bank: e.target.value
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200"
            />

            <input
              type="text"
              placeholder="Loại hồ sơ"
              value={newApplication.fileType}
              onChange={(e) =>
                setNewApplication({
                  ...newApplication,
                  fileType: e.target.value
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200"
            />

            <input
              type="text"
              placeholder="Giá trị"
              value={newApplication.amount}
              onChange={(e) =>
                setNewApplication({
                  ...newApplication,
                  amount: e.target.value
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="px-5 py-3 rounded-2xl bg-slate-200"
              >
                Hủy
              </button>

              <button
                onClick={addApplication}
                className="px-5 py-3 rounded-2xl bg-slate-800 text-white"
              >
                Lưu
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}