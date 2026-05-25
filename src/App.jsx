import { useState, useEffect,useRef } from 'react'
import * as XLSX from 'xlsx'
import PullToRefresh
  from 'react-simple-pull-to-refresh'
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
import companyLogo from './assets/logotnv.png'
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
      'abb',
    'abbank',
    'an binh',
    'anbinh'
    ],

    name: 'An Binh Bank',

    logo:
      abbankLogo
  },
  {
    keywords: [
      'gpbank',
      'gp'
    ],

    name: 'GPBank',

    logo:
      gpbankLogo
  }
  
]
const masterChecklist = [

  {
    group: 'Pháp lý doanh nghiệp',

    items: [

      'GPKD',

      'Điều lệ',

      'CCCD người đại diện',

      'Báo cáo thuế'
    ]
  },

  {
    group: 'Financial',

    items: [

      'BCTC kiểm toán',

      'BCTC nội bộ quý gần nhất',

      'VAT',

      'Bảng kê chi tiết tài khoản kế toán, doanh thu 2 năm gần nhất, quý gần nhất'
    ]
  },

  {
    group: 'Existing Debt',

    items: [

      'Hợp đồng tín dụng TCTD',

      'Khế ước nhận nợ',

      'Sao kê dư nợ,Dòng tiền về tài khoản'
    ]
  },

  {
    group: 'Business Flow',

    items: [

      'Phương án kinh doanh',

      'Hợp đồng đầu ra',

      'Hợp đồng đầu vào',

      'Invoice / PO'
    ]
  },

  {
    group: 'Collateral',

    items: [

      'Hồ sơ TSĐB'
    ]
  }
]
const checklistKeywordMap = {

  'vat': 'VAT',

  'bctc':
    'BCTC kiểm toán',

  'kiểm toán':
    'BCTC kiểm toán',

  'tài sản':
    'Hồ sơ TSĐB',

  'tsđb':
    'Hồ sơ TSĐB',

  'sao kê':
    'Sao kê dư nợ,Dòng tiền về tài khoản',

  'dòng tiền':
    'Sao kê dư nợ,Dòng tiền về tài khoản',

  'khế ước':
    'Khế ước nhận nợ',

  'hợp đồng':
    'Hợp đồng đầu ra',

  'invoice':
    'Invoice / PO',

  'po':
    'Invoice / PO',

  'cccd':
    'CCCD người đại diện',

  'điều lệ':
    'Điều lệ'
}
export default function App() {

  const [shipments, setshipments] =
    useState([])
const dashboardRef =
  useRef(null)

const casesRef =
  useRef(null)

const followupRef =
  useRef(null)
  const [search, setSearch] =
    useState('')
const [
  showFabMenu,
  setShowFabMenu
] = useState(false)
  const [showModal, setShowModal] =
    useState(false)

  const [selectedFile, setSelectedFile] =
    useState(null)
const [
  activeMobileTab,
  setActiveMobileTab
] = useState('home')
  const [selectedTimeline, setSelectedTimeline] =
    useState([])
const [
  selectedTimelineMap,
  setSelectedTimelineMap
] = useState({})
  const [showTimeline, setShowTimeline] =
    useState(false)
    const [
  showDetails,
  setShowDetails
] = useState(false)

const [
  selectedShipment,
  setSelectedShipment
] = useState(null)
const [
  selectedCase,
  setSelectedCase
] = useState(null)

const [
  showCaseDetail,
  setShowCaseDetail
] = useState(false)
const [
  editCreditStructure,
  setEditCreditStructure
] = useState(false)

const [
  creditLimit,
  setCreditLimit
] = useState('')

const [
  lcValue,
  setLcValue
] = useState('')

const [
  unsecuredValue,
  setUnsecuredValue
] = useState('')
  const [timelineNote, setTimelineNote] =
    useState('')
    const suggestedChecklist =

  Object.entries(
    checklistKeywordMap
  )

  .filter(([keyword]) =>

    timelineNote
      .toLowerCase()
      .includes(
        keyword.toLowerCase()
      )
  )

  .map(([, checklist]) =>
    checklist
  )

useEffect(() => {

  setTimelineChecklist(
    suggestedChecklist
  )

}, [timelineNote])
const [
  timelineFollowupDate,
  setTimelineFollowupDate
] = useState('')

const [
  timelineNextAction,
  setTimelineNextAction
] = useState('')    
const [
  timelineChecklist,
  setTimelineChecklist
] = useState([])
const [
  timelineFile,
  setTimelineFile
] = useState(null)
  const [selectedApplicationId,
    setSelectedApplicationId] =
    useState(null)
const [
  selectedChecklist,
  setSelectedChecklist
] = useState([])

 const [
  newShipment,
  setNewShipment
] = useState({

  orderNo: '',

  supplier: '',

  vesselName: '',

  cargoQty: '',

  gcv: '',

  cifPrice: '',

  fxRate: '26150',

  estimatedValueVnd: '',

  laycanStart: '',

  laycanEnd: '',

  etaDischarge: '',

  loadPort: '',

  dischargePort: '',

  paymentTerm: '',
  ownerName: '',

department: '',

nextStep: '',

internalDueDate: '',

  shipmentNotes: '',

  status: 'Kế hoạch',

  riskLevel: 'Bình thường'
})
const estimatedValueVnd =

  Number(
    newShipment.cargoQty || 0
  )

  *

  Number(
    newShipment.cifPrice || 0
  )

  *

  Number(
    newShipment.fxRate || 0
  )
useEffect(() => {

  fetchShipments()

}, [])

useEffect(() => {

  async function loadAllTimelines() {

    const map = {}

    for (const app of shipments) {

      const { data } =
        await supabase
          .from('shipment_timeline')
          .select()
          .eq(
            'shipment_id',
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

  if (shipments.length) {

    loadAllTimelines()
  }

}, [shipments])

  async function fetchShipments() {

  const { data, error } =
    await supabase
      .from('shipments')
      .select()
      .order(
        'created_at',
        {
          ascending: false
        }
      )

  if (!error) {

    setshipments(data || [])
  }
}
function detectBank(bankName = '') {

  const normalized =
    bankName
      .toLowerCase()
      .trim()

  return bankDirectory.find(bank =>

    bank.keywords.some(keyword =>

      normalized.includes(
        keyword.toLowerCase()
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
            newShipment.supplier
              .toLowerCase()
          )
    )
async function addTimeline(
  applicationId,
  action,
  fileUrl = '',
  fileName = ''
) {

  await supabase
    .from('shipment_timeline')
    .insert([
      {
        shipment_id:
          applicationId,

        action,

        file_url:
          fileUrl,

        file_name:
          fileName
      }
    ])
}

  async function fetchTimeline(id) {

    const { data } =
      await supabase
        .from('shipment_timeline')
        .select()
        .eq('shipment_id', id)
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

  let fileUrl = ''
  let fileName = ''

  if (timelineFile) {

    const fileExt =
      timelineFile.name
        .split('.')
        .pop()

    const uploadName =
      `${uuidv4()}.${fileExt}`

    const {
      error: uploadError
    } =
      await supabase.storage
        .from('documents')
        .upload(
          uploadName,
          timelineFile
        )

    if (!uploadError) {

      const { data } =
        supabase.storage
          .from('documents')
          .getPublicUrl(uploadName)

      fileUrl =
        data.publicUrl

      fileName =
        timelineFile.name

      await supabase
        .from('shipments')
        .update({

          document_url:
            fileUrl,

          document_name:
            fileName

        })
        .eq(
          'id',
          selectedApplicationId
        )
    }
  }

  await addTimeline(
    selectedApplicationId,
    timelineNote,
    fileUrl,
    fileName
  )
const currentApplication =
  shipments.find(

    app =>
      app.id ===
      selectedApplicationId
  )

const existingChecklist =
  currentApplication
    ?.checklist || []

const mergedChecklist = [

  ...new Set([

    ...existingChecklist,

    ...timelineChecklist
  ])
]

await supabase
  .from('shipments')

  .update({

    next_followup_date:
      timelineFollowupDate
        || null,

    next_action:
      timelineNextAction
        || null,

    checklist:
      mergedChecklist
  })

  .eq(
    'id',
    selectedApplicationId
  )
  setTimelineNote('')

  setTimelineFile(null)
setTimelineFollowupDate('')

setTimelineNextAction('')
setTimelineChecklist([])
  fetchTimeline(
    selectedApplicationId
  )

  fetchShipments()
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
function getLastUpdateInfo(
  applicationId
) {

  const timelines =
    selectedTimelineMap[
      applicationId
    ] || []

  if (!timelines.length) {

    return {

      label:
        '⚪ Chưa cập nhật',

      color:
        'text-slate-400'
    }
  }

  const latest =
    timelines[0]

  const updated =
    new Date(
      latest.created_at
    )

  const now =
    new Date()

  const diffMs =
    now - updated

  const diffDays =
    diffMs / (
      1000 * 60 * 60 * 24
    )

  if (diffDays < 1) {

    const hours =
      Math.max(
        1,
        Math.floor(
          diffMs /
          (1000 * 60 * 60)
        )
      )

    return {

      label:
        `🟢 Cập nhật ${hours} giờ trước`,

      color:
        'text-green-600'
    }
  }

  if (diffDays <= 3) {

    return {

      label:
        `🟡 Cập nhật ${Math.floor(
          diffDays
        )} ngày trước`,

      color:
        'text-yellow-600'
    }
  }

  return {

    label:
      `🔴 Cập nhật ${Math.floor(
        diffDays
      )} ngày trước`,

    color:
      'text-red-600'
  }
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
function getNextAction(
  application
) {

  return (
    application.next_action
    || '-'
  )
}
async function openCaseDetail(item) {

  setSelectedCase(item)

  const { data } =
    await supabase
      .from('shipment_timeline')
      .select()
      .eq(
        'shipment_id',
        item.id
      )
      .order(
        'created_at',
        {
          ascending: false
        }
      )

  setSelectedTimeline(data || [])

  setShowCaseDetail(true)
}
async function saveCreditStructure() {

  if (!selectedCase)
    return

  await supabase
    .from('shipments')
    .update({

      credit_limit:
        Number(
          creditLimit
            .replaceAll(',', '')
        ) || 0,

      lc_value:
        Number(
          lcValue
            .replaceAll(',', '')
        ) || 0,

      unsecured_value:
        Number(
          unsecuredValue
            .replaceAll(',', '')
        ) || 0
    })

    .eq(
      'id',
      selectedCase.id
    )

  fetchShipments()

  setSelectedCase({

    ...selectedCase,

    credit_limit:
      Number(
        creditLimit
          .replaceAll(',', '')
      ),

    lc_value:
      Number(
        lcValue
          .replaceAll(',', '')
      ),

    unsecured_value:
      Number(
        unsecuredValue
          .replaceAll(',', '')
      )
  })

  setEditCreditStructure(false)
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
  !newShipment.orderNo
) return

    let documentUrl = ''
    let documentName = ''

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

    const { data, error } =
      await supabase
        .from('shipments')
        .insert([
          {

  order_no:
    newShipment.orderNo,

  supplier:
    newShipment.supplier,

  vessel_name:
    newShipment.vesselName,

  cargo_qty:
    Number(
      newShipment.cargoQty
    ) || 0,

  gcv:
    newShipment.gcv,

  cif_price:
    Number(
      newShipment.cifPrice
    ) || 0,

  fx_rate:
    Number(
      newShipment.fxRate
    ) || 0,

  estimated_value_vnd:
    estimatedValueVnd,

  laycan_start:
    newShipment.laycanStart,

  laycan_end:
    newShipment.laycanEnd,

  eta_discharge:
    newShipment.etaDischarge,

  load_port:
    newShipment.loadPort,

  discharge_port:
    newShipment.dischargePort,

  payment_term:
    newShipment.paymentTerm,
owner_name:
  newShipment.ownerName,

department:
  newShipment.department,

next_step:
  newShipment.nextStep,

internal_due_date:
  newShipment.internalDueDate,
  shipment_notes:
    newShipment.shipmentNotes,

  risk_level:
    newShipment.riskLevel,

  progress: 10,

  status:
    'Kế hoạch',

  document_url:
    documentUrl,

  document_name:
    documentName
}
        ])
        .select()
console.log(error)
    if (!error) {

      if (data?.[0]?.id) {

  await addTimeline(
    data[0].id,
    '📄 Shipment được tạo'
  )
}

      fetchShipments()

      setNewShipment({

  orderNo: '',

  supplier: '',

  vesselName: '',

  cargoQty: '',

  gcv: '',

  cifPrice: '',

  fxRate: '26150',

  estimatedValueVnd: '',

  laycanStart: '',

  laycanEnd: '',

  etaDischarge: '',

  loadPort: '',

  dischargePort: '',

  paymentTerm: '',

  shipmentNotes: '',

  status: 'Kế hoạch',

  riskLevel: 'Bình thường'
})

      setSelectedFile(null)
setSelectedChecklist([])
      setShowModal(false)
    }
  }

  async function deleteApplication(id) {

    const { error } =
      await supabase
        .from('shipments')
        .delete()
        .eq('id', Number(id))

    if (!error) {

      fetchShipments()
    }
  }

  async function updateProgress(id, value) {

    const { error } =
      await supabase
        .from('shipments')
        .update({
          progress: parseInt(value)
        })
        .eq('id', Number(id))

    if (!error) {

      await addTimeline(
        id,
        `📊 Tiến độ cập nhật ${value}%`
      )

      fetchShipments()
    }
  }

  async function updateNextAction(
  id,
  value
) {

  const { error } =
    await supabase
      .from('shipments')
      .update({
        next_action: value
      })
      .eq('id', Number(id))

  if (error) {

    console.log(error)

    return
  }

  setshipments(prev =>

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

async function updateStatus(id, value) {
    const { error } =
      await supabase
        .from('shipments')
        .update({
          status: value
        })
        .eq('id', Number(id))

    if (!error) {

      await addTimeline(
        id,
        `🔄 Status chuyển sang ${value}`
      )

      fetchShipments()
    }
  }

  function exportToExcel() {

    const worksheet =
      XLSX.utils.json_to_sheet(shipments)

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'shipments'
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

    case 'Kế hoạch':
      return 'bg-slate-100 text-slate-700'

    case 'Đang đàm phán':
      return 'bg-amber-100 text-amber-700'

    case 'Chờ mở LC':
      return 'bg-orange-100 text-orange-700'

    case 'Đã mở LC':
      return 'bg-cyan-100 text-cyan-700'

    case 'Tàu đang xếp hàng':
      return 'bg-indigo-100 text-indigo-700'

    case 'Đang hành trình':
      return 'bg-blue-100 text-blue-700'

    case 'Sắp cập cảng':
      return 'bg-purple-100 text-purple-700'

    case 'Đang dỡ hàng':
      return 'bg-yellow-100 text-yellow-700'

    case 'Hoàn tất':
      return 'bg-green-100 text-green-700'

    default:
      return 'bg-slate-100 text-slate-700'
  }
}
function getLaycanColor(
  laycanStart
) {

  if (!laycanStart)
    return `
      bg-slate-100
      text-slate-600
    `

  const today =
    new Date()

  const laycan =
    new Date(laycanStart)

  const diffDays =
    Math.ceil(
      (
        laycan - today
      ) /
      (
        1000 *
        60 *
        60 *
        24
      )
    )

  if (diffDays < 0) {

    return `
      bg-red-200
      text-red-800
    `
  }

  if (diffDays <= 2) {

    return `
      bg-red-100
      text-red-700
    `
  }

  if (diffDays <= 7) {

    return `
      bg-amber-100
      text-amber-700
    `
  }

  return `
    bg-cyan-100
    text-cyan-700
  `
}
  function isFollowupOverdue(date) {

    if (!date) return false

    return (
      new Date(date) <
      new Date()
    )
  }
const today =
  new Date()

const urgentLaycan =
  shipments.filter(item => {

    if (!item.laycan_start)
      return false

    const laycan =
      new Date(
        item.laycan_start
      )

    const diffDays =
      Math.ceil(
        (
          laycan - today
        ) /
        (
          1000 *
          60 *
          60 *
          24
        )
      )

    return diffDays <= 3
  })

const overdueEta =
  shipments.filter(item => {

    if (
      !item.eta_discharge
    ) return false

    return (
      new Date(
        item.eta_discharge
      ) < today
      &&
      item.status !==
      'Hoàn tất'
    )
  })

const highRisk =
  shipments.filter(item =>
    item.risk_level === 'Cao'
  )

const pendingLc =
  shipments.filter(item =>
    item.status ===
    'Chờ mở LC'
  )
  const filteredshipments =
    shipments.filter(item => {

      const bank =
        item.supplier || ''

      return bank
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    })
    const mobileTabTitle = {

  home:
    'Dashboard Overview',

  cases:
    'All Cases',

  followup:
    'Cases Need Follow-up'
}
let mobileshipments =
  filteredshipments
if (
  activeMobileTab ===
  'followup'
) {

  mobileshipments =
    filteredshipments.filter(

      item => {

        if (
          !item.next_followup_date
        ) return false

        const today =
          new Date()

        const followup =
          new Date(
            item.next_followup_date
          )

        return (
          followup <= today
        )
      }
    )
}
if (
  activeMobileTab ===
  'home'
) {

  mobileshipments =
    filteredshipments.slice(0, 5)
}
  const processingCount =
    shipments.filter(item => {

      const progress =
        item.progress || 0

      return progress < 100

    }).length

  const completedCount =
    shipments.filter(item => {

      const progress =
        item.progress || 0

      return progress === 100

    }).length

  const overdueCount =
    shipments.filter(item => {

      return (
        calculateAging(
          item.created_at
        ) > 7
      )

    }).length

  const followupOverdueCount =
    shipments.filter(item =>

      isFollowupOverdue(
        item.next_followup_date
      )
    ).length

  const totalAmount =
    shipments.reduce(
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
        shipments.filter(
          item =>
            item.status ===
            'Đã tiếp nhận'
        ).length
    },

    {
      name: 'Đang thẩm định',
      value:
        shipments.filter(
          item =>
            item.status ===
            'Đang thẩm định'
        ).length
    },

    {
      name: 'Chờ bổ sung',
      value:
        shipments.filter(
          item =>
            item.status ===
            'Chờ bổ sung'
        ).length
    },

    {
      name: 'Hoàn thành',
      value:
        shipments.filter(
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

  const bankData = shipments.map(
    item => ({
      bank: item.bank,
      progress:
        item.progress || 0
    })
  )

  return (
<PullToRefresh

    onRefresh={
  fetchShipments
}

  >
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div className="flex items-center gap-5">

  <div
    className="
      bg-white
      rounded-3xl
      shadow-sm
      border
      border-slate-200
      p-4
      h-[88px]
      w-[88px]
      flex
      items-center
      justify-center
    "
  >

    <img
      src={companyLogo}
      alt="Company Logo"

      className="
        max-h-[60px]
        object-contain
      "
    />

  </div>

  <div>

    <h1 className="text-4xl font-bold text-slate-800">

      Hệ thống theo dõi tiến độ tàu hàng

    </h1>

    <p className="text-slate-500 mt-2">

      Shipment Tracking System

    </p>

  </div>

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
              + Thêm shipment
            </button>

          </div>

        </div>

        <div ref={dashboardRef} className="grid grid-cols-1 md:grid-cols-6 gap-5">

          <div className="
  bg-white
  rounded-3xl
  p-4
  shadow-sm
">

            <p className="text-slate-500 text-sm">
              Tổng hồ sơ
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">
              {shipments.length}
            </h2>

          </div>

          <div className="
  bg-white
  rounded-3xl
  p-4
  shadow-sm
">

            <p className="text-slate-500 text-sm">
              Đang xử lý
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">
              {processingCount}
            </h2>

          </div>

          <div className="
  bg-white
  rounded-3xl
  p-4
  shadow-sm
">

            <p className="text-slate-500 text-sm">
              Hoàn thành
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">
              {completedCount}
            </h2>

          </div>

          <div className="
  bg-white
  rounded-3xl
  p-4
  shadow-sm
">

            <p className="text-slate-500 text-sm">
              Hồ sơ overdue
            </p>

            <h2 className="text-4xl font-bold mt-3 text-red-600">
              {overdueCount}
            </h2>

          </div>

          <div className="
  bg-white
  rounded-3xl
  p-4
  shadow-sm
">

            <p className="text-slate-500 text-sm">
              Follow-up overdue
            </p>

            <h2 className="text-4xl font-bold mt-3 text-amber-600">
              {followupOverdueCount}
            </h2>

          </div>

          <div className="
  bg-white
  rounded-3xl
  p-4
  shadow-sm
">

            <p className="text-slate-500 text-sm">
              Tổng pipeline
            </p>

            <h2 className="text-xl font-bold mt-3 text-slate-800">
              {formatCurrency(totalAmount)} VNĐ
            </h2>

          </div>

        </div>
        

  <div className="
    space-y-2
    text-sm
    text-slate-700
  ">
<div className="
  bg-gradient-to-r
  from-slate-900
  to-slate-800
  text-white
  rounded-3xl
  p-6
  mb-6
">

  <div className="
    flex
    items-center
    justify-between
    mb-4
  ">

    <div>

      <div className="
        text-xl
        font-bold
      ">

        Smart Insights

      </div>

      <div className="
        text-slate-300
        text-sm
        mt-1
      ">

        Điều phối & cảnh báo vận hành shipment

      </div>

    </div>

    <div className="text-3xl">
      🚢
    </div>

  </div>

  <div className="
    grid
    md:grid-cols-2
    gap-3
  ">

    <div className="
      bg-white/10
      rounded-2xl
      p-4
    ">

      <div className="font-semibold">

        ⚠ Shipment sắp Laycan

      </div>

      <div className="
        text-2xl
        font-bold
        mt-2
      ">

        {urgentLaycan.length}

      </div>

    </div>

    <div className="
      bg-white/10
      rounded-2xl
      p-4
    ">

      <div className="font-semibold">

        🚨 ETA quá hạn

      </div>

      <div className="
        text-2xl
        font-bold
        mt-2
      ">

        {overdueEta.length}

      </div>

    </div>

    <div className="
      bg-white/10
      rounded-2xl
      p-4
    ">

      <div className="font-semibold">

        💳 Chờ mở LC

      </div>

      <div className="
        text-2xl
        font-bold
        mt-2
      ">

        {pendingLc.length}

      </div>

    </div>

    <div className="
      bg-white/10
      rounded-2xl
      p-4
    ">

      <div className="font-semibold">

        🔥 Shipment Risk Cao

      </div>

      <div className="
        text-2xl
        font-bold
        mt-2
      ">

        {highRisk.length}

      </div>

    </div>
</div>
  </div>

</div>
        <div className="
  bg-white
  rounded-3xl
  p-4
  shadow-sm
">

          <input
            type="text"
            placeholder="Tìm kiếm đơn tàu..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full px-4 py-3 rounded-2xl border border-slate-200"
          />

        </div>

        <div className="
  hidden
  lg:block
  bg-white
  rounded-3xl
  shadow-sm
  overflow-hidden
">
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 text-slate-500 text-sm uppercase">

                <tr>

  <th className="text-left px-6 py-4">
    Đơn hàng
  </th>

  <th className="text-left px-6 py-4">
    Nhà cung cấp
  </th>
  <th className="text-left px-6 py-4">
    Laycan
  </th>

  <th className="text-left px-6 py-4">
    ETA
  </th>

  <th className="text-left px-6 py-4">
    Khối lượng
  </th>

  <th className="text-left px-6 py-4">
    CIF USD
  </th>

  <th className="text-left px-6 py-4">
    Giá trị tạm tính
  </th>
<th className="text-left px-6 py-4">
  Status
</th>
  <th className="text-left px-6 py-4">
    Risk
  </th>

  <th className="text-left px-6 py-4">
    Timeline
  </th>

</tr>

              </thead>

              <tbody>

                {mobileshipments.map(item => {

  return (

    <tr
      key={item.id}
    >

                  <td className="px-6 py-5 font-semibold">

  <div>

    <div className="font-bold text-slate-800">

      {item.order_no}

    </div>

    <button

      onClick={(e) => {

        e.stopPropagation()

        setSelectedShipment(item)

        setShowDetails(true)
      }}

      className="
        mt-2
        text-sm
        text-indigo-600
        hover:text-indigo-800
        font-semibold
      "
    >

      📄 Chi tiết

    </button>

  </div>

</td>

<td className="px-6 py-5">
  {item.supplier}
</td>

<td className="px-6 py-5">
  <div>

  <span className={`
  inline-flex
  items-center
  gap-2
  px-3
  py-2
  rounded-full
  text-sm
  font-semibold

  ${getLaycanColor(
    item.laycan_start
  )}
`}>

    {item.laycan_start || '-'}

    <span className="text-cyan-400">
      →
    </span>

    {item.laycan_end || '-'}

  </span>

</div>
</td>

<td className="px-6 py-5">
  {item.eta_discharge || '-'}
</td>

<td className="px-6 py-5">
  {Number(
    item.cargo_qty || 0
  ).toLocaleString('vi-VN')}
</td>

<td className="px-6 py-5">
  ${Number(
    item.cif_price || 0
  ).toLocaleString('en-US')}
</td>

<td className="px-6 py-5 font-bold text-emerald-700">

  {
    Number(
      item.estimated_value_vnd || 0
    ).toLocaleString('vi-VN')
  }

</td>
<td className="px-6 py-5">

  <select

    value={item.status || 'Kế hoạch'}

    onChange={(e) =>

      updateStatus(
        item.id,
        e.target.value
      )
    }

    className={`
      px-3
      py-2
      rounded-xl
      text-sm
      font-semibold
      border-0
      ${getStatusColor(item.status)}
    `}
  >

    <option>Kế hoạch</option>

    <option>Đang đàm phán</option>

    <option>Chờ mở LC</option>

    <option>Đã mở LC</option>

    <option>Tàu đang xếp hàng</option>

    <option>Đang hành trình</option>

    <option>Sắp cập cảng</option>

    <option>Đang dỡ hàng</option>

    <option>Hoàn tất</option>

  </select>

</td>
<td className="px-6 py-5">

  <span className={`
    px-3
    py-2
    rounded-full
    text-sm
    font-semibold

    ${
      item.risk_level === 'Cao'

      ? `
        bg-red-100
        text-red-700
      `

      : `
        bg-green-100
        text-green-700
      `
    }
  `}>

    {item.risk_level}

  </span>

</td>
                      <td className="px-6 py-5">
                        <button
                          onClick={(e) => {

  e.stopPropagation()

  setSelectedApplicationId(
    item.id
  )

  fetchTimeline(item.id)

  setShowTimeline(true)
}}
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

        </div>{
  activeMobileTab ===
  'followup' && (

    <div
      ref={followupRef}
    />
  )
}
<div

  ref={casesRef}

  className="
    lg:hidden
    space-y-4
">
<div className="
  flex
  items-center
  justify-between
  mb-2
">

  <h2 className="
    text-lg
    font-bold
    text-slate-800
  ">

    {
      mobileTabTitle[
        activeMobileTab
      ]
    }

  </h2>

  <div className="
    text-sm
    text-slate-500
  ">

    {mobileshipments.length}

    hồ sơ

  </div>

</div>
  {mobileshipments.map(item => {

    const aging =
      calculateAging(
        item.submission_date
      )

    const bankInfo = null

    return (

      <div
        key={item.id}

        onClick={() =>
          openCaseDetail(item)
        }

        className="
          bg-white
          rounded-3xl
          p-5
          shadow-sm
          space-y-4
        "
      >

        <div className="
          flex
          items-center
          justify-between
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div>

              <h3 className="
                font-bold
                text-slate-800
              ">

                {item.supplier}

              </h3>

              <p className="
                text-sm
                text-slate-500
              ">

                {item.vessel_name}

              </p>

            </div>

          </div>

          <button

            onClick={(e) => {

              e.stopPropagation()

              fetchTimeline(item.id)
            }}

            className="
              bg-indigo-500
              text-white
              px-4
              py-2
              rounded-xl
              text-sm
            "
          >

            Timeline

          </button>

        </div>

        <div className="
          grid
          grid-cols-2
          gap-3
        ">

          <div className="
            bg-slate-50
            rounded-2xl
            p-3
          ">

            <p className="
              text-xs
              text-slate-500
            ">

              Giá trị

            </p>

            <p className="
              font-bold
              text-slate-800
              mt-1
            ">

              {Number(
  item.estimated_value_vnd || 0
).toLocaleString('vi-VN')}

            </p>

          </div>

          <div className="
            bg-slate-50
            rounded-2xl
            p-3
          ">

            <p className="
              text-xs
              text-slate-500
            ">

              Aging

            </p>

            <span
              className={`
                inline-block
                mt-1
                px-2
                py-1
                rounded-full
                text-xs
                font-semibold

                ${getAgingColor(aging)}
              `}
            >

              {aging} ngày

            </span>

          </div>

        </div>

        <div className="
          bg-green-50
          rounded-2xl
          p-4
        ">

          <p className="
            text-xs
            text-green-700
            font-semibold
            mb-2
          ">

            NEXT ACTION

          </p>

          <p className="
            text-sm
            text-slate-700
          ">

            {getNextAction(item)}

          </p>

        </div>

      </div>
    )
  })}

</div>


      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="
  bg-white
  rounded-3xl
  p-6
  w-full
  max-w-md
  space-y-3
  shadow-2xl
  max-h-[90vh]
  overflow-y-auto
">

            <h2 className="text-2xl font-bold text-slate-800">
              Tạo Shipment Than
            </h2>

            <input
  type="text"
  placeholder="Số đơn hàng"
  value={newShipment.orderNo}
  onChange={(e) =>
    setNewShipment({
      ...newShipment,
      orderNo: e.target.value
    })
  }
  className="w-full px-4 py-3 rounded-2xl border border-slate-200"
/>

<input
  type="text"
  placeholder="Nhà cung cấp"
  value={newShipment.supplier}
  onChange={(e) =>
    setNewShipment({
      ...newShipment,
      supplier: e.target.value
    })
  }
  className="w-full px-4 py-3 rounded-2xl border border-slate-200"
/>

<input
  type="text"
  placeholder="Tên tàu"
  value={newShipment.vesselName}
  onChange={(e) =>
    setNewShipment({
      ...newShipment,
      vesselName: e.target.value
    })
  }
  className="w-full px-4 py-3 rounded-2xl border border-slate-200"
/>

<div className="grid grid-cols-2 gap-3">

  <input
    type="date"
    value={newShipment.laycanStart}
    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        laycanStart: e.target.value
      })
    }
    className="w-full px-4 py-3 rounded-2xl border border-slate-200"
  />

  <input
    type="date"
    value={newShipment.laycanEnd}
    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        laycanEnd: e.target.value
      })
    }
    className="w-full px-4 py-3 rounded-2xl border border-slate-200"
  />

</div>

<input
  type="text"
  placeholder="Cảng xếp"
  value={newShipment.loadPort}
  onChange={(e) =>
    setNewShipment({
      ...newShipment,
      loadPort: e.target.value
    })
  }
  className="w-full px-4 py-3 rounded-2xl border border-slate-200"
/>

<input
  type="text"
  placeholder="Cảng dỡ"
  value={newShipment.dischargePort}
  onChange={(e) =>
    setNewShipment({
      ...newShipment,
      dischargePort: e.target.value
    })
  }
  className="w-full px-4 py-3 rounded-2xl border border-slate-200"
/>

<div className="grid grid-cols-2 gap-3">

  <input
    type="text"
    placeholder="Khối lượng"
    value={newShipment.cargoQty}
    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        cargoQty: e.target.value
      })
    }
    className="w-full px-4 py-3 rounded-2xl border border-slate-200"
  />

  <input
    type="text"
    placeholder="Nhiệt trị GCV"
    value={newShipment.gcv}
    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        gcv: e.target.value
      })
    }
    className="w-full px-4 py-3 rounded-2xl border border-slate-200"
  />

</div>

<div className="grid grid-cols-2 gap-3">

  <input
    type="text"
    placeholder="Giá CIF USD"
    value={newShipment.cifPrice}
    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        cifPrice: e.target.value
      })
    }
    className="w-full px-4 py-3 rounded-2xl border border-slate-200"
  />

  <input
    type="text"
    placeholder="Tỷ giá VCB"
    value={newShipment.fxRate}
    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        fxRate: e.target.value
      })
    }
    className="w-full px-4 py-3 rounded-2xl border border-slate-200"
  />

