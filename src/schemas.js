import { schema } from "normalizr";

export const studentSchema = new schema.Entity(
  "students",
  {},
  { idAttribute: "id" }
);