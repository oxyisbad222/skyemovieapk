import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "37a77934-74eb-4afd-8f20-1e0991bbe087");
  requestHeaders.set("x-createxyz-project-group-id", "22c0896d-15fc-4bfd-9d6f-2478de29d7ca");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}