</div>

<div className="
  bg-emerald-50
  border
  border-emerald-200
  rounded-2xl
  p-4
">

  <p className="
    text-sm
    text-emerald-700
  ">

    Giá trị tạm tính

  </p>

  <h3 className="
    text-xl
    font-bold
    text-emerald-800
    mt-2
  ">

    {
      estimatedValueVnd.toLocaleString('vi-VN')
    }

    VND

  </h3>

</div>
<div className="
  text-xs
  text-slate-500
  leading-relaxed
  mb-2
">

  Ngày dự kiến tàu cập cảng dỡ hàng tại Việt Nam
  (ETA = Estimated Time of Arrival)

</div>
<input
  type="date"
  value={newShipment.etaDischarge}
  onChange={(e) =>
    setNewShipment({
      ...newShipment,
      etaDischarge: e.target.value
    })
  }
  className="w-full px-4 py-3 rounded-2xl border border-slate-200"
/>

<input
  type="text"
  placeholder="Điều kiện thanh toán"
  value={newShipment.paymentTerm}
  onChange={(e) =>
    setNewShipment({
      ...newShipment,
      paymentTerm: e.target.value
    })
  }
  className="w-full px-4 py-3 rounded-2xl border border-slate-200"
/>
<div>

  <label className="
    text-sm
    font-semibold
    text-slate-700
  ">

    Người phụ trách

  </label>

  <input

    value={newShipment.ownerName}

    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        ownerName: e.target.value
      })
    }

    className="
      w-full
      mt-2
      rounded-2xl
      border
      border-slate-200
      px-4
      py-3
    "

    placeholder="VD: Nguyễn Văn A"
  />

