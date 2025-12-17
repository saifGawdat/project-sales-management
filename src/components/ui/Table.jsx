// مكون الجدول - لعرض البيانات في شكل جدول
const Table = ({ columns, data, onEdit, onDelete, loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">لا توجد بيانات للعرض</div>
    );
  }

  const hasActions = onEdit || onDelete;

  return (
    <div className="w-full space-y-4">
      {/* Header Row - Hidden on Mobile */}
      <div
        className="hidden md:grid gap-4 px-6 py-3 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, 1fr) ${
            hasActions ? "auto" : ""
          }`,
        }}
      >
        {columns.map((column, index) => (
          <div key={index} className="text-right ">
            {column.header}
          </div>
        ))}
        {hasActions && <div className="text-right">الإجراءات</div>}
      </div>

      {/* Data Rows as Cards */}
      <div className="space-y-4">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-12! flex flex-col md:grid gap-4 items-center "
            style={{
              gridTemplateColumns: `repeat(${columns.length}, 1fr) ${
                hasActions ? "auto" : ""
              }`,
            }}
          >
            {columns.map((column, colIndex) => (
              <div
                key={colIndex}
                className="w-full flex justify-between md:block"
              >
                {/* Mobile Label */}
                <span className="md:hidden text-gray-500 font-medium text-sm ml-2">
                  {column.header}:
                </span>
                {/* Content */}
                <div className="text-sm text-gray-900 truncate">
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : row[column.accessor]}
                </div>
              </div>
            ))}

            {hasActions && (
              <div className="w-full flex justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 md:w-auto">
                {onEdit && (
                  <button
                    onClick={() => onEdit(row)}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 px-6! py-4! rounded-md transition-colors text-sm"
                  >
                    تعديل
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(row)}
                    className="text-red-600 hover:text-red-800 bg-red-50 px-6! py-4! rounded-md transition-colors text-sm"
                  >
                    حذف
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;
