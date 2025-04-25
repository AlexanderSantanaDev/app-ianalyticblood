export interface ApiSuccess<T> {
    status: "success";
    data: T;
}

export interface RegisterBody {
    email: string;
    name: string;
    password: string;
    terms_accepted: boolean;
    terms_version?: string;   // opcional (por defecto "1.0")
}

export interface LoginResponse {
    status: "success";
    access_token: string;
    token_type: "bearer";
}

export interface Overview {
    alert_level: "normal" | "attention" | "alert";
    general_state: string;
    summary: string;
}

export interface Parameter {
    value: number | null;
    unit: string | null;
    status: "normal" | "bajo" | "alto" | "muy_alto" | null;
    reference_range: [number, number] | null;
}

export interface AnalysisDoc {
    _id: string;
    user_id: string;
    file_type: string;
    overview: Overview;
    parameters: Record<string, Parameter>;
    analysis: string[];
    recommendations: string[];
    date: string;
}
