import type { TransactionQueryParams, EnrichedTransaction, PendingTransaction } from "akahu";

export class AkahuService {
    private readonly baseURL = "https://api.akahu.io/v1";

    constructor(
        private readonly appToken: string,
        private readonly userToken: string,
    ) {}

    private getHeaders(): HeadersInit {
        return {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${this.userToken}`,
            "X-Akahu-Id": this.appToken,
        };
    }

    async getTransactions(
        query: TransactionQueryParams,
    ): Promise<EnrichedTransaction[]> {
        const transactions: EnrichedTransaction[] = [];
        let currentCursor: string | null = null;

        do {
            const queryParams = new URLSearchParams({
                start: query.start!,
                end: query.end!,
                ...(currentCursor ? { cursor: currentCursor } : {}),
            });

            const response = await fetch(
                `${this.baseURL}/transactions?${queryParams}`,
                {
                    method: "GET",
                    headers: this.getHeaders(),
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = (await response.json()) as {
                items: EnrichedTransaction[];
                cursor: { next: string | null };
            };

            transactions.push(...data.items);
            currentCursor = data.cursor.next;
        } while (currentCursor);

        return transactions;
    }

    async getPendingTransactions(): Promise<PendingTransaction[]> {
        const response = await fetch(
            `${this.baseURL}/transactions/pending`,
            {
                method: "GET",
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as {
            items: PendingTransaction[];
        };

        return ...data.items;
    }
}
