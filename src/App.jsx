import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { supabase } from './lib/supabase'
import { v4 as uuidv4 }
from 'uuid'

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
const [selectedFile, setSelectedFile] =
  useState(null)
  useEffect(() => {

    fetchApplications()

  }, [])

  async function fetchApplications() {

  const { data, error } =
    await supabase
      .from('applications')
      .select()

  console.log('DATA:', data)
  console.log('ERROR:', error)

  if (data) {

    setApplications(data)
  }
}

  async function addApplication() {

  if (
    !newApplication.bank ||
    !newApplication.fileType
  ) return

  let documentUrl = ''
  let documentName = ''

  // upload pdf

  if (selectedFile) {

    const fileExt =
      selectedFile.name.split('.').pop()

    const fileName =
      `${uuidv4()}.${fileExt}`

    const { error: uploadError } =
      await supabase.storage
        .from('documents')
        .upload(
          fileName,
          selectedFile
        )

    if (!uploadError) {

      const { data } =
        supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

      documentUrl =
        data.publicUrl

      documentName =
        selectedFile.name
    }
  }

  // insert database

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
            'Đã tiếp nhận',

          document_url:
            documentUrl,

          document_name:
            documentName
        }
      ])

  if (!error) {

    fetchApplications()

    setNewApplication({
      bank: '',
      fileType: '',
      amount: ''
    })

    setSelectedFile(null)

    setShowModal(false)
  }
}

  async function deleteApplication(id) {

  console.log('DELETE ID:', id)

  const response =
    await supabase
      .from('applications')
      .delete()
      .eq('id', Number(id))
      .select()

  console.log('DELETE RESPONSE:', response)

  fetchApplications()
}

  async function updateProgress(id, value) {

  console.log('UPDATE ID:', id)
  console.log('UPDATE VALUE:', value)

  const response =
    await supabase
      .from('applications')
      .update({
        progress: parseInt(value)
      })
      .eq('id', Number(id))
      .select()

  console.log('UPDATE RESPONSE:', response)

  fetchApplications()
}

  async function updateStatus(id, value) {

  const response =
    await supabase
      .from('applications')
      .update({
        status: value
      })
      .eq('id', Number(id))
      .select()

  console.log('STATUS RESPONSE:', response)

  fetchApplications()
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

  function getStatusColor(status) {

    switch (status) {

      case 'Đang thẩm định':
        return 'bg-amber-100 text-amber-700'

      case 'Chờ bổ sung':
        return 'bg-red-100 text-red-700'

      case 'Đã tiếp nhận':
        return 'bg-blue-100 text-blue-700'

      case 'Hoàn thành':
        return 'bg-green-100 text-green-700'

      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const filteredApplications =
    applications.filter(item => {

      const bank =
        item.bank || ''

      return bank
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    })

  const processingCount =
    applications.filter(item => {

      const progress =
        item.progress || 0

      return progress < 100

    }).length

  const completedCount =
    applications.filter(item => {

      const progress =
        item.progress || 0

      return progress === 100

    }).length

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

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
              className="bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg hover:bg-green-700"
            >
              Export Excel
            </button>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-lg hover:bg-slate-700"
            >
              + Thêm hồ sơ
            </button>

          </div>

        </div>

        {/* KPI */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <p className="text-slate-500 text-sm">
              Tổng hồ sơ
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">
              {applications.length}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <p className="text-slate-500 text-sm">
              Đang xử lý
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">
              {processingCount}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <p className="text-slate-500 text-sm">
              Hoàn thành
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">
              {completedCount}
            </h2>

          </div>

        </div>

        {/* SEARCH */}

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

        {/* TABLE */}

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 text-slate-500 text-sm uppercase">

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
  Hồ sơ PDF
</th>
                  <th className="text-left px-6 py-4">
                    Tiến độ
                  </th>

                  <th className="text-left px-6 py-4">
                    Trạng thái
                  </th>

                  <th className="text-left px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredApplications.map(item => (

                  <tr
                    key={String(item.id)}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-6 py-5 font-semibold">
                      {item.bank}
                    </td>

                    <td className="px-6 py-5">
                      {item.file_type}
                    </td>

                    <td className="px-6 py-5">
                      {item.amount}
                    </td>
<td className="px-6 py-5">

  {item.document_url ? (

    <a
      href={item.document_url}
      target="_blank"
      className="text-blue-600 underline"
    >
      📄 {item.document_name}
    </a>

  ) : (

    <span className="text-slate-400">
      Không có file
    </span>

  )}

</td>
                    <td className="px-6 py-5 min-w-[240px]">

                      <div className="space-y-3">

                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">

                          <div
                            className="bg-slate-800 h-full"
                            style={{
                              width: `${item.progress || 0}%`
                            }}
                          />

                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.progress || 0}
                          onChange={(e) =>
                            updateProgress(
                              item.id,
                              e.target.value
                            )
                          }
                          className="w-full"
                        />

                      </div>

                    </td>

                    <td className="px-6 py-5">

                      <select
                        value={
                          item.status ||
                          'Đã tiếp nhận'
                        }
                        onChange={(e) =>
                          updateStatus(
                            item.id,
                            e.target.value
                          )
                        }
                        className={`px-4 py-2 rounded-full border-0 ${getStatusColor(item.status)}`}
                      >

                        <option>
                          Đã tiếp nhận
                        </option>

                        <option>
                          Đang thẩm định
                        </option>

                        <option>
                          Chờ bổ sung
                        </option>

                        <option>
                          Hoàn thành
                        </option>

                      </select>

                    </td>

                    <td className="px-6 py-5">

                      <button
                        onClick={() =>
                          deleteApplication(item.id)
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
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

      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">

            <h2 className="text-2xl font-bold text-slate-800">
              Thêm hồ sơ mới
            </h2>

            <input
              type="text"
              placeholder="Tên ngân hàng"
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
              placeholder="Giá trị khoản vay"
              value={newApplication.amount}
              onChange={(e) =>
                setNewApplication({
                  ...newApplication,
                  amount: e.target.value
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200"
            />
<div className="space-y-2">

  <label className="text-sm font-medium text-slate-600">

    Upload hồ sơ PDF

  </label>

  <input
    type="file"
    accept=".pdf"
    onChange={(e) =>
      setSelectedFile(
        e.target.files[0]
      )
    }
    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white"
  />

</div>
            <div className="flex justify-end gap-3 pt-3">

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
                Lưu hồ sơ
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}