export function formatDate(date: Date | string, format = "%B %d, %Y"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formatMap = {
    "%Y": dateObj.getFullYear().toString(),
    "%m": String(dateObj.getMonth() + 1).padStart(2, "0"),
    "%d": String(dateObj.getDate()).padStart(2, "0"),
    "%B": new Intl.DateTimeFormat("en-US", { month: "long" }).format(dateObj),
    "%b": new Intl.DateTimeFormat("en-US", { month: "short" }).format(dateObj),
    "%H": String(dateObj.getHours()).padStart(2, "0"),
    "%M": String(dateObj.getMinutes()).padStart(2, "0"),
    "%S": String(dateObj.getSeconds()).padStart(2, "0"),
  };

  return format.replace(
    /%[YmdBbHMS]/g,
    (matched) => formatMap[matched as keyof typeof formatMap] || matched,
  );
}
