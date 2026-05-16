import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { supabase } from './lib/supabase'
import { v4 as uuidv4 } from 'uuid'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

export default function App() {

  const [applications, setApplications] =
    useState([])

  const [search, setSearch] =
    useState('')

  const [showModal, setShowModal] =
    useState(false)

  const [selectedFile, setSelectedFile] =
    useState(null)

  const [selectedTimeline, setSelectedTimeline] =
    useState([])

  const [showTimeline, setShowTimeline] =
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
        .order('id', {
          ascending: false
        })

    if (!error) {

      setApplications(data || [])
    }
  }

  async function addTimeline(
    applicationId,
    action
  ) {

    await supabase
      .from('application_timeline')
      .insert([
        {
          application_id:
            applicationId,

          action
        }
      ])
  }

  async function fetchTimeline(id) {

    const { data } =
      await supabase
        .from('application_timeline')
        .select()
        .eq('application_id', id)
        .order('created_at', {
          ascending: false
        })

    setSelectedTimeline(data || [])

    setShowTimeline(true)
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
        selectedFile.name
          .split('.')
          .pop()

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

    // insert db

    const { data, error } =
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
        .select()

    if (!error) {

      await addTimeline(
        data[0].id,
        'Hồ sơ được tạo'
      )

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

    const { error } =
      await supabase
        .from('applications')
        .delete()
        .eq('id', Number(id))

    if (!error) {

      fetchApplications()
    }
  }

  async function updateProgress(id, value) {

    const { error } =
      await supabase
        .from('applications')
        .update({
          progress: parseInt(value)
        })
        .eq('id', Number(id))

    if (!error) {

      await addTimeline(
        id,
        `Tiến độ cập nhật ${value}%`
      )

      fetchApplications()
    }
  }

  async function updateStatus(id, value) {

    const { error } =
      await supabase
        .from('applications')
        .update({
          status: value
        })
        .eq('id', Number(id))

    if (!error) {

      await addTimeline(
        id,
        `Status chuyển sang ${value}`
      )

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

  function getStatusColor(status) {

    switch (status) {

      case 'Đang thẩm định':
        return 'bg-amber-100 text-amber-700'

      case 'Chờ bổ sung':
        return 'bg-red-100 text-red-700'

      case 'Hoàn thành':
        return 'bg-green-100 text-green-700'

      default:
        return 'bg-blue-100 text-blue-700'
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

  const totalAmount =
    applications.reduce(
      (sum, item) => {

        const value =
          parseFloat(
            item.amount
              ?.replace(/[^\d]/g, '')
          ) || 0

        return sum + value

      },
      0
    )

  const statusData = [

    {
      name: 'Đã tiếp nhận',
      value:
        applications.filter(
          item =>
            item.status ===
            'Đã tiếp nhận'
        ).length
    },

    {
      name: 'Đang thẩm định',
      value:
        applications.filter(
          item =>
            item.status ===
            'Đang thẩm định'
        ).length
    },

    {
      name: 'Chờ bổ sung',
      value:
        applications.filter(
          item =>
            item.status ===
            'Chờ bổ sung'
        ).length
    },

    {
      name: 'Hoàn thành',
      value:
        applications.filter(
          item =>
            item.status ===
            'Hoàn thành'
        ).length
    }
  ]

  const COLORS = [
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#22c55e'
  ]

  const bankData = applications.map(
    item => ({
      bank: item.bank,
      progress:
        item.progress || 0
    })
  )

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <h1 className="text-4xl font-bold text-slate-800">
              Banking LOS Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Credit Workflow Management System
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

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

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <p className="text-slate-500 text-sm">
              Tổng pipeline
            </p>

            <h2 className="text-2xl font-bold mt-3 text-slate-800">
              {totalAmount.toLocaleString()} VNĐ
            </h2>

          </div>

        </div>

        {/* EXECUTIVE DASHBOARD */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PIE CHART */}

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-800 mb-6">

              Trạng thái hồ sơ

            </h2>

            <div className="h-[320px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >

                    {statusData.map(
                      (entry, index) => (

                        <Cell
                          key={index}
                          fill={
                            COLORS[
                              index %
                              COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* BAR CHART */}

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-800 mb-6">

              Tiến độ theo ngân hàng

            </h2>

            <div className="h-[320px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={bankData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="bank" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="progress"
                    fill="#0f172a"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

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
                    PDF
                  </th>

                  <th className="text-left px-6 py-4">
                    Tiến độ
                  </th>

                  <th className="text-left px-6 py-4">
                    Trạng thái
                  </th>

                  <th className="text-left px-6 py-4">
                    Timeline
                  </th>

                  <th className="text-left px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredApplications.map(item => (

                  <tr
                    key={item.id}
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
                          rel="noreferrer"
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
                          fetchTimeline(item.id)
                        }
                        className="bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600"
                      >
                        Xem
                      </button>

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

      {/* ADD MODAL */}

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

      {/* TIMELINE MODAL */}

      {showTimeline && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                Timeline Hồ Sơ
              </h2>

              <button
                onClick={() =>
                  setShowTimeline(false)
                }
                className="bg-slate-200 px-4 py-2 rounded-xl"
              >
                Đóng
              </button>

            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">

              {selectedTimeline.map(item => (

                <div
                  key={item.id}
                  className="border-l-4 border-slate-800 bg-slate-50 p-4 rounded-xl"
                >

                  <p className="font-semibold text-slate-800">
                    {item.action}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">

                    {new Date(
                      item.created_at
                    ).toLocaleString()}

                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      )}

    </div>
  )
}