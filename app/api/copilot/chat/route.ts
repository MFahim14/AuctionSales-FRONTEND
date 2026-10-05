import { NextRequest } from "next/server";
import { proxyApiRequest } from "../../_proxy";

export async function POST(req: NextRequest) {
  return proxyApiRequest(req);
}

export async function OPTIONS(req: NextRequest) {
  return proxyApiRequest(req);
}
