    import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      tenant: string;
      module: string;
      collection: string;
      action: string;
    };
  }
) {
  const { tenant, module, collection, action } = await params;
  const uri = `${process.env.NEXT_PUBLIC_MGMT_SERVER_URI}/mgmt/${tenant}/${module}/${collection}/${action}`;
  console.log("POST URI:", uri);


  const fetchData = async () => {
    const result = await axios.get(uri);
    return result.data;
  };

  try {
    const data = await fetchData();

    if (!data) {
      throw new Error("Data not found");
    }

    return NextResponse.json(data);
  } catch (e: any) {
    if (axios.isAxiosError(e)) {
      if (e.response) {
        return NextResponse.json(
          {
            code: e.response.status,
            message: e.message,
            cause: e,
          },
          { status: e.response.status }
        );
      }
    }
    return NextResponse.json({ cause: e, message: e.message }, { status: 500 });
  }
}


export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      tenant: string;
      module: string;
      collection: string;
      action: string;
    };
  }
) {
  const { tenant, module, collection, action } = await params;
  const uri = `${process.env.NEXT_PUBLIC_MGMT_SERVER_URI}/mgmt/${tenant}/${module}/${collection}/${action}`;

  try {
    const body = await req.json();
    const res = await axios.post(uri, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return NextResponse.json(res.data);
  } catch (e: any) {
    if (axios.isAxiosError(e)) {
      return NextResponse.json(
        {
          code: e.response?.status || 500,
          message: e.message,
          cause: e,
        },
        { status: e.response?.status || 500 }
      );
    }
    return NextResponse.json({ cause: e, message: e.message }, { status: 500 });
  }
}
