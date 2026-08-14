import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportResourceType, SignedUrlRequest } from "@/types/domain";

const BUCKET = "attachments";
const SIGNED_URL_TTL_SECONDS = 60;

const RESOURCE_TABLES: Record<ReportResourceType, "assessment_forms" | "consents" | "ccdc_forms"> = {
  assessment_form: "assessment_forms",
  consent: "consents",
  ccdc_form: "ccdc_forms",
};

function isValidRequest(body: unknown): body is SignedUrlRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.resourceId === "string" &&
    (b.resourceType === "assessment_form" || b.resourceType === "consent" || b.resourceType === "ccdc_form") &&
    (b.fileKind === "pdf" || b.fileKind === "excel")
  );
}

function clientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!isValidRequest(body)) {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }
  const { resourceType, resourceId, fileKind } = body;

  if (fileKind === "excel" && resourceType !== "assessment_form") {
    return NextResponse.json({ error: "Loại tài nguyên không có bảng điểm Excel." }, { status: 400 });
  }

  // User-scoped client: every read below is subject to the same RLS
  // (current_staff_id / is_same_branch) as the mobile app, so a staff member
  // can only mint a signed URL for a record they're actually allowed to see.
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!staffRow) {
    return NextResponse.json({ error: "Tài khoản chưa được gán hồ sơ nhân sự." }, { status: 403 });
  }

  const table = RESOURCE_TABLES[resourceType];
  const pathColumn = fileKind === "excel" ? "excel_path" : "pdf_path";

  const { data: record, error: recordError } = await supabase
    .from(table)
    .select(pathColumn)
    .eq("id", resourceId)
    .single();

  const path = (record as Record<string, string | null> | null)?.[pathColumn];

  if (recordError || !record || !path) {
    return NextResponse.json({ error: "Không tìm thấy tệp hoặc bạn không có quyền truy cập." }, { status: 404 });
  }

  const { error: auditError } = await supabase.from("audit_logs").insert({
    staff_id: staffRow.id,
    action: fileKind === "excel" ? "VIEW_EXCEL" : "VIEW_PDF",
    resource_type: resourceType,
    resource_id: resourceId,
    resource_path: path,
    ip_address: clientIp(request),
    user_agent: request.headers.get("user-agent"),
  });
  if (auditError) {
    return NextResponse.json({ error: "Không thể ghi nhật ký giám sát, yêu cầu bị từ chối." }, { status: 500 });
  }

  const admin = createAdminClient();
  const { data: signed, error: signError } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (signError || !signed) {
    return NextResponse.json({ error: "Không thể tạo liên kết xem an toàn." }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: signed.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS });
}
