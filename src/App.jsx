import { useState } from 'react'

const initialApplications = [
  {
    id: 1,
    bank: 'Vietcombank',
    branch: 'CN Hải Phòng',
    fileType: 'Hồ sơ vay vốn',
    amount: '20 tỷ',
    sentDate: '14/05/2026',
    progress: 75,
    status: 'Đang thẩm định',
    priority: 'Cao',
    owner: 'Nguyễn Văn A'
  },
  {
    id: 2,
    bank: 'BIDV',
    branch: 'Khối KHDN',
    fileType: 'Hồ sơ bảo lãnh',
    amount: '5 tỷ',
    sentDate: '13/05/2026',
    progress: 45,
    status: 'Chờ bổ sung',
    priority: 'Trung bình',
    owner: 'Trần Thị B'
  },
  {
    id: 3,
    bank: 'Techcombank',
    branch: 'SME Hải Phòng',
    fileType: 'Cấp hạn mức',
    amount: '15 tỷ',
    sentDate: '12/05/2026',
    progress: 60,
    status: 'Đã tiếp nhận',
    priority: 'Cao',
    owner: 'Lê Văn C'
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

    case 'Mới tạo':
      return 'bg-purple-100 text-purple-700'

    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'Khẩn':
      return 'text-red-600'

    case 'Cao':
      return 'text-orange-500'

    default:
      return 'text-slate-500'
  }
}

export default function App() {

  const [applications, setApplications] = useState(initialApplications)

  const [newBank, setNewBank] = useState('')

  function addApplication() {

    if (!newBank) return

    const newItem = {
      id: applications.length + 1,
      bank: newBank,
      branch: 'Chi nhánh mới',
      fileType: 'Hồ sơ mới',
      amount: '0',
      sentDate: new Date().toLocaleDateString(),
      progress: 10,
      status: 'Mới tạo',
      priority: 'Thấp',
      owner: 'Admin'
    }

    setApplications([newItem, ...applications])

    setNewBank('')
  }

  function deleteApplication(id) {

    const filtered = applications.filter(
      (item) => item.id !== id
    )

    setApplications(filtered)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Dashboard Quản Lý Hồ Sơ Ngân Hàng
            </h1>

            <p className="text-slate-500 mt-2">
              Theo dõi tiến độ xử lý hồ sơ tín dụng doanh nghiệp
            </p>
          </div>

          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Tên ngân hàng..."
              value={newBank}
              onChange={(e) => setNewBank(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none"
            />

            <button
              onClick={addApplication}
              className="bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-lg hover:opacity-90 transition-all"
            >
              + Thêm hồ sơ
            </button>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-slate-500 text-sm">
              Tổng hồ sơ
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">
              {applications.length}
            </h2>

            <p className="text-blue-600 mt-2 text-sm">
              Realtime Dashboard
            </p>
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

            <p className="text-amber-600 mt-2 text-sm">
              Theo dõi SLA
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-slate-500 text-sm">
              Tổng hạn mức
            </p>

            <h2 className="text-4xl font-bold mt-3 text-slate-800">
              126 tỷ
            </h2>

            <p className="text-green-600 mt-2 text-sm">
              Working Capital
            </p>
          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-100">

            <h3 className="text-2xl font-semibold text-slate-800">
              Danh sách hồ sơ
            </h3>

            <p className="text-slate-500 mt-1 text-sm">
              Quản lý tiến độ xử lý hồ sơ theo ngân hàng
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 text-slate-500 text-sm uppercase">

                <tr>

                  <th className="text-left px-6 py-4">
                    STT
                  </th>

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

                {applications.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-all"
                  >

                    <td className="px-6 py-5 font-semibold">
                      {item.id}
                    </td>

                    <td className="px-6 py-5">

                      <div>

                        <p className="font-semibold text-slate-800">
                          {item.bank}
                        </p>

                        <p className="text-sm text-slate-500">
                          {item.branch}
                        </p>

                      </div>

                    </td>

                    <td className="px-6 py-5">
                      {item.fileType}
                    </td>

                    <td className="px-6 py-5 font-semibold">
                      {item.amount}
                    </td>

                    <td className="px-6 py-5 min-w-[220px]">

                      <div className="flex items-center gap-4">

                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">

                          <div
                            className="bg-slate-800 h-full rounded-full"
                            style={{
                              width: `${item.progress}%`
                            }}
                          />

                        </div>

                        <span className="text-sm font-semibold text-slate-600">
                          {item.progress}%
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <button
                        onClick={() => deleteApplication(item.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600 transition-all"
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

    </div>
  )
}