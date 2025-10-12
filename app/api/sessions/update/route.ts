import { getConnection } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSessionSchema = z.object({
  session_id: z.string().min(1, "Session ID is required"),
  is_active: z.boolean().optional(),
  name: z.string().min(1, "Session name cannot be empty").optional(),
}).strict().refine(data => data.is_active !== undefined || data.name !== undefined, {
  message: "At least one field (is_active or name) must be provided for update",
  path: ["_general"],
});

export async function POST(req: NextRequest) {
  let connection;
  try {
    const body = await req.json();
    const validationResult = updateSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation Error", errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { session_id, is_active, name } = validationResult.data;

    let updateFields: string[] = [];
    let updateValues: (boolean | string)[] = [];

    if (is_active !== undefined) {
      updateFields.push("is_active = ?");
      updateValues.push(is_active);
    }
    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: "No fields provided for update" },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.execute(
      `UPDATE sessions SET ${updateFields.join(", ")} WHERE id = ?`,
      [...updateValues, session_id]
    );
    return NextResponse.json({ message: "Session updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
