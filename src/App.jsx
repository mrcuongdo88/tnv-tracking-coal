import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { supabase } from './lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import acbLogo from './assets/banks/acb.svg'
import mbLogo from './assets/banks/mbb.png'
import msbLogo from './assets/banks/msb.svg'
import shbLogo from './assets/banks/shb.png'
import vcbLogo from './assets/banks/vcb.webp'
import bidvLogo from './assets/banks/bidv.png'
import techcomLogo from './assets/banks/tcb.svg'
import abbankLogo from './assets/banks/abb.png'
import gpbankLogo from './assets/banks/gpb.svg'
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

const bankDirectory = [

  {
    keywords: [
      'acb',
      'asia commercial'
    ],

    name: 'ACB',

    logo:
      acbLogo
  },

  {
    keywords: [
      'mb',
      'mbbank',
      'military bank'
    ],

    name: 'MBBank',

    logo:
      mbLogo
  },

  {
    keywords: [
      'msb',
      'maritime'
    ],

    name: 'MSB',

    logo:
      msbLogo
  },

  {
    keywords: [
      'shb'
    ],

    name: 'SHB',

    logo:
      shbLogo
  },

  {
    keywords: [
      'vcb',
      'vietcombank'
    ],

    name: 'Vietcombank',

    logo:
      vcbLogo
  },

  {
    keywords: [
      'bidv'
    ],

    name: 'BIDV',

    logo:
      bidvLogo
  },

  {
    keywords: [
      'techcombank',
      'tcb'
    ],

    name: 'Techcombank',

    logo:
      techcomLogo
  },
  {
    keywords: [
      'anbinhbank',
      'abb'
    ],

    name: 'An Binh Bank',

    logo:
      abbankLogo
  },
  {
    keywords: [
      'GPBank',
      'GPBank'
    ],

    name: 'GPBank',

    logo:
      gpbankLogo
  }
]

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
const [
  selectedTimelineMap,
  setSelectedTimelineMap
] = useState({})
  const [showTimeline, setShowTimeline] =
    useState(false)

  const [timelineNote, setTimelineNote] =
    useState('')

  const [selectedApplicationId,
    setSelectedApplicationId] =
    useState(null)

  const [newApplication, setNewApplication] =
    useState({
      bank: '',
      fileType: '',
      amount: '',
      submissionDate: '',
      nextAction: '',
      nextFollowupDate: ''
    })
useEffect(() => {

  fetchApplications()

}, [])

useEffect(() => {

  async function loadAllTimelines() {

    const map = {}

    for (const app of applications) {

      const { data } =
        await supabase
          .from('application_timeline')
          .select()
          .eq(
            'application_id',
            app.id
          )
          .order(
            'created_at',
            {
              ascending: false
            }
          )

      map[app.id] =
        data || []
    }

    setSelectedTimelineMap(map)
  }

  if (applications.length) {

    loadAllTimelines()
  }

}, [applications])

  async function fetchApplications() {

    const { data, error } =
      await supabase
        .from('applications')
        .select()
        .order('submission_date', {
          ascending: false
        })

    if (!error) {

      setApplications(data || [])
    }
  }

  function detectBank(bankName) {

    if (!bankName) return null

    const normalized =
      bankName
        .toLowerCase()
        .trim()

    return bankDirectory.find(
      bank =>

        bank.keywords.some(
          keyword =>

            normalized.includes(
              keyword
            )
        )
    )
  }

  const bankSuggestions =

    bankDirectory.filter(
      bank =>

        bank.name
          .toLowerCase()
          .includes(
            newApplication.bank
              .toLowerCase()
          )
    )

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
setSelectedTimelineMap(prev => ({

  ...prev,

  [id]: data || []

}))
    setSelectedApplicationId(id)

    setShowTimeline(true)
  }

  async function addNote() {

    if (
      !timelineNote ||
      !selectedApplicationId
    ) return

    await addTimeline(
      selectedApplicationId,
      timelineNote
    )

    setTimelineNote('')

    fetchTimeline(
      selectedApplicationId
    )
  }

  function calculateAging(date) {

    if (!date) return 0

    const today =
      new Date()

    const submissionDate =
      new Date(date)

    const diffTime =
      today - submissionDate

    const diffDays =
      Math.floor(
        diffTime /
        (1000 * 60 * 60 * 24)
      )

    return diffDays
  }

  function getAgingColor(days) {

    if (days > 14) {

      return 'bg-red-100 text-red-700'
    }

    if (days > 7) {

      return 'bg-amber-100 text-amber-700'
    }

    return 'bg-green-100 text-green-700'
  }

  function formatCurrency(value) {

    if (!value) return '-'

    const number =
      parseFloat(
        value.toString()
          .replace(/[^\d]/g, '')
      )

    return number.toLocaleString(
      'vi-VN'
    )
  }
