import { useState } from 'react'

const initialApplications = [
  {
    id: 1,
    bank: 'Vietcombank',
    fileType: 'Hồ sơ vay vốn',
    amount: '20 tỷ',
    progress: 75,
    status: 'Đang thẩm định'
  },
  {
    id: 2,
    bank: 'BIDV',
    fileType: 'Hồ sơ bảo lãnh',
    amount: '5 tỷ',
    progress: 45,
    status: 'Chờ bổ sung'
  },
  {
    id: 3,
    bank: 'Techcombank',
    fileType: 'Cấp hạn mức',
    amount: '15 tỷ',
    progress: 60,
    status: 'Đã tiếp nhận'
  }
]

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

export default function App() {

  const [applications, setApplications] = useState(initialApplications)

  const [search, setSearch] = useState('')

  const [filterStatus, setFilterStatus] = useState('Tất cả')

  const [showModal, setShowModal] = useState(false)

  const [newApplication, setNewApplication] = useState({
    bank: '',
    fileType: '',
    amount: ''
  })

  function addApplication() {

    if (
      !newApplication.bank ||
      !newApplication.fileType
    ) return

    const item = {
      id: Date.now(),
      bank: newApplication.bank,
      fileType: newApplication.fileType,
      amount: newApplication.amount,
      progress: 10,
      status: 'Đã tiếp nhận'
    }

    setApplications([item, ...applications])

    setNewApplication({
      bank: '',
      fileType: '',
      amount: ''
    })

    setShowModal(false)
  }

  function deleteApplication(id) {

    const filtered = applications.filter(
      item => item.id !== id
    )

    setApplications(filtered)
  }

  function updateProgress(id, value) {

    const updated = applications.map(item => {

      if (item.id === id) {

        return {
          ...item,
          progress: Number(value)
        }
      }

      return item
    })

    setApplications(updated)
  }

  function updateStatus(id, value) {

    const updated = applications.map(item => {

      if (item.id === id) {

        return {
          ...item,
          status: value
        }
      }

      return item
    })

    setApplications(updated)
  }

  const filteredApplications = applications.filter(item => {

    const matchSearch =
      item.bank
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchStatus =
      filterStatus === 'Tất cả'
      || item.status === filterStatus

    return matchSearch && matchStatus
  })

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <h1 className="text-4xl font-bold text-slate-800">
              Dashboard Quản Lý Hồ Sơ Ngân Hàng
            </h1>

            <p className="text-slate-500 mt-2">
              CRM quản lý pipeline tín dụng doanh nghiệp
            </p>

          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-lg hover:opacity-90"
          >
            + Thêm hồ sơ
          </button>

        </div>

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

              {
                applications.filter(
                  item => item.progress < 100
                ).length
              }

            </h2>

          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">

            <p className="text-slate-500 text-sm">
              Hoàn thành
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">

              {
                applications.filter(
                  item => item.progress === 100
                ).length
              }

            </h2>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row gap-4">

          <input
            type="text"
            placeholder="Tìm kiếm ngân hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200 flex-1"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200"
          >
            <option>Tất cả</option>
            <option>Đã tiếp nhận</option>
            <option>Đang thẩm định</option>
            <option>Chờ bổ sung</option>
            <option>Hoàn thành</option>
          </select>

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
                    Loại hồ sơ
                  </th>

                  <th className="text-left px-6 py-4">
                    Giá trị
                  </th>

                  <th className="text-left px-6 py-4">
                    Tiến độ
                  </th>

                  <th className="text-left px-6 py-4">
                    Trạng thái
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
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-6 py-5 font-semibold">
                      {item.bank}
                    </td>

                    <td className="px-6 py-5">
                      {item.fileType}
                    </td>

                    <td className="px-6 py-5">
                      {item.amount}
                    </td>

                    <td className="px-6 py-5 min-w-[240px]">

                      <div className="space-y-3">

                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">

                          <div
                            className="bg-slate-800 h-full"
                            style={{
                              width: `${item.progress}%`
                            }}
                          />

                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.progress}
                          onChange={(e) =>
                            updateProgress(
                              item.id,
                              e.target.value
                            )
                          }
                          className="w-full"
                        />

                        <p className="text-sm text-slate-500">
                          {item.progress}%
                        </p>

                      </div>

                    </td>

                    <td className="px-6 py-5">

                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateStatus(
                            item.id,
                            e.target.value
                          )
                        }
                        className={`px-4 py-2 rounded-full text-sm font-semibold border-0 ${getStatusColor(item.status)}`}
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
                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600"
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

            <div className="flex justify-end gap-3 pt-3">

              <button
                onClick={() => setShowModal(false)}
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