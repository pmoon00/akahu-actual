import type { EnrichedTransaction, PendingTransaction } from "akahu";
import type { ActualTransaction } from "../services/actual-service.ts";

export function transformTransaction(
    transaction: EnrichedTransaction,
): ActualTransaction {
    let payee = transaction.description;

    if (transaction.type === "TRANSFER" && transaction.meta.other_account != null) {
        const prefix = transaction.amount < 0
            ? "To: "
            : "From: "
        payee = prefix + transaction.meta.other_account;
    }
    return {
        imported_id: transaction._id,
        date: new Date(transaction.date),
        amount: Math.round(transaction.amount * 100),
        payee_name: payee,
        notes: formatTransactionNotes(transaction),
    };
}

export function transformPendingTransaction(
    transaction: PendingTransaction,
): ActualTransaction {
    return {
        date: new Date(transaction.date),
        amount: Math.round(transaction.amount * 100),
        payee_name: transaction.description,
        notes: `${transaction.type} • ${transaction.description || ""}`
            .replace(/\s+•\s+$/, "")
            .replace(/\s+•\s+•\s+/, " • "),
    };
}

function formatTransactionNotes(transaction: EnrichedTransaction): string {
    let prefix = transaction.type.toString();

    if (transaction.type === "CREDIT CARD" && transaction.meta.card_suffix != null) {
        prefix = transaction.meta.card_suffix;
    }
    return `${prefix} • ${transaction.category?.name || ""} • ${transaction.description || ""}`
        .replace(/\s+•\s+$/, "")
        .replace(/\s+•\s+•\s+/, " • ");
}
