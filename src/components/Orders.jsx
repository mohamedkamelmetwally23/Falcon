import { Check, PackageCheck, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { orderApi } from "../services/api";
import { useUi } from "../UiContext";

const itemsOf = (order) =>
  order.items?.length
    ? order.items
    : [{ product: order.product, quantity: order.quantity }];

const statusBadgeClass = (status) => {
  switch (status) {
    case "new":
      return "badge-warning";
    case "confirmed":
    case "delivered":
      return "badge-success";
    case "rejected":
    case "cancelled":
      return "badge-error";
    case "returned":
    case "preparing":
      return "badge-info";
    default:
      return "badge-ghost";
  }
};

export default function Orders({ orders, setOrders, isAdmin, loading, error }) {
  const { isArabic, language } = useUi();
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [salePrices, setSalePrices] = useState({});
  const labels = isArabic
    ? {
        new: "في انتظار المدير",
        confirmed: "تم التأكيد والخصم",
        returned: "تم الإرجاع",
        rejected: "مرفوضة",
        preparing: "جاري التجهيز",
        delivered: "تم التسليم",
        cancelled: "ملغية",
      }
    : {
        new: "Waiting for manager",
        confirmed: "Confirmed & deducted",
        returned: "Returned",
        rejected: "Rejected",
        preparing: "Preparing",
        delivered: "Delivered",
        cancelled: "Cancelled",
      };
  const visible = useMemo(
    () =>
      orders.filter((order) =>
        `${order.customerName || ""} ${order.notes || ""} ${order.user?.name || ""} ${itemsOf(
          order,
        )
          .map((item) => item.product)
          .join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [orders, search],
  );
  const act = async (order, action) => {
    setWorkingId(order.id);
    setActionError("");
    try {
      const saved = await orderApi[action](
        order.id,
        action === "confirm"
          ? {
              salePrices: itemsOf(order).map((item, index) => ({
                itemId: item._id,
                price: salePrices[item._id || index] || "",
              })),
            }
          : undefined,
      );
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? saved : item)),
      );
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setWorkingId("");
    }
  };

  return (
    <section className="p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {isAdmin
            ? isArabic
              ? "إدارة المخزن"
              : "WAREHOUSE"
            : isArabic
              ? "فواتيري"
              : "MY INVOICES"}
        </span>
        <h2 className="text-2xl font-bold text-base-content">
          {isAdmin
            ? isArabic
              ? "راجع الفواتير قبل خصم المخزون"
              : "Review invoices before stock deduction"
            : isArabic
              ? "تابع فواتيرك وحالتها"
              : "Track your invoices"}
        </h2>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                FALCON INVOICES
              </span>
              <h3 className="text-lg font-semibold">
                {isAdmin
                  ? isArabic
                    ? "فواتير العاملين"
                    : "Worker invoices"
                  : isArabic
                    ? "فواتيري"
                    : "My invoices"}
              </h3>
              <p className="text-sm text-base-content/60">
                {orders.length}{" "}
                {isArabic ? "فاتورة مسجلة" : "registered invoices"}
              </p>
            </div>
          </div>

          <label className="input flex items-center gap-2 w-full sm:max-w-sm">
            <Search className="size-4 opacity-60" />
            <input
              type="text"
              className="grow"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isArabic ? "ابحث في الأوردرات..." : "Search orders..."}
            />
          </label>

          {(error || actionError) && (
            <div className="alert alert-error">
              <span>{error || actionError}</span>
            </div>
          )}
          {loading && (
            <div className="alert alert-info">
              <span>{isArabic ? "جاري التحميل..." : "Loading..."}</span>
            </div>
          )}

          {!loading && !visible.length ? (
            <div className="flex flex-col items-center gap-2 py-12 text-base-content/50">
              <PackageCheck className="size-10" />
              <b>{isArabic ? "لا توجد أوردرات" : "No orders yet"}</b>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="table table-zebra table-sm">
                  <thead>
                    <tr>
                      <th>{isArabic ? "التاريخ" : "Date"}</th>
                      {isAdmin && <th>{isArabic ? "العميل" : "Customer"}</th>}
                      {isAdmin && <th>{isArabic ? "المستخدم" : "User"}</th>}
                      <th>{isArabic ? "البنود" : "Items"}</th>
                      <th>{isArabic ? "إجمالي الكمية" : "Total qty"}</th>
                      {isAdmin && <th>{isArabic ? "السعر القديم" : "Old price"}</th>}
                      {isAdmin && <th>{isArabic ? "السعر الجديد" : "New price"}</th>}
                      {isAdmin && <th>{isArabic ? "الإجمالي القديم" : "Old total"}</th>}
                      {isAdmin && <th>{isArabic ? "الإجمالي الجديد" : "New total"}</th>}
                      <th>{isArabic ? "الحالة" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((order) => {
                      const lineItems = itemsOf(order);
                      const displayTotal = lineItems.reduce((sum, item, index) => {
                        const enteredPrice = Number(salePrices[item._id || index]);
                        const unitPrice =
                          order.status === "new" &&
                          salePrices[item._id || index] !== "" &&
                          Number.isFinite(enteredPrice)
                            ? enteredPrice
                            : Number(item.unitPrice || 0);
                        return sum + unitPrice * Number(item.quantity || 0);
                      }, 0);
                      const originalTotal = lineItems.reduce(
                        (sum, item) =>
                          sum +
                          Number(item.originalUnitPrice ?? item.unitPrice ?? 0) *
                            Number(item.quantity || 0),
                        0,
                      );
                      const isWorking = workingId === order.id;
                      return (
                        <tr key={order.id}>
                          <td>
                            <span className="font-semibold whitespace-nowrap">
                              {new Date(
                                order.invoiceDate || order.createdAt,
                              ).toLocaleDateString(
                                language === "ar" ? "ar-EG" : "en-US",
                              )}
                            </span>
                          </td>
                          {isAdmin && (
                            <td>
                              <div className="font-semibold">{order.customerName || "—"}</div>
                              {order.notes && (
                                <div className="text-xs text-base-content/50">{order.notes}</div>
                              )}
                            </td>
                          )}
                          {isAdmin && (
                            <td className="font-semibold">{order.user?.name}</td>
                          )}
                          <td>
                            <div className="flex flex-col gap-1">
                              {lineItems.map((item, index) => (
                                <span key={item._id || index} className="font-medium">
                                  {item.product ||
                                    `${item.laptop?.brand || ""} ${item.laptop?.model || ""}`.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className="font-semibold">
                              {lineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
                            </span>
                          </td>
                          {isAdmin && (
                            <td>
                              <div className="flex flex-col gap-1">
                                {lineItems.map((item, index) => (
                                  <span key={item._id || index} className="text-xs text-base-content/60 whitespace-nowrap">
                                    {Number(item.originalUnitPrice ?? item.unitPrice ?? 0).toLocaleString()}{" "}
                                    {isArabic ? "ج.م" : "EGP"}
                                  </span>
                                ))}
                              </div>
                            </td>
                          )}
                          {isAdmin && (
                            <td>
                              <div className="flex flex-col gap-1">
                                {lineItems.map((item, index) =>
                                  order.status === "new" ? (
                                    <input
                                      key={item._id || index}
                                      className="input input-sm w-28"
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={salePrices[item._id || index] || ""}
                                      onChange={(event) =>
                                        setSalePrices((current) => ({
                                          ...current,
                                          [item._id || index]: event.target.value,
                                        }))
                                      }
                                      placeholder={isArabic ? "اكتب السعر" : "Enter price"}
                                    />
                                  ) : (
                                    <span key={item._id || index} className="text-xs text-base-content/60 whitespace-nowrap">
                                      {Number(item.unitPrice || 0).toLocaleString()}{" "}
                                      {isArabic ? "ج.م" : "EGP"}
                                    </span>
                                  ),
                                )}
                              </div>
                            </td>
                          )}
                          {isAdmin && (
                            <td>
                              <span className="font-semibold whitespace-nowrap">
                                {originalTotal.toLocaleString()} {isArabic ? "ج.م" : "EGP"}
                              </span>
                            </td>
                          )}
                          {isAdmin && (
                            <td>
                              <span className="font-semibold text-primary whitespace-nowrap">
                                {displayTotal.toLocaleString()} {isArabic ? "ج.م" : "EGP"}
                              </span>
                            </td>
                          )}
                          <td>
                            {isAdmin && order.status === "new" ? (
                              <div className="flex gap-2">
                                <button
                                  disabled={isWorking}
                                  className="btn btn-success btn-sm"
                                  onClick={() => act(order, "confirm")}
                                >
                                  {isWorking ? (
                                    <span className="loading loading-spinner loading-xs" />
                                  ) : (
                                    <Check className="size-4" />
                                  )}
                                  {isArabic ? "تأكيد" : "Confirm"}
                                </button>
                                <button
                                  disabled={isWorking}
                                  className="btn btn-error btn-sm"
                                  onClick={() => act(order, "reject")}
                                >
                                  {isWorking ? (
                                    <span className="loading loading-spinner loading-xs" />
                                  ) : (
                                    <X className="size-4" />
                                  )}
                                  {isArabic ? "رفض" : "Reject"}
                                </button>
                              </div>
                            ) : (
                              <span className={`badge ${statusBadgeClass(order.status)}`}>
                                {labels[order.status] || order.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden space-y-3">
                {visible.map((order) => {
                  const lineItems = itemsOf(order);
                  const displayTotal = lineItems.reduce((sum, item, index) => {
                    const enteredPrice = Number(salePrices[item._id || index]);
                    const unitPrice =
                      order.status === "new" &&
                      salePrices[item._id || index] !== "" &&
                      Number.isFinite(enteredPrice)
                        ? enteredPrice
                        : Number(item.unitPrice || 0);
                    return sum + unitPrice * Number(item.quantity || 0);
                  }, 0);
                  const isWorking = workingId === order.id;
                  return (
                    <div className="card bg-base-200" key={order.id}>
                      <div className="card-body p-4 gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold">
                            {new Date(
                              order.invoiceDate || order.createdAt,
                            ).toLocaleDateString(
                              language === "ar" ? "ar-EG" : "en-US",
                            )}
                          </span>
                          <span className={`badge ${statusBadgeClass(order.status)}`}>
                            {labels[order.status] || order.status}
                          </span>
                        </div>
                        {isAdmin && (
                          <div className="text-xs text-base-content/60 flex flex-col gap-0.5">
                            <span>
                              {isArabic ? "العميل" : "Customer"}:{" "}
                              <b className="text-base-content">{order.customerName || "—"}</b>
                            </span>
                            <span>
                              {isArabic ? "بواسطة" : "By"}: {order.user?.name}
                            </span>
                          </div>
                        )}
                        <div className="divide-y divide-base-300">
                          {lineItems.map((item, index) => (
                            <div
                              key={item._id || index}
                              className="flex items-center justify-between gap-2 py-1.5"
                            >
                              <div>
                                <div className="text-sm font-medium">
                                  {item.product ||
                                    `${item.laptop?.brand || ""} ${item.laptop?.model || ""}`.trim()}
                                </div>
                                <div className="text-xs text-base-content/50">
                                  {isArabic ? "الكمية" : "Qty"}: {item.quantity}
                                </div>
                              </div>
                              {isAdmin && order.status === "new" && (
                                <input
                                  className="input input-sm w-24"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={salePrices[item._id || index] || ""}
                                  onChange={(event) =>
                                    setSalePrices((current) => ({
                                      ...current,
                                      [item._id || index]: event.target.value,
                                    }))
                                  }
                                  placeholder={isArabic ? "السعر الجديد" : "New price"}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-base-300 pt-2">
                          <span className="text-sm text-base-content/60">
                            {isArabic ? "إجمالي الكمية" : "Total quantity"}
                          </span>
                          <b>{lineItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</b>
                        </div>
                        <div className="flex items-center justify-between border-t border-base-300 pt-2">
                          <span className="text-sm text-base-content/60">
                            {isArabic ? "الإجمالي بعد الخصم" : "Total after discount"}
                          </span>
                          <b className="text-primary">
                            {displayTotal.toLocaleString()} {isArabic ? "ج.م" : "EGP"}
                          </b>
                        </div>
                        {order.notes && (
                          <p className="text-xs text-base-content/60">{order.notes}</p>
                        )}
                        {isAdmin && order.status === "new" && (
                          <div className="flex gap-2">
                            <button
                              disabled={isWorking}
                              className="btn btn-success btn-sm flex-1"
                              onClick={() => act(order, "confirm")}
                            >
                              {isWorking ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                <Check className="size-4" />
                              )}
                              {isArabic ? "تأكيد وخصم" : "Confirm"}
                            </button>
                            <button
                              disabled={isWorking}
                              className="btn btn-error btn-sm flex-1"
                              onClick={() => act(order, "reject")}
                            >
                              {isWorking ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                <X className="size-4" />
                              )}
                              {isArabic ? "رفض" : "Reject"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