</div>

<div>

  <label className="
    text-sm
    font-semibold
    text-slate-700
  ">

    Bộ phận phụ trách

  </label>

  <select

    value={newShipment.department}

    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        department: e.target.value
      })
    }

    className="
      w-full
      mt-2
      rounded-2xl
      border
      border-slate-200
      px-4
      py-3
    "
  >

    <option value="">
      Chọn bộ phận
    </option>

    <option>
      Commercial
    </option>

    <option>
      Logistics
    </option>

    <option>
      Finance
    </option>

    <option>
      Operations
    </option>

    <option>
      Port
    </option>

  </select>

</div>

<div>

  <label className="
    text-sm
    font-semibold
    text-slate-700
  ">

    Việc cần thực hiện tiếp theo

  </label>

  <input

    value={newShipment.nextStep}

    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        nextStep: e.target.value
      })
    }

    className="
      w-full
      mt-2
      rounded-2xl
      border
      border-slate-200
      px-4
      py-3
    "

    placeholder="VD: Mở LC trước ngày..."
  />

</div>

<div>

  <label className="
    text-sm
    font-semibold
    text-slate-700
  ">

    Deadline nội bộ

  </label>

  <input

    type="date"

    value={newShipment.internalDueDate}

    onChange={(e) =>
      setNewShipment({
        ...newShipment,
        internalDueDate: e.target.value
      })
    }

    className="
      w-full
      mt-2
      rounded-2xl
      border
      border-slate-200
      px-4
      py-3
    "
  />

