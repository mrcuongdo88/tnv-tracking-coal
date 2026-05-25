export default function ShipmentTable({
  shipments,
  searchTerm,
  setSearchTerm,
  openTimeline,
  openDetails,
  calculateRisk,
  getLaycanColor,
  formatCurrency
}) {

  return (

    <div className="
      bg-white
      rounded-3xl
      shadow-sm
      overflow-hidden
    ">

      {/* Search */}

      <div className="
        p-4
        border-b
        border-slate-100
      ">

        <input
          type="text"
          placeholder="Tìm kiếm shipment..."
          value={searchTerm}
          onChange={(e)=>
            setSearchTerm(
              e.target.value
            )
          }
          className="
            w-full
            px-4
            py-3
            rounded-2xl
            border
            border-slate-200
            focus:outline-none
          "
        />

      </div>

      {/* Table */}

      <div className="
        w-full
        overflow-x-auto
      ">

        <table className="
          min-w-[1400px]
          border-collapse
        ">

          <thead className="
            bg-slate-50
            text-slate-500
            text-sm
            uppercase
          ">

            <tr>

              <th className="px-6 py-4 text-left">
                Đơn hàng
              </th>

              <th className="px-6 py-4 text-left">
                NCC
              </th>

              <th className="px-6 py-4 text-left">
                Laycan
              </th>

              <th className="px-6 py-4 text-left">
                ETA
              </th>

              <th className="px-6 py-4 text-left">
                Giá trị
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-left">
                Risk
              </th>

              <th className="px-6 py-4 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {shipments.map((item)=>(

              <tr
                key={item.id}
                className="
                  border-t
                  border-slate-100
                  hover:bg-slate-50
                "
              >

                <td className="
                  px-6
                  py-5
                  whitespace-nowrap
                ">
                  {item.order_no}
                </td>

                <td className="px-6 py-5">
                  {item.supplier}
                </td>

                <td className="
                  px-6
                  py-5
                  whitespace-nowrap
                ">

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

                    {
                      item.laycan_start
                    }

                  </span>

                </td>

                <td className="
                  px-6
                  py-5
                  whitespace-nowrap
                ">
                  {item.eta}
                </td>

                <td className="
                  px-6
                  py-5
                  whitespace-nowrap
                ">
                  {
                    formatCurrency(
                      item.estimated_value_vnd
                    )
                  }
                </td>

                <td className="px-6 py-5">
                  {item.status}
                </td>

                <td className="px-6 py-5">

                  <span className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold

                    ${
                      calculateRisk(item)
                      === 'Cao'

                      ? `
                        bg-rose-100
                        text-rose-700
                      `

                      : `
                        bg-emerald-100
                        text-emerald-700
                      `
                    }
                  `}>

                    {
                      calculateRisk(item)
                    }

                  </span>

                </td>

                <td className="
                  px-6
                  py-5
                  whitespace-nowrap
                ">

                  <div className="
                    flex
                    gap-2
                  ">

                    <button
                      onClick={()=>
                        openDetails(item)
                      }
                      className="
                        px-3
                        py-2
                        rounded-xl
                        bg-slate-900
                        text-white
                        text-sm
                      "
                    >
                      Chi tiết
                    </button>

                    <button
                      onClick={()=>
                        openTimeline(item)
                      }
                      className="
                        px-3
                        py-2
                        rounded-xl
                        border
                        border-slate-200
                        text-sm
                      "
                    >
                      Timeline
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}