function getLatestTimeline(id) {

  const timelines =
    selectedTimelineMap[id] || []

  if (!timelines.length)
    return '-'

  return timelines[0].action
}
  function formatInputCurrency(value) {

    const number =
      value.replace(/[^\d]/g, '')

    return number.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ','
    )
  }

  async function addApplication() {

    if (
      !newApplication.bank ||
      !newApplication.fileType
    ) return

    let documentUrl = ''
    let documentName = ''

    if (selectedFile) {

      const fileExt =
        selectedFile.name
        document_name: selectedFile.name
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
              newApplication.amount
                .replace(/[^\d]/g, ''),

            submission_date:
              newApplication.submissionDate,

            next_action:
              newApplication.nextAction,

            next_followup_date:
              newApplication.nextFollowupDate,

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
        '📄 Hồ sơ được tạo'
      )

      fetchApplications()

      setNewApplication({
        bank: '',
        fileType: '',
        amount: '',
        submissionDate: '',
        nextAction: '',
        nextFollowupDate: ''
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
        `📊 Tiến độ cập nhật ${value}%`
      )

      fetchApplications()
    }
  }

  async function updateStatus(id, value) {
async function updateNextAction(
  id,
  value
) {

  const { error } =
    await supabase
      .from('applications')
      .update({
        next_action: value
      })
      .eq('id', Number(id))

  if (error) {

    console.log(error)

    return
  }

  setApplications(prev =>

    prev.map(app =>

      app.id === id
        ? {
            ...app,
            next_action: value
          }
        : app
    )
  )
}
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
        `🔄 Status chuyển sang ${value}`
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

  function isFollowupOverdue(date) {

    if (!date) return false

    return (
      new Date(date) <
      new Date()
    )
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

  const overdueCount =
    applications.filter(item => {

      return (
        calculateAging(
          item.submission_date
        ) > 7
      )

    }).length

  const followupOverdueCount =
    applications.filter(item =>

      isFollowupOverdue(
        item.next_followup_date
      )
    ).length

  const totalAmount =
    applications.reduce(
      (sum, item) => {

        const value =
          parseFloat(
            item.amount
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

        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">

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
              Hồ sơ overdue
            </p>

            <h2 className="text-4xl font-bold mt-3 text-red-600">
              {overdueCount}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <p className="text-slate-500 text-sm">
              Follow-up overdue
            </p>

            <h2 className="text-4xl font-bold mt-3 text-amber-600">
              {followupOverdueCount}
            </h2>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <p className="text-slate-500 text-sm">
              Tổng pipeline
            </p>

            <h2 className="text-xl font-bold mt-3 text-slate-800">
              {formatCurrency(totalAmount)} VNĐ
            </h2>

          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                    Ngày gửi
                  </th>

                  <th className="text-left px-6 py-4">
                    Aging
                  </th>

                  <th className="text-left px-6 py-4">
                    Next Action
                  </th>

                  <th className="text-left px-6 py-4">
                    Follow-up
                  </th>

                  <th className="text-left px-6 py-4">
                    PDF
                  </th>

                  <th className="text-left px-6 py-4">
                    Timeline
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredApplications.map(item => {

                  const aging =
                    calculateAging(
                      item.submission_date
                    )

                  const bankInfo =
                    detectBank(
                      item.bank
                    )

                  return (

                    <tr
                      key={item.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
<td className="px-6 py-5">

  <div className="flex items-center justify-center">

    {bankInfo?.logo ? (

      <div className="w-[120px] h-[56px] bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-2 shadow-sm">

        <img
          src={bankInfo.logo}
          alt={item.bank}
          className="max-h-[36px] max-w-[90px] object-contain"
        />

      </div>

    ) : (

      <div className="w-[120px] h-[56px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-medium">

        {item.bank}

      </div>

    )}

  </div>

</td>

                      <td className="px-6 py-5">
                        {item.file_type}
                      </td>

                      <td className="px-6 py-5 font-semibold text-slate-800">
                        {formatCurrency(item.amount)}
                      </td>

                      <td className="px-6 py-5">

                        {item.submission_date
                          ? new Date(
                              item.submission_date
                            ).toLocaleDateString()
                          : '-'}

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-2 rounded-full text-sm font-semibold ${getAgingColor(aging)}`}
                        >
                          {aging} ngày
                        </span>

                      </td>

                     <td className="px-6 py-5">

</td>

                      <td className="px-6 py-5">

                        {item.next_followup_date ? (

                          <span
                            className={`px-3 py-2 rounded-full text-sm font-semibold ${
                              isFollowupOverdue(
                                item.next_followup_date
                              )
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >

                            {new Date(
                              item.next_followup_date
                            ).toLocaleDateString()}

                          </span>

                        ) : (

                          '-'

                        )}

                      </td>
<td className="px-6 py-5">

  {item.document_url ? (

    <div className="flex flex-col gap-2">
<p className="text-xs text-slate-400 truncate max-w-[160px]">
  {item.document_name}
</p>
      <a
        href={item.document_url}
        target="_blank"
        rel="noreferrer"
        className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm text-center hover:bg-slate-700"
      >
        👁 Xem PDF
      </a>

      <a
        href={item.document_url}
        download
        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm text-center hover:bg-slate-200"
      >
        ⬇ Download
      </a>

    </div>

  ) : (

    <span className="text-slate-400">
      Không có file
    </span>

  )}

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

                    </tr>

                  )
                })}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">

            <h2 className="text-2xl font-bold text-slate-800">
              Thêm hồ sơ mới
            </h2>

            <div className="space-y-2">

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

              {newApplication.bank && (

                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">

                  {bankSuggestions.map(
                    bank => (

                      <button
                        key={bank.name}
                        type="button"
                        onClick={() =>
                          setNewApplication({
                            ...newApplication,
                            bank: bank.name
                          })
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 text-left"
                      >

                        <img
                          src={bank.logo}
                          alt={bank.name}
                          className="h-8 w-auto object-contain"
                        />

                        <span className="font-medium">
                          {bank.name}
                        </span>

                      </button>

                    )
                  )}

                </div>

              )}

            </div>

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
                  amount:
                    formatInputCurrency(
                      e.target.value
                    )
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200"
            />

            <input
              type="text"
              placeholder="Next Action"
              value={newApplication.nextAction}
              onChange={(e) =>
                setNewApplication({
                  ...newApplication,
                  nextAction:
                    e.target.value
                })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200"
            />

            <div className="space-y-2">

              <label className="text-sm font-medium text-slate-600">
                Ngày follow-up tiếp theo
              </label>

              <input
                type="date"
                value={
                  newApplication.nextFollowupDate
                }
                onChange={(e) =>
                  setNewApplication({
                    ...newApplication,
                    nextFollowupDate:
                      e.target.value
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200"
              />

            </div>

            <div className="space-y-2">

              <label className="text-sm font-medium text-slate-600">
                Ngày gửi hồ sơ ngân hàng
              </label>

              <input
                type="date"
                value={
                  newApplication.submissionDate
                }
                onChange={(e) =>
                  setNewApplication({
                    ...newApplication,
                    submissionDate:
                      e.target.value
                  })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200"
              />

            </div>

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

      {showTimeline && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-bold">
                CRM Follow-up Timeline
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

            <div className="bg-slate-50 p-4 rounded-2xl mb-6 space-y-3">

              <textarea
                placeholder="Nhập follow-up / ghi chú / trao đổi với ngân hàng..."
                value={timelineNote}
                onChange={(e) =>
                  setTimelineNote(
                    e.target.value
                  )
                }
                className="w-full border border-slate-200 rounded-2xl p-4 min-h-[100px]"
              />

              <div className="flex justify-end">

                <button
                  onClick={addNote}
                  className="bg-slate-800 text-white px-5 py-3 rounded-2xl"
                >
                  + Thêm ghi chú
                </button>

              </div>

            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">

              {selectedTimeline.map(item => (

                <div
                  key={item.id}
                  className="border-l-4 border-slate-800 bg-slate-50 p-4 rounded-xl"
                >

                  <p className="font-semibold text-slate-800 whitespace-pre-wrap">
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