</div>
<textarea
  placeholder="Ghi chú shipment..."
  value={newShipment.shipmentNotes}
  onChange={(e) =>
    setNewShipment({
      ...newShipment,
      shipmentNotes: e.target.value
    })
  }
  className="
    w-full
    px-4
    py-3
    rounded-2xl
    border
    border-slate-200
    min-h-[80px]
  "
/>


            <div className="flex justify-end  gap-3 pt-3 relative z-50">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="px-5 py-3 rounded-2xl bg-slate-200"
              >
                Hủy
              </button>

              <button
                type="button"

onClick={(e) => {

  e.preventDefault()

  e.stopPropagation()

  addApplication()
}}
                className="
    px-5
    py-3
    rounded-2xl
    bg-slate-800
    text-white
  "
              >
                Lưu hồ sơ
              </button>

            </div>

          </div>
</div>
      )}
{showCaseDetail && selectedCase && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">

    <div className="
  bg-white
  h-full
  w-full
  max-w-5xl
  p-6
  overflow-y-auto
  shadow-2xl
">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-3xl font-bold text-slate-800">
          Case Detail
        </h2>

        <button
          onClick={() =>
            setShowCaseDetail(false)
          }
          className="bg-slate-200 px-4 py-2 rounded-xl"
        >
          Đóng
        </button>

      </div>

      <div className="space-y-6">

        <div className="bg-slate-50 rounded-3xl p-6">

          <div className="flex items-center gap-4 mb-6">

            {detectBank(selectedCase.bank)?.logo && (

              <img
                src={
                  detectBank(selectedCase.bank).logo
                }
                alt={selectedCase.bank}
                className="h-14 object-contain"
              />

            )}

            <div>

              <h3 className="text-2xl font-bold text-slate-800">
                {selectedCase.bank}
              </h3>

              <p className="text-slate-500">
                {selectedCase.file_type}
              </p>

            </div>

          </div>

          <div className="grid lg:grid-cols-3 gap-4">

            <div className="bg-white rounded-2xl p-4">

              <p className="text-slate-500 text-sm">
                Giá trị khoản vay
              </p>

              <h3 className="text-xl font-bold text-slate-800 mt-2">
                {formatCurrency(selectedCase.amount)} VNĐ
              </h3>
<div className="mt-5 space-y-3">

  <div className="flex items-center justify-between">

    <span className="text-slate-500">
      HMTD
    </span>

    <span className="font-semibold text-slate-800">

      {formatCurrency(
        selectedCase.credit_limit || 0
      )}

    </span>

  </div>

  <div className="flex items-center justify-between">

    <span className="text-slate-500">
      LC
    </span>

    <span className="font-semibold text-slate-800">

      {formatCurrency(
        selectedCase.lc_value || 0
      )}

    </span>

  </div>

  <div className="flex items-center justify-between">

    <span className="text-slate-500">
      Tín chấp
    </span>

    <span className="font-semibold text-slate-800">

      {formatCurrency(
        selectedCase.unsecured_value || 0
      )}

    </span>

  </div>

  <button

    onClick={() => {

      setCreditLimit(

  selectedCase.credit_limit
    ? formatCurrency(
        selectedCase.credit_limit
      )
    : ''

)

      setLcValue(

  selectedCase.lc_value
    ? formatCurrency(
        selectedCase.lc_value
      )
    : ''

)

      setUnsecuredValue(

  selectedCase.unsecured_value
    ? formatCurrency(
        selectedCase.unsecured_value
      )
    : ''

)

      setEditCreditStructure(true)
    }}

    className="
      mt-4
      bg-slate-800
      text-white
      px-4
      py-2
      rounded-xl
      text-sm
    "
  >

    Edit

  </button>

</div>
            </div>

            <div className="bg-white rounded-2xl p-4">

              <p className="text-slate-500 text-sm">
                Aging
              </p>

              <h3 className="text-xl font-bold mt-2">

                <span
                  className={`px-3 py-2 rounded-full text-sm font-semibold ${getAgingColor(
                    calculateAging(selectedCase.submission_date)
                  )}`}
                >

                  {calculateAging(
                    selectedCase.submission_date
                  )} ngày

                </span>

              </h3>

            </div>

          </div>

        </div>

        <div className="bg-slate-50 rounded-3xl p-6">

          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Next Action
          </h3>

          <div className="bg-green-100 text-green-700 px-4 py-4 rounded-2xl font-semibold whitespace-pre-wrap">

            {getNextAction(selectedCase)}

          </div>

        </div>
<div className="bg-slate-50 rounded-3xl p-6">

  <div className="
    flex
    items-center
    justify-between
    mb-5
  ">

    <h3 className="
      text-xl
      font-bold
      text-slate-800
    ">

      Document Checklist

    </h3>

    <div className="
      bg-amber-100
      text-amber-700
      px-4
      py-2
      rounded-full
      text-sm
      font-semibold
    ">

      {
        masterChecklist
          .flatMap(g => g.items)
          .length
        -
        (
          selectedCase.checklist
            ?.length || 0
        )
      }
      hồ sơ thiếu

    </div>

  </div>

  <div className="space-y-5">

    {masterChecklist.map(group => (

      <div key={group.group}>

        <h4 className="
          font-bold
          text-slate-700
          mb-3
        ">

          {group.group}

        </h4>

        <div className="space-y-2">

          {group.items.map(item => {

            const checked =
              selectedCase.checklist
                ?.includes(item)

            return (

              <button

  key={item}

  onClick={async () => {

    let updatedChecklist =
      selectedCase.checklist || []

    if (checked) {

      updatedChecklist =
        updatedChecklist.filter(
          value => value !== item
        )

    } else {

      updatedChecklist = [

        ...updatedChecklist,
        item
      ]
    }

    await supabase
      .from('shipments')
      .update({

        checklist:
          updatedChecklist
      })

      .eq(
        'id',
        selectedCase.id
      )

    setSelectedCase({

      ...selectedCase,

      checklist:
        updatedChecklist
    })

    fetchShipments()
  }}

  className="
    flex
    items-center
    gap-3
    text-sm
  "
>

  <span>

    {checked
      ? '☑'
      : '☐'}

  </span>

  <span
    className={
      checked
        ? 'text-slate-800'
        : 'text-slate-400'
    }
  >

    {item}

  </span>

</button>
            )
          })}

        </div>

      </div>

    ))}

  </div>

</div>
        <div className="bg-slate-50 rounded-3xl p-6">

          <h3 className="text-xl font-bold text-slate-800 mb-4">
            PDF Hồ sơ
          </h3>

          {selectedCase.document_url ? (

            <div className="space-y-3">

              <p className="text-slate-500">
                {selectedCase.document_name}
              </p>

              <div className="flex gap-3">

                <a
                  href={selectedCase.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 text-white px-5 py-3 rounded-2xl"
                >
                  👁 Xem PDF
                </a>

                <a
                  href={selectedCase.document_url}
                  download
                  className="bg-slate-200 px-5 py-3 rounded-2xl"
                >
                  ⬇ Download
                </a>

              </div>

            </div>

          ) : (

            <p className="text-slate-400">
              Không có file
            </p>

          )}

        </div>

      </div>
<div className="bg-slate-50 rounded-3xl p-6">

  <h3 className="text-xl font-bold text-slate-800 mb-4">

    PDF History

  </h3>

  <div className="space-y-3">

    {selectedTimeline
      .filter(item => item.file_url)
      .map(item => (

        <div
          key={item.id}

          className="
            bg-white
            rounded-2xl
            p-4
            flex
            items-center
            justify-between
          "
        >

          <div>

            <p className="font-semibold text-slate-800">

              📄 {item.file_name}

            </p>

            <p className="text-sm text-slate-400 mt-1">

              {new Date(
                item.created_at
              ).toLocaleString()}

            </p>

          </div>

          <a
            href={item.file_url}
            target="_blank"
            rel="noreferrer"

            className="
              bg-slate-800
              text-white
              px-4
              py-2
              rounded-xl
              text-sm
            "
          >

            Xem PDF

          </a>

        </div>

      ))}

    {!selectedTimeline.some(
      item => item.file_url
    ) && (

      <p className="text-slate-400">

        Chưa có lịch sử PDF

      </p>

    )}

  </div>

</div>{editCreditStructure && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">

    <div className="bg-white rounded-3xl p-8 w-full max-w-lg">

      <h2 className="text-2xl font-bold text-slate-800 mb-6">

        Edit Credit Structure

      </h2>

      <div className="space-y-4">

        <input
          type="text"

          placeholder="HMTD"

          value={creditLimit}

          onChange={(e) =>
            setCreditLimit(
              formatInputCurrency(
                e.target.value
              )
            )
          }

          className="
            w-full
            border
            border-slate-200
            rounded-2xl
            p-4
          "
        />

        <input
          type="text"

          placeholder="LC"

          value={lcValue}

          onChange={(e) =>
            setLcValue(
              formatInputCurrency(
                e.target.value
              )
            )
          }

          className="
            w-full
            border
            border-slate-200
            rounded-2xl
            p-4
          "
        />

        <input
          type="text"

          placeholder="Tín chấp"

          value={unsecuredValue}

          onChange={(e) =>
            setUnsecuredValue(
              formatInputCurrency(
                e.target.value
              )
            )
          }

          className="
            w-full
            border
            border-slate-200
            rounded-2xl
            p-4
          "
        />

      </div>

      <div className="flex justify-end gap-3 mt-6">

        <button

          onClick={() =>
            setEditCreditStructure(false)
          }

          className="
            bg-slate-200
            px-5
            py-3
            rounded-2xl
          "
        >

          Hủy

        </button>

        <button

          onClick={
            saveCreditStructure
          }

          className="
            bg-slate-800
            text-white
            px-5
            py-3
            rounded-2xl
          "
        >

          Lưu

        </button>

      </div>

    </div>

  </div>

)}
    </div>

  </div>

)}
{showDetails && selectedShipment && (

  <div className="
    fixed
    inset-0
    bg-black/40
    z-50
    flex
    justify-end
  ">

    <div className="
      bg-white
      h-full
      w-full
      max-w-2xl
      overflow-y-auto
      shadow-2xl
      p-6
    ">

      <div className="
        flex
        justify-between
        items-center
        mb-6
      ">

        <div>

          <h2 className="
            text-3xl
            font-bold
            text-slate-800
          ">

            {selectedShipment.order_no}

          </h2>

          <p className="text-slate-500">

            {selectedShipment.supplier}

          </p>

        </div>

        <button

          onClick={() =>
            setShowDetails(false)
          }

          className="
            text-slate-500
            text-2xl
          "
        >

          ✕

        </button>

      </div>

      <div className="
        grid
        grid-cols-2
        gap-4
      ">

        <div className="
          bg-slate-50
          rounded-2xl
          p-4
        ">

          <div className="text-sm text-slate-500">
            Tàu
          </div>

          <div className="font-bold text-lg">
            {selectedShipment.vessel_name || '-'}
          </div>

        </div>

        <div className="
          bg-slate-50
          rounded-2xl
          p-4
        ">

          <div className="text-sm text-slate-500">
            Khối lượng
          </div>

          <div className="font-bold text-lg">

            {Number(
              selectedShipment.cargo_qty || 0
            ).toLocaleString('vi-VN')}

            MT

          </div>

        </div>

        <div className="
          bg-slate-50
          rounded-2xl
          p-4
        ">

          <div className="text-sm text-slate-500">
            CIF USD
          </div>

          <div className="font-bold text-lg">

            $
            {Number(
              selectedShipment.cif_price || 0
            ).toLocaleString('en-US')}

          </div>

        </div>

        <div className="
          bg-slate-50
          rounded-2xl
          p-4
        ">

          <div className="text-sm text-slate-500">
            Giá trị tạm tính
          </div>

          <div className="
            font-bold
            text-lg
            text-emerald-700
          ">

            {Number(
              selectedShipment.estimated_value_vnd || 0
            ).toLocaleString('vi-VN')}

            VND

          </div>
        </div>

      </div>

      <div className="
        mt-6
        bg-slate-50
        rounded-2xl
        p-5
      ">

        <h3 className="
          font-bold
          text-lg
          mb-4
        ">

          🚢 Hành trình

        </h3>

        <div className="space-y-3">

          <div>
            <span className="text-slate-500">
              Load Port:
            </span>

            {' '}

            {selectedShipment.load_port || '-'}
          </div>

          <div>
            <span className="text-slate-500">
              Discharge Port:
            </span>

            {' '}

            {selectedShipment.discharge_port || '-'}
          </div>

          <div>
            <span className="text-slate-500">
              Laycan:
            </span>

            {' '}

            {selectedShipment.laycan_start}

            {' → '}

            {selectedShipment.laycan_end}
          </div>

          <div>
            <span className="text-slate-500">
              Dự kiến cập cảng:
            </span>

            {' '}

            {selectedShipment.eta_discharge || '-'}
          </div>
<div className="
  text-xs
  text-amber-600
  mt-1
">

  ETA giúp bộ phận Logistics, Kho vận và Tài chính
  chủ động kế hoạch tiếp nhận hàng.

</div>
        </div>

      </div>

      <div className="
        mt-6
        bg-slate-50
        rounded-2xl
        p-5
      ">

        <h3 className="
          font-bold
          text-lg
          mb-4
        ">

          📝 Ghi chú

        </h3>

        <p className="text-slate-700 whitespace-pre-wrap">

          {selectedShipment.shipment_notes || 'Không có ghi chú'}

        </p>

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
              <input
  type="date"

  value={
    timelineFollowupDate
  }

  onChange={(e) =>
    setTimelineFollowupDate(
      e.target.value
    )
  }

  className="
    w-full
    border
    border-slate-200
    rounded-2xl
    p-3
    bg-white
    mt-3
  "
/>

<input
  type="text"

  placeholder="
    Next Action đề xuất
  "

  value={
    timelineNextAction
  }

  onChange={(e) =>
    setTimelineNextAction(
      e.target.value
    )
  }

  className="
    w-full
    border
    border-slate-200
    rounded-2xl
    p-3
    bg-white
    mt-3
  "
/>
{
  suggestedChecklist.length > 0 && (

    <div className="
      bg-amber-50
      border
      border-amber-200
      rounded-2xl
      p-4
      mt-4
    ">

      <p className="
        text-sm
        font-semibold
        text-amber-700
        mb-3
      ">

        Hồ sơ được đề xuất

      </p>

      <div className="
        flex
        flex-wrap
        gap-2
      ">

        {suggestedChecklist.map(item => {

          const checked =
            timelineChecklist.includes(item)

          return (

            <button

              key={item}

              type="button"

              onClick={() => {

                if (checked) {

                  setTimelineChecklist(

                    timelineChecklist.filter(
                      value =>
                        value !== item
                    )
                  )

                } else {

                  setTimelineChecklist([

                    ...timelineChecklist,
                    item
                  ])
                }
              }}

              className={`
                px-3
                py-2
                rounded-full
                text-sm
                transition

                ${
                  checked

                  ? `
                    bg-green-500
                    text-white
                  `

                  : `
                    bg-white
                    border
                    border-slate-200
                    text-slate-700
                  `
                }
              `}
            >

              {checked ? '☑' : '☐'}

              {' '}

              {item}

            </button>
          )
        })}

      </div>

    </div>
  )
}
<input
  type="file"
  accept=".pdf"

  onChange={(e) =>
    setTimelineFile(
      e.target.files[0]
    )
  }

  className="
    w-full
    border
    border-slate-200
    rounded-2xl
    p-3
    bg-white
  "
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
{item.file_url && (

  <div className="mt-3">

    <a
      href={item.file_url}
      target="_blank"
      rel="noreferrer"

      className="
        inline-flex
        items-center
        gap-2
        bg-slate-800
        text-white
        px-4
        py-2
        rounded-xl
        text-sm
      "
    >

      📄 {item.file_name}

    </a>

  </div>

)}
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
{/* MOBILE FAB */}

<div className="
  fixed
  bottom-24
  right-6
  lg:hidden
  z-50
">

  <div className="relative">

    <button
    onClick={() =>

  setShowFabMenu(
    !showFabMenu
  )
}
      className="
        w-16
        h-16
        rounded-full
        bg-indigo-600
        text-white
        text-3xl
        shadow-2xl
      "
    >

      +

    </button>

    <div className={`
  absolute
  bottom-20
  right-0
  transition
  space-y-3

  ${
    showFabMenu

    ? `
      opacity-100
      pointer-events-auto
    `

    : `
      opacity-0
      pointer-events-none
    `
  }
`}>

      <button

        onClick={() =>
          setShowModal(true)
        }

        className="
          bg-white
          shadow-lg
          rounded-2xl
          px-4
          py-3
          text-sm
          whitespace-nowrap
          w-full
        "
      >

        📄 Tạo hồ sơ

      </button>

      <button

        onClick={() => {

          if (
            shipments.length
          ) {

            fetchTimeline(
              shipments[0].id
            )
          }
        }}

        className="
          bg-white
          shadow-lg
          rounded-2xl
          px-4
          py-3
          text-sm
          whitespace-nowrap
          w-full
        "
      >

        📝 Timeline

      </button>

    </div>

  </div>

</div>
{/* MOBILE BOTTOM NAV */}

<div className="
  fixed
  bottom-0
  left-0
  right-0
  lg:hidden
  bg-white
  border-t
  border-slate-200
  z-40
">

  <div className="
    grid
    grid-cols-4
  ">

    <button

      onClick={() => {

  setActiveMobileTab(
    'home'
  )

  dashboardRef.current
    ?.scrollIntoView({

      behavior:
        'smooth'
    })
}}

      className={`
        py-4
        text-sm
        font-medium

        ${
          activeMobileTab ===
          'home'

          ? `
            text-indigo-600
          `

          : `
            text-slate-400
          `
        }
      `}
    >

      🏠

      <div>Home</div>

    </button>

    <button

      onClick={() => {

  setActiveMobileTab(
    'cases'
  )

  casesRef.current
    ?.scrollIntoView({

      behavior:
        'smooth'
    })
}}

      className={`
        py-4
        text-sm
        font-medium

        ${
          activeMobileTab ===
          'cases'

          ? `
            text-indigo-600
          `

          : `
            text-slate-400
          `
        }
      `}
    >

      📋

      <div>Cases</div>

    </button>

    <button

      onClick={() => {

  setActiveMobileTab(
    'followup'
  )

  setTimeout(() => {

    followupRef.current
      ?.scrollIntoView({

        behavior:
          'smooth'
      })

  }, 100)
}}

      className={`
        py-4
        text-sm
        font-medium

        ${
          activeMobileTab ===
          'followup'

          ? `
            text-indigo-600
          `

          : `
            text-slate-400
          `
        }
      `}
    >

      📅

      <div>Follow-up</div>

    </button>

    <button

      onClick={() => {

        window.scrollTo({

          top: 0,

          behavior:
            'smooth'
        })
      }}

      className="
        py-4
        text-sm
        font-medium
        text-slate-400
      "
    >

      ⚙️

      <div>More</div>

    </button>

  </div>
</div>
</div>
    </div></PullToRefresh>
  )
  }