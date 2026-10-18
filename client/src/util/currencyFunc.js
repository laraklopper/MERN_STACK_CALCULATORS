// currencyFunc.js
/* Format a figure as rands, e.g. R 1 500,00. Used by the tax and interest
calculator forms, which work only in rands. A missing figure is shown as R 0,00
rather than as nothing, because a result card with no number in it reads as a
fault rather than as a zero. */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 2,
    }).format(value || 0);
}