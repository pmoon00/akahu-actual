import * as api from "@actual-app/api";
import * as os from "os";

export interface ActualTransaction {
    imported_id: string;
    date: Date;
    amount: number;
    payee_name: string;
    notes: string;
    cleared: boolean;
}

export class ActualService {
    constructor(
        private readonly serverURL: string,
        private readonly password: string,
        private readonly e2eEncryptionPassword: string | undefined,
        private readonly syncId: string,
    ) {}

    async initialize(): Promise<void> {
        await api.init({
            dataDir: os.tmpdir(),
            serverURL: this.serverURL,
            password: this.password,
        });
        const downloadParams = this.e2eEncryptionPassword
            ? { password: this.e2eEncryptionPassword }
            : undefined;
        await api.downloadBudget(this.syncId, downloadParams);
    }

    async importTransactions(
        accountId: string,
        transactions: ActualTransaction[],
    ): Promise<void> {
        await api.importTransactions(accountId, transactions);
    }

    async shutdown(): Promise<void> {
        await api.shutdown();
    }
}
