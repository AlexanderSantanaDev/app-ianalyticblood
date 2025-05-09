export interface DashboardStats {
    analyses_total: number;
    analyses_this_month: number;
    general_state: string;
    next_reminder: string | null;
}

export interface AnalysisSummary {
    id: string;
    date: string;
    summary: string;
    alert_level: "normal" | "attention" | "alert";
}

export interface Analysis {
    id: number;
    title: string;
    date: string;
    status: "normal" | "warning" | "alert";
    statusText: string;
    description: string;
}

export interface FileUploadProps {
    onUpload: (file: File) => void